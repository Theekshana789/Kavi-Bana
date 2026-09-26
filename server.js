// server.js — Hardened Node.js/Express server
// Security layers: Helmet (secure headers + CSP), rate limiting, input validation
// & sanitization, CSRF protection (double-submit cookie), HTTPS enforcement,
// strict CORS, request size limits, safe logging (no sensitive data in logs).
// Also: Admin panel (session login), Kavi Bana + Gallery management via
// Google Drive links only (no media files ever stored on the server), and
// contact-form emails sent via Gmail app password.

require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const compression = require('compression');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { body, validationResult } = require('express-validator');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production';

// Fail fast if critical secrets are missing in production
if (isProd && (!process.env.SESSION_SECRET || !process.env.CSRF_SECRET || !process.env.ADMIN_PASSWORD)) {
  console.error('❌ SESSION_SECRET / CSRF_SECRET / ADMIN_PASSWORD missing. Set them in your .env (or Render env vars) before starting in production.');
  process.exit(1);
}
const CSRF_SECRET = process.env.CSRF_SECRET || 'dev-only-csrf-secret-change-me';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'TTnn10@&admin';
const CONTACT_RECEIVER = process.env.CONTACT_RECEIVER_EMAIL || 'navindutheekshana695@gmail.com';

// Trust reverse proxy (needed for correct client IP behind nginx/Cloudflare/Render, and for secure cookies)
app.set('trust proxy', 1);

/* -------------------- 1. Force HTTPS in production -------------------- */
app.use((req, res, next) => {
  if (isProd && req.headers['x-forwarded-proto'] !== 'https') {
    return res.redirect(301, `https://${req.headers.host}${req.url}`);
  }
  next();
});

/* -------------------- 2. Secure HTTP headers (Helmet + strict CSP) ----- */
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        // React/Babel/Three.js are loaded from cdnjs only — nothing else is allowed to execute.
        // 'unsafe-eval' + 'unsafe-inline' are required because React/JSX is compiled in the
        // browser via Babel Standalone (no build step).
        scriptSrc: ["'self'", "'unsafe-eval'", "'unsafe-inline'", 'https://cdnjs.cloudflare.com'],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        // Drive thumbnail images need to load as <img>
        imgSrc: ["'self'", 'data:', 'https://drive.google.com', 'https://*.googleusercontent.com'],
        connectSrc: ["'self'", 'https://cdnjs.cloudflare.com'],
        // Kavi Bana audio/video + gallery images/videos are embedded in an <iframe>
        // that plays the Google Drive file INSIDE our own page (no redirect away).
        frameSrc: ["'self'", 'https://drive.google.com'],
        objectSrc: ["'none'"],
        frameAncestors: ["'none'"], // blocks clickjacking via iframes into OUR site
        baseUri: ["'self'"],
        formAction: ["'self'"],
        upgradeInsecureRequests: isProd ? [] : null,
      },
    },
    crossOriginEmbedderPolicy: false, // relaxed only because we load 3rd-party CDN scripts + Drive iframes
    hsts: { maxAge: 63072000, includeSubDomains: true, preload: true },
    referrerPolicy: { policy: 'no-referrer' },
  })
);

/* -------------------- 3. Strict CORS (only allow-listed origins) ------- */
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
    if (origin) res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,X-CSRF-Token');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Vary', 'Origin');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

/* -------------------- 4. Body parsing with strict size limits ---------- */
app.use(express.json({ limit: '10kb' })); // small limit stops payload-flood attacks
app.use(cookieParser());
app.use(compression());

/* -------------------- 4b. Admin session -------------------------------- */
app.use(
  session({
    name: 'kb_admin_sid',
    secret: process.env.SESSION_SECRET || 'dev-only-session-secret-change-me',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: isProd,
      sameSite: 'strict',
      maxAge: 2 * 60 * 60 * 1000, // 2 hours
    },
  })
);

/* -------------------- 5. Global rate limiting (anti brute-force/DDoS) -- */
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, error: 'ඉල්ලීම් ගණන සීමාව ඉක්මවා ඇත. පසුව උත්සාහ කරන්න.' },
});
app.use(globalLimiter);

