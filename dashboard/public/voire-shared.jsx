
// ─── Icons ────────────────────────────────────────────────────────────────────
const ICONS = {
  home:        () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  users:       () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  video:       () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>,
  briefcase:   () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>,
  chart:       () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  settings:    () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  search:      () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  bell:        () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  arrowLeft:   () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>,
  upload:      () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>,
  mic:         () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>,
  plus:        () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  check:       () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  sparkle:     () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3L13.5 8.5L19 10L13.5 11.5L12 17L10.5 11.5L5 10L10.5 8.5Z"/></svg>,
  x:           () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  columns:     () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="8" height="18" rx="1"/><rect x="13" y="3" width="8" height="18" rx="1"/></svg>,
  eye:         () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  share:       () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>,
  link:        () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>,
  calendar:    () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  sliders:     () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>,
  dollar:      () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  zap:         () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  info:        () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>,
  shield:      () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  trending:    () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  clock:       () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  trash:       () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>,
  award:       () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>,
};

// ─── Score Ring ───────────────────────────────────────────────────────────────
function ScoreRing({ score, size = 56, strokeWidth = 4 }) {
  const [anim, setAnim] = React.useState(0);
  React.useEffect(() => { const t = setTimeout(() => setAnim(score), 80); return () => clearTimeout(t); }, [score]);
  const r = (size - strokeWidth * 2) / 2;
  const circ = 2 * Math.PI * r;
  const color = score >= 85 ? 'var(--green)' : score >= 70 ? 'var(--amber)' : 'var(--red)';
  const trackColor = score >= 85 ? 'var(--green-light)' : score >= 70 ? 'var(--amber-light)' : 'var(--red-light)';
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', display: 'block' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={trackColor} strokeWidth={strokeWidth} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeDasharray={circ} strokeDashoffset={circ - (anim/100)*circ} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1.1s cubic-bezier(0.34,1.56,0.64,1)' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: size * 0.27, fontWeight: 700, color, lineHeight: 1 }}>{score}</span>
        {size > 60 && <span style={{ fontSize: size * 0.14, color: 'var(--text-3)', marginTop: 1 }}>score</span>}
      </div>
    </div>
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({ name, color = '#2B5CE6', size = 36 }) {
  const initials = name.split(' ').map(n => n[0]).slice(0, 2).join('');
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', flexShrink: 0, background: color + '18', border: `1.5px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.34, fontWeight: 600, color, letterSpacing: '-0.5px' }}>{initials}</div>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────
function Badge({ children, variant = 'default', small }) {
  const variants = {
    default: { bg: 'var(--surface-2)', color: 'var(--text-2)', border: 'var(--border)' },
    accent:  { bg: 'var(--accent-light)', color: 'var(--accent)', border: 'var(--accent-border)' },
    green:   { bg: 'var(--green-light)', color: 'var(--green)', border: 'var(--green-border)' },
    amber:   { bg: 'var(--amber-light)', color: 'var(--amber)', border: 'var(--amber-border)' },
    red:     { bg: 'var(--red-light)', color: 'var(--red)', border: 'var(--red-border)' },
    purple:  { bg: 'var(--purple-light)', color: 'var(--purple)', border: 'var(--purple-border)' },
    top:     { bg: '#FEF9C3', color: '#854D0E', border: '#FDE047' },
  };
  const v = variants[variant] || variants.default;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: small ? '2px 7px' : '3px 9px', borderRadius: 100, fontSize: small ? 10 : 11, fontWeight: 600, letterSpacing: '0.02em', background: v.bg, color: v.color, border: `1px solid ${v.border}`, whiteSpace: 'nowrap' }}>{children}</span>
  );
}

// ─── SkillBar ─────────────────────────────────────────────────────────────────
function SkillBar({ skill, match, delay = 0, showLabel = true }) {
  const [w, setW] = React.useState(0);
  React.useEffect(() => { const t = setTimeout(() => setW(match), 120 + delay); return () => clearTimeout(t); }, [match]);
  const color = match >= 80 ? 'var(--green)' : match >= 60 ? 'var(--amber)' : 'var(--red)';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      {showLabel && <span style={{ width: 116, fontSize: 12.5, color: 'var(--text-2)', flexShrink: 0 }}>{skill}</span>}
      <div style={{ flex: 1, height: 6, background: 'var(--surface-2)', borderRadius: 3, overflow: 'hidden', border: '1px solid var(--border)' }}>
        <div style={{ height: '100%', width: `${w}%`, background: color, borderRadius: 3, transition: 'width 0.9s cubic-bezier(0.34,1.2,0.64,1)' }} />
      </div>
      <span style={{ width: 34, fontSize: 12, fontWeight: 600, color, textAlign: 'right' }}>{match}%</span>
    </div>
  );
}

