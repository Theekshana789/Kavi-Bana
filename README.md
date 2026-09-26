# කවි බණ Website (React + Three.js + Node.js/Express)

## අලුතින් එකතු කළ දේ (New in this version)
- **Kavi Bana දේශනා** — `/kavibana` නමින් වෙනම පිටුවක්. Admin panel එකෙන් එකතු කරන Google Drive
  audio/video links, පිටුව තුළම (iframe embed එකකින්) play වේ — වෙන අඩවියකට යාමක් නැත.
- **Admin Panel** (`/admin`) — Password එකෙන් login වී, කවි බණ දේශනා සහ ගැලරි items (images/videos)
  Google Drive links වශයෙන් එකතු/ඉවත් කළ හැක. Media files server එකේ save වන්නේ නැති නිසා
  server storage එක වැඩි වන්නේ නැත — Drive එකේ තියෙන file එකම, Drive එකෙන්ම stream වේ.
- **Contact Form → Email** — කවුරුහරි contact form එක submit කළහොත්, එම විස්තර
  `contact-requests.json` එකට save වෙන අතරම, Gmail හරහා ඔබේ email එකට (`navindutheekshana695@gmail.com`)
  email එකක් විදිහටත් එයි.

## Run කරන විදිය (Local)
1. Node.js install කරගන්න (v16+).
2. Terminal එකේ මේ folder එකට යන්න.
3. dependencies install කරගන්න:
   ```
   npm install
   ```
4. `.env` file එක open කර, අවශ්‍ය අගයන් (values) පුරවන්න — පහත "`.env` file එකේ තියෙන්නේ මොනවද" කොටස බලන්න.
5. Server එක run කරන්න:
   ```
   npm start
   ```
6. Browser එකේ open කරන්න: http://localhost:3000
   - මුල් පිටුව: `/`
   - කවි බණ පිටුව: `/kavibana`
   - Admin Panel: `/admin`  (password: `.env` file එකේ `ADMIN_PASSWORD`)

## Folder Structure
```
Kavi bana/
  server.js              -> Node/Express backend (සියලුම API + admin auth + email)
  package.json
  .env                   -> රහස් වචන (secrets) — කිසිදාක git වෙත commit කරන්න එපා
  bana-items.json         -> කවි බණ items (Drive links) — auto-created/updated
  gallery-items.json      -> ගැලරි items (Drive links) — auto-created/updated
  contact-requests.json   -> contact form messages log — auto-created
  public/
    index.html / app.jsx           -> මුල් පිටුව
    kavibana.html / kavibana.jsx    -> කවි බණ දේශනා පිටුව
    admin.html / admin.jsx          -> Admin Panel
    three-scene.js                  -> Three.js animated golden-particle background
    style.css                       -> සියලුම styles
```

## `.env` file එකේ තියෙන්නේ මොනවද?
`.env` file එක කියන්නේ ඔබේ website එකේ **රහස් සැකසුම්** (secrets/configuration) තියෙන file එකයි.
කේතයේ (code) hardcode නොකර මෙතන තියෙන්නේ, ඒවා වෙනස් කරන්න code වෙනස් කරන්න අවශ්‍ය නොවීමට සහ
රහස් වචන GitHub වගේ public තැනකට upload නොවීමටයි (`.gitignore` එකෙන් `.env` file එක ignore කර ඇත).

| Variable | කුමක් සඳහාද |
|---|---|
| `PORT` | Server එක run වෙන port එක. Render එකේ මේක automatic-ව set වේ. |
| `NODE_ENV` | `development` (ඔබේ පරිගණකයේ) හෝ `production` (Render එකේ). |
| `SESSION_SECRET` | Admin login session cookie එක sign කරන්න භාවිත වන රහස් අකුරු මාලාව. |
| `CSRF_SECRET` | Form submissions ආරක්ෂා කරන CSRF token generate කරන්න භාවිත වේ. |
| `ADMIN_PASSWORD` | `/admin` වෙත login වීමට password එක. (දැනට: `TTnn10@&admin`) |
| `ALLOWED_ORIGINS` | ඔබේ website domain එක (CORS ආරක්ෂාව සඳහා). |
| `GMAIL_USER` | Contact form emails **එවන** Gmail ලිපිනය. |
| `GMAIL_APP_PASSWORD` | ඔබේ සාමාන්‍ය Gmail password එක **නොවේ** — පහත පියවර වලින් generate කරන 16-අකුරු App Password එක. |
| `CONTACT_RECEIVER_EMAIL` | Contact form messages **ලැබෙන** email ලිපිනය (දැනට: `navindutheekshana695@gmail.com`). |