// Tighter limiter specifically for the contact form (anti-spam / anti-flood)
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, error: 'ඉතා ඉක්මනින් ඉල්ලීම් කර ඇත. විනාඩි 15කින් නැවත උත්සාහ කරන්න.' },
});

// Strict limiter for admin login (anti brute-force on the password)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 8,
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, error: 'උත්සාහයන් ගණන ඉක්මවා ඇත. විනාඩි 15කින් නැවත උත්සාහ කරන්න.' },
});

/* -------------------- 6. CSRF protection (double-submit cookie) -------- */
function issueCsrfToken(req, res) {
  const token = crypto.createHmac('sha256', CSRF_SECRET).update(req.sessionID || 'anon').digest('hex') +
    '.' + crypto.randomBytes(16).toString('hex');
  res.cookie('csrf_token', token, {
    httpOnly: false, // must be readable by JS to echo back in header
    secure: isProd,
    sameSite: 'strict',
    maxAge: 2 * 60 * 60 * 1000,
  });
  return token;
}

function verifyCsrf(req, res, next) {
  const cookieToken = req.cookies['csrf_token'];
  const headerToken = req.headers['x-csrf-token'];
  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return res.status(403).json({ ok: false, error: 'CSRF token නොගැලපේ. පිටුව refresh කර නැවත උත්සාහ කරන්න.' });
  }
  next();
}

app.get('/api/csrf-token', (req, res) => {
  const token = issueCsrfToken(req, res);
  res.json({ csrfToken: token });
});

/* -------------------- 6b. Admin auth middleware ------------------------ */
function requireAdmin(req, res, next) {
  if (req.session && req.session.isAdmin) return next();
  return res.status(401).json({ ok: false, error: 'Admin විදිහට login වී නැත.' });
}

