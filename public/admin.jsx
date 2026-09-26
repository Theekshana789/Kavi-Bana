const { useState, useEffect } = React;

// Fetch a fresh CSRF token (double-submit-cookie pattern, same as the contact form)
async function getCsrfToken() {
  const res = await fetch('/api/csrf-token', { credentials: 'same-origin' });
  const data = await res.json();
  return data.csrfToken;
}

async function apiFetch(url, options = {}) {
  const csrfToken = await getCsrfToken();
  const res = await fetch(url, {
    ...options,
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrfToken,
      ...(options.headers || {}),
    },
  });
  return res.json();
}

function LoginBox({ onLoggedIn }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const data = await apiFetch('/api/admin/login', {
        method: 'POST',
        body: JSON.stringify({ password }),
      });
      if (data.ok) onLoggedIn();
      else setError(data.error || 'Login අසාර්ථකයි.');
    } catch {
      setError('දෝෂයක් ඇතිවිය.');
    }
    setBusy(false);
  };

  return (
    <div className="admin-wrap">
      <div className="admin-box" style={{ maxWidth: 420, margin: '0 auto' }}>
        <h2 className="section-title center">Admin Login</h2>
        <form onSubmit={submit}>
          <input
            type="password"
            placeholder="Admin Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button className="btn-primary" type="submit" disabled={busy} style={{ width: '100%' }}>
            {busy ? '...' : 'Login'}
          </button>
          {error && <p className="status err">{error}</p>}
        </form>
      </div>
    </div>
  );
}

function KaviBanaManager() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', driveLink: '' });
  const [status, setStatus] = useState(null);

  const load = () => fetch('/api/kavibana').then((r) => r.json()).then(setItems).catch(() => setItems([]));
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    setStatus(null);
    const data = await apiFetch('/api/admin/kavibana', { method: 'POST', body: JSON.stringify(form) });
    if (data.ok) {
      setForm({ title: '', description: '', driveLink: '' });
      setStatus({ type: 'ok', msg: 'එකතු කරන ලදී!' });
      load();
    } else {
      setStatus({ type: 'err', msg: data.error || 'දෝෂයක්.' });
    }
  };

  const remove = async (id) => {
    await apiFetch(`/api/admin/kavibana/${id}`, { method: 'DELETE' });
    load();
  };

  return (
    <div className="admin-box">
      <h2>කවි බණ දේශනා එකතු කරන්න</h2>
      <p className="hint">
        Google Drive එකේ audio/video file එක upload කර, එය <b>"Anyone with the link"</b> ලෙස Share කරන්න.
        එවිට ලැබෙන share link එක මෙහි paste කරන්න. Video/audio file එක සර්වර් එකේ save වන්නේ නැත —
        Drive එකෙන්ම පිටුව තුළ play වේ.
      </p>
      <form onSubmit={submit}>
        <input placeholder="මාතෘකාව (Title)" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        <textarea placeholder="විස්තරය (Description) - optional" rows="2" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <input placeholder="Google Drive Share Link" value={form.driveLink} onChange={(e) => setForm({ ...form, driveLink: e.target.value })} required />
        <button className="btn-primary" type="submit">එකතු කරන්න</button>
        {status && <p className={`status ${status.type === 'ok' ? 'ok' : 'err'}`}>{status.msg}</p>}
      </form>

      <h3 style={{ marginTop: 24 }}>දැනට ඇති දේශනා ({items.length})</h3>
      {items.map((it) => (
        <div key={it.id} className="admin-item-row">
          <span>{it.title}</span>
          <button className="btn-danger" onClick={() => remove(it.id)}>ඉවත් කරන්න</button>
        </div>
      ))}
    </div>
  );
}

function GalleryManager() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ caption: '', driveLink: '', mediaType: 'image' });
  const [status, setStatus] = useState(null);

  const load = () => fetch('/api/gallery').then((r) => r.json()).then(setItems).catch(() => setItems([]));
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    setStatus(null);
    const data = await apiFetch('/api/admin/gallery', { method: 'POST', body: JSON.stringify(form) });
    if (data.ok) {
      setForm({ caption: '', driveLink: '', mediaType: 'image' });
      setStatus({ type: 'ok', msg: 'එකතු කරන ලදී!' });
      load();
    } else {
      setStatus({ type: 'err', msg: data.error || 'දෝෂයක්.' });
    }
  };

  const remove = async (id) => {
    await apiFetch(`/api/admin/gallery/${id}`, { method: 'DELETE' });
    load();
  };

  return (
    <div className="admin-box">
      <h2>ගැලරිය (Gallery) එකතු කරන්න</h2>
      <p className="hint">
        Image එකක් හෝ Video එකක් Google Drive එකට upload කර "Anyone with the link" ලෙස Share කර, link එක මෙහි දමන්න.
      </p>
      <form onSubmit={submit}>
        <select value={form.mediaType} onChange={(e) => setForm({ ...form, mediaType: e.target.value })}>
          <option value="image">Image</option>
          <option value="video">Video</option>
        </select>
        <input placeholder="Google Drive Share Link" value={form.driveLink} onChange={(e) => setForm({ ...form, driveLink: e.target.value })} required />
        <input placeholder="Caption - optional" value={form.caption} onChange={(e) => setForm({ ...form, caption: e.target.value })} />
        <button className="btn-primary" type="submit">එකතු කරන්න</button>
        {status && <p className={`status ${status.type === 'ok' ? 'ok' : 'err'}`}>{status.msg}</p>}
      </form>

      <h3 style={{ marginTop: 24 }}>දැනට ඇති items ({items.length})</h3>
      {items.map((it) => (
        <div key={it.id} className="admin-item-row">
          <span>{it.mediaType} — {it.caption || '(caption නැත)'}</span>
          <button className="btn-danger" onClick={() => remove(it.id)}>ඉවත් කරන්න</button>
        </div>
      ))}
    </div>
  );
}

function AdminDashboard({ onLogout }) {
  return (
    <div className="admin-wrap">
      <a href="/" className="back-link">← මුල් පිටුවට</a>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <h1 className="section-title">Admin Panel</h1>
        <button className="btn-danger" onClick={onLogout}>Logout</button>
      </div>
      <KaviBanaManager />
      <GalleryManager />
    </div>
  );
}

function App() {
  const [checking, setChecking] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    fetch('/api/admin/check', { credentials: 'same-origin' })
      .then((r) => r.json())
      .then((d) => setLoggedIn(!!d.isAdmin))
      .finally(() => setChecking(false));
  }, []);

  const logout = async () => {
    await apiFetch('/api/admin/logout', { method: 'POST' });
    setLoggedIn(false);
  };

  if (checking) return <div className="admin-wrap"><p className="center">පූරණය වෙමින්...</p></div>;
  if (!loggedIn) return <LoginBox onLoggedIn={() => setLoggedIn(true)} />;
  return <AdminDashboard onLogout={logout} />;
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
