const { useState, useEffect } = React;

/* ---------- SVG Decorative Elements ---------- */

function LotusSVG({ className }) {
  return (
    <svg className={className} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g>
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => (
          <ellipse
            key={i}
            cx="100" cy="60" rx="18" ry="42"
            fill="url(#petalGrad)"
            transform={`rotate(${deg} 100 100)`}
            opacity="0.9"
          />
        ))}
        <circle cx="100" cy="100" r="14" fill="#ffd98a" />
      </g>
      <defs>
        <linearGradient id="petalGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffe9c2" />
          <stop offset="100%" stopColor="#e8a13c" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function DharmaWheelSVG({ className }) {
  return (
    <svg className={className} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="42" stroke="#e8a13c" strokeWidth="3" fill="none" />
      <circle cx="50" cy="50" r="8" fill="#e8a13c" />
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i * 360) / 8;
        return (
          <line
            key={i}
            x1="50" y1="50"
            x2={50 + 42 * Math.cos((angle * Math.PI) / 180)}
            y2={50 + 42 * Math.sin((angle * Math.PI) / 180)}
            stroke="#e8a13c" strokeWidth="3"
          />
        );
      })}
    </svg>
  );
}

function BoLeafSVG({ className }) {
  return (
    <svg className={className} viewBox="0 0 64 80" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M32 2C14 20 4 34 4 48c0 16 12 26 28 30 16-4 28-14 28-30C60 34 50 20 32 2Z"
        fill="url(#leafGrad)" stroke="#7a9a5b" strokeWidth="1.5"
      />
      <path d="M32 8 L32 76" stroke="#7a9a5b" strokeWidth="1.2" opacity="0.6" />
      <defs>
        <linearGradient id="leafGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#9fd074" />
          <stop offset="100%" stopColor="#4c7a34" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/* ---------- Reveal-on-scroll wrapper ---------- */
function Reveal({ children, className = '' }) {
  const ref = React.useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setVisible(true),
      { threshold: 0.15 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} className={`${className} reveal ${visible ? 'reveal-visible' : ''}`}>
      {children}
    </div>
  );
}

/* ---------- Sections ---------- */

function Nav() {
  const [open, setOpen] = useState(false);
  const links = [
    ['#home', 'මුල් පිටුව'],
    ['#about', 'උන්වහන්සේ ගැන'],
    ['/kavibana', 'කවි බණ'],
    ['#schedule', 'දේශනා කාලසටහන'],
    ['#gallery', 'ගැලරිය'],
    ['#contact', 'සම්බන්ධ වන්න'],
  ];
  return (
    <nav className="navbar">
      <div className="nav-brand"><DharmaWheelSVG className="nav-wheel spin-slow" /> පූජ්‍ය අමිතානන්ද හිමි</div>
      <button className="nav-toggle" onClick={() => setOpen(!open)}>☰</button>
      <div className={`nav-links ${open ? 'nav-open' : ''}`}>
        {links.map(([href, label]) => (
          <a key={href} href={href} onClick={() => setOpen(false)}>{label}</a>
        ))}
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <header id="home" className="hero">
      <LotusSVG className="lotus lotus-left float" />
      <LotusSVG className="lotus lotus-right float-delay" />
      <div className="hero-content">
        <p className="hero-kicker fade-in">ශ්‍රී සද්ධර්ම දේශනා</p>
        <h1 className="hero-title fade-in-up">පූජ්‍ය අමිතානන්ද හිමි</h1>
        <p className="hero-sub fade-in-up-delay">
          කවියෙන් බුදුදහම ජීවමාන කරන, හදවත් වෙත සමීප දහම් දේශනා ශිල්පියෙකි.
        </p>
        <a href="#kavibana" className="btn-primary pulse">දේශනා අසන්න</a>
      </div>
    </header>
  );
}

function About() {
  return (
    <section id="about" className="section about">
      <Reveal className="about-grid">
        <div className="about-art">
          <BoLeafSVG className="bo-leaf spin-gentle" />
        </div>
        <div>
          <h2 className="section-title">උන්වහන්සේ ගැන</h2>
          <p>
            දශක ගණනාවක් තිස්සේ ශ්‍රී ලංකාව පුරා විවිධ විහාරස්ථානවල කවි බණ දේශනා
            පවත්වමින්, පද්‍යමය රසයෙන් හා සරල බසින් බුදුදහමේ ගැඹුරු අර්ථ ජනතාව
            වෙත ගෙන එනු ලබන පූජ්‍ය අමිතානන්ද හිමිපාණන් වහන්සේ, දහම් රසය කවි ස්වරයෙන්
            ජනතාවගේ හදවත් තුළට කා වදින සේ දේශනා කරති.
          </p>
          <ul className="about-points">
            <li>🪷 සම්ප්‍රදායික කවි බණ ශෛලිය</li>
            <li>🪷 දේශීය හා විදේශීය විහාරස්ථානවල දේශනා</li>
            <li>🪷 පිරිත්, බණ, ගාථා දේශනා</li>
          </ul>
        </div>
      </Reveal>
    </section>
  );
}

function KaviBana() {
  const [items, setItems] = useState([]);
  useEffect(() => {
    fetch('/api/kavibana').then((r) => r.json()).then((d) => setItems(d.slice(0, 3))).catch(() => setItems([]));
  }, []);
  return (
    <section id="kavibana" className="section kavibana">
      <Reveal>
        <h2 className="section-title center">කවි බණ දේශනා</h2>
        <p className="section-sub center">ශබ්ද හා දෘශ්‍ය මාධ්‍යයෙන් දහම රස විඳින්න — පිටුව තුළම වාදනය කරන්න</p>
      </Reveal>
      <div className="card-grid">
        {items.length === 0 && (
          <Reveal className="bana-card">
            <DharmaWheelSVG className="card-icon spin-slow" />
            <p>මෙතෙක් කවි බණ දේශනා එකතු කර නොමැත. Admin panel එකෙන් එකතු කරන්න.</p>
          </Reveal>
        )}
        {items.map((it) => (
          <Reveal key={it.id} className="bana-card">
            <DharmaWheelSVG className="card-icon spin-slow" />
            <h3>{it.title}</h3>
            {it.description && <p>{it.description}</p>}
            <div className="drive-embed">
              <iframe
                src={`https://drive.google.com/file/d/${it.driveId}/preview`}
                allow="autoplay"
                loading="lazy"
                title={it.title}
              ></iframe>
            </div>
          </Reveal>
        ))}
      </div>
      <Reveal className="center">
        <a href="/kavibana" className="btn-primary">සියලුම දේශනා බලන්න</a>
      </Reveal>
    </section>
  );
}

function Schedule() {
  const [schedule, setSchedule] = useState([]);
  useEffect(() => {
    fetch('/api/schedule')
      .then((r) => r.json())
      .then(setSchedule)
      .catch(() => setSchedule([]));
  }, []);

  return (
    <section id="schedule" className="section schedule">
      <Reveal>
        <h2 className="section-title center">දේශනා කාලසටහන</h2>
      </Reveal>
      <div className="timeline">
        {schedule.map((s, i) => (
          <Reveal key={s.id} className="timeline-item">
            <div className="timeline-dot pulse-dot"></div>
            <div className="timeline-content">
              <span className="timeline-date">{s.date}</span>
              <h4>{s.title}</h4>
              <p>{s.place}</p>
            </div>
          </Reveal>
        ))}
        {schedule.length === 0 && <p className="center">දේශනා කාලසටහන පූරණය වෙමින්...</p>}
      </div>
    </section>
  );
}

function Gallery() {
  const [items, setItems] = useState([]);
  useEffect(() => {
    fetch('/api/gallery').then((r) => r.json()).then(setItems).catch(() => setItems([]));
  }, []);
  return (
    <section id="gallery" className="section gallery">
      <Reveal>
        <h2 className="section-title center">ගැලරිය</h2>
      </Reveal>
      <div className="gallery-grid">
        {items.length === 0 && (
          <Reveal className="gallery-item gallery-empty">
            <p>මෙතෙක් ගැලරි items එකතු කර නොමැත.</p>
          </Reveal>
        )}
        {items.map((it) => (
          <Reveal key={it.id} className="gallery-item">
            <iframe
              src={`https://drive.google.com/file/d/${it.driveId}/preview`}
              allow="autoplay"
              loading="lazy"
              title={it.caption || 'gallery item'}
            ></iframe>
            {it.caption && <span className="gallery-caption">{it.caption}</span>}
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function Contact() {
  const [form, setForm] = useState({ name: '', phone: '', message: '' });
  const [status, setStatus] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    try {
      // 1. Fetch a fresh CSRF token (double-submit cookie pattern)
      const tokenRes = await fetch('/api/csrf-token', { credentials: 'same-origin' });
      const { csrfToken } = await tokenRes.json();

      // 2. Submit the form with the token in a header (cookie is sent automatically)
      const res = await fetch('/api/contact', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      setStatus(data.ok ? 'success' : 'error');
      if (data.ok) setForm({ name: '', phone: '', message: '' });
      else if (data.error) console.warn(data.error);
    } catch {
      setStatus('error');
    }
  };

  return (
    <section id="contact" className="section contact">
      <Reveal className="contact-box">
        <h2 className="section-title center">දේශනාවක් සඳහා ආරාධනා කරන්න</h2>
        <form onSubmit={submit} className="contact-form">
          <input
            placeholder="ඔබේ නම"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <input
            placeholder="දුරකථන අංකය"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            required
          />
          <textarea
            placeholder="පණිවිඩය (විහාරස්ථානය, දිනය, ආදිය)"
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            rows="4"
          />
          <button className="btn-primary" type="submit">යවන්න</button>
          {status === 'success' && <p className="status ok">🙏 ස්තුතියි! ඉක්මනින් සම්බන්ධ වෙමු.</p>}
          {status === 'error' && <p className="status err">යමක් වැරදිලා. නැවත උත්සාහ කරන්න.</p>}
        </form>
      </Reveal>
    </section>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <DharmaWheelSVG className="footer-wheel spin-slow" />
      <p>© {new Date().getFullYear()} පූජ්‍ය අමිතානන්ද හිමි — සියලුම හිමිකම් ඇවිරිණි</p>
      <a href="/admin" className="admin-link">Admin</a>
    </footer>
  );
}

function App() {
  return (
    <React.Fragment>
      <Nav />
      <Hero />
      <About />
      <KaviBana />
      <Schedule />
      <Gallery />
      <Contact />
      <Footer />
    </React.Fragment>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);