function safeCompare(a, b) {
  const bufA = Buffer.from(String(a));
  const bufB = Buffer.from(String(b));
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

app.post('/api/admin/login', loginLimiter, verifyCsrf, (req, res) => {
  const { password } = req.body || {};
  if (typeof password === 'string' && safeCompare(password, ADMIN_PASSWORD)) {
    req.session.isAdmin = true;
    return res.json({ ok: true });
  }
  return res.status(401).json({ ok: false, error: 'මුරපදය වැරදියි.' });
});

app.post('/api/admin/logout', (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

app.get('/api/admin/check', (req, res) => {
  res.json({ ok: true, isAdmin: !!(req.session && req.session.isAdmin) });
});

/* -------------------- 7. Static files (no directory listing, no dotfiles) */
app.use(
  express.static(path.join(__dirname, 'public'), {
    dotfiles: 'deny',
    index: 'index.html',
    setHeaders: (res) => {
      res.setHeader('X-Content-Type-Options', 'nosniff');
    },
  })
);

/* -------------------- 8. Input sanitization helper --------------------- */
function sanitize(str) {
  return String(str)
    .replace(/<[^>]*>/g, '')
    .replace(/[<>"'`]/g, '')
    .trim()
    .slice(0, 500);
}

// Extracts a Google Drive file ID from any share-link format the admin might paste.
function extractDriveId(link) {
  if (typeof link !== 'string') return null;
  const patterns = [
    /\/d\/([a-zA-Z0-9_-]{10,})/,      // .../file/d/FILE_ID/view
    /[?&]id=([a-zA-Z0-9_-]{10,})/,    // ...?id=FILE_ID
  ];
  for (const re of patterns) {
    const m = link.match(re);
    if (m) return m[1];
  }
  return null;
}

/* -------------------- 9. Schedule API (read-only, no user input) ------- */
const banaSchedule = [
  { id: 1, title: 'මහා ශුද්ධාෂ්ටක කවි බණ', date: '2026-10-05', place: 'ශ්‍රී සුමංගල විහාරය, කැළණිය' },
  { id: 2, title: 'මාතෘ ගුණ කවි බණ', date: '2026-10-19', place: 'රජමහා විහාරය, මහනුවර' },
  { id: 3, title: 'සසර දුක් කවි බණ', date: '2026-11-02', place: 'පුරාණ විහාරස්ථානය, මාතලේ' },
];

app.get('/api/schedule', (req, res) => {
  res.json(banaSchedule);
});

/* -------------------- 10. JSON "database" helpers ----------------------
   We NEVER store the actual audio/video/image files. Only small JSON text
   records (title + Google Drive link) are kept, so server storage usage
   stays essentially flat no matter how much media the admin adds.        */
function readJsonFile(file, fallback) {
  const p = path.join(__dirname, file);
  try {
    if (fs.existsSync(p)) return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch (e) {
    console.error(`Failed to read ${file} (corrupt) — using fallback.`);
  }
  return fallback;
}
function writeJsonFile(file, data) {
  const p = path.join(__dirname, file);
  fs.writeFileSync(p, JSON.stringify(data, null, 2), { mode: 0o600 });
}

const BANA_FILE = 'bana-items.json';
const GALLERY_FILE = 'gallery-items.json';

/* -------------------- 11. Kavi Bana items (public read / admin write) -- */
app.get('/api/kavibana', (req, res) => {
  res.json(readJsonFile(BANA_FILE, []));
});

app.post(
  '/api/admin/kavibana',
  requireAdmin,
  verifyCsrf,
  [
    body('title').trim().isLength({ min: 2, max: 150 }).withMessage('මාතෘකාව අවශ්‍යයි'),
    body('description').optional({ checkFalsy: true }).isLength({ max: 500 }),
    body('driveLink').trim().isURL().withMessage('වලංගු Google Drive link එකක් යොදන්න'),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ ok: false, error: errors.array()[0].msg });

    const driveId = extractDriveId(req.body.driveLink);
    if (!driveId) {
      return res.status(400).json({ ok: false, error: 'Google Drive share link එකෙන් file ID එක සොයාගත නොහැක. Share link එක නිවැරදිදැයි බලන්න.' });
    }

    const items = readJsonFile(BANA_FILE, []);
    const item = {
      id: Date.now(),
      title: sanitize(req.body.title),
      description: sanitize(req.body.description || ''),
      driveId,
      addedAt: new Date().toISOString(),
    };
    items.unshift(item);
    writeJsonFile(BANA_FILE, items);
    res.json({ ok: true, item });
  }
);

app.delete('/api/admin/kavibana/:id', requireAdmin, verifyCsrf, (req, res) => {
  const id = Number(req.params.id);
  const items = readJsonFile(BANA_FILE, []);
  const filtered = items.filter((it) => it.id !== id);
  writeJsonFile(BANA_FILE, filtered);
  res.json({ ok: true });
});

/* -------------------- 12. Gallery items (public read / admin write) ----- */
app.get('/api/gallery', (req, res) => {
  res.json(readJsonFile(GALLERY_FILE, []));
});

app.post(
  '/api/admin/gallery',
  requireAdmin,
  verifyCsrf,
  [
    body('caption').optional({ checkFalsy: true }).isLength({ max: 150 }),
    body('driveLink').trim().isURL().withMessage('වලංගු Google Drive link එකක් යොදන්න'),
    body('mediaType').isIn(['image', 'video']).withMessage('mediaType image හෝ video විය යුතුය'),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ ok: false, error: errors.array()[0].msg });

    const driveId = extractDriveId(req.body.driveLink);
    if (!driveId) {
      return res.status(400).json({ ok: false, error: 'Google Drive share link එකෙන් file ID එක සොයාගත නොහැක. Share link එක නිවැරදිදැයි බලන්න.' });
    }

    const items = readJsonFile(GALLERY_FILE, []);
    const item = {
      id: Date.now(),
      caption: sanitize(req.body.caption || ''),
      mediaType: req.body.mediaType,
      driveId,
      addedAt: new Date().toISOString(),
    };
    items.unshift(item);
    writeJsonFile(GALLERY_FILE, items);
    res.json({ ok: true, item });
  }
);

app.delete('/api/admin/gallery/:id', requireAdmin, verifyCsrf, (req, res) => {
  const id = Number(req.params.id);
  const items = readJsonFile(GALLERY_FILE, []);
  const filtered = items.filter((it) => it.id !== id);
  writeJsonFile(GALLERY_FILE, filtered);
  res.json({ ok: true });
});

/* -------------------- 13. Email transporter (Gmail app password) ------- */
let mailTransporter = null;
if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
  mailTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
} else {
  console.warn('⚠️  GMAIL_USER / GMAIL_APP_PASSWORD not set — contact form messages will only be saved to contact-requests.json, not emailed.');
}

async function sendContactEmail(entry) {
  if (!mailTransporter) return;
  await mailTransporter.sendMail({
    from: `"කවි බණ වෙබ් අඩවිය" <${process.env.GMAIL_USER}>`,
    to: CONTACT_RECEIVER,
    replyTo: process.env.GMAIL_USER,
    subject: `නව සම්බන්ධතා පණිවිඩයක් — ${entry.name}`,
    text:
      `නම: ${entry.name}\n` +
      `දුරකථන අංකය: ${entry.phone}\n` +
      `පණිවිඩය: ${entry.message || '(නැත)'}\n` +
      `වේලාව: ${entry.time}`,
  });
}

/* -------------------- 14. Contact form: validated + sanitized + CSRF --- */
app.post(
  '/api/contact',
  contactLimiter,
  verifyCsrf,
  [
    body('name')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('නම අකුරු 2ත් 100ත් අතර විය යුතුය')
      .matches(/^[a-zA-Z\u0D80-\u0DFF\s.'-]+$/)
      .withMessage('නමේ අනවසර අකුරු ඇත'),
    body('phone')
      .trim()
      .isLength({ min: 7, max: 20 })
      .withMessage('වලංගු දුරකථන අංකයක් යොදන්න')
      .matches(/^[0-9+\-\s()]+$/)
      .withMessage('දුරකථන අංකයේ අනවසර අකුරු ඇත'),
    body('message')
      .optional({ checkFalsy: true })
      .isLength({ max: 1000 })
      .withMessage('පණිවිඩය ඉතා දිගු වේ'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ ok: false, error: errors.array()[0].msg });
    }

    const entry = {
      name: sanitize(req.body.name),
      phone: sanitize(req.body.phone),
      message: sanitize(req.body.message || ''),
      time: new Date().toISOString(),
    };

    const logPath = path.join(__dirname, 'contact-requests.json');
    let list = [];
    try {
      if (fs.existsSync(logPath)) {
        list = JSON.parse(fs.readFileSync(logPath, 'utf8'));
      }
    } catch (e) {
      list = [];
    }
    list.push(entry);

    try {
      fs.writeFileSync(logPath, JSON.stringify(list, null, 2), { mode: 0o600 });
    } catch (e) {
      console.error('Failed to persist contact request (details withheld from client).');
      return res.status(500).json({ ok: false, error: 'දෝෂයක් ඇතිවිය. පසුව උත්සාහ කරන්න.' });
    }

    try {
      await sendContactEmail(entry);
    } catch (e) {
      console.error('Failed to send contact email (details withheld from client):', e.message);
      // Still tell the user it worked — their message IS saved; email is a bonus channel.
    }

    res.json({ ok: true, message: '🙏 ස්තුතියි! ඉක්මනින් අප ඔබව සම්බන්ධ කර ගන්නෙමු.' });
  }
);

/* -------------------- 15. Page routes for the extra pages -------------- */
app.get('/kavibana', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'kavibana.html'));
});
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

/* -------------------- 16. 404 + centralized error handler -------------- */
app.use((req, res) => {
  res.status(404).json({ ok: false, error: 'Not found' });
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ ok: false, error: 'අභ්‍යන්තර දෝෂයකි.' });
});

app.listen(PORT, () => {
  console.log(`🔒 Kavi Bana website (hardened) running on port ${PORT} [env: ${isProd ? 'production' : 'development'}]`);
});