`SESSION_SECRET` සහ `CSRF_SECRET` generate කරන්න, terminal එකේ මේ command එක run කරන්න:
```
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
මේක දෙපාරක් run කර, එන අගයන් දෙක වෙනම `SESSION_SECRET` සහ `CSRF_SECRET` වලට දාන්න.

## Gmail App Password එකක් හදාගන්නේ කොහොමද?
Google, ඔබේ සාමාන්‍ය Gmail password එක third-party app එකකට (මේ website එකට) දෙන්න ඉඩ දෙන්නේ නැත —
ඒ වෙනුවට "App Password" කියන විශේෂ password එකක් හදාගන්න ඕන.

1. `GMAIL_USER` කියලා `.env` එකේ දාන Gmail account එකට login වෙන්න.
2. ඒ account එකේ **2-Step Verification** (2FA) on කරන්න (myaccount.google.com → Security).
   App Password එකක් හදාගන්න පුළුවන් වෙන්නේ 2FA on කළොත් විතරයි.
3. https://myaccount.google.com/apppasswords වෙත යන්න.
4. App name එකක් දාන්න (උදා: "Kavi Bana Website") → **Generate** ඔබන්න.
5. එන 16-අකුරු password එක (spaces අයින් කරලා) `.env` එකේ `GMAIL_APP_PASSWORD` කියලා දාන්න.
6. `CONTACT_RECEIVER_EMAIL` එකට `navindutheekshana695@gmail.com` දාන්න (දැනටමත් default එක ලෙස set කර ඇත).

## Admin Panel පාවිච්චි කරන විදිය
1. `/admin` වෙත යන්න → `.env` එකේ `ADMIN_PASSWORD` එකෙන් login වෙන්න.
2. **කවි බණ දේශනාවක් එකතු කිරීම:**
   - Audio/Video file එක ඔබේ Google Drive එකට upload කරන්න.
   - File එක මත right-click → Share → **"Anyone with the link"** → **Viewer** කරන්න → Copy link.
   - Admin panel එකේ "කවි බණ දේශනා එකතු කරන්න" කොටසේ, මාතෘකාව + copy කරගත් link එක paste කර "එකතු කරන්න" ඔබන්න.
   - එය ක්ෂණිකව මුල් පිටුවේ සහ `/kavibana` පිටුවේ, Drive එකෙන්ම, පිටුව තුළම play වන player එකක් ලෙස පෙන්වයි.
3. **ගැලරි item එකතු කිරීම:** ඒ විදිහටම image/video එක Drive එකට දාලා, link එක gallery form එකේ දාන්න.
4. ඉවත් කරන්න ඕන item එකක් ඇත්නම් "ඉවත් කරන්න" button එක ඔබන්න.

## ⚠️ Storage එක ගැන — වැදගත් සටහනක්
- Kavi Bana / Gallery items වලට **real media files server එකේ කිසිදාක save වන්නේ නැත** — Google Drive
  link එකේ file ID එක විතරයි text විදිහට save වන්නේ (`bana-items.json` / `gallery-items.json` — KB ගණනක් විතරයි).
  ඒ නිසා ඔබ කොපමණ audio/video/images එකතු කළත් server disk usage එක ඉහළ යන්නේ නැත.
- **Render Free plan** එකේ disk එක *ephemeral* (redeploy/restart එකකදී reset වේ) බව මතක තියාගන්න —
  මේ ගැන පහත Deploy කොටසේ වැඩිදුර පැහැදිලි කර ඇත.

## Render එකට Deploy කරන විදිය (පියවරෙන් පියවර)
1. **GitHub වෙත Push කරන්න** — මේ folder එක (GitHub Desktop හෝ `git`) භාවිතයෙන් අලුත් GitHub repository
   එකකට push කරන්න. `.env` file එක commit **නොවේ** (`.gitignore` එකෙන් block කර ඇත) — ඒක හරි දෙයක්,
   secrets Render එකේම වෙනම දාන්නම් ඕන.
2. https://render.com යන්න → ගිණුමක් හදාගන්න (GitHub account එකෙන්ම sign up කරන්න පුළුවන්).
3. Dashboard එකේ **"New +" → "Web Service"** ඔබන්න.
4. ඔබේ GitHub repository එක connect කර, තෝරාගන්න.
5. Settings පුරවන්න:
   - **Name**: kavi-bana (හෝ ඔබට ඕන නමක්)
   - **Region**: ළඟම ඇති එක (Singapore ආසන්නම)
   - **Branch**: main
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free (test කරන්න) හෝ Starter (production සඳහා නිර්දේශිතයි — Free plan එක
     minutes ගණනක් idle වූ පසු "sleep" වී, next visitor ලට seconds කිහිපයක් loading වේ)
6. **"Environment"** tab එකට යන්න → "Add Environment Variable" එකෙන්, `.env` file එකේ තියෙන
   සියලුම variables එකින් එක type කරන්න (real, ආරක්ෂිත අගයන් සමඟ):
   ```
   NODE_ENV=production
   SESSION_SECRET=<generate කරගත් අගය>
   CSRF_SECRET=<generate කරගත් වෙනත් අගය>
   ADMIN_PASSWORD=TTnn10@&admin
   ALLOWED_ORIGINS=https://your-app-name.onrender.com
   GMAIL_USER=youraddress@gmail.com
   GMAIL_APP_PASSWORD=<16 අකුරු app password>
   CONTACT_RECEIVER_EMAIL=navindutheekshana695@gmail.com
   ```
   (`PORT` variable එක දාන්න එපා — Render එකම handle කරයි.)
7. **"Create Web Service"** ඔබන්න → Render එක automatic-ව build කර deploy කරයි (විනාඩි 2-5 අතර කාලයක් යයි).
8. Deploy complete වූ පසු, Render එක ඔබට URL එකක් දෙයි (උදා: `https://kavi-bana.onrender.com`) —
   එය step 6 හි `ALLOWED_ORIGINS` එකට දැම්මාද කියලා අනිවාර්යයෙන් හරි කරලා, "Manual Deploy" → "Deploy latest commit" කරන්න.
