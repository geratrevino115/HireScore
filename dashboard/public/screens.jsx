/* global React, N, ETAPAS, stageChip, stageLabel, API,
   Chip, NIcon, NAvatar, ScoreCell, fontN */
// Pantallas de página completa (Resumen, Vacantes, Candidatos, Guías, Configuración)

const { useState: useStateS } = React;

function Card({ children, pad = 18, style }) {
  return <div style={{ border: `1px solid ${N.border}`, borderRadius: 8, background: N.bg, padding: pad, ...style }}>{children}</div>;
}
function CardHead({ title, sub }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 14 }}>
      <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: N.ink }}>{title}</h3>
      {sub && <span style={{ fontSize: 12, color: N.ink3 }}>{sub}</span>}
    </div>
  );
}
function PageTitle({ title, count }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 2 }}>
      <h1 style={{ fontSize: 26, fontWeight: 700, color: N.ink, letterSpacing: "-0.02em", margin: 0 }}>{title}</h1>
      {count !== undefined && <span style={{ color: N.ink3, fontSize: 14 }}>· {count}</span>}
    </div>
  );
}
function KpiRow({ items }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${items.length}, 1fr)`, border: `1px solid ${N.border}`, borderRadius: 8, overflow: "hidden", background: N.bg }}>
      {items.map((it, i) => (
        <div key={it.label} style={{ padding: "14px 16px", borderRight: i < items.length - 1 ? `1px solid ${N.border}` : "none", display: "flex", flexDirection: "column", gap: 5 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, color: N.ink3 }}>
            <NIcon name={it.icon} size={12} color={N.ink3} />
            <span style={{ fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.04em" }}>{it.label}</span>
          </div>
          <div style={{ fontSize: 26, fontWeight: 600, color: N.ink, letterSpacing: "-0.02em", lineHeight: 1.1 }}>{it.value}</div>
          {it.sub && <span style={{ fontSize: 12, color: N.ink3 }}>{it.sub}</span>}
        </div>
      ))}
    </div>
  );
}

// ── RESUMEN (accionable) ──────────────────────────
function DashboardScreen({ people = [], vacancies = [], onOpenVacante, onOpenCandidate, onAdvance, onReject, stageOrder }) {
  const tot = people.length;
  const prom = tot ? Math.round(people.reduce((a, b) => a + b.score, 0) / tot) : 0;
  const decisionStages = ["shortlist", "entrevista", "entrevista_tecnica"];
  const pendientes = [...people].filter(p => decisionStages.includes(p.etapa)).sort((a, b) => b.score - a.score);
  const funnel = ETAPAS.map(e => ({ ...e, n: people.filter(p => p.etapa === e.id).length }));
  const maxF = Math.max(1, ...funnel.map(f => f.n));
  const activas = vacancies.filter(v => !v.cerrada);
  const hora = new Date().getHours();
  const saludo = hora < 12 ? "Buenos días" : hora < 19 ? "Buenas tardes" : "Buenas noches";
  const atEnd = (etapa) => stageOrder && stageOrder.findIndex(e => e.id === etapa) >= stageOrder.length - 1;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: N.ink, letterSpacing: "-0.02em", margin: 0 }}>{saludo}, Camila</h1>
        <p style={{ fontSize: 14, color: N.ink2, margin: "4px 0 0" }}>
          Tienes <strong style={{ color: N.ink }}>{pendientes.length} candidatos</strong> esperando tu decisión y <strong style={{ color: N.ink }}>{activas.length} vacantes</strong> abiertas.
        </p>
      </div>

      <KpiRow items={[
        { label: "Esperan decisión", value: String(pendientes.length), icon: "clock" },
        { label: "Vacantes activas", value: String(activas.length), icon: "briefcase" },
        { label: "Puntaje medio", value: String(prom), icon: "bar" },
        { label: "Costo LLM mes", value: "$48.20", sub: "3,910 llamadas", icon: "dollar" },
      ]} />

      {/* Requieren tu decisión — con acciones rápidas */}
      <Card pad={0}>
        <div style={{ padding: "16px 18px 12px", display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: N.ink, display: "flex", alignItems: "center", gap: 8 }}>
            <NIcon name="zap" size={15} color={N.chip.orange.fg} /> Requieren tu decisión
          </h3>
          <span style={{ fontSize: 12, color: N.ink3 }}>{pendientes.length} en cola</span>
        </div>
        {pendientes.length === 0 && (
          <div style={{ padding: "20px 18px", fontSize: 13.5, color: N.ink3, borderTop: `1px solid ${N.border}` }}>Sin pendientes — todo al día.</div>
        )}
        {pendientes.map(p => (
          <div key={p.id} style={{ display: "grid", gridTemplateColumns: "1.4fr 130px 150px auto", alignItems: "center", gap: 14, padding: "10px 18px", borderTop: `1px solid ${N.border}` }}>
            <div onClick={() => onOpenCandidate && onOpenCandidate(p)} style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0, cursor: "pointer" }}>
              <NAvatar name={p.name} size={26} />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 14, color: N.ink, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</div>
                <div style={{ fontSize: 12, color: N.ink3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.title}</div>
              </div>
            </div>
            <ScoreCell value={p.score} />
            <div><Chip color={stageChip[p.etapa]} dot>{stageLabel[p.etapa]}</Chip></div>
            <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
              <button onClick={() => onAdvance && onAdvance(p.id)} disabled={atEnd(p.etapa)} style={{ background: atEnd(p.etapa) ? N.hover : N.ink, color: atEnd(p.etapa) ? N.ink3 : N.bg, border: "none", cursor: atEnd(p.etapa) ? "default" : "pointer", padding: "6px 11px", fontSize: 12.5, fontFamily: fontN, fontWeight: 500, borderRadius: 6, display: "inline-flex", alignItems: "center", gap: 5 }}>
                <NIcon name="arrow" size={13} color={atEnd(p.etapa) ? N.ink3 : N.bg} /> Avanzar
              </button>
              <button onClick={() => onReject && onReject(p.id)} title="Rechazar" style={{ background: "transparent", color: N.chip.red.fg, border: `1px solid ${N.border}`, cursor: "pointer", padding: "6px 9px", fontSize: 12.5, fontFamily: fontN, fontWeight: 500, borderRadius: 6, display: "inline-flex", alignItems: "center", gap: 5 }}>
                <NIcon name="x" size={13} color={N.chip.red.fg} />
              </button>
            </div>
          </div>
        ))}
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Embudo por etapa */}
        <Card>
          <CardHead title="Embudo del pipeline" sub={`${tot} candidatos`} />
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {funnel.map(f => (
              <div key={f.id} style={{ display: "grid", gridTemplateColumns: "130px 1fr 26px", alignItems: "center", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, minWidth: 0 }}>
                  <span style={{ width: 7, height: 7, borderRadius: 999, background: N.chip[f.chip].fg, flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: N.ink2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{f.label}</span>
                </div>
                <div style={{ height: 10, borderRadius: 4, background: N.track, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${(f.n / maxF) * 100}%`, background: N.chip[f.chip].fg, opacity: 0.55, borderRadius: 4, minWidth: f.n ? 4 : 0 }} />
                </div>
                <span style={{ fontSize: 13, color: N.ink, fontWeight: 600, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{f.n}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Vacantes que necesitan atención */}
        <Card>
          <CardHead title="Vacantes activas" sub={`${activas.length} abiertas`} />
          <div style={{ display: "flex", flexDirection: "column" }}>
            {activas.map((v, i) => (
              <div key={v.titulo} onClick={onOpenVacante} style={{
                display: "flex", alignItems: "center", gap: 10, padding: "9px 4px", cursor: "pointer",
                borderBottom: i < activas.length - 1 ? `1px solid ${N.border}` : "none",
              }}
              onMouseEnter={e => e.currentTarget.style.background = N.hover}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <div style={{ width: 22, height: 22, borderRadius: 4, background: N.hover, color: N.ink2, fontSize: 10.5, fontWeight: 600, display: "grid", placeItems: "center", flexShrink: 0 }}>{v.mono}</div>
                <span style={{ fontSize: 14, color: N.ink, flex: 1, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{v.titulo}</span>
                <span style={{ fontSize: 12, color: N.ink3 }}>{v.aplicantes}</span>
                <ScoreCell value={v.puntaje} width={96} />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ── VACANTES ──────────────────────────────────────
function VacanciesScreen({ vacancies = [], onOpenVacante }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PageTitle title="Vacantes" count={`${vacancies.length} en total`} />
      <Card pad={0}>
        <div style={{ display: "grid", gridTemplateColumns: "1.6fr 110px 1fr", padding: "10px 18px", borderBottom: `1px solid ${N.border}`, fontSize: 12, color: N.ink2, fontWeight: 500, background: N.sidebar }}>
          <span>Vacante</span><span>Estado</span><span>ID</span>
        </div>
        {vacancies.map((v, i) => (
          <div key={v.id} onClick={onOpenVacante} style={{
            display: "grid", gridTemplateColumns: "1.6fr 110px 1fr", alignItems: "center",
            padding: "11px 18px", borderTop: i ? `1px solid ${N.border}` : "none", cursor: "pointer",
          }}
          onMouseEnter={e => e.currentTarget.style.background = N.hover}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
              <span style={{ fontSize: 14, color: N.ink, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{v.titulo}</span>
            </div>
            <Chip color={v.cerrada ? "gray" : "yellow"} dot>{v.cerrada ? "Cerrada" : "Abierta"}</Chip>
            <span style={{ fontSize: 12, color: N.ink3 }}>OH-{String(v.id).padStart(3, "0")}</span>
          </div>
        ))}
        {vacancies.length === 0 && (
          <div style={{ padding: "24px 18px", fontSize: 13.5, color: N.ink3, textAlign: "center" }}>Sin vacantes aún</div>
        )}
      </Card>
    </div>
  );
}

// ── CANDIDATOS ────────────────────────────────────
function CandidatesScreen({ people = [], onOpenCandidate }) {
  const ranked = [...people].sort((a, b) => b.score - a.score);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PageTitle title="Candidatos" count={`${ranked.length} mostrados`} />
      <Card pad={0}>
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 140px 1.4fr 130px 1fr", padding: "10px 18px", borderBottom: `1px solid ${N.border}`, fontSize: 12, color: N.ink2, fontWeight: 500, background: N.sidebar }}>
          <span>Candidato</span><span>Puntaje</span><span>Rol actual</span><span>Etapa</span><span>Email</span>
        </div>
        {ranked.map((p, i) => (
          <div key={p.id} onClick={() => onOpenCandidate(p)} style={{
            display: "grid", gridTemplateColumns: "1.4fr 140px 1.4fr 130px 1fr", alignItems: "center",
            padding: "11px 18px", borderTop: i ? `1px solid ${N.border}` : "none", cursor: "pointer",
          }}
          onMouseEnter={e => e.currentTarget.style.background = N.hover}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
              <NAvatar name={p.name} size={24} />
              <span style={{ fontSize: 14, color: N.ink, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</span>
            </div>
            <ScoreCell value={p.score} width={120} />
            <span style={{ fontSize: 13, color: N.ink2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.title}</span>
            <div><Chip color={stageChip[p.etapa]} dot>{stageLabel[p.etapa]}</Chip></div>
            <span style={{ fontSize: 13, color: N.ink2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.email}</span>
          </div>
        ))}
      </Card>
    </div>
  );
}

// ── GUÍAS DE ENTREVISTA ───────────────────────────
const { useState: useStateSG, useEffect: useEffectSG } = React;

function GuidesScreen({ vacancyId }) {
  const [guia, setGuia] = useStateSG(null);
  const [loading, setLoading] = useStateSG(false);
  const [generating, setGenerating] = useStateSG(false);

  useEffectSG(() => {
    if (!vacancyId) return;
    setLoading(true);
    API.getGuia(vacancyId).then(setGuia).catch(() => setGuia(null)).finally(() => setLoading(false));
  }, [vacancyId]);

  const generate = () => {
    setGenerating(true);
    API.generateGuia(vacancyId).then(g => { setGuia(g); setGenerating(false); }).catch(() => setGenerating(false));
  };

  const Q = ({ q, accent }) => (
    <div style={{ padding: "12px 14px", background: N.bg, border: `1px solid ${N.border}`, borderLeft: `3px solid ${accent}`, borderRadius: 6, marginBottom: 8 }}>
      <div style={{ fontSize: 14, color: N.ink, fontWeight: 500, lineHeight: 1.45 }}>{q.pregunta}</div>
      {q.objetivo && <div style={{ fontSize: 12, color: N.ink3, marginTop: 6, fontStyle: "italic" }}>{q.objetivo}</div>}
    </div>
  );
  const Block = ({ title, children }) => (
    <div style={{ marginBottom: 6 }}>
      <div style={{ fontSize: 12, color: N.ink2, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 10 }}>{title}</div>
      {children}
    </div>
  );
  const listItem = (txt, color) => (
    <div key={txt} style={{ display: "flex", gap: 9, alignItems: "flex-start", fontSize: 13.5, color: N.ink, lineHeight: 1.45, padding: "5px 0" }}>
      <span style={{ width: 6, height: 6, borderRadius: 999, background: color, marginTop: 6, flexShrink: 0 }} />
      <span>{txt}</span>
    </div>
  );

  if (!vacancyId) return (
    <div style={{ color: N.ink3, fontSize: 14 }}>Selecciona una vacante en el sidebar para ver su guía.</div>
  );

  if (loading) return <div style={{ color: N.ink3, fontSize: 14 }}>Cargando guía…</div>;

  if (!guia) return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 540 }}>
      <PageTitle title="Guía de entrevista" />
      <p style={{ fontSize: 14, color: N.ink2 }}>Esta vacante aún no tiene guía generada.</p>
      <button onClick={generate} disabled={generating} style={{ background: N.ink, color: N.bg, border: "none", cursor: "pointer", padding: "10px 18px", fontSize: 14, fontFamily: fontN, fontWeight: 500, borderRadius: 6, display: "inline-flex", alignItems: "center", gap: 8, alignSelf: "flex-start" }}>
        <NIcon name="sparkle" size={15} color={N.bg} /> {generating ? "Generando…" : "Generar guía con IA"}
      </button>
    </div>
  );

  const tecnicas    = guia.preguntas?.filter(q => q.tipo === "tecnica")        || [];
  const comportam   = guia.preguntas?.filter(q => q.tipo === "comportamiento") || [];
  const situacional = guia.preguntas?.filter(q => q.tipo === "situacional")    || [];
  const senales     = guia.senales_de_alerta   || [];
  const criterios   = guia.criterios_evaluacion || [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 880 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <PageTitle title="Guía de entrevista" />
        <Chip color="purple">IA</Chip>
        <button onClick={generate} disabled={generating} style={{ marginLeft: "auto", background: "transparent", border: `1px solid ${N.border}`, color: N.ink2, cursor: "pointer", padding: "6px 12px", fontSize: 13, fontFamily: fontN, borderRadius: 6, display: "inline-flex", alignItems: "center", gap: 6 }}>
          <NIcon name="rotate" size={13} color={N.ink3} /> {generating ? "Regenerando…" : "Regenerar"}
        </button>
      </div>

      {tecnicas.length > 0 && (
        <Card>
          <Block title="Preguntas técnicas">{tecnicas.map((q, i) => <Q key={i} q={q} accent={N.chip.blue.fg} />)}</Block>
          {comportam.length > 0 && <Block title="Comportamiento">{comportam.map((q, i) => <Q key={i} q={q} accent={N.chip.purple.fg} />)}</Block>}
          {situacional.length > 0 && <Block title="Situacionales">{situacional.map((q, i) => <Q key={i} q={q} accent={N.chip.orange.fg} />)}</Block>}
        </Card>
      )}

      {(senales.length > 0 || criterios.length > 0) && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {senales.length > 0 && <Card><Block title="Señales de alerta">{senales.map(s => listItem(s, N.chip.red.fg))}</Block></Card>}
          {criterios.length > 0 && <Card><Block title="Criterios de evaluación">{criterios.map(s => listItem(s, N.chip.green.fg))}</Block></Card>}
        </div>
      )}
    </div>
  );
}

// ── CONFIGURACIÓN ─────────────────────────────────
function SettingsScreen() {
  const Row = ({ label, children, last }) => (
    <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", alignItems: "center", padding: "12px 0", borderBottom: last ? "none" : `1px solid ${N.border}` }}>
      <span style={{ fontSize: 13.5, color: N.ink2 }}>{label}</span>
      <div>{children}</div>
    </div>
  );
  const Pill = ({ children }) => (
    <span style={{ display: "inline-flex", alignItems: "center", padding: "5px 11px", border: `1px solid ${N.border}`, borderRadius: 6, fontSize: 13, color: N.ink, background: N.bg }}>{children}</span>
  );
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 760 }}>
      <PageTitle title="Configuración" />

      <Card>
        <CardHead title="Modelo y proveedor" />
        <Row label="Proveedor LLM"><Pill>OpenAI · gpt-4o-mini</Pill></Row>
        <Row label="Idioma de análisis"><Pill>Español</Pill></Row>
        <Row label="Umbral de shortlist" last><Pill>≥ 75 puntos</Pill></Row>
      </Card>

      <Card>
        <CardHead title="Etapas del pipeline" sub={`${ETAPAS.length} etapas`} />
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {ETAPAS.map(e => <Chip key={e.id} color={e.chip} dot>{e.label}</Chip>)}
        </div>
      </Card>
    </div>
  );
}

Object.assign(window, { DashboardScreen, VacanciesScreen, CandidatesScreen, GuidesScreen, SettingsScreen, Card });