// ─── AnimBar (for score breakdown) ───────────────────────────────────────────
function AnimBar({ val, color, height = 7 }) {
  const [w, setW] = React.useState(0);
  React.useEffect(() => { const t = setTimeout(() => setW(val || 0), 120); return () => clearTimeout(t); }, [val]);
  return <div style={{ height: '100%', width: `${w}%`, background: color, borderRadius: 4, transition: 'width 1s cubic-bezier(0.34,1.2,0.64,1)' }} />;
}

// ─── Chip ─────────────────────────────────────────────────────────────────────
function Chip({ children, color, variant }) {
  if (variant === 'gap') return (
    <span style={{ padding: '3px 9px', borderRadius: 6, fontSize: 11.5, fontWeight: 600, background: 'var(--red-light)', color: 'var(--red)', border: '1px solid var(--red-border)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      <span style={{ fontSize: 9 }}>✕</span> {children}
    </span>
  );
  return (
    <span style={{ padding: '3px 9px', borderRadius: 6, fontSize: 11.5, fontWeight: 500, background: color ? color + '12' : 'var(--surface-2)', color: color || 'var(--text-2)', border: `1px solid ${color ? color + '25' : 'var(--border)'}` }}>{children}</span>
  );
}

// ─── Cost Pill ────────────────────────────────────────────────────────────────
function CostPill({ cost }) {
  if (!cost) return null;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 7px', borderRadius: 100, fontSize: 10.5, fontWeight: 600, background: 'var(--surface-2)', color: 'var(--text-3)', border: '1px solid var(--border)' }}>
      {React.createElement(ICONS.dollar)} ${cost.toFixed(4)}
    </span>
  );
}

// ─── Processing State ─────────────────────────────────────────────────────────
const PIPELINE_STEPS = [
  { id: 'upload',    label: 'Recibiendo archivo' },
  { id: 'extract',   label: 'Extrayendo datos del CV' },
  { id: 'requisitos',label: 'Analizando requisitos' },
  { id: 'scoring',   label: 'Calculando score' },
  { id: 'explain',   label: 'Generando explicación' },
];

function ProcessingState({ step, onDone }) {
  const [current, setCurrent] = React.useState(0);
  React.useEffect(() => {
    if (current >= PIPELINE_STEPS.length) { setTimeout(onDone, 400); return; }
    const t = setTimeout(() => setCurrent(c => c + 1), 900 + Math.random() * 600);
    return () => clearTimeout(t);
  }, [current]);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '16px 0' }}>
      {PIPELINE_STEPS.map((s, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 22, height: 22, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: done ? 'var(--green)' : active ? 'var(--accent)' : 'var(--surface-2)', border: `2px solid ${done ? 'var(--green)' : active ? 'var(--accent)' : 'var(--border)'}`, transition: 'all 0.3s' }}>
              {done ? <span style={{ color: 'white', fontSize: 10 }}>{React.createElement(ICONS.check)}</span>
                : active ? <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'white', animation: 'blink 0.8s step-end infinite' }} />
                : <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--border)' }} />}
            </div>
            <span style={{ fontSize: 13, fontWeight: active ? 600 : done ? 500 : 400, color: done ? 'var(--text-1)' : active ? 'var(--text-1)' : 'var(--text-3)', transition: 'all 0.3s' }}>
              {s.label}
            </span>
            {active && <div style={{ marginLeft: 'auto', display: 'flex', gap: 3 }}>
              {[0,1,2].map(i => <div key={i} style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--accent)', animation: `blink 1s ease-in-out ${i * 0.2}s infinite` }} />)}
            </div>}
            {done && <span style={{ marginLeft: 'auto', fontSize: 10.5, color: 'var(--green)', fontWeight: 600 }}>✓</span>}
          </div>
        );
      })}
    </div>
  );
}