9. ඉවරයි! ඔබේ website එක Live! `/admin` වෙත ගිහින් content එකතු කරන්න පටන්ගන්න.

### පසුව වෙනසක් කරන්නේ නම්
GitHub repository එකට push කරන හැම වතාවකම, Render **automatic-ව** නැවත deploy කරයි (Auto-Deploy on
by default). Environment Variable එකක් වෙනස් කරන්න ඕන නම්, Render dashboard → Environment tab එකෙන්
කෙලින්ම වෙනස් කර "Save Changes" ඔබන්න — server එක restart වේ.

### Render Free Plan එකේ Storage එක ගැන දැනගත යුතු දේ
Free (සහ සමහර paid) plans වල disk එක "ephemeral" —  server එක restart වුනොත් (redeploy, crash,
manual restart, හෝ Free plan එකේ inactivity නිසා sleep වී ඇහැරෙන විට) `bana-items.json`,
`gallery-items.json`, සහ `contact-requests.json` වල තියෙන දත්ත **reset විය හැක**. මේක නරකම නම්:
- Render එකේ **paid plan** එකක් (Starter) සමඟ **Persistent Disk** එකක් attach කරන්න (Render
  dashboard → ඔබේ service → "Disks" tab), එවිට files permanent-ව save වේ. **මෙය හොඳම විසඳුමයි.**
- එසේ නැත්නම්, admin panel එකෙන් items එකතු කරන හැම වතාවකම, `bana-items.json` /
  `gallery-items.json` files download කරගෙන (Render Shell එකෙන් copy කරගෙන) backup එකක් තියාගන්න.

## Security hardening (already included)
- **Helmet.js** — strict Content-Security-Policy, HSTS, clickjacking protection, `nosniff`, no-referrer.
- **CSRF protection** — double-submit-cookie pattern on every state-changing request (contact form + admin actions).
- **Admin session auth** — password-protected `/admin`, session cookie is `httpOnly`, `secure` in production, rate-limited login (8 attempts / 15 min).
- **Input validation & sanitization** — `express-validator` + a sanitizer stripping HTML/script characters.
- **Rate limiting** — global limiter, plus stricter limiters on the contact form and admin login.
- **HTTPS enforcement** in production; **strict CORS allow-list**.
- **No media files stored** — Kavi Bana / Gallery only ever store a small Google Drive file ID as text.
- **No sensitive data in logs** — errors logged generically, never stack traces/secrets to the client.

## Customize
- Preaching schedule: edit `banaSchedule` array in `server.js`.
- Colors/theme: edit CSS variables at the top of `public/style.css`.
- About-section text: edit `public/app.jsx`.
