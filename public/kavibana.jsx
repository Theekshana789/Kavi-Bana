const { useState, useEffect } = React;

function DharmaWheelSVG({ className }) {
  return (
    <svg className={className} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="42" stroke="#e8a13c" strokeWidth="3" fill="none" />
      <circle cx="50" cy="50" r="8" fill="#e8a13c" />
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i * 360) / 8;
        return (
          <line key={i} x1="50" y1="50"
            x2={50 + 42 * Math.cos((angle * Math.PI) / 180)}
            y2={50 + 42 * Math.sin((angle * Math.PI) / 180)}
            stroke="#e8a13c" strokeWidth="3" />
        );
      })}
    </svg>
  );
}

function KaviBanaPage() {
  const [items, setItems] = useState(null); // null = loading

  useEffect(() => {
    fetch('/api/kavibana')
      .then((r) => r.json())
      .then(setItems)
      .catch(() => setItems([]));
  }, []);

  return (
    <div className="page-wrap">
      <a href="/" className="back-link">← මුල් පිටුවට</a>
      <h1 className="section-title center" style={{ marginBottom: 6 }}>
        <DharmaWheelSVG className="nav-wheel spin-slow" style={{ width: 30, height: 30, verticalAlign: 'middle', marginRight: 10 }} />
        කවි බණ දේශනා
      </h1>
      <p className="section-sub center" style={{ marginBottom: 30 }}>
        සියලුම දේශනා පිටුව තුළම වාදනය කරන්න — වෙනත් අඩවියකට යාමක් අවශ්‍ය නොවේ
      </p>

      {items === null && <p className="center">පූරණය වෙමින්...</p>}
      {items && items.length === 0 && (
        <p className="center">මෙතෙක් කවි බණ දේශනා එකතු කර නොමැත. Admin panel එකෙන් එකතු කරන්න.</p>
      )}

      <div className="bana-page-grid">
        {items && items.map((it) => (
          <div key={it.id} className="bana-card">
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
          </div>
        ))}
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<KaviBanaPage />);