// ─── Weight Sliders ───────────────────────────────────────────────────────────
function WeightSliders({ weights, onChange }) {
  const DIMS = [
    { key: 'skills',      label: 'Habilidades técnicas', color: '#2B5CE6' },
    { key: 'experiencia', label: 'Experiencia',           color: '#7C3AED' },
    { key: 'educacion',   label: 'Educación',             color: '#16A34A' },
    { key: 'softskills',  label: 'Soft skills',           color: '#D97706' },
  ];
  const total = Object.values(weights).reduce((a, b) => a + b, 0);
  const valid = Math.abs(total - 100) < 1;

  const handleChange = (key, val) => {
    const newW = { ...weights, [key]: Number(val) };
    onChange(newW);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>Pesos del scoring</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: valid ? 'var(--green)' : 'var(--red)', padding: '3px 9px', background: valid ? 'var(--green-light)' : 'var(--red-light)', borderRadius: 100, border: `1px solid ${valid ? 'var(--green-border)' : 'var(--red-border)'}` }}>
          {total}% {valid ? '✓' : '— debe sumar 100%'}
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {DIMS.map(d => (
          <div key={d.key}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
              <span style={{ fontSize: 12.5, color: 'var(--text-2)', fontWeight: 500 }}>{d.label}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: d.color }}>{weights[d.key]}%</span>
            </div>
            <input type="range" min="0" max="100" step="5" value={weights[d.key]} onChange={e => handleChange(d.key, e.target.value)}
              style={{ width: '100%', accentColor: d.color, cursor: 'pointer', height: 4 }} />
          </div>
        ))}
      </div>
      <div style={{ marginTop: 12, height: 7, background: 'var(--surface-2)', borderRadius: 4, overflow: 'hidden', border: '1px solid var(--border)', display: 'flex' }}>
        {DIMS.map(d => <div key={d.key} style={{ width: `${weights[d.key]}%`, background: d.color, transition: 'width 0.3s', height: '100%' }} />)}
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
        {DIMS.map(d => <span key={d.key} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10.5, color: 'var(--text-3)' }}><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 2, background: d.color }}></span>{d.label.split(' ')[0]}</span>)}
      </div>
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
function Sidebar({ activeView, setView }) {
  const nav = [
    { id: 'dashboard',  label: 'Vacantes',        icon: 'briefcase' },
    { id: 'interviews', label: 'Entrevistas',      icon: 'video' },
    { id: 'compare',    label: 'Comparar',         icon: 'columns' },
    { id: 'review',     label: 'Decisores',        icon: 'eye' },
    { id: 'reports',    label: 'Reportes',         icon: 'chart' },
  ];
  const isVacancyFlow = ['dashboard','vacancy','candidate','interview'].includes(activeView);

  return (
    <aside style={{ width: 216, flexShrink: 0, height: '100vh', background: 'var(--surface)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', padding: '0 0 16px' }}>
      {/* Logo */}
      <div style={{ padding: '20px 18px 16px', borderBottom: '1px solid var(--border)', marginBottom: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M4 14L9 4L14 14" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M6 11H12" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: '-0.7px', color: 'var(--text-1)', lineHeight: 1 }}>HireScore</div>
            <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 1, fontWeight: 500 }}>Evaluación inteligente</div>
          </div>
        </div>
      </div>
      {/* Nav */}
      <nav style={{ flex: 1, padding: '4px 8px', display: 'flex', flexDirection: 'column', gap: 1 }}>
        {nav.map(item => {
          const active = item.id === 'dashboard' ? isVacancyFlow : activeView === item.id;
          const Ic = ICONS[item.icon];
          return (
            <button key={item.id} onClick={() => setView(item.id)}
              style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', background: active ? 'var(--accent-light)' : 'transparent', color: active ? 'var(--accent)' : 'var(--text-2)', fontSize: 13.5, fontWeight: active ? 600 : 500, transition: 'all 0.13s', textAlign: 'left', width: '100%' }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.color = 'var(--text-1)'; }}}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-2)'; }}}>
              <Ic />{item.label}
            </button>
          );
        })}
      </nav>
      {/* Bottom */}
      <div style={{ padding: '0 8px', display: 'flex', flexDirection: 'column', gap: 1 }}>
        <button onClick={() => setView('settings')}
          style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', background: activeView === 'settings' ? 'var(--accent-light)' : 'transparent', color: activeView === 'settings' ? 'var(--accent)' : 'var(--text-2)', fontSize: 13.5, fontWeight: 500, textAlign: 'left', width: '100%' }}>
          {React.createElement(ICONS.settings)} Configuración
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', marginTop: 2, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
          <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg,#4B74F0,#7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'white', flexShrink: 0 }}>AR</div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Ana Ríos</div>
            <div style={{ fontSize: 11, color: 'var(--text-3)' }}>Reclutadora Sr.</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

// ─── TopBar ───────────────────────────────────────────────────────────────────
function TopBar({ title, breadcrumb, onBack, action }) {
  return (
    <div style={{ height: 56, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 12, padding: '0 24px', borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
      {onBack && (
        <button onClick={onBack}
          style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', border: '1px solid var(--border)', borderRadius: 7, background: 'transparent', cursor: 'pointer', fontSize: 13, color: 'var(--text-2)', fontWeight: 500 }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.color = 'var(--text-1)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-2)'; }}>
          {React.createElement(ICONS.arrowLeft)} Volver
        </button>
      )}
      <div style={{ flex: 1 }}>
        {breadcrumb && <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 1 }}>{breadcrumb}</div>}
        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-1)' }}>{title}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '7px 12px', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8, width: 196 }}>
          {React.createElement(ICONS.search)}
          <input placeholder="Buscar…" style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: 13, color: 'var(--text-1)', width: '100%' }} />
        </div>
        <button style={{ width: 34, height: 34, borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-2)', position: 'relative' }}>
          {React.createElement(ICONS.bell)}
          <div style={{ position: 'absolute', top: 7, right: 7, width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', border: '1.5px solid var(--surface)' }} />
        </button>
        {action}
      </div>
    </div>
  );
}

Object.assign(window, {
  ICONS, ScoreRing, Avatar, Badge, SkillBar, AnimBar, Chip, CostPill,
  ProcessingState, WeightSliders, Sidebar, TopBar, PIPELINE_STEPS,
});
