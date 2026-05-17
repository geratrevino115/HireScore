
// ─── Pipeline stages & data ───────────────────────────────────────────────────
const PIPELINE_STAGES = ["Screening", "Prueba Técnica", "Ent. Técnica", "Ent. Final", "Oferta"];

const DEFAULT_WEIGHTS = { skills: 40, experiencia: 30, educacion: 15, softskills: 15 };

const VACANCIES = [
  {
    id: 1, title: "Senior Software Engineer", department: "Engineering", color: "#2B5CE6",
    requirements: ["React", "TypeScript", "Node.js", "GraphQL", "AWS"],
    posted: "10 abr 2026", status: "active", priority: "alta",
    description: "Ingeniero senior para liderar el desarrollo del producto core.",
    costTotal: 0.047,
    weights: { skills: 50, experiencia: 25, educacion: 10, softskills: 15 },
    candidates: [
      {
        id: 1, name: "Sofía Ramírez", stageIndex: 2, color: "#2B5CE6",
        cvScore: 88, interviewScore: 89, fitScore: 83, score: 87, matchScore: 92,
        role: "Sr. Frontend Developer", location: "CDMX", experience: "6 años",
        education: "Ing. Sistemas — UNAM", lastActivity: "hace 2h", status: "top",
        cost: 0.012,
        jobStatus: "done", // done | processing | pending
        skillMatches: [
          { skill: "React",      match: 95, inCv: true  },
          { skill: "TypeScript", match: 90, inCv: true  },
          { skill: "Node.js",    match: 82, inCv: true  },
          { skill: "GraphQL",    match: 78, inCv: true  },
          { skill: "AWS",        match: 45, inCv: false },
        ],
        skillsGap: ["AWS", "Infrastructure-as-Code"],
        features: [
          { dim: "Habilidades técnicas", raw: 0.88, weight: 50, contrib: 44.0, color: "#2B5CE6" },
          { dim: "Experiencia",          raw: 0.83, weight: 25, contrib: 20.8, color: "#7C3AED" },
          { dim: "Educación",            raw: 0.90, weight: 10, contrib:  9.0, color: "#16A34A" },
          { dim: "Soft skills",          raw: 0.75, weight: 15, contrib: 11.3, color: "#D97706" },
        ],
        interview: { recorded: true, transcribed: true, duration: "48m", date: "28 abr 2026", platform: "Zoom" },
        cvUploaded: true,
        timeline: [
          { stage: "Aplicación recibida", date: "15 abr", done: true },
          { stage: "Screening inicial",   date: "18 abr", done: true },
          { stage: "Entrevista técnica",  date: "28 abr", done: true, current: true },
          { stage: "Entrevista final",    date: "—",      done: false },
          { stage: "Decisión",            date: "—",      done: false },
        ],
        notes: ["Excelente arquitectura de componentes", "TypeScript avanzado confirmado", "Gap en cloud — área a desarrollar"],
        transcript: [
          { speaker: "Reclutadora", time: "00:02", text: "Cuéntame sobre tu experiencia con React en proyectos grandes." },
          { speaker: "Sofía",       time: "00:45", text: "En mi último proyecto trabajé en una plataforma SaaS con +200 componentes. Usamos atomic design para mantener consistencia y reutilización." },
          { speaker: "Reclutadora", time: "02:10", text: "¿Cómo manejaste el estado global?" },
          { speaker: "Sofía",       time: "02:28", text: "Zustand para estado global y React Query para server state. Evitamos Redux porque la complejidad no se justificaba." },
          { speaker: "Reclutadora", time: "04:15", text: "¿Experiencia con AWS?" },
          { speaker: "Sofía",       time: "04:32", text: "Conocimiento básico — S3 y CloudFront para deploy, pero no tengo experiencia profunda con otros servicios." },
        ],
        softSkillsEvidence: [
          { dim: "Comunicación",       score: 82, evidence: "Explica decisiones técnicas con claridad y contexto de negocio." },
          { dim: "Pensamiento crítico", score: 88, evidence: "Justifica elección de Zustand sobre Redux con argumentos medibles." },
          { dim: "Trabajo en equipo",  score: 79, evidence: "Menciona colaboración estrecha con producto y diseño." },
        ],
        aiHighlights: ["Dominio avanzado de React y ecosistema moderno", "Criterio sólido en arquitectura de componentes", "Gap en cloud — área de desarrollo a corto plazo"],
        recommendation: "Avanzar a entrevista final",
      },
      {
        id: 2, name: "Carlos Mendoza", stageIndex: 0, color: "#7C3AED",
        cvScore: 72, interviewScore: null, fitScore: 74, score: 73, matchScore: 68,
        role: "Backend Engineer", location: "Guadalajara", experience: "4 años",
        education: "Lic. Computación — ITESM", lastActivity: "hace 1 día", status: "active",
        cost: 0.009, jobStatus: "done",
        skillMatches: [
          { skill: "React",      match: 30, inCv: false },
          { skill: "TypeScript", match: 60, inCv: true  },
          { skill: "Node.js",    match: 82, inCv: true  },
          { skill: "GraphQL",    match: 55, inCv: true  },
          { skill: "AWS",        match: 48, inCv: false },
        ],
        skillsGap: ["React", "AWS", "Frontend en general"],
        features: [
          { dim: "Habilidades técnicas", raw: 0.55, weight: 50, contrib: 27.5, color: "#2B5CE6" },
          { dim: "Experiencia",          raw: 0.74, weight: 25, contrib: 18.5, color: "#7C3AED" },
          { dim: "Educación",            raw: 0.78, weight: 10, contrib:  7.8, color: "#16A34A" },
          { dim: "Soft skills",          raw: 0.70, weight: 15, contrib: 10.5, color: "#D97706" },
        ],
        interview: { recorded: false, transcribed: false, duration: null, date: null, platform: null },
        cvUploaded: true,
        timeline: [
          { stage: "Aplicación recibida", date: "20 abr", done: true },
          { stage: "Screening inicial",   date: "—", done: false, current: true },
          { stage: "Entrevista técnica",  date: "—", done: false },
          { stage: "Entrevista final",    date: "—", done: false },
          { stage: "Decisión",            date: "—", done: false },
        ],
        notes: ["Perfil backend puro", "React es gap importante para este rol"],
        transcript: [], softSkillsEvidence: [],
        aiHighlights: ["Node.js y bases de datos son fortalezas", "React es gap significativo para este rol"],
        recommendation: "Evaluar con prueba técnica antes de continuar",
      },
    ],
  },
  {
    id: 2, title: "Product Designer", department: "Producto", color: "#16A34A",
    requirements: ["Figma", "User Research", "Prototyping", "Design Systems", "Motion Design"],
    posted: "12 abr 2026", status: "active", priority: "media",
    description: "Diseñador para liderar la experiencia del usuario.",
    costTotal: 0.031,
    weights: { ...DEFAULT_WEIGHTS },
    candidates: [
      {
        id: 3, name: "Ana Torres", stageIndex: 3, color: "#16A34A",
        cvScore: 96, interviewScore: 95, fitScore: 91, score: 94, matchScore: 96,
        role: "Product Designer Sr.", location: "Monterrey", experience: "7 años",
        education: "Diseño Gráfico — UDEM", lastActivity: "hace 5h", status: "top",
        cost: 0.016, jobStatus: "done",
        skillMatches: [
          { skill: "Figma",          match: 98, inCv: true  },
          { skill: "User Research",  match: 92, inCv: true  },
          { skill: "Prototyping",    match: 95, inCv: true  },
          { skill: "Design Systems", match: 90, inCv: true  },
          { skill: "Motion Design",  match: 70, inCv: true  },
        ],
        skillsGap: [],
        features: [
          { dim: "Habilidades técnicas", raw: 0.95, weight: 40, contrib: 38.0, color: "#2B5CE6" },
          { dim: "Experiencia",          raw: 0.94, weight: 30, contrib: 28.2, color: "#7C3AED" },
          { dim: "Educación",            raw: 0.88, weight: 15, contrib: 13.2, color: "#16A34A" },
          { dim: "Soft skills",          raw: 0.93, weight: 15, contrib: 14.0, color: "#D97706" },
        ],
        interview: { recorded: true, transcribed: true, duration: "62m", date: "25 abr 2026", platform: "Google Meet" },
        cvUploaded: true,
        timeline: [
          { stage: "Aplicación recibida", date: "10 abr", done: true },
          { stage: "Screening inicial",   date: "14 abr", done: true },
          { stage: "Entrevista técnica",  date: "20 abr", done: true },
          { stage: "Entrevista final",    date: "25 abr", done: true, current: true },
          { stage: "Decisión",            date: "—", done: false },
        ],
        notes: ["Portafolio excepcional", "Liderazgo en design systems demostrado"],
        transcript: [
          { speaker: "Reclutadora", time: "00:03", text: "Ana, cuéntanos cómo has estructurado design systems anteriormente." },
          { speaker: "Ana",         time: "00:40", text: "En Clip construimos un design system desde cero para 4 plataformas. Documenté cada componente con variantes y accesibilidad. Redujimos el tiempo de entrega de nuevas features un 35%." },
          { speaker: "Reclutadora", time: "02:50", text: "¿Cómo colaboras con ingeniería para mantener fidelidad diseño-código?" },
          { speaker: "Ana",         time: "03:10", text: "Uso Figma con tokens sincronizados al código, hago QA de diseño y tenemos sesiones semanales de feedback bidireccional." },
        ],
        softSkillsEvidence: [
          { dim: "Liderazgo",   score: 94, evidence: "Lideró design system para 4 plataformas con métricas de impacto claras." },
          { dim: "Comunicación", score: 96, evidence: "Describe proceso con métricas específicas (35% reducción de tiempo)." },
          { dim: "Colaboración", score: 92, evidence: "Establece sesiones de feedback estructuradas con ingeniería." },
        ],
        aiHighlights: ["Perfil excepcional — cumple todos los requisitos", "Métricas de impacto concretas en design systems", "Recomendada para oferta inmediata"],
        recommendation: "Hacer oferta esta semana",
      },
      {
        id: 5, name: "Diego Vargas", stageIndex: 1, color: "#0891B2",
        cvScore: 74, interviewScore: null, fitScore: 71, score: 73, matchScore: 76,
        role: "UX Designer", location: "CDMX", experience: "4 años",
        education: "Diseño Industrial — IBERO", lastActivity: "hace 2 días", status: "active",
        cost: 0.008, jobStatus: "processing",
        skillMatches: [
          { skill: "Figma",          match: 88, inCv: true  },
          { skill: "User Research",  match: 80, inCv: true  },
          { skill: "Prototyping",    match: 72, inCv: true  },
          { skill: "Design Systems", match: 55, inCv: false },
          { skill: "Motion Design",  match: 40, inCv: false },
        ],
        skillsGap: ["Design Systems", "Motion Design"],
        features: [
          { dim: "Habilidades técnicas", raw: 0.67, weight: 40, contrib: 26.8, color: "#2B5CE6" },
          { dim: "Experiencia",          raw: 0.71, weight: 30, contrib: 21.3, color: "#7C3AED" },
          { dim: "Educación",            raw: 0.75, weight: 15, contrib: 11.3, color: "#16A34A" },
          { dim: "Soft skills",          raw: 0.69, weight: 15, contrib: 10.4, color: "#D97706" },
        ],
        interview: { recorded: false, transcribed: false, duration: null, date: null, platform: null },
        cvUploaded: true,
        timeline: [
          { stage: "Aplicación recibida", date: "14 abr", done: true },
          { stage: "Screening inicial",   date: "17 abr", done: true },
          { stage: "Prueba técnica",      date: "24 abr", done: false, current: true },
          { stage: "Entrevista final",    date: "—", done: false },
          { stage: "Decisión",            date: "—", done: false },
        ],
        notes: ["UX research sólido", "Design systems es área de crecimiento"],
        transcript: [], softSkillsEvidence: [],
        aiHighlights: ["UX research sólido", "Design systems y motion design son gaps relevantes"],
        recommendation: "Continuar con prueba técnica",
      },
    ],
  },
  {
    id: 3, title: "DevOps Engineer", department: "Infraestructura", color: "#D97706",
    requirements: ["AWS", "Docker", "Kubernetes", "Terraform", "CI/CD", "Linux"],
    posted: "22 abr 2026", status: "active", priority: "urgente",
    description: "DevOps para fortalecer infraestructura cloud y pipelines CI/CD.",
    costTotal: 0.008,
    weights: { skills: 60, experiencia: 25, educacion: 5, softskills: 10 },
    candidates: [
      {
        id: 4, name: "Luis Herrera", stageIndex: 0, color: "#D97706",
        cvScore: 68, interviewScore: null, fitScore: 62, score: 65, matchScore: 68,
        role: "DevOps Jr.", location: "CDMX", experience: "3 años",
        education: "Ing. Redes — IPN", lastActivity: "hace 3 días", status: "active",
        cost: 0.008, jobStatus: "pending",
        skillMatches: [
          { skill: "AWS",        match: 85, inCv: true  },
          { skill: "Docker",     match: 88, inCv: true  },
          { skill: "Kubernetes", match: 50, inCv: false },
          { skill: "Terraform",  match: 75, inCv: true  },
          { skill: "CI/CD",      match: 60, inCv: true  },
          { skill: "Linux",      match: 90, inCv: true  },
        ],
        skillsGap: ["Kubernetes", "Orquestación avanzada"],
        features: [
          { dim: "Habilidades técnicas", raw: 0.74, weight: 60, contrib: 44.4, color: "#2B5CE6" },
          { dim: "Experiencia",          raw: 0.55, weight: 25, contrib: 13.8, color: "#7C3AED" },
          { dim: "Educación",            raw: 0.65, weight:  5, contrib:  3.3, color: "#16A34A" },
          { dim: "Soft skills",          raw: 0.62, weight: 10, contrib:  6.2, color: "#D97706" },
        ],
        interview: { recorded: false, transcribed: false, duration: null, date: null, platform: null },
        cvUploaded: false,
        timeline: [
          { stage: "Aplicación recibida", date: "22 abr", done: true },
          { stage: "Screening inicial",   date: "—", done: false, current: true },
          { stage: "Entrevista técnica",  date: "—", done: false },
          { stage: "Entrevista final",    date: "—", done: false },
          { stage: "Decisión",            date: "—", done: false },
        ],
        notes: [],
        transcript: [], softSkillsEvidence: [],
        aiHighlights: ["AWS, Docker y Linux son fortalezas", "Kubernetes necesita validación", "CV pendiente — análisis incompleto"],
        recommendation: "Solicitar CV completo antes de continuar",
      },
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function stageBadge(idx) {
  if (idx === 4) return 'green';
  if (idx === 3) return 'amber';
  if (idx >= 2) return 'accent';
  return 'default';
}
function priorityBadge(p) {
  return p === 'urgente' ? 'red' : p === 'alta' ? 'amber' : 'default';
}

// ════════════════════════════════════════════════════════════════════════════
// DASHBOARD — Notion-style page
// ════════════════════════════════════════════════════════════════════════════
function NotionProperty({ icon, label, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, padding: '4px 0', minHeight: 28 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, width: 160, color: 'var(--n-text-2)', fontSize: 14, padding: '2px 6px', borderRadius: 4, cursor: 'pointer' }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--n-hover)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
        <span style={{ fontSize: 14 }}>{icon}</span>
        <span>{label}</span>
      </div>
      <div style={{ flex: 1, padding: '2px 6px', borderRadius: 4, color: 'var(--n-text)', fontSize: 14, cursor: 'pointer', minHeight: 24, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 4 }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--n-hover)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
        {children}
      </div>
    </div>
  );
}

function NotionTag({ children, color = 'gray' }) {
  const colors = {
    gray:    { bg: 'rgba(120,119,116,0.16)', fg: '#37352F' },
    brown:   { bg: 'rgba(140,46,0,0.16)',    fg: '#64473A' },
    orange:  { bg: 'rgba(217,115,13,0.16)',  fg: '#D9730D' },
    yellow:  { bg: 'rgba(223,171,1,0.18)',   fg: '#DFAB01' },
    green:   { bg: 'rgba(15,123,108,0.16)',  fg: '#0F7B6C' },
    blue:    { bg: 'rgba(11,110,153,0.16)',  fg: '#0B6E99' },
    purple:  { bg: 'rgba(105,64,165,0.16)',  fg: '#6940A5' },
    pink:    { bg: 'rgba(173,26,114,0.16)',  fg: '#AD1A72' },
    red:     { bg: 'rgba(224,62,62,0.16)',   fg: '#E03E3E' },
  };
  const c = colors[color] || colors.gray;
  return (
    <span style={{
      padding: '1px 8px', borderRadius: 3, fontSize: 14, lineHeight: 1.5,
      background: c.bg, color: c.fg, fontWeight: 400, whiteSpace: 'nowrap',
    }}>{children}</span>
  );
}

const PRIORITY_COLOR = { urgente: 'red', alta: 'orange', media: 'yellow', baja: 'gray' };
const DEPT_COLOR = { Engineering: 'blue', 'Producto': 'green', 'Diseño': 'purple', 'Marketing': 'pink', 'Ventas': 'orange' };

const VACANCY_EMOJI = { 1: '💻', 2: '🎨', 3: '📊', 4: '📣', 5: '🔧', 6: '⚙️', 7: '🚀' };
function vacEmoji(v) { return VACANCY_EMOJI[v.id] || '📄'; }

function DashboardView({ setView, setVacancy, setNewVacancyOpen }) {
  const [tab, setTab] = React.useState('table');
  const [hov, setHov] = React.useState(null);
  const total = VACANCIES.reduce((a, v) => a + v.candidates.length, 0);
  const withInterview = VACANCIES.reduce((a, v) => a + v.candidates.filter(c => c.interview.recorded).length, 0);

  return (
    <div className="notion-page" style={{ flex: 1, overflow: 'auto', background: 'var(--n-bg)' }}>
      {/* Top toolbar minimal (Notion) */}
      <div style={{ height: 45, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 14px', borderBottom: '1px solid var(--n-divider)', color: 'var(--n-text-2)', fontSize: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ padding: '3px 6px', borderRadius: 4, cursor: 'pointer' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--n-hover)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>Workspace</span>
          <span style={{ color: 'var(--n-text-3)' }}>/</span>
          <span style={{ padding: '3px 6px', borderRadius: 4, cursor: 'pointer', color: 'var(--n-text)', display: 'inline-flex', gap: 4, alignItems: 'center' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--n-hover)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            💼 <span>Vacantes activas</span>
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <button style={{ padding: '4px 8px', height: 28, borderRadius: 4, border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 14, color: 'var(--n-text-2)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--n-hover)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>Compartir</button>
          <button aria-label="Comentarios" style={{ width: 28, height: 28, borderRadius: 4, border: 'none', background: 'transparent', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--n-text-2)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--n-hover)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          </button>
          <button aria-label="Favorito" style={{ width: 28, height: 28, borderRadius: 4, border: 'none', background: 'transparent', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--n-text-2)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--n-hover)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polygon points="12 2 15 8.5 22 9.3 17 14.1 18.2 21 12 17.8 5.8 21 7 14.1 2 9.3 9 8.5 12 2"/></svg>
          </button>
          <button aria-label="Más" style={{ width: 28, height: 28, borderRadius: 4, border: 'none', background: 'transparent', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--n-text-2)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--n-hover)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/></svg>
          </button>
        </div>
      </div>

      {/* Page header */}
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '60px 96px 0' }}>
        {/* Icon emoji */}
        <div style={{ fontSize: 78, lineHeight: 1, marginBottom: 4, marginLeft: -4 }}>💼</div>
        {/* Title */}
        <h1 style={{ fontSize: 40, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--n-text)', lineHeight: 1.2, marginTop: 12, marginBottom: 6 }}>
          Vacantes activas
        </h1>

        {/* Properties */}
        <div style={{ marginTop: 12, marginBottom: 8 }}>
          <NotionProperty icon="👤" label="Owner">
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 18, height: 18, borderRadius: '50%', background: '#E03E3E', color: 'white', fontSize: 10, fontWeight: 600, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>AR</span>
              Ana Ríos
            </span>
          </NotionProperty>
          <NotionProperty icon="🏷️" label="Tags">
            <NotionTag color="blue">Recruiting</NotionTag>
            <NotionTag color="green">2026 Q2</NotionTag>
          </NotionProperty>
          <NotionProperty icon="📅" label="Última actualización">
            <span style={{ color: 'var(--n-text-2)' }}>Hoy a las 09:42</span>
          </NotionProperty>
          <NotionProperty icon="🔢" label="Resumen">
            <span style={{ color: 'var(--n-text-2)' }}>
              <strong style={{ color: 'var(--n-text)', fontWeight: 600 }}>{VACANCIES.length}</strong> vacantes ·{' '}
              <strong style={{ color: 'var(--n-text)', fontWeight: 600 }}>{total}</strong> candidatos ·{' '}
              <strong style={{ color: 'var(--n-text)', fontWeight: 600 }}>{withInterview}</strong> entrevistas
            </span>
          </NotionProperty>
          <button style={{ marginTop: 4, padding: '4px 6px', borderRadius: 4, border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--n-text-3)', fontSize: 14, display: 'inline-flex', alignItems: 'center', gap: 6 }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--n-hover)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            + Agregar una propiedad
          </button>
        </div>

        {/* Divider */}
        <div style={{ borderTop: '1px solid var(--n-divider)', margin: '14px 0 8px' }} />

        {/* Inline content paragraph */}
        <p style={{ color: 'var(--n-text)', fontSize: 16, lineHeight: 1.5, margin: '12px 0 4px', padding: '3px 2px' }}>
          Base de datos central de procesos de selección abiertos. Haz clic en una fila para abrir el pipeline kanban de esa vacante.
        </p>

        {/* Database block */}
        <div style={{ marginTop: 28 }}>
          {/* DB header: title + add view */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '4px 0' }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--n-text)', letterSpacing: '-0.01em', margin: 0 }}>📋 Vacantes</h2>
          </div>

          {/* View tabs */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--n-divider)', marginTop: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
              {[
                { id: 'table', label: 'Tabla', icon: '☰' },
                { id: 'board', label: 'Tablero', icon: '▦' },
                { id: 'gallery', label: 'Galería', icon: '▢' },
              ].map(t => (
                <button key={t.id} onClick={() => setTab(t.id)}
                  style={{
                    padding: '6px 10px', borderRadius: 4, border: 'none', background: 'transparent', cursor: 'pointer',
                    fontSize: 14, color: tab === t.id ? 'var(--n-text)' : 'var(--n-text-2)',
                    borderBottom: `2px solid ${tab === t.id ? 'var(--n-text)' : 'transparent'}`,
                    marginBottom: -1, fontWeight: tab === t.id ? 500 : 400,
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                  }}>
                  <span style={{ fontSize: 13 }}>{t.icon}</span> {t.label}
                </button>
              ))}
              <button style={{ padding: '6px 8px', borderRadius: 4, border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 14, color: 'var(--n-text-3)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--n-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>+ Nueva vista</button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <button style={{ padding: '4px 8px', borderRadius: 4, border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 13, color: 'var(--n-text-2)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--n-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>Filtrar</button>
              <button style={{ padding: '4px 8px', borderRadius: 4, border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 13, color: 'var(--n-text-2)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--n-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>Ordenar</button>
              <button aria-label="Buscar" style={{ width: 28, height: 28, borderRadius: 4, border: 'none', background: 'transparent', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--n-text-2)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--n-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              </button>
              <button onClick={() => setNewVacancyOpen(true)} style={{ padding: '5px 10px', borderRadius: 4, border: 'none', background: '#2383E2', color: 'white', cursor: 'pointer', fontSize: 13, fontWeight: 500, marginLeft: 6 }}>
                Nueva
              </button>
            </div>
          </div>

          {/* TABLE VIEW */}
          {tab === 'table' && (
            <div style={{ marginTop: 0 }}>
              {/* Header row */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 90px 90px 1fr', borderBottom: '1px solid var(--n-divider)', fontSize: 12, color: 'var(--n-text-2)', fontWeight: 500 }}>
                {['Aa Vacante','Departamento','Prioridad','Candidatos','Top score','Publicada'].map((h, i) => (
                  <div key={i} style={{ padding: '7px 8px', borderRight: i < 5 ? '1px solid var(--n-divider)' : 'none', cursor: 'pointer' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--n-hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>{h}</div>
                ))}
              </div>
              {/* Rows */}
              {VACANCIES.map(v => {
                const topC = v.candidates.reduce((b, c) => !b || c.score > b.score ? c : b, null);
                const isHov = hov === v.id;
                return (
                  <div key={v.id}
                    onMouseEnter={() => setHov(v.id)} onMouseLeave={() => setHov(null)}
                    onClick={() => { setVacancy(v); setView('vacancy'); }}
                    style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 90px 90px 1fr', borderBottom: '1px solid var(--n-divider)', fontSize: 14, color: 'var(--n-text)', cursor: 'pointer', background: isHov ? 'var(--n-hover)' : 'transparent' }}>
                    <div style={{ padding: '7px 8px', borderRight: '1px solid var(--n-divider)', display: 'flex', alignItems: 'center', gap: 6, minHeight: 32 }}>
                      <span style={{ fontSize: 16, lineHeight: 1 }}>{vacEmoji(v)}</span>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.title}</span>
                      {isHov && (
                        <span style={{ marginLeft: 'auto', padding: '2px 6px', borderRadius: 3, fontSize: 12, color: 'var(--n-text-2)', border: '1px solid var(--n-divider)', background: 'var(--n-bg)' }}>↗ Abrir</span>
                      )}
                    </div>
                    <div style={{ padding: '7px 8px', borderRight: '1px solid var(--n-divider)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <NotionTag color={DEPT_COLOR[v.department] || 'gray'}>{v.department}</NotionTag>
                    </div>
                    <div style={{ padding: '7px 8px', borderRight: '1px solid var(--n-divider)', display: 'flex', alignItems: 'center' }}>
                      <NotionTag color={PRIORITY_COLOR[v.priority] || 'gray'}>{v.priority}</NotionTag>
                    </div>
                    <div style={{ padding: '7px 8px', borderRight: '1px solid var(--n-divider)', display: 'flex', alignItems: 'center', fontVariantNumeric: 'tabular-nums', color: 'var(--n-text-2)' }}>
                      {v.candidates.length}
                    </div>
                    <div style={{ padding: '7px 8px', borderRight: '1px solid var(--n-divider)', display: 'flex', alignItems: 'center', gap: 6 }}>
                      {topC ? (
                        <>
                          <div style={{
                            width: 22, height: 6, borderRadius: 3,
                            background: 'linear-gradient(90deg, ' + (topC.score >= 85 ? '#0F7B6C' : topC.score >= 70 ? '#D9730D' : '#E03E3E') + ' ' + topC.score + '%, var(--n-hover) ' + topC.score + '%)',
                          }} />
                          <span style={{ fontVariantNumeric: 'tabular-nums', color: 'var(--n-text-2)' }}>{topC.score}</span>
                        </>
                      ) : <span style={{ color: 'var(--n-text-3)' }}>—</span>}
                    </div>
                    <div style={{ padding: '7px 8px', display: 'flex', alignItems: 'center', color: 'var(--n-text-2)' }}>
                      {v.posted}
                    </div>
                  </div>
                );
              })}
              {/* Add row */}
              <button onClick={() => setNewVacancyOpen(true)} style={{ width: '100%', padding: '8px 8px', borderRadius: 0, border: 'none', borderBottom: '1px solid var(--n-divider)', background: 'transparent', cursor: 'pointer', fontSize: 14, color: 'var(--n-text-3)', textAlign: 'left' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--n-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                + Nueva vacante
              </button>
              <div style={{ padding: '6px 8px', fontSize: 12, color: 'var(--n-text-3)', display: 'flex', justifyContent: 'space-between' }}>
                <span>Conteo {VACANCIES.length}</span>
                <span>{total} candidatos en total</span>
              </div>
            </div>
          )}

          {/* GALLERY VIEW */}
          {tab === 'gallery' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12, padding: '14px 0' }}>
              {VACANCIES.map(v => {
                const topC = v.candidates.reduce((b, c) => !b || c.score > b.score ? c : b, null);
                return (
                  <div key={v.id} onClick={() => { setVacancy(v); setView('vacancy'); }}
                    style={{ border: '1px solid var(--n-divider)', borderRadius: 4, cursor: 'pointer', overflow: 'hidden', background: 'var(--n-bg)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--n-hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'var(--n-bg)'}>
                    <div style={{ height: 86, background: v.color + '14', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36 }}>
                      {vacEmoji(v)}
                    </div>
                    <div style={{ padding: '10px 12px' }}>
                      <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--n-text)', marginBottom: 6 }}>{v.title}</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 6 }}>
                        <NotionTag color={DEPT_COLOR[v.department] || 'gray'}>{v.department}</NotionTag>
                        <NotionTag color={PRIORITY_COLOR[v.priority] || 'gray'}>{v.priority}</NotionTag>
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--n-text-2)', display: 'flex', justifyContent: 'space-between' }}>
                        <span>{v.candidates.length} candidatos</span>
                        {topC && <span>Top {topC.score}</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* BOARD VIEW */}
          {tab === 'board' && (
            <div style={{ display: 'flex', gap: 12, padding: '14px 0', overflowX: 'auto' }}>
              {['alta', 'media', 'baja'].map(prio => (
                <div key={prio} style={{ minWidth: 240, flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 6px', marginBottom: 6 }}>
                    <NotionTag color={PRIORITY_COLOR[prio] || 'gray'}>{prio}</NotionTag>
                    <span style={{ fontSize: 12, color: 'var(--n-text-3)' }}>{VACANCIES.filter(v => v.priority === prio).length}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {VACANCIES.filter(v => v.priority === prio).map(v => (
                      <div key={v.id} onClick={() => { setVacancy(v); setView('vacancy'); }}
                        style={{ background: 'var(--n-bg)', border: '1px solid var(--n-divider)', borderRadius: 4, padding: '8px 10px', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--n-hover)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'var(--n-bg)'}>
                        <div style={{ fontSize: 14, color: 'var(--n-text)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 5 }}>
                          <span style={{ fontSize: 15 }}>{vacEmoji(v)}</span> {v.title}
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                          <NotionTag color={DEPT_COLOR[v.department] || 'gray'}>{v.department}</NotionTag>
                          <NotionTag color="gray">{v.candidates.length} candidatos</NotionTag>
                        </div>
                      </div>
                    ))}
                    <button style={{ padding: '6px 8px', borderRadius: 4, border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 13, color: 'var(--n-text-3)', textAlign: 'left' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--n-hover)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>+ Nueva</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ height: 80 }} />
      </div>
    </div>
  );
}

function VacancyCard({ v, isHov, setHov, onClick }) {
  const stageCounts = PIPELINE_STAGES.map((_, i) => v.candidates.filter(c => c.stageIndex === i).length);
  const topC = v.candidates.reduce((b, c) => !b || c.score > b.score ? c : b, null);
  return (
    <div onClick={onClick} onMouseEnter={() => setHov(v.id)} onMouseLeave={() => setHov(null)}
      style={{ background: 'var(--surface)', border: `1px solid ${isHov ? v.color + '45' : 'var(--border)'}`, borderRadius: 14, overflow: 'hidden', cursor: 'pointer', boxShadow: isHov ? `0 8px 28px ${v.color}12` : '0 1px 4px rgba(0,0,0,0.04)', transform: isHov ? 'translateY(-2px)' : 'none', transition: 'all 0.2s cubic-bezier(0.34,1.1,0.64,1)' }}>
      <div style={{ height: 4, background: v.color }} />
      <div style={{ padding: '18px 20px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-1)', marginBottom: 5 }}>{v.title}</div>
            <div style={{ display: 'flex', gap: 5 }}>
              <Badge variant="default" small>{v.department}</Badge>
              <Badge variant={priorityBadge(v.priority)} small>{v.priority}</Badge>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5 }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: v.color + '12', border: `1.5px solid ${v.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: v.color }}>
              {React.createElement(ICONS.briefcase)}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 14 }}>
          {v.requirements.slice(0, 4).map(r => <span key={r} style={{ padding: '2px 8px', borderRadius: 5, fontSize: 11, fontWeight: 500, background: v.color + '0E', color: v.color, border: `1px solid ${v.color}20` }}>{r}</span>)}
          {v.requirements.length > 4 && <span style={{ padding: '2px 8px', borderRadius: 5, fontSize: 11, color: 'var(--text-3)', background: 'var(--surface-2)', border: '1px solid var(--border)' }}>+{v.requirements.length - 4}</span>}
        </div>
        {/* Pipeline mini */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 10, color: 'var(--text-3)', fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pipeline</div>
          <div style={{ display: 'flex', gap: 3 }}>
            {PIPELINE_STAGES.map((s, i) => (
              <div key={s} title={`${s}: ${stageCounts[i]}`} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <div style={{ width: '100%', height: 5, borderRadius: 3, background: stageCounts[i] > 0 ? v.color : 'var(--surface-2)', border: `1px solid ${stageCounts[i] > 0 ? v.color + '40' : 'var(--border)'}` }} />
                {stageCounts[i] > 0 && <span style={{ fontSize: 9, color: v.color, fontWeight: 700 }}>{stageCounts[i]}</span>}
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div style={{ display: 'flex', gap: 14 }}>
            <div><div style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-1)', letterSpacing: '-0.5px', lineHeight: 1 }}>{v.candidates.length}</div><div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 2 }}>candidatos</div></div>
            <div><div style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-1)', letterSpacing: '-0.5px', lineHeight: 1 }}>{v.candidates.filter(c => c.interview.recorded).length}</div><div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 2 }}>entrevistas</div></div>
          </div>
          {topC && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 9px', background: v.color + '0A', borderRadius: 7, border: `1px solid ${v.color}18` }}>
              <span style={{ fontSize: 10, color: v.color, fontWeight: 700 }}>⭐ Top</span>
              <Avatar name={topC.name} color={topC.color} size={20} />
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-1)' }}>{topC.name.split(' ')[0]}</span>
              <ScoreRing score={topC.score} size={24} strokeWidth={2.5} />
            </div>
          )}
        </div>
      </div>
      <div style={{ padding: '9px 20px', background: 'var(--surface-2)', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 12.5, fontWeight: 600, color: v.color }}>Ver pipeline →</span>
        <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{v.posted}</span>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// VACANCY DETAIL — Kanban
// ════════════════════════════════════════════════════════════════════════════
function VacancyDetail({ vacancy: v, setVacancy, setView, setCandidate, setUploadOpen }) {
  const [weightsOpen, setWeightsOpen] = React.useState(false);
  const [weights, setWeights] = React.useState(v.weights || DEFAULT_WEIGHTS);
  const stageCols = PIPELINE_STAGES.map((s, i) => ({ label: s, idx: i, candidates: v.candidates.filter(c => c.stageIndex === i) }));
  const totalW = Object.values(weights).reduce((a, b) => a + b, 0);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg)', overflow: 'hidden' }}>
      <TopBar title={v.title} breadcrumb={`Vacantes → ${v.department}`} onBack={() => setView('dashboard')}
        action={
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setWeightsOpen(w => !w)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', borderRadius: 8, background: weightsOpen ? 'var(--accent-light)' : 'var(--surface-2)', color: weightsOpen ? 'var(--accent)' : 'var(--text-1)', border: `1px solid ${weightsOpen ? 'var(--accent-border)' : 'var(--border)'}`, cursor: 'pointer', fontSize: 12.5, fontWeight: 500 }}>
              {React.createElement(ICONS.sliders)} Pesos del score
              {JSON.stringify(weights) !== JSON.stringify(DEFAULT_WEIGHTS) && <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', marginLeft: 2 }} />}
            </button>
            <button onClick={() => setUploadOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', borderRadius: 8, background: 'var(--surface-2)', color: 'var(--text-1)', border: '1px solid var(--border)', cursor: 'pointer', fontSize: 12.5, fontWeight: 500 }}>
              {React.createElement(ICONS.upload)} Cargar CV
            </button>
            <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, background: v.color, color: 'white', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
              {React.createElement(ICONS.plus)} Añadir candidato
            </button>
          </div>
        } />

      {/* Weights panel */}
      {weightsOpen && (
        <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '20px 24px', display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24, alignItems: 'start' }}>
          <WeightSliders weights={weights} onChange={setWeights} />
          <div style={{ padding: '14px 16px', background: 'var(--surface-2)', borderRadius: 10, border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              {React.createElement(ICONS.info)}
              <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-1)' }}>¿Qué son los pesos?</span>
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.65, margin: 0 }}>
              Los pesos definen qué tanto importa cada dimensión en el score final de esta vacante. Una vacante de DevOps puede priorizar habilidades técnicas (60%) sobre educación (5%). Los cambios aplican a todos los candidatos de esta vacante.
            </p>
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button onClick={() => setWeights(DEFAULT_WEIGHTS)} style={{ padding: '6px 12px', borderRadius: 7, background: 'var(--surface)', border: '1px solid var(--border)', cursor: 'pointer', fontSize: 12, color: 'var(--text-2)', fontWeight: 500 }}>Restablecer</button>
              <button onClick={() => setWeightsOpen(false)} disabled={Math.abs(totalW - 100) > 1} style={{ flex: 1, padding: '6px 12px', borderRadius: 7, background: Math.abs(totalW - 100) < 1 ? v.color : 'var(--surface-2)', border: 'none', cursor: 'pointer', fontSize: 12, color: Math.abs(totalW - 100) < 1 ? 'white' : 'var(--text-3)', fontWeight: 600 }}>
                Guardar pesos
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Meta bar */}
      <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 20, flexShrink: 0 }}>
        <div style={{ flex: 1, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <Badge variant="green" small>● Activa</Badge>
          <Badge variant={priorityBadge(v.priority)} small>Prioridad {v.priority}</Badge>
          {v.requirements.map(r => <span key={r} style={{ padding: '2px 7px', borderRadius: 5, fontSize: 11, fontWeight: 500, background: v.color + '0E', color: v.color, border: `1px solid ${v.color}20` }}>{r}</span>)}
        </div>
        <div style={{ display: 'flex', gap: 20, flexShrink: 0, alignItems: 'center' }}>
          {[
            { label: 'Candidatos', val: v.candidates.length },
            { label: 'Con entrevista', val: v.candidates.filter(c => c.interview.recorded).length },
            { label: 'En etapa final', val: v.candidates.filter(c => c.stageIndex >= 3).length },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-1)', letterSpacing: '-0.5px', lineHeight: 1 }}>{s.val}</div>
              <div style={{ fontSize: 10.5, color: 'var(--text-3)', marginTop: 1 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Kanban */}
      <div style={{ flex: 1, overflow: 'auto', padding: '18px 20px' }}>
        <div style={{ display: 'flex', gap: 12, minWidth: 'fit-content', alignItems: 'flex-start' }}>
          {stageCols.map(col => (
            <div key={col.label} style={{ width: 240, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 13px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10 }}>
                <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-1)' }}>{col.label}</span>
                <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 100, background: col.candidates.length > 0 ? v.color + '14' : 'var(--surface-2)', color: col.candidates.length > 0 ? v.color : 'var(--text-3)', border: `1px solid ${col.candidates.length > 0 ? v.color + '30' : 'var(--border)'}` }}>{col.candidates.length}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {col.candidates.length === 0 && <div style={{ border: '1.5px dashed var(--border)', borderRadius: 10, padding: '18px', textAlign: 'center', color: 'var(--text-3)', fontSize: 12 }}>Sin candidatos</div>}
                {col.candidates.map(c => <KanbanCard key={c.id} c={c} v={v} onClick={() => { setCandidate(c); setView('candidate'); }} />)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function KanbanCard({ c, v, onClick }) {
  const [hov, setHov] = React.useState(false);
  const isProcessing = c.jobStatus === 'processing';
  const isPending = c.jobStatus === 'pending';

  return (
    <div onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background: 'var(--surface)', border: `1px solid ${hov ? v.color + '50' : 'var(--border)'}`, borderRadius: 10, padding: '13px', cursor: 'pointer', boxShadow: hov ? `0 4px 16px ${v.color}14` : '0 1px 3px rgba(0,0,0,0.04)', transition: 'all 0.15s ease', opacity: isPending ? 0.7 : 1 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 9, marginBottom: 9 }}>
        <Avatar name={c.name} color={c.color} size={30} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2 }}>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</span>
            {c.status === 'top' && <span style={{ fontSize: 10 }}>⭐</span>}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{c.experience} · {c.location}</div>
        </div>
        {isProcessing ? (
          <div style={{ display: 'flex', gap: 2, alignItems: 'center', flexShrink: 0 }}>
            {[0,1,2].map(i => <div key={i} style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--accent)', animation: `blink 1s ease ${i*0.2}s infinite` }} />)}
          </div>
        ) : isPending ? (
          <div style={{ fontSize: 10, color: 'var(--text-3)', padding: '2px 6px', background: 'var(--surface-2)', borderRadius: 4, border: '1px solid var(--border)' }}>Pendiente</div>
        ) : (
          <ScoreRing score={c.score} size={34} strokeWidth={3} />
        )}
      </div>

      {/* Match bar */}
      {!isPending && (
        <div style={{ marginBottom: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
            <span style={{ fontSize: 10.5, color: 'var(--text-3)', fontWeight: 500 }}>Match con vacante</span>
            <span style={{ fontSize: 10.5, fontWeight: 700, color: c.matchScore >= 85 ? 'var(--green)' : c.matchScore >= 70 ? 'var(--amber)' : 'var(--red)' }}>{c.matchScore}%</span>
          </div>
          <div style={{ height: 4, background: 'var(--surface-2)', borderRadius: 2, overflow: 'hidden', border: '1px solid var(--border)' }}>
            <div style={{ height: '100%', width: `${c.matchScore}%`, background: c.matchScore >= 85 ? 'var(--green)' : c.matchScore >= 70 ? 'var(--amber)' : 'var(--red)', borderRadius: 2 }} />
          </div>
        </div>
      )}

      {/* Gaps */}
      {c.skillsGap.length > 0 && !isPending && (
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 7 }}>
          {c.skillsGap.slice(0, 2).map(g => <Chip key={g} variant="gap">{g}</Chip>)}
          {c.skillsGap.length > 2 && <span style={{ fontSize: 10.5, color: 'var(--red)', fontWeight: 600 }}>+{c.skillsGap.length - 2}</span>}
        </div>
      )}

      {/* Status row */}
      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {c.interview.recorded ? <Badge variant="accent" small>🎙 Transcrita</Badge> : <Badge variant="default" small>Sin entrevista</Badge>}
          {c.cvUploaded ? <Badge variant="green" small>CV ✓</Badge> : <Badge variant="amber" small>Sin CV</Badge>}
        </div>
        {c.cost > 0 && <CostPill cost={c.cost} />}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// CANDIDATE DETAIL
// ════════════════════════════════════════════════════════════════════════════
function CandidateDetail({ candidate: c, vacancy: v, setView }) {
  const [tab, setTab] = React.useState('resumen');
  const tabs = [
    { id: 'resumen',      label: 'Resumen' },
    { id: 'explicacion',  label: 'Explicación' },
    { id: 'cv',           label: 'Análisis CV' },
    { id: 'entrevista',   label: 'Entrevista' },
    { id: 'timeline',     label: 'Timeline' },
  ];

  return (
    <div style={{ flex: 1, overflow: 'auto', background: 'var(--bg)' }}>
      <TopBar title={c.name} breadcrumb={`${v.title} → Candidatos`} onBack={() => setView('vacancy')}
        action={
          <div style={{ display: 'flex', gap: 8 }}>
            <button style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px', borderRadius: 8, background: 'var(--surface-2)', color: 'var(--text-1)', border: '1px solid var(--border)', cursor: 'pointer', fontSize: 12.5, fontWeight: 500 }}>
              {React.createElement(ICONS.share)} Compartir
            </button>
            <button onClick={() => setView('interview')} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, background: v.color, color: 'white', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
              {React.createElement(ICONS.video)} {c.interview.recorded ? 'Ver entrevista' : 'Gestionar entrevista'}
            </button>
          </div>
        } />

      {/* Hero */}
      <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '22px 28px 0' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 16 }}>
          <Avatar name={c.name} color={c.color} size={56} />
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.4px', color: 'var(--text-1)', margin: 0 }}>{c.name}</h2>
              <Badge variant={stageBadge(c.stageIndex)}>{PIPELINE_STAGES[c.stageIndex]}</Badge>
              {c.status === 'top' && <Badge variant="top">⭐ Top candidato</Badge>}
            </div>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              {[c.role, c.location, c.experience, c.education].map((val, i) => (
                <span key={i} style={{ fontSize: 13, color: 'var(--text-2)' }}>{val}</span>
              ))}
            </div>
          </div>

          {/* Score breakdown */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
            {[
              { label: 'CV',         val: c.cvScore,        color: '#2B5CE6', w: `${v.weights?.skills ?? 40}%` },
              { label: 'Entrevista', val: c.interviewScore, color: '#7C3AED', w: `${v.weights?.softskills ?? 15}%` },
              { label: 'Fit empresa',val: c.fitScore,       color: '#16A34A', w: `${v.weights?.experiencia ?? 30}%` },
            ].map((item, i) => (
              <React.Fragment key={i}>
                <div style={{ textAlign: 'center', padding: '10px 12px', background: 'var(--surface-2)', borderRadius: 10, border: '1px solid var(--border)', minWidth: 68 }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: item.val !== null ? item.color : 'var(--text-3)', letterSpacing: '-1px', lineHeight: 1 }}>{item.val ?? '—'}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-3)', fontWeight: 500, marginTop: 3 }}>{item.label}</div>
                </div>
                {i < 2 && <span style={{ color: 'var(--border)', fontSize: 18, fontWeight: 300 }}>+</span>}
              </React.Fragment>
            ))}
            <span style={{ color: 'var(--border)', fontSize: 16 }}>=</span>
            <ScoreRing score={c.score} size={68} strokeWidth={5} />
          </div>

          <button style={{ padding: '8px 14px', borderRadius: 8, background: 'var(--surface-2)', color: 'var(--text-1)', border: '1px solid var(--border)', cursor: 'pointer', fontSize: 13, fontWeight: 500, flexShrink: 0, whiteSpace: 'nowrap' }}>
            Avanzar etapa →
          </button>
        </div>

        {/* Recommendation */}
        {c.recommendation && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '9px 14px', background: v.color + '0D', border: `1px solid ${v.color}25`, borderRadius: 8, marginBottom: 14 }}>
            {React.createElement(ICONS.sparkle)}
            <span style={{ fontSize: 13, color: 'var(--text-1)' }}><strong>Recomendación IA:</strong> {c.recommendation}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginLeft: 'auto' }}>
              {React.createElement(ICONS.shield)}
              <span style={{ fontSize: 11, color: 'var(--text-3)' }}>Score auditable — no es decisión automática</span>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 0, marginBottom: -1 }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: '9px 16px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 13, fontWeight: tab === t.id ? 600 : 500, color: tab === t.id ? v.color : 'var(--text-2)', borderBottom: tab === t.id ? `2px solid ${v.color}` : '2px solid transparent', transition: 'all 0.15s' }}>{t.label}</button>
          ))}
        </div>
      </div>

      <div style={{ padding: '24px 28px' }}>
        {tab === 'resumen'     && <ResumenTab c={c} v={v} />}
        {tab === 'explicacion' && <ExplicacionTab c={c} v={v} />}
        {tab === 'cv'          && <CVTab c={c} v={v} />}
        {tab === 'entrevista'  && <EntrevistaTab c={c} v={v} setView={setView} />}
        {tab === 'timeline'    && <TimelineTab c={c} />}
      </div>
    </div>
  );
}

function ResumenTab({ c, v }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 18 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Score breakdown */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '20px 22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>Desglose del Score HireScore</span>
            <Badge variant="accent" small>Auditable</Badge>
          </div>
          {[
            { label: 'Match de CV',             sub: 'Habilidades del CV vs. requisitos', val: c.cvScore,        color: '#2B5CE6', w: v.weights?.skills ?? 40 },
            { label: 'Desempeño en entrevista', sub: 'Basado en transcripción y notas',   val: c.interviewScore, color: '#7C3AED', w: v.weights?.softskills ?? 15 },
            { label: 'Fit con la empresa',      sub: 'Cultura, valores y expectativas',   val: c.fitScore,       color: '#16A34A', w: v.weights?.experiencia ?? 30 },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: i < 2 ? 14 : 0 }}>
              <div style={{ width: 108, flexShrink: 0 }}>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-1)' }}>{item.label}</div>
                <div style={{ fontSize: 10.5, color: 'var(--text-3)', marginTop: 1 }}>{item.w}% del total</div>
              </div>
              <div style={{ flex: 1, height: 7, background: 'var(--surface-2)', borderRadius: 4, overflow: 'hidden', border: '1px solid var(--border)' }}>
                <AnimBar val={item.val || 0} color={item.color} />
              </div>
              <div style={{ width: 46, textAlign: 'right' }}>
                {item.val !== null ? <span style={{ fontSize: 16, fontWeight: 800, color: item.color, letterSpacing: '-0.5px' }}>{item.val}</span>
                  : <span style={{ fontSize: 11, color: 'var(--text-3)', fontStyle: 'italic' }}>Sin datos</span>}
              </div>
            </div>
          ))}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 14px', background: 'var(--surface-2)', borderRadius: 8, border: '1px solid var(--border)', marginTop: 14 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>Score HireScore</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <ScoreRing score={c.score} size={42} strokeWidth={4} />
              <span style={{ fontSize: 20, fontWeight: 800, color: c.score >= 85 ? 'var(--green)' : c.score >= 70 ? 'var(--amber)' : 'var(--red)', letterSpacing: '-1px' }}>{c.score}<span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-3)' }}>/100</span></span>
            </div>
          </div>
        </div>

        {/* Skills match */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '20px 22px' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)', marginBottom: 14 }}>Habilidades requeridas vs. candidato</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {c.skillMatches.map((s, i) => <SkillBar key={s.skill} skill={s.skill} match={s.match} delay={i * 60} />)}
          </div>
          {/* Gaps */}
          {c.skillsGap.length > 0 && (
            <div style={{ marginTop: 14, padding: '12px 14px', background: 'var(--red-light)', border: '1px solid var(--red-border)', borderRadius: 8 }}>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--red)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                {React.createElement(ICONS.info)} {c.skillsGap.length} gap{c.skillsGap.length > 1 ? 's' : ''} detectado{c.skillsGap.length > 1 ? 's' : ''} por IA
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {c.skillsGap.map(g => <Chip key={g} variant="gap">{g}</Chip>)}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 12 }}>
            {React.createElement(ICONS.sparkle)}
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>Insights IA</span>
          </div>
          {c.aiHighlights.map((h, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, padding: '7px 0', borderBottom: i < c.aiHighlights.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <span style={{ color: v.color, flexShrink: 0, marginTop: 1 }}>·</span>
              <span style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.5 }}>{h}</span>
            </div>
          ))}
        </div>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 18px' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)', marginBottom: 10 }}>Notas del reclutador</div>
          {c.notes.map((n, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, padding: '6px 0', borderBottom: i < c.notes.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <div style={{ width: 4, height: 4, borderRadius: '50%', background: v.color, marginTop: 7, flexShrink: 0 }} />
              <span style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.5 }}>{n}</span>
            </div>
          ))}
          {c.notes.length === 0 && <span style={{ fontSize: 12.5, color: 'var(--text-3)' }}>Sin notas aún.</span>}
          <textarea placeholder="Añadir nota…" style={{ width: '100%', marginTop: 10, padding: '8px 10px', border: '1px solid var(--border)', borderRadius: 7, fontSize: 12.5, color: 'var(--text-1)', background: 'var(--surface-2)', resize: 'vertical', minHeight: 56, outline: 'none', fontFamily: 'inherit' }} />
        </div>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 18px' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)', marginBottom: 10 }}>Estado del proceso</div>
          {[
            { label: 'CV',           val: c.cvUploaded ? 'Cargado ✓' : 'Pendiente', ok: c.cvUploaded },
            { label: 'Entrevista',   val: c.interview.recorded ? c.interview.date : 'No realizada', ok: c.interview.recorded },
            { label: 'Plataforma',   val: c.interview.platform || '—' },
            { label: 'Transcripción',val: c.interview.transcribed ? 'Disponible ✓' : '—', ok: c.interview.transcribed },
            { label: 'Costo IA',     val: c.cost ? `$${c.cost.toFixed(4)} USD` : '—' },
            { label: 'Etapa',        val: PIPELINE_STAGES[c.stageIndex] },
          ].map(row => (
            <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{row.label}</span>
              <span style={{ fontSize: 12, fontWeight: 500, color: row.ok === true ? 'var(--green)' : row.ok === false ? 'var(--text-3)' : 'var(--text-2)' }}>{row.val}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Explicación Tab ──────────────────────────────────────────────────────────
function ExplicacionTab({ c, v }) {
  const totalContrib = c.features.reduce((a, f) => a + f.contrib, 0);
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
      {/* Feature breakdown */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '20px 22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>Desglose auditable por dimensión</span>
            <Badge variant="accent" small>Determinístico</Badge>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 16, lineHeight: 1.5 }}>El LLM extrae datos; el scoring es cálculo puro Python. Mismo CV → mismo score, siempre.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 60px 60px 60px', gap: 8, padding: '6px 8px', background: 'var(--surface-2)', borderRadius: '6px 6px 0 0', borderBottom: '1px solid var(--border)' }}>
              {['Dimensión', 'Raw [0-1]', 'Peso %', 'Contribución'].map(h => <span key={h} style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</span>)}
            </div>
            {c.features.map((f, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 60px 60px 60px', gap: 8, padding: '11px 8px', borderBottom: i < c.features.length - 1 ? '1px solid var(--border)' : 'none', alignItems: 'center', background: 'var(--surface)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: f.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: 'var(--text-1)', fontWeight: 500 }}>{f.dim}</span>
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: f.color, fontVariantNumeric: 'tabular-nums' }}>{f.raw.toFixed(2)}</span>
                <span style={{ fontSize: 13, color: 'var(--text-2)', fontVariantNumeric: 'tabular-nums' }}>{f.weight}%</span>
                <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-1)', fontVariantNumeric: 'tabular-nums' }}>{f.contrib.toFixed(1)}</span>
              </div>
            ))}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 60px 60px 60px', gap: 8, padding: '10px 8px', background: 'var(--surface-2)', borderRadius: '0 0 6px 6px', borderTop: '2px solid var(--border)' }}>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-1)' }}>Total</span>
              <span></span><span></span>
              <span style={{ fontSize: 16, fontWeight: 800, color: c.score >= 85 ? 'var(--green)' : c.score >= 70 ? 'var(--amber)' : 'var(--red)', fontVariantNumeric: 'tabular-nums' }}>{totalContrib.toFixed(1)}</span>
            </div>
          </div>
          {/* Visual proportions */}
          <div style={{ marginTop: 14, height: 8, background: 'var(--surface-2)', borderRadius: 4, overflow: 'hidden', display: 'flex', border: '1px solid var(--border)' }}>
            {c.features.map((f, i) => <AnimBar key={i} val={f.weight} color={f.color} />)}
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 6 }}>
            {c.features.map(f => <span key={f.dim} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10.5, color: 'var(--text-3)' }}><span style={{ width: 8, height: 8, borderRadius: 2, background: f.color, display: 'inline-block' }} />{f.dim.split(' ')[0]}</span>)}
          </div>
        </div>

        {/* Gaps detail */}
        {c.skillsGap.length > 0 && (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '18px 20px' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)', marginBottom: 10 }}>Skills faltantes detectados</div>
            <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 10, lineHeight: 1.5 }}>Requisitos de la vacante no encontrados en el CV del candidato.</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {c.skillsGap.map(g => <Chip key={g} variant="gap">{g}</Chip>)}
            </div>
          </div>
        )}
      </div>

      {/* Soft skills evidence */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {c.softSkillsEvidence.length > 0 && (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '18px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>Evidencias de soft skills</span>
              <span style={{ fontSize: 11.5, color: 'var(--text-3)' }}>Extraídas de la transcripción</span>
            </div>
            {c.softSkillsEvidence.map((e, i) => (
              <div key={i} style={{ padding: '12px 14px', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 9, marginBottom: i < c.softSkillsEvidence.length - 1 ? 8 : 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-1)' }}>{e.dim}</span>
                  <span style={{ fontSize: 13, fontWeight: 800, color: e.score >= 85 ? 'var(--green)' : 'var(--amber)', letterSpacing: '-0.5px' }}>{e.score}</span>
                </div>
                <p style={{ fontSize: 12.5, color: 'var(--text-2)', margin: 0, lineHeight: 1.55, fontStyle: 'italic' }}>"{e.evidence}"</p>
              </div>
            ))}
          </div>
        )}

        {/* Disclaimer */}
        <div style={{ background: 'var(--amber-light)', border: '1px solid var(--amber-border)', borderRadius: 10, padding: '14px 16px' }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            {React.createElement(ICONS.shield)}
            <div>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--amber)', marginBottom: 4 }}>Aviso legal</div>
              <p style={{ fontSize: 12, color: 'var(--text-2)', margin: 0, lineHeight: 1.6 }}>
                Este score es asistencia para el reclutador, no una decisión automática. La decisión final siempre corresponde a una persona. (Art. 22 GDPR / AI Act)
              </p>
            </div>
          </div>
        </div>

        {/* Cost detail */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 18px' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)', marginBottom: 10 }}>Costo del análisis</div>
          {[
            { label: 'Extracción de CV',     cost: 0.0041 },
            { label: 'Análisis requisitos',  cost: 0.0028 },
            { label: 'Soft skills (entrev.)', cost: c.interview.transcribed ? 0.0051 : null },
          ].filter(r => r.cost !== null).map(r => (
            <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{r.label}</span>
              <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-2)', fontVariantNumeric: 'tabular-nums' }}>${r.cost.toFixed(4)} USD</span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0 0' }}>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-1)' }}>Total</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)', fontVariantNumeric: 'tabular-nums' }}>${c.cost.toFixed(4)} USD</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function CVTab({ c, v }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '20px 22px' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)', marginBottom: 14 }}>Habilidades detectadas vs. vacante</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {c.skillMatches.map((s, i) => (
            <div key={s.skill}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <div style={{ display: 'flex', gap: 7, alignItems: 'center' }}>
                  <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-1)' }}>{s.skill}</span>
                  {!s.inCv && <span style={{ fontSize: 10, color: 'var(--text-3)', padding: '1px 5px', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 4 }}>No en CV</span>}
                </div>
                <Badge variant={s.match >= 80 ? 'green' : s.match >= 60 ? 'amber' : 'red'} small>
                  {s.match >= 80 ? 'Cumple' : s.match >= 60 ? 'Parcial' : 'Gap'}
                </Badge>
              </div>
              <SkillBar skill="" match={s.match} delay={i * 80} showLabel={false} />
            </div>
          ))}
        </div>
        {c.skillsGap.length > 0 && (
          <div style={{ marginTop: 16, padding: '12px', background: 'var(--red-light)', borderRadius: 8, border: '1px solid var(--red-border)' }}>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--red)', marginBottom: 7 }}>Skills faltantes</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {c.skillsGap.map(g => <Chip key={g} variant="gap">{g}</Chip>)}
            </div>
          </div>
        )}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '18px 20px' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)', marginBottom: 12 }}>Datos extraídos del CV</div>
          {[{ label: 'Nombre', value: c.name }, { label: 'Rol', value: c.role }, { label: 'Experiencia', value: c.experience }, { label: 'Ubicación', value: c.location }, { label: 'Educación', value: c.education }].map(r => (
            <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{r.label}</span>
              <span style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--text-1)' }}>{r.value}</span>
            </div>
          ))}
        </div>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 18px' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)', marginBottom: 10 }}>Habilidades identificadas</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {c.skillMatches.filter(s => s.inCv).map(s => <Chip key={s.skill} color={v.color}>{s.skill}</Chip>)}
          </div>
          {c.skillMatches.filter(s => !s.inCv).length > 0 && (
            <div style={{ marginTop: 10 }}>
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 6 }}>No encontradas en CV:</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {c.skillMatches.filter(s => !s.inCv).map(s => <Chip key={s.skill} variant="gap">{s.skill}</Chip>)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EntrevistaTab({ c, v, setView }) {
  if (!c.interview.recorded) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div onClick={() => setView('interview')} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '28px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 14, cursor: 'pointer', transition: 'all 0.18s' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(43,92,230,0.1)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: 'var(--accent-light)', border: '1.5px solid var(--accent-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>🔗</div>
          <div><div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-1)', marginBottom: 5 }}>Conectar a reunión</div>
          <div style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6 }}>Pega el link de Zoom, Meet o Teams. HireScore se une y transcribe automáticamente.</div></div>
          <div style={{ display: 'flex', gap: 6 }}>{['Zoom', 'Google Meet', 'Teams'].map(p => <span key={p} style={{ padding: '3px 8px', borderRadius: 5, fontSize: 11, background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-2)', fontWeight: 500 }}>{p}</span>)}</div>
        </div>
        <div onClick={() => setView('interview')} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '28px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 14, cursor: 'pointer', transition: 'all 0.18s' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--purple)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(124,58,237,0.1)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: 'var(--purple-light)', border: '1.5px solid var(--purple-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, color: 'var(--purple)' }}>🎧</div>
          <div><div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-1)', marginBottom: 5 }}>Subir grabación</div>
          <div style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6 }}>Ya tienes el audio. HireScore transcribe, diariza hablantes y genera el análisis completo.</div></div>
          <div style={{ display: 'flex', gap: 6 }}>{['MP3', 'MP4', 'WAV', 'M4A'].map(p => <span key={p} style={{ padding: '3px 8px', borderRadius: 5, fontSize: 11, background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-2)', fontWeight: 500 }}>{p}</span>)}</div>
        </div>
      </div>
    );
  }
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 18 }}>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '20px 22px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>Transcripción — {c.interview.speaker_count || 2} hablantes detectados</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Badge variant="green" small>✓ Transcrita y diarizada</Badge>
            <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{c.interview.duration} · {c.interview.platform}</span>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {c.transcript.map((t, i) => (
            <div key={i} style={{ display: 'flex', gap: 12 }}>
              <span style={{ fontSize: 10, color: 'var(--text-3)', paddingTop: 3, minWidth: 36, fontVariantNumeric: 'tabular-nums' }}>{t.time}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 10.5, fontWeight: 700, color: t.speaker === 'Reclutadora' ? v.color : c.color, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: 6 }}>
                  {t.speaker}
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: t.speaker === 'Reclutadora' ? v.color : c.color, display: 'inline-block' }} />
                </div>
                <div style={{ fontSize: 13.5, color: 'var(--text-1)', lineHeight: 1.65, background: t.speaker !== 'Reclutadora' ? 'var(--surface-2)' : 'transparent', padding: t.speaker !== 'Reclutadora' ? '10px 14px' : '0', borderRadius: 8, border: t.speaker !== 'Reclutadora' ? '1px solid var(--border)' : 'none' }}>{t.text}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 18px' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)', marginBottom: 10 }}>Insights IA</div>
          {c.aiHighlights.map((h, i) => (
            <div key={i} style={{ fontSize: 12.5, color: 'var(--text-2)', padding: '7px 0', borderBottom: i < c.aiHighlights.length - 1 ? '1px solid var(--border)' : 'none', lineHeight: 1.5, display: 'flex', gap: 7 }}>
              <span style={{ color: v.color }}>·</span>{h}
            </div>
          ))}
        </div>
        {c.softSkillsEvidence.length > 0 && (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px' }}>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-1)', marginBottom: 10 }}>Soft skills detectados</div>
            {c.softSkillsEvidence.map((e, i) => (
              <div key={i} style={{ padding: '7px 0', borderBottom: i < c.softSkillsEvidence.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-1)' }}>{e.dim}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: e.score >= 85 ? 'var(--green)' : 'var(--amber)' }}>{e.score}</span>
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--text-3)', lineHeight: 1.4, fontStyle: 'italic' }}>"{e.evidence}"</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TimelineTab({ c }) {
  return (
    <div style={{ maxWidth: 500 }}>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '24px 28px' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)', marginBottom: 20 }}>Progreso del proceso</div>
        <div style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', left: 13, top: 0, bottom: 0, width: 2, background: 'var(--border)' }} />
          {c.timeline.map((t, i) => (
            <div key={i} style={{ display: 'flex', gap: 20, paddingBottom: i < c.timeline.length - 1 ? 22 : 0 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0, background: t.done ? (t.current ? 'var(--accent)' : 'var(--green)') : 'var(--surface)', border: `2px solid ${t.done ? (t.current ? 'var(--accent)' : 'var(--green)') : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1, position: 'relative' }}>
                {t.done && !t.current && <span style={{ color: 'white' }}>{React.createElement(ICONS.check)}</span>}
                {t.current && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'white' }} />}
                {!t.done && <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--border)' }} />}
              </div>
              <div style={{ paddingTop: 4 }}>
                <div style={{ fontSize: 13.5, fontWeight: t.current ? 700 : t.done ? 500 : 400, color: t.done ? 'var(--text-1)' : 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  {t.stage} {t.current && <Badge variant="accent" small>Actual</Badge>}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>{t.date}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// INTERVIEW VIEW
// ════════════════════════════════════════════════════════════════════════════
const LIVE_WORDS = "En mi último proyecto lideré la migración completa a Kubernetes en AWS EKS. Pasamos de deploys manuales cada dos semanas a entregas diarias automatizadas con GitHub Actions. Configuré el monitoreo con Prometheus y Grafana, lo que nos permitió detectar un memory leak en producción antes de que afectara usuarios. El mayor reto fue la estrategia de blue-green deployments para aplicaciones stateful con Postgres.".split(' ');

function InterviewView({ candidate: c, vacancy: v, setView }) {
  const [mode, setMode] = React.useState('choose');
  const [words, setWords] = React.useState([]);
  const [running, setRunning] = React.useState(false);
  const [elapsed, setElapsed] = React.useState(0);
  const [platform, setPlatform] = React.useState('Zoom');
  const [meetUrl, setMeetUrl] = React.useState('');
  const [uploadProgress, setUploadProgress] = React.useState(0);
  const [uploadDone, setUploadDone] = React.useState(false);

  React.useEffect(() => {
    if (!running || words.length >= LIVE_WORDS.length) return;
    const t = setTimeout(() => setWords(w => [...w, LIVE_WORDS[w.length]]), 200 + Math.random() * 160);
    return () => clearTimeout(t);
  }, [running, words]);

  React.useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(t);
  }, [running]);

  const fmt = s => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;

  const startUpload = () => {
    setMode('upload');
    let p = 0;
    const iv = setInterval(() => {
      p += 3 + Math.random() * 5;
      if (p >= 100) { clearInterval(iv); setUploadProgress(100); setTimeout(() => setUploadDone(true), 500); }
      else setUploadProgress(Math.min(p, 99));
    }, 160);
  };

  if (mode === 'choose') return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg)', overflow: 'hidden' }}>
      <TopBar title={`Entrevista — ${c.name}`} breadcrumb={`${v.title} → ${c.name}`} onBack={() => setView('candidate')} />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div style={{ maxWidth: 600, width: '100%' }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-1)', letterSpacing: '-0.4px', marginBottom: 6 }}>¿Cómo procesar la entrevista de {c.name.split(' ')[0]}?</div>
            <div style={{ fontSize: 14, color: 'var(--text-2)' }}>HireScore transcribe, diariza hablantes y genera análisis IA automáticamente.</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[
              { emoji: '🔗', title: 'Conectar a reunión', desc: 'Pega el link de la reunión. HireScore se unirá para transcribir en tiempo real.', platforms: ['Zoom', 'Meet', 'Teams'], color: 'var(--accent)', bg: 'var(--accent-light)', border: 'var(--accent-border)', action: () => setMode('live') },
              { emoji: '🎧', title: 'Subir grabación', desc: 'Ya tienes la grabación. HireScore transcribe, diariza hablantes y genera el análisis.', platforms: ['MP3', 'MP4', 'WAV', 'M4A'], color: 'var(--purple)', bg: 'var(--purple-light)', border: 'var(--purple-border)', action: startUpload },
            ].map(opt => (
              <div key={opt.title} onClick={opt.action} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '28px 22px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.18s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = opt.color; e.currentTarget.style.boxShadow = `0 6px 24px ${opt.color}18`; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}>
                <div style={{ width: 54, height: 54, borderRadius: 14, background: opt.bg, border: `1.5px solid ${opt.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', fontSize: 24 }}>{opt.emoji}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-1)', marginBottom: 8 }}>{opt.title}</div>
                <div style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6, marginBottom: 14 }}>{opt.desc}</div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 5 }}>
                  {opt.platforms.map(p => <span key={p} style={{ padding: '2px 7px', borderRadius: 5, fontSize: 11, background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-2)', fontWeight: 500 }}>{p}</span>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  if (mode === 'upload') return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg)', overflow: 'hidden' }}>
      <TopBar title={`Procesando grabación — ${c.name}`} breadcrumb={`${v.title} → ${c.name}`} onBack={() => setView('candidate')} />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
        <div style={{ width: 460, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '36px', textAlign: 'center', boxShadow: '0 8px 32px rgba(0,0,0,0.06)' }}>
          {!uploadDone ? (
            <>
              <div style={{ fontSize: 36, marginBottom: 16 }}>🎧</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-1)', marginBottom: 4 }}>Procesando audio…</div>
              <div style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 24 }}>Transcribiendo y diarizando hablantes con Whisper + pyannote.</div>
              <ProcessingState step={Math.floor(uploadProgress / 20)} onDone={() => {}} />
              <div style={{ height: 7, background: 'var(--surface-2)', borderRadius: 4, overflow: 'hidden', border: '1px solid var(--border)', marginTop: 16, marginBottom: 6 }}>
                <div style={{ height: '100%', width: `${uploadProgress}%`, background: 'var(--purple)', borderRadius: 4, transition: 'width 0.2s' }} />
              </div>
              <div style={{ fontSize: 11.5, color: 'var(--text-3)', fontVariantNumeric: 'tabular-nums' }}>{Math.round(uploadProgress)}%</div>
            </>
          ) : (
            <>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--green-light)', border: '2px solid var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 22 }}>✓</div>
              <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-1)', marginBottom: 6 }}>Transcripción y análisis listos</div>
              <div style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 22, lineHeight: 1.6 }}>Se identificaron 2 hablantes, se generó la transcripción y se actualizó el score de entrevista.</div>
              <button onClick={() => setView('candidate')} style={{ padding: '10px 28px', borderRadius: 8, background: 'var(--accent)', color: 'white', border: 'none', cursor: 'pointer', fontSize: 13.5, fontWeight: 600 }}>Ver perfil actualizado</button>
            </>
          )}
        </div>
      </div>
    </div>
  );

  // Live mode
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg)', overflow: 'hidden' }}>
      <TopBar title={`En vivo — ${c.name}`} breadcrumb={`${v.title} → ${c.name}`} onBack={() => setView('candidate')} />
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 300px', overflow: 'hidden' }}>
        <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', borderRight: '1px solid var(--border)' }}>
          {/* Connect bar */}
          <div style={{ padding: '12px 20px', background: 'var(--surface)', borderBottom: '1px solid var(--border)', display: 'flex', gap: 8, alignItems: 'center' }}>
            <input value={meetUrl} onChange={e => setMeetUrl(e.target.value)} placeholder="https://zoom.us/j/… o meet.google.com/…" style={{ flex: 1, padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13, color: 'var(--text-1)', background: 'var(--surface-2)', outline: 'none', fontFamily: 'inherit' }} />
            <select value={platform} onChange={e => setPlatform(e.target.value)} style={{ padding: '8px 10px', border: '1px solid var(--border)', borderRadius: 8, background: 'var(--surface-2)', color: 'var(--text-1)', fontSize: 13, outline: 'none', fontFamily: 'inherit', cursor: 'pointer' }}>
              {['Zoom', 'Google Meet', 'Microsoft Teams'].map(p => <option key={p}>{p}</option>)}
            </select>
            <button onClick={() => setRunning(r => !r)} style={{ padding: '8px 16px', borderRadius: 8, background: running ? 'var(--red)' : v.color, color: 'white', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
              {running ? '⏹ Detener' : '🔗 Conectar'}
            </button>
          </div>
          {/* Status */}
          <div style={{ background: running ? 'rgba(220,38,38,0.05)' : 'var(--surface-2)', borderBottom: '1px solid var(--border)', padding: '7px 20px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: running ? 'var(--red)' : 'var(--text-3)', animation: running ? 'blink 1s step-end infinite' : 'none' }} />
            <span style={{ fontSize: 12.5, fontWeight: running ? 600 : 400, color: running ? 'var(--red)' : 'var(--text-3)' }}>
              {running ? `Transcribiendo en vivo — ${fmt(elapsed)}` : 'En espera — conecta la reunión para comenzar'}
            </span>
            {running && <Badge variant="red" small>● EN VIVO</Badge>}
          </div>
          {/* Transcript area */}
          <div style={{ flex: 1, padding: '20px 24px', overflow: 'auto' }}>
            {words.length === 0 && !running && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 10, color: 'var(--text-3)' }}>
                <div style={{ fontSize: 32 }}>💬</div>
                <div style={{ fontSize: 14, fontWeight: 500 }}>La transcripción aparecerá aquí</div>
                <div style={{ fontSize: 13 }}>HireScore detectará automáticamente los hablantes</div>
              </div>
            )}
            {words.length > 0 && (
              <div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10 }}>
                  <Avatar name={c.name} color={c.color} size={22} />
                  <span style={{ fontSize: 10.5, fontWeight: 700, color: c.color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{c.name} — Speaker 2</span>
                </div>
                <div style={{ fontSize: 15, color: 'var(--text-1)', lineHeight: 1.75, background: 'var(--surface-2)', padding: '16px 18px', borderRadius: 10, border: '1px solid var(--border)' }}>
                  {words.map((w, i) => <span key={i} style={{ animation: 'fadeIn 0.2s ease forwards' }}>{w} </span>)}
                  {running && <span style={{ display: 'inline-block', width: 2, height: 15, background: v.color, verticalAlign: 'middle', animation: 'blink 0.8s step-end infinite' }} />}
                </div>
              </div>
            )}
          </div>
        </div>
        {/* Side panel */}
        <div style={{ display: 'flex', flexDirection: 'column', overflow: 'auto', background: 'var(--surface)' }}>
          <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12 }}>
              <Avatar name={c.name} color={c.color} size={36} />
              <div><div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)' }}>{c.name}</div><div style={{ fontSize: 11.5, color: 'var(--text-3)' }}>{PIPELINE_STAGES[c.stageIndex]}</div></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[{ label: 'Score', val: c.score, color: c.score >= 85 ? 'var(--green)' : 'var(--amber)' }, { label: 'Match CV', val: `${c.matchScore}%`, color: c.matchScore >= 85 ? 'var(--green)' : 'var(--amber)' }].map(s => (
                <div key={s.label} style={{ textAlign: 'center', padding: '8px', background: 'var(--surface-2)', borderRadius: 8, border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 17, fontWeight: 700, color: s.color, letterSpacing: '-0.5px' }}>{s.val}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 1 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
          {c.skillsGap.length > 0 && (
            <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-1)', marginBottom: 7 }}>Gaps a explorar en entrevista</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {c.skillsGap.map(g => (
                  <div key={g} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '6px 9px', background: 'var(--red-light)', border: '1px solid var(--red-border)', borderRadius: 7, fontSize: 12.5, color: 'var(--red)', fontWeight: 500 }}>
                    <span style={{ fontSize: 10 }}>?</span> Pregunta sobre: {g}
                  </div>
                ))}
              </div>
            </div>
          )}
          <div style={{ padding: '14px 18px', flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-1)', marginBottom: 8 }}>Notas rápidas</div>
            <textarea placeholder="Observaciones durante la entrevista…" style={{ width: '100%', minHeight: 100, padding: '10px 12px', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13, color: 'var(--text-1)', resize: 'none', outline: 'none', fontFamily: 'inherit', lineHeight: 1.6 }} />
            <div style={{ display: 'flex', gap: 5, marginTop: 8, flexWrap: 'wrap' }}>
              {['✓ Buena respuesta', '⚠ Revisar', '★ Destacable'].map(tag => (
                <button key={tag} style={{ padding: '4px 9px', fontSize: 10.5, borderRadius: 6, background: 'var(--surface-2)', border: '1px solid var(--border)', cursor: 'pointer', color: 'var(--text-2)', fontWeight: 500 }}>{tag}</button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// COMPARE VIEW
// ════════════════════════════════════════════════════════════════════════════
function CompareView({ setView, setVacancy, setCandidate }) {
  const [selV, setSelV] = React.useState(VACANCIES[0]);
  const candidates = selV.candidates;

  return (
    <div style={{ flex: 1, overflow: 'auto', background: 'var(--bg)' }}>
      <TopBar title="Comparar candidatos" />
      <div style={{ padding: '24px 28px 48px' }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          {VACANCIES.map(v => (
            <button key={v.id} onClick={() => setSelV(v)} style={{ padding: '8px 16px', borderRadius: 8, border: `1.5px solid ${selV.id === v.id ? v.color : 'var(--border)'}`, background: selV.id === v.id ? v.color + '10' : 'var(--surface)', color: selV.id === v.id ? v.color : 'var(--text-2)', cursor: 'pointer', fontSize: 13, fontWeight: selV.id === v.id ? 700 : 500, transition: 'all 0.15s' }}>{v.title}</button>
          ))}
        </div>
        {candidates.length < 2 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-3)' }}>
            <div style={{ fontSize: 28, marginBottom: 10 }}>👥</div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>Se necesitan al menos 2 candidatos para comparar</div>
          </div>
        ) : (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: `200px ${candidates.map(() => '1fr').join(' ')}`, gap: 12, marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Candidato</span>
              </div>
              {candidates.map(c => (
                <div key={c.id} onClick={() => { setCandidate(c); setVacancy(selV); setView('candidate'); }}
                  style={{ background: 'var(--surface)', border: `1px solid ${c.status === 'top' ? selV.color + '50' : 'var(--border)'}`, borderRadius: 12, padding: '16px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 4px 16px ${selV.color}12`; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; }}>
                  <Avatar name={c.name} color={c.color} size={42} />
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)', marginTop: 8, marginBottom: 2 }}>{c.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 10 }}>{c.experience}</div>
                  <ScoreRing score={c.score} size={52} strokeWidth={4} />
                  {c.status === 'top' && <div style={{ marginTop: 7 }}><Badge variant="top" small>⭐ Top</Badge></div>}
                </div>
              ))}
            </div>
            {[
              { label: 'Score HireScore', render: c => <ScoreRing score={c.score} size={36} strokeWidth={3} /> },
              { label: 'Match CV', render: c => <span style={{ fontSize: 14, fontWeight: 700, color: c.matchScore >= 85 ? 'var(--green)' : 'var(--amber)' }}>{c.matchScore}%</span> },
              { label: 'Score CV', render: c => <span style={{ fontSize: 14, fontWeight: 700, color: '#2B5CE6' }}>{c.cvScore}</span> },
              { label: 'Entrevista', render: c => c.interviewScore ? <span style={{ fontSize: 14, fontWeight: 700, color: '#7C3AED' }}>{c.interviewScore}</span> : <span style={{ fontSize: 12, color: 'var(--text-3)' }}>—</span> },
              { label: 'Fit empresa', render: c => <span style={{ fontSize: 14, fontWeight: 700, color: '#16A34A' }}>{c.fitScore}</span> },
              { label: 'Gaps', render: c => <span style={{ fontSize: 12, color: c.skillsGap.length === 0 ? 'var(--green)' : 'var(--red)', fontWeight: 600 }}>{c.skillsGap.length === 0 ? 'Sin gaps' : `${c.skillsGap.length} gap${c.skillsGap.length > 1 ? 's' : ''}`}</span> },
              { label: 'Etapa', render: c => <Badge variant={stageBadge(c.stageIndex)} small>{PIPELINE_STAGES[c.stageIndex]}</Badge> },
              { label: 'Entrevista', render: c => c.interview.recorded ? <Badge variant="green" small>✓ Realizada</Badge> : <Badge variant="default" small>Pendiente</Badge> },
            ].map((row, idx) => (
              <div key={idx} style={{ display: 'grid', gridTemplateColumns: `200px ${candidates.map(() => '1fr').join(' ')}`, gap: 12, padding: '12px 0', borderBottom: '1px solid var(--border)', alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: 'var(--text-2)', fontWeight: 500 }}>{row.label}</span>
                {candidates.map(c => <div key={c.id} style={{ display: 'flex', justifyContent: 'center' }}>{row.render(c)}</div>)}
              </div>
            ))}
            <div style={{ marginTop: 24 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)', marginBottom: 12 }}>Habilidades requeridas</div>
              {selV.requirements.map(skill => (
                <div key={skill} style={{ display: 'grid', gridTemplateColumns: `200px ${candidates.map(() => '1fr').join(' ')}`, gap: 12, padding: '9px 0', borderBottom: '1px solid var(--border)', alignItems: 'center' }}>
                  <span style={{ fontSize: 12.5, color: 'var(--text-2)' }}>{skill}</span>
                  {candidates.map(c => {
                    const sm = c.skillMatches.find(s => s.skill === skill);
                    const val = sm ? sm.match : 0;
                    return (
                      <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
                        <div style={{ width: 50, height: 5, background: 'var(--surface-2)', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${val}%`, background: val >= 80 ? 'var(--green)' : val >= 60 ? 'var(--amber)' : 'var(--red)' }} />
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 600, color: val >= 80 ? 'var(--green)' : val >= 60 ? 'var(--amber)' : 'var(--red)' }}>{val}%</span>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// REVIEW VIEW — Decisores
// ════════════════════════════════════════════════════════════════════════════
function ReviewView({ setView, setVacancy, setCandidate }) {
  return (
    <div style={{ flex: 1, overflow: 'auto', background: 'var(--bg)' }}>
      <TopBar title="Vista de decisores" />
      <div style={{ padding: '24px 28px 48px' }}>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 18px', marginBottom: 24, display: 'flex', gap: 12, alignItems: 'center' }}>
          {React.createElement(ICONS.eye)}
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-1)' }}>Vista de revisión — Ingenieros y managers</div>
            <div style={{ fontSize: 13, color: 'var(--text-2)' }}>Solo candidatos pre-filtrados con score ≥ 70 — ya evaluados por reclutamiento. Score auditable y determinístico.</div>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px', background: 'var(--amber-light)', border: '1px solid var(--amber-border)', borderRadius: 7 }}>
            {React.createElement(ICONS.shield)}
            <span style={{ fontSize: 11.5, color: 'var(--amber)', fontWeight: 600 }}>Score no es decisión automática</span>
          </div>
        </div>
        {VACANCIES.map(v => {
          const filtered = v.candidates.filter(c => c.score >= 70).sort((a, b) => b.score - a.score);
          if (!filtered.length) return null;
          return (
            <div key={v.id} style={{ marginBottom: 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div style={{ width: 5, height: 22, borderRadius: 3, background: v.color }} />
                <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-1)', margin: 0 }}>{v.title}</h3>
                <Badge variant="default" small>{v.department}</Badge>
                <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{filtered.length} candidato{filtered.length > 1 ? 's' : ''} preseleccionado{filtered.length > 1 ? 's' : ''}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {filtered.map(c => (
                  <div key={c.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 20px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 80px 80px 80px 1.4fr 180px', gap: 16, alignItems: 'center' }}>
                      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        <Avatar name={c.name} color={c.color} size={38} />
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 3 }}>
                            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-1)' }}>{c.name}</span>
                            {c.status === 'top' && <Badge variant="top" small>⭐</Badge>}
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{c.role} · {c.experience}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'center' }}><ScoreRing score={c.score} size={44} strokeWidth={4} /></div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 16, fontWeight: 800, color: '#2B5CE6' }}>{c.cvScore}</div>
                        <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 1 }}>CV</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        {c.interviewScore ? <>
                          <div style={{ fontSize: 16, fontWeight: 800, color: '#7C3AED' }}>{c.interviewScore}</div>
                          <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 1 }}>Entrevista</div>
                        </> : <span style={{ fontSize: 11, color: 'var(--text-3)' }}>—</span>}
                      </div>
                      <div style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.5, display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                        {React.createElement(ICONS.sparkle)}
                        {c.recommendation}
                      </div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => { const vac = VACANCIES.find(vv => vv.candidates.some(cc => cc.id === c.id)); setVacancy(vac); setCandidate(c); setView('candidate'); }} style={{ flex: 1, padding: '7px 10px', borderRadius: 7, background: 'var(--surface-2)', color: 'var(--text-1)', border: '1px solid var(--border)', cursor: 'pointer', fontSize: 12, fontWeight: 500 }}>Ver detalles</button>
                        <button style={{ flex: 1, padding: '7px 10px', borderRadius: 7, background: v.color, color: 'white', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>Aprobar</button>
                      </div>
                    </div>
                    {c.skillsGap.length > 0 && (
                      <div style={{ marginTop: 10, padding: '8px 12px', background: 'var(--red-light)', borderRadius: 7, border: '1px solid var(--red-border)', display: 'flex', gap: 8, alignItems: 'center' }}>
                        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--red)' }}>Gaps detectados:</span>
                        <div style={{ display: 'flex', gap: 5 }}>{c.skillsGap.map(g => <Chip key={g} variant="gap">{g}</Chip>)}</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// INTERVIEWS LIST
// ════════════════════════════════════════════════════════════════════════════
function InterviewsListView({ setView, setVacancy, setCandidate }) {
  const all = VACANCIES.flatMap(v => v.candidates.map(c => ({ ...c, v })));
  const done = all.filter(c => c.interview.recorded);
  const pending = all.filter(c => !c.interview.recorded);

  return (
    <div style={{ flex: 1, overflow: 'auto', background: 'var(--bg)' }}>
      <TopBar title="Entrevistas" />
      <div style={{ padding: '24px 28px 48px' }}>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 20px', marginBottom: 24, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 0 }}>
          {[
            { label: 'Transcritas', val: done.length, color: 'var(--green)' },
            { label: 'Pendientes', val: pending.length, color: 'var(--amber)' },
            { label: 'En procesamiento', val: all.filter(c => c.jobStatus === 'processing').length, color: 'var(--accent)' },
          ].map((s, i) => (
            <div key={s.label} style={{ textAlign: 'center', padding: '8px', borderRight: i < 2 ? '1px solid var(--border)' : 'none' }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: s.color, letterSpacing: '-1px', lineHeight: 1 }}>{s.val}</div>
              <div style={{ fontSize: 11.5, color: 'var(--text-3)', marginTop: 3 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Processing */}
        {all.filter(c => c.jobStatus === 'processing').map(({ v, ...c }) => (
          <div key={c.id} style={{ background: 'var(--surface)', border: '1px solid var(--accent-border)', borderRadius: 10, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8 }}>
            <Avatar name={c.name} color={c.color} size={34} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-1)', marginBottom: 2 }}>{c.name}</div>
              <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{v.title}</div>
            </div>
            <Badge variant="accent" small>Procesando…</Badge>
            <div style={{ display: 'flex', gap: 3 }}>
              {[0,1,2].map(i => <div key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--accent)', animation: `blink 1s ease ${i * 0.2}s infinite` }} />)}
            </div>
          </div>
        ))}

        {/* Pending */}
        {pending.length > 0 && (
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
              Pendientes de entrevista <Badge variant="amber" small>{pending.length}</Badge>
            </div>
            {pending.map(({ v, ...c }) => (
              <div key={c.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '13px 18px', display: 'flex', alignItems: 'center', gap: 14, marginBottom: 7 }}>
                <Avatar name={c.name} color={c.color} size={34} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-1)', marginBottom: 2 }}>{c.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{v.title} · {PIPELINE_STAGES[c.stageIndex]}</div>
                </div>
                <ScoreRing score={c.score} size={34} strokeWidth={3} />
                <div style={{ display: 'flex', gap: 7 }}>
                  <button onClick={() => { setCandidate(c); setVacancy(v); setView('interview'); }} style={{ padding: '7px 13px', borderRadius: 7, background: v.color, color: 'white', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>🔗 Conectar</button>
                  <button onClick={() => { setCandidate(c); setVacancy(v); setView('interview'); }} style={{ padding: '7px 13px', borderRadius: 7, background: 'var(--surface-2)', color: 'var(--text-1)', border: '1px solid var(--border)', cursor: 'pointer', fontSize: 12, fontWeight: 500 }}>🎧 Subir audio</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Done */}
        {done.length > 0 && (
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
              Transcritas y analizadas <Badge variant="green" small>{done.length}</Badge>
            </div>
            {done.map(({ v, ...c }) => (
              <div key={c.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '13px 18px', display: 'flex', alignItems: 'center', gap: 14, marginBottom: 7 }}>
                <Avatar name={c.name} color={c.color} size={34} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-1)', marginBottom: 2 }}>{c.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{v.title} · {c.interview.date} · {c.interview.platform} · {c.interview.duration}</div>
                </div>
                <Badge variant="green" small>✓ Transcrita y diarizada</Badge>
                <CostPill cost={c.cost} />
                <ScoreRing score={c.score} size={34} strokeWidth={3} />
                <button onClick={() => { setCandidate(c); setVacancy(v); setView('candidate'); }} style={{ padding: '7px 13px', borderRadius: 7, background: 'var(--surface-2)', color: 'var(--text-1)', border: '1px solid var(--border)', cursor: 'pointer', fontSize: 12, fontWeight: 500 }}>Ver perfil</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// REPORTS VIEW
// ════════════════════════════════════════════════════════════════════════════
function ReportsView() {
  const allCandidates = VACANCIES.flatMap(v => v.candidates.map(c => ({ ...c, vacancyTitle: v.title, vacancyColor: v.color })));
  const totalCost = VACANCIES.reduce((a, v) => a + v.costTotal, 0);
  const avgScore = Math.round(allCandidates.reduce((a, c) => a + c.score, 0) / allCandidates.length);

  return (
    <div style={{ flex: 1, overflow: 'auto', background: 'var(--bg)' }}>
      <TopBar title="Reportes y métricas" />
      <div style={{ padding: '24px 28px 48px' }}>
        {/* Cost overview */}
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-1)', marginBottom: 14 }}>Costos de análisis IA</h2>
          <div style={{ display: 'flex', gap: 14, marginBottom: 16 }}>
            {[
              { label: 'Costo total este mes', val: `$${totalCost.toFixed(4)}`, sub: 'USD · Claude Haiku', color: 'var(--text-1)' },
              { label: 'Costo por análisis', val: `$${(totalCost / allCandidates.length).toFixed(4)}`, sub: 'Promedio por candidato', color: 'var(--text-1)' },
              { label: 'Análisis realizados', val: allCandidates.length, sub: 'Total de candidatos', color: 'var(--text-1)' },
            ].map(s => (
              <div key={s.label} style={{ flex: 1, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 18px' }}>
                <div style={{ fontSize: 10.5, color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>{s.label}</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: s.color, letterSpacing: '-0.5px', fontVariantNumeric: 'tabular-nums' }}>{s.val}</div>
                <div style={{ fontSize: 11.5, color: 'var(--text-3)', marginTop: 3 }}>{s.sub}</div>
              </div>
            ))}
          </div>
          {/* Per vacancy cost */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>Desglose por vacante</div>
            {VACANCIES.map((v, i) => (
              <div key={v.id} style={{ display: 'grid', gridTemplateColumns: '1fr 120px 120px 120px', padding: '13px 20px', borderBottom: i < VACANCIES.length - 1 ? '1px solid var(--border)' : 'none', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <div style={{ width: 4, height: 20, borderRadius: 2, background: v.color }} />
                  <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-1)' }}>{v.title}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-1)', fontVariantNumeric: 'tabular-nums' }}>${v.costTotal.toFixed(4)}</div>
                  <div style={{ fontSize: 10.5, color: 'var(--text-3)' }}>total</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-2)', fontVariantNumeric: 'tabular-nums' }}>${(v.costTotal / v.candidates.length).toFixed(4)}</div>
                  <div style={{ fontSize: 10.5, color: 'var(--text-3)' }}>por candidato</div>
                </div>
                <div style={{ textAlign: 'right', fontSize: 13, color: 'var(--text-2)' }}>{v.candidates.length} candidatos</div>
              </div>
            ))}
          </div>
        </div>

        {/* Rankings */}
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-1)', marginBottom: 14 }}>Ranking de candidatos por vacante</h2>
          {VACANCIES.map(v => (
            <div key={v.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', marginBottom: 14 }}>
              <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 4, height: 18, borderRadius: 2, background: v.color }} />
                <span style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-1)' }}>{v.title}</span>
                <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{v.candidates.length} candidatos</span>
              </div>
              {v.candidates.sort((a, b) => b.score - a.score).map((c, i) => (
                <div key={c.id} style={{ display: 'grid', gridTemplateColumns: '32px 2fr 80px 80px 80px 80px 1fr', gap: 12, padding: '12px 20px', borderBottom: i < v.candidates.length - 1 ? '1px solid var(--border)' : 'none', alignItems: 'center' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: i === 0 ? v.color : 'var(--text-3)', textAlign: 'center' }}>#{i+1}</div>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <Avatar name={c.name} color={c.color} size={30} />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>{c.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{c.role}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center' }}><ScoreRing score={c.score} size={36} strokeWidth={3} /></div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#2B5CE6' }}>{c.cvScore}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-3)' }}>CV</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    {c.interviewScore ? <><div style={{ fontSize: 13, fontWeight: 700, color: '#7C3AED' }}>{c.interviewScore}</div><div style={{ fontSize: 10, color: 'var(--text-3)' }}>Entrevista</div></>
                      : <span style={{ fontSize: 11, color: 'var(--text-3)' }}>—</span>}
                  </div>
                  <div style={{ textAlign: 'center' }}><CostPill cost={c.cost} /></div>
                  <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                    {c.skillsGap.slice(0, 2).map(g => <Chip key={g} variant="gap">{g}</Chip>)}
                    {c.skillsGap.length === 0 && <Badge variant="green" small>Sin gaps</Badge>}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Compliance */}
        <div>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-1)', marginBottom: 14 }}>Compliance y auditoría</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
            {[
              { icon: '⚖️', title: 'GDPR Art. 22', desc: 'Scoring determinístico + explicabilidad por dimensión. Supervisión humana requerida.', status: 'Activo', color: 'var(--green)' },
              { icon: '🇲🇽', title: 'LFPDPPP', desc: 'Aviso de privacidad requerido antes del primer análisis de CV de candidatos reales.', status: 'Pendiente', color: 'var(--amber)' },
              { icon: '🏙️', title: 'NYC AEDT', desc: 'Auditoría de sesgo independiente anual. Bias audit no ejecutado aún.', status: 'Pendiente', color: 'var(--amber)' },
            ].map(item => (
              <div key={item.title} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '18px 20px' }}>
                <div style={{ fontSize: 24, marginBottom: 10 }}>{item.icon}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <span style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-1)' }}>{item.title}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 100, color: item.color, background: item.color + '15', border: `1px solid ${item.color}30` }}>{item.status}</span>
                </div>
                <p style={{ fontSize: 12.5, color: 'var(--text-2)', margin: 0, lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// MODALS
// ════════════════════════════════════════════════════════════════════════════
function NewVacancyModal({ onClose }) {
  const [step, setStep] = React.useState(0);
  const [form, setForm] = React.useState({ title: '', department: '', priority: 'media', description: '', requirements: [] });
  const [reqInput, setReqInput] = React.useState('');
  const [weights, setWeights] = React.useState({ ...DEFAULT_WEIGHTS });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const addReq = () => { if (reqInput.trim()) { set('requirements', [...form.requirements, reqInput.trim()]); setReqInput(''); } };
  const depts = ['Engineering', 'Producto', 'Diseño', 'Infraestructura', 'Data', 'Marketing', 'Ventas'];

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ width: 540, background: 'var(--surface)', borderRadius: 16, padding: '28px', border: '1px solid var(--border)', boxShadow: '0 28px 64px rgba(0,0,0,0.18)', animation: 'slideUp 0.25s ease' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 22 }}>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-1)' }}>Nueva vacante</div>
            <div style={{ display: 'flex', gap: 5, marginTop: 8 }}>
              {['Información', 'Requisitos', 'Pesos score', 'Confirmar'].map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: 18, height: 18, borderRadius: '50%', background: i <= step ? 'var(--accent)' : 'var(--surface-2)', border: `1.5px solid ${i <= step ? 'var(--accent)' : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: i <= step ? 'white' : 'var(--text-3)' }}>{i+1}</div>
                  <span style={{ fontSize: 11, color: i === step ? 'var(--accent)' : 'var(--text-3)', fontWeight: i === step ? 600 : 400 }}>{s}</span>
                  {i < 3 && <span style={{ color: 'var(--border)', fontSize: 12 }}>›</span>}
                </div>
              ))}
            </div>
          </div>
          <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: '50%', border: 'none', background: 'var(--surface-2)', cursor: 'pointer', color: 'var(--text-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{React.createElement(ICONS.x)}</button>
        </div>

        {step === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[{ label: 'Nombre de la vacante *', key: 'title', type: 'input', placeholder: 'ej. Senior Backend Engineer' }].map(f => (
              <div key={f.key}>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-1)', display: 'block', marginBottom: 5 }}>{f.label}</label>
                <input value={form[f.key]} onChange={e => set(f.key, e.target.value)} placeholder={f.placeholder} style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13.5, color: 'var(--text-1)', background: 'var(--surface-2)', outline: 'none', fontFamily: 'inherit' }} />
              </div>
            ))}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-1)', display: 'block', marginBottom: 5 }}>Área</label>
                <select value={form.department} onChange={e => set('department', e.target.value)} style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13, color: 'var(--text-1)', background: 'var(--surface-2)', outline: 'none', fontFamily: 'inherit', cursor: 'pointer' }}>
                  <option value="">Seleccionar…</option>
                  {depts.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-1)', display: 'block', marginBottom: 5 }}>Prioridad</label>
                <select value={form.priority} onChange={e => set('priority', e.target.value)} style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13, color: 'var(--text-1)', background: 'var(--surface-2)', outline: 'none', fontFamily: 'inherit', cursor: 'pointer' }}>
                  {['baja','media','alta','urgente'].map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-1)', display: 'block', marginBottom: 5 }}>Descripción del rol</label>
              <textarea value={form.description} onChange={e => set('description', e.target.value)} placeholder="Describe el rol, responsabilidades y contexto del equipo…" style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13, color: 'var(--text-1)', background: 'var(--surface-2)', resize: 'vertical', minHeight: 80, outline: 'none', fontFamily: 'inherit', lineHeight: 1.6 }} />
            </div>
          </div>
        )}

        {step === 1 && (
          <div>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-1)', display: 'block', marginBottom: 5 }}>Habilidades y requisitos técnicos</label>
            <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 10 }}>Estas skills se usarán para analizar CVs automáticamente.</div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
              <input value={reqInput} onChange={e => setReqInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addReq()} placeholder="ej. React, Python, AWS…" style={{ flex: 1, padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13, color: 'var(--text-1)', background: 'var(--surface-2)', outline: 'none', fontFamily: 'inherit' }} />
              <button onClick={addReq} style={{ padding: '9px 14px', borderRadius: 8, background: 'var(--accent)', color: 'white', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>{React.createElement(ICONS.plus)}</button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, minHeight: 40 }}>
              {form.requirements.map((r, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 7, background: 'var(--accent-light)', color: 'var(--accent)', border: '1px solid var(--accent-border)', fontSize: 12.5, fontWeight: 500 }}>
                  {r}<button onClick={() => set('requirements', form.requirements.filter((_, j) => j !== i))} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--accent)', padding: 0, display: 'flex' }}>{React.createElement(ICONS.x)}</button>
                </div>
              ))}
              {form.requirements.length === 0 && <span style={{ fontSize: 12, color: 'var(--text-3)' }}>Añade al menos una habilidad requerida.</span>}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 14, lineHeight: 1.5 }}>Define qué tanto pesa cada dimensión en el score de esta vacante. Los cambios se guardan en el backend via <code style={{ fontSize: 11, background: 'var(--surface-2)', padding: '1px 5px', borderRadius: 4 }}>PUT /vacancies/&#123;id&#125;/pesos</code>.</div>
            <WeightSliders weights={weights} onChange={setWeights} />
          </div>
        )}

        {step === 3 && (
          <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 10, padding: '16px 18px' }}>
            {[{ label: 'Nombre', val: form.title || '—' }, { label: 'Departamento', val: form.department || '—' }, { label: 'Prioridad', val: form.priority }, { label: 'Requisitos', val: form.requirements.join(', ') || '—' }].map(r => (
              <div key={r.label} style={{ display: 'flex', gap: 12, padding: '7px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: 12, color: 'var(--text-3)', width: 100, flexShrink: 0 }}>{r.label}</span>
                <span style={{ fontSize: 12.5, color: 'var(--text-1)', fontWeight: 500 }}>{r.val}</span>
              </div>
            ))}
            <div style={{ display: 'flex', gap: 12, padding: '7px 0' }}>
              <span style={{ fontSize: 12, color: 'var(--text-3)', width: 100, flexShrink: 0 }}>Pesos</span>
              <div style={{ display: 'flex', gap: 8 }}>
                {Object.entries(weights).map(([k, v]) => <span key={k} style={{ fontSize: 12, padding: '2px 8px', borderRadius: 5, background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-2)' }}>{k} {v}%</span>)}
              </div>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
          <button onClick={() => step > 0 ? setStep(s => s - 1) : onClose()} style={{ padding: '9px 18px', borderRadius: 8, background: 'var(--surface-2)', color: 'var(--text-1)', border: '1px solid var(--border)', cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>{step === 0 ? 'Cancelar' : '← Anterior'}</button>
          <button onClick={() => step < 3 ? setStep(s => s + 1) : onClose()} style={{ padding: '9px 20px', borderRadius: 8, background: 'var(--accent)', color: 'white', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>{step < 3 ? 'Continuar →' : '✓ Crear vacante'}</button>
        </div>
      </div>
    </div>
  );
}

function UploadModal({ onClose }) {
  const [drag, setDrag] = React.useState(false);
  const [processing, setProcessing] = React.useState(false);
  const [done, setDone] = React.useState(false);

  const start = () => setProcessing(true);

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ width: 460, background: 'var(--surface)', borderRadius: 16, padding: '26px', border: '1px solid var(--border)', boxShadow: '0 24px 56px rgba(0,0,0,0.16)', animation: 'slideUp 0.25s ease' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 18 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-1)' }}>Cargar CV del candidato</div>
            <div style={{ fontSize: 12.5, color: 'var(--text-3)', marginTop: 3 }}>Extracción de datos + análisis de skills + score automático</div>
          </div>
          <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: '50%', border: 'none', background: 'var(--surface-2)', cursor: 'pointer', color: 'var(--text-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{React.createElement(ICONS.x)}</button>
        </div>
        {!processing && !done && (
          <div onDragOver={e => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)}
            onDrop={e => { e.preventDefault(); setDrag(false); start(); }} onClick={start}
            style={{ border: `2px dashed ${drag ? 'var(--accent)' : 'var(--border)'}`, borderRadius: 12, padding: '36px', textAlign: 'center', background: drag ? 'var(--accent-light)' : 'var(--surface-2)', cursor: 'pointer', transition: 'all 0.15s' }}>
            <div style={{ fontSize: 30, marginBottom: 10 }}>📄</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)', marginBottom: 5 }}>Arrastra el CV aquí</div>
            <div style={{ fontSize: 12.5, color: 'var(--text-3)' }}>PDF, DOCX — o haz clic para seleccionar</div>
          </div>
        )}
        {processing && !done && (
          <div style={{ padding: '8px 0' }}>
            <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
              <div style={{ fontSize: 22 }}>📄</div>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-1)', marginBottom: 4 }}>candidato_cv.pdf</div>
                <div style={{ fontSize: 12, color: 'var(--text-3)' }}>Pipeline HireScore en proceso…</div>
              </div>
            </div>
            <ProcessingState step={0} onDone={() => setDone(true)} />
          </div>
        )}
        {done && (
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--green-light)', border: '2px solid var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: 20 }}>✓</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-1)', marginBottom: 5 }}>Análisis completado</div>
            <div style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 18 }}>Skills extraídas, score calculado y match con vacante generado.</div>
            <button onClick={onClose} style={{ padding: '10px 26px', borderRadius: 8, background: 'var(--accent)', color: 'white', border: 'none', cursor: 'pointer', fontSize: 13.5, fontWeight: 600 }}>Ver perfil</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// APP ROOT
// ════════════════════════════════════════════════════════════════════════════
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "darkMode": false,
  "accentColor": "#2B5CE6"
}/*EDITMODE-END*/;

function App() {
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [view, setView] = React.useState('dashboard');
  const [vacancy, setVacancy] = React.useState(VACANCIES[0]);
  const [candidate, setCandidate] = React.useState(VACANCIES[0].candidates[0]);
  const [newVacancyOpen, setNewVacancyOpen] = React.useState(false);
  const [uploadOpen, setUploadOpen] = React.useState(false);

  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', tweaks.darkMode ? 'dark' : 'light');
    document.documentElement.style.setProperty('--accent', tweaks.accentColor);
    document.documentElement.style.setProperty('--accent-light', tweaks.accentColor + '18');
    document.documentElement.style.setProperty('--accent-border', tweaks.accentColor + '40');
  }, [tweaks.darkMode, tweaks.accentColor]);

  const Panel = () => (
    <TweaksPanel>
      <TweakSection label="Apariencia">
        <TweakToggle label="Modo oscuro" value={tweaks.darkMode} onChange={v => setTweak('darkMode', v)} />
        <TweakColor label="Color de acento" value={tweaks.accentColor} onChange={v => setTweak('accentColor', v)} />
      </TweakSection>
    </TweaksPanel>
  );

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar activeView={view} setView={setView} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        {view === 'dashboard'  && <DashboardView setView={setView} setVacancy={setVacancy} setNewVacancyOpen={setNewVacancyOpen} />}
        {view === 'vacancy'    && <VacancyDetail vacancy={vacancy} setVacancy={setVacancy} setView={setView} setCandidate={setCandidate} setUploadOpen={setUploadOpen} />}
        {view === 'candidate'  && <CandidateDetail candidate={candidate} vacancy={vacancy} setView={setView} />}
        {view === 'interview'  && <InterviewView candidate={candidate} vacancy={vacancy} setView={setView} />}
        {view === 'compare'    && <CompareView setView={setView} setVacancy={setVacancy} setCandidate={setCandidate} />}
        {view === 'review'     && <ReviewView setView={setView} setVacancy={setVacancy} setCandidate={setCandidate} />}
        {view === 'interviews' && <InterviewsListView setView={setView} setVacancy={setVacancy} setCandidate={setCandidate} />}
        {view === 'reports'    && <ReportsView />}
        {!['dashboard','vacancy','candidate','interview','compare','review','interviews','reports'].includes(view) && (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-3)', fontSize: 14 }}>Sección en construcción</div>
        )}
      </div>
      {newVacancyOpen && <NewVacancyModal onClose={() => setNewVacancyOpen(false)} />}
      {uploadOpen && <UploadModal onClose={() => setUploadOpen(false)} />}
      <Panel />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
