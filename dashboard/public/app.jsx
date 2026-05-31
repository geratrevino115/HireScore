/* global React, ReactDOM, N, ETAPAS, stageChip, stageLabel,
   API, aplToCandidate, initials,
   Chip, NIcon, NAvatar, Monogram, SBItem, ScoreCell, fontN,
   LoginScreen, EmptyState, NewVacancyWizard, AddCandidates, CandidateDetail,
   DashboardScreen, VacanciesScreen, CandidatesScreen, GuidesScreen, SettingsScreen,
   CompareView, useTweaks, TweaksPanel, TweakSection, TweakRadio */

const { useState, useEffect, useMemo, useCallback } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "tema": "claro",
  "chrome": "completo",
  "kpis": "completos",
  "densidad": "cómoda"
}/*EDITMODE-END*/;

// ── Helpers UI ────────────────────────────────────
function GhostBtn({ children, onClick, title }) {
  return (
    <button title={title} onClick={onClick} style={{
      background: "transparent", border: "none", cursor: "pointer",
      color: N.ink2, padding: 6, borderRadius: 6, display: "inline-flex", alignItems: "center",
    }}
    onMouseEnter={e => e.currentTarget.style.background = N.hover}
    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
      {children}
    </button>
  );
}

function CompareBar({ count, onCompare, onClear }) {
  return (
    <div style={{
      position: "fixed", bottom: 22, left: "calc(50% + 124px)", transform: "translateX(-50%)",
      background: N.ink, borderRadius: 10, boxShadow: "0 8px 28px rgba(15,15,15,0.28)",
      display: "flex", alignItems: "center", gap: 6, padding: "7px 8px 7px 14px", zIndex: 30,
    }}>
      <span style={{ fontSize: 13, color: N.bg, fontWeight: 500 }}>{count} seleccionado{count > 1 ? "s" : ""}</span>
      <div style={{ width: 1, height: 18, background: "rgba(255,255,255,0.18)", margin: "0 4px" }} />
      <button onClick={onCompare} disabled={count < 2} style={{
        background: count >= 2 ? N.bg : "rgba(255,255,255,0.15)", color: count >= 2 ? N.ink : "rgba(255,255,255,0.5)",
        border: "none", cursor: count >= 2 ? "pointer" : "default", padding: "6px 12px", fontSize: 13,
        fontFamily: fontN, fontWeight: 600, borderRadius: 6, display: "inline-flex", alignItems: "center", gap: 6,
      }}>
        <NIcon name="scale" size={14} color={count >= 2 ? N.ink : "rgba(255,255,255,0.5)"} /> Comparar
      </button>
      <button onClick={onClear} title="Limpiar" style={{ background: "transparent", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.7)", padding: 6, borderRadius: 6, display: "grid", placeItems: "center" }}>
        <NIcon name="x" size={15} color="rgba(255,255,255,0.7)" />
      </button>
    </div>
  );
}

// ── SIDEBAR ───────────────────────────────────────
function Sidebar({ vacancies, selectedVacancyId, route, onNavigate, onNewVacancy, onSelectVacancy }) {
  const activas = vacancies.filter(v => !v.cerrada);
  const cerradas = vacancies.filter(v => v.cerrada);

  return (
    <aside style={{
      width: 248, background: N.sidebar, borderRight: `1px solid ${N.border}`,
      display: "flex", flexDirection: "column", padding: "10px 8px",
      flexShrink: 0, height: "100%", overflow: "auto",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 8px", borderRadius: 4, cursor: "pointer", marginBottom: 4 }}>
        <div style={{ width: 22, height: 22, borderRadius: 5, background: N.ink, color: N.bg, fontSize: 12, fontWeight: 700, display: "grid", placeItems: "center" }}>H</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: N.ink, whiteSpace: "nowrap" }}>HireScore</div>
        </div>
        <NIcon name="chevD" size={14} color={N.ink3} />
      </div>

      <SBItem icon={<NIcon name="search" size={15} />} label="Buscar" hot="⌘K" />
      <SBItem icon={<NIcon name="bar" size={15} />} label="Resumen" selected={route === "resumen"} onClick={() => onNavigate("resumen")} />
      <SBItem icon={<NIcon name="users" size={15} />} label="Candidatos" selected={route === "candidatos"} onClick={() => onNavigate("candidatos")} />

      <div style={{ padding: "16px 8px 4px", fontSize: 12, color: N.ink3, fontWeight: 600, display: "flex", alignItems: "center" }}>
        <span style={{ flex: 1 }}>Vacantes activas</span>
        <span onClick={onNewVacancy} style={{ cursor: "pointer", display: "grid", placeItems: "center", padding: 2, borderRadius: 4 }}
          onMouseEnter={e => e.currentTarget.style.background = N.hover}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
          <NIcon name="plus" size={14} color={N.ink3} />
        </span>
      </div>
      {activas.map(v => (
        <SBItem key={v.id}
          icon={<Monogram label={initials(v.titulo)} />}
          label={v.titulo}
          selected={v.id === selectedVacancyId && route === "vacante"}
          onClick={() => { onSelectVacancy(v); onNavigate("vacante"); }} />
      ))}
      {activas.length === 0 && (
        <div style={{ padding: "6px 8px", fontSize: 13, color: N.ink4, fontStyle: "italic" }}>Sin vacantes activas</div>
      )}

      {cerradas.length > 0 && (
        <React.Fragment>
          <div style={{ padding: "16px 8px 4px", fontSize: 12, color: N.ink3, fontWeight: 600, display: "flex", alignItems: "center" }}>
            <span style={{ flex: 1 }}>Cerradas</span>
            <span style={{ color: N.ink4, fontVariantNumeric: "tabular-nums" }}>{cerradas.length}</span>
          </div>
          {cerradas.map(v => (
            <div key={v.id} onClick={() => { onSelectVacancy(v); onNavigate("vacante"); }} style={{
              display: "flex", alignItems: "center", gap: 7, padding: "4px 8px", borderRadius: 4,
              minHeight: 28, cursor: "pointer", opacity: 0.78,
            }}
            onMouseEnter={e => e.currentTarget.style.background = N.hover}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              <span style={{ width: 20, display: "grid", placeItems: "center" }}><Monogram label={initials(v.titulo)} /></span>
              <span style={{ flex: 1, minWidth: 0, fontSize: 14, color: N.ink2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", textDecoration: "line-through", textDecorationColor: N.ink4 }}>{v.titulo}</span>
            </div>
          ))}
        </React.Fragment>
      )}

      <div style={{ padding: "16px 8px 4px", fontSize: 12, color: N.ink3, fontWeight: 600 }}>Biblioteca</div>
      <SBItem icon={<NIcon name="folder" size={15} />} label="Todas las vacantes" badge={vacancies.length} selected={route === "vacantes"} onClick={() => onNavigate("vacantes")} />
      <SBItem icon={<NIcon name="page" size={15} />} label="Guías de entrevista" selected={route === "guias"} onClick={() => onNavigate("guias")} />

      <div style={{ flex: 1 }} />

      <div style={{ paddingTop: 8, borderTop: `1px solid ${N.border}`, marginTop: 12 }}>
        <SBItem icon={<NIcon name="cog" size={15} />} label="Configuración" selected={route === "config"} onClick={() => onNavigate("config")} />
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px" }}>
          <NAvatar name="Reclutador" size={24} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: N.ink, whiteSpace: "nowrap" }}>Mi cuenta</div>
            <div style={{ fontSize: 11, color: N.ink3 }}>HireScore</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

// ── HEADER ────────────────────────────────────────
function AppHeader({ chrome, tema, onToggleTheme, vacancy, closed, onToggleClosed, onUploadCV }) {
  const titulo = vacancy?.titulo || "Vacante";
  const vid = vacancy?.id ? `OH-${String(vacancy.id).padStart(3, "0")}` : "";
  return (
    <header style={{
      height: 52, borderBottom: `1px solid ${N.border}`,
      display: "flex", alignItems: "center", gap: 10, padding: "0 20px",
      flexShrink: 0, background: N.bg,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: N.ink2, minWidth: 0 }}>
        <NIcon name="briefcase" size={15} color={N.ink3} />
        <span style={{ color: N.ink, fontWeight: 600, fontSize: 15, whiteSpace: "nowrap" }}>{titulo}</span>
        <Chip color={closed ? "gray" : "yellow"} dot>{closed ? "Cerrada" : "Abierta"}</Chip>
        {vid && <span style={{ color: N.ink3, fontSize: 13, whiteSpace: "nowrap" }}>· {vid}</span>}
      </div>
      <div style={{ flex: 1 }} />

      {chrome === "completo" && !closed && (
        <div style={{ display: "flex", alignItems: "center", gap: 6, background: N.hover, border: `1px solid ${N.border}`, padding: "5px 10px", borderRadius: 6, width: 210 }}>
          <NIcon name="search" size={14} color={N.ink3} />
          <input placeholder="Buscar candidatos…" style={{ border: "none", background: "transparent", outline: "none", flex: 1, fontFamily: fontN, fontSize: 13, color: N.ink }} />
        </div>
      )}

      {closed ? (
        <button onClick={onToggleClosed} style={{ background: "transparent", color: N.ink, border: `1px solid ${N.border}`, cursor: "pointer", padding: "6px 12px", fontSize: 13, fontFamily: fontN, fontWeight: 500, borderRadius: 6, display: "inline-flex", alignItems: "center", gap: 6 }}>
          <NIcon name="rotate" size={14} color={N.ink2} /> Reabrir vacante
        </button>
      ) : (
        <React.Fragment>
          <button onClick={onUploadCV} style={{ background: N.ink, color: N.bg, border: "none", cursor: "pointer", padding: "6px 12px", fontSize: 13, fontFamily: fontN, fontWeight: 500, borderRadius: 6, display: "inline-flex", alignItems: "center", gap: 6 }}>
            <NIcon name="upload" size={14} color={N.bg} /> Subir CV
          </button>
          <button onClick={onToggleClosed} style={{ background: "transparent", color: N.ink2, border: `1px solid ${N.border}`, cursor: "pointer", padding: "6px 12px", fontSize: 13, fontFamily: fontN, fontWeight: 500, borderRadius: 6, display: "inline-flex", alignItems: "center", gap: 6 }}
            onMouseEnter={e => { e.currentTarget.style.background = N.hover; e.currentTarget.style.color = N.ink; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = N.ink2; }}>
            <NIcon name="archive" size={14} /> Cerrar vacante
          </button>
        </React.Fragment>
      )}

      <GhostBtn title="Cambiar tema" onClick={onToggleTheme}>
        <NIcon name={tema === "oscuro" ? "sun" : "moon"} size={16} />
      </GhostBtn>
    </header>
  );
}

function ClosedBanner({ onReopen }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: N.chip.gray.bg, border: `1px solid ${N.border}`, borderRadius: 6 }}>
      <NIcon name="archive" size={16} color={N.ink2} />
      <div style={{ flex: 1, fontSize: 13.5, color: N.ink, lineHeight: 1.4 }}>
        <strong style={{ fontWeight: 600 }}>Vacante cerrada</strong> · archivada y en modo solo lectura.
      </div>
      <button onClick={onReopen} style={{ background: "transparent", color: N.ink, border: `1px solid ${N.border}`, cursor: "pointer", padding: "5px 11px", fontSize: 13, fontFamily: fontN, fontWeight: 500, borderRadius: 6, display: "inline-flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
        <NIcon name="rotate" size={13} color={N.ink2} /> Reabrir
      </button>
    </div>
  );
}

// ── KPI STRIP ─────────────────────────────────────
function KpiStrip({ kpis, people, costo }) {
  if (kpis === "ocultos") return null;
  const total = people.length;
  const prom = total ? Math.round(people.reduce((a, b) => a + b.score, 0) / total) : 0;
  const enProceso = people.filter(p => !["rechazada", "oferta"].includes(p.etapa)).length;
  const mejor = total ? Math.max(...people.map(p => p.score)) : 0;
  const costoStr = costo != null ? `$${costo.toFixed(2)}` : "—";

  const KPI_ALL = [
    { label: "Aplicantes",   value: String(total),     delta: `${enProceso} en proceso`,  deltaColor: "gray",  icon: "user" },
    { label: "Puntaje medio", value: String(prom),      delta: `Mejor: ${mejor}`,          deltaColor: "green", icon: "bar" },
    { label: "En proceso",   value: String(enProceso), delta: `de ${total}`,               deltaColor: "gray",  icon: "clock" },
    { label: "Costo LLM",    value: costoStr,           delta: `${total} análisis`,         deltaColor: "gray",  icon: "dollar" },
  ];

  const items = kpis === "esenciales" ? [KPI_ALL[0], KPI_ALL[1], KPI_ALL[3]] : KPI_ALL;
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${items.length}, 1fr)`, border: `1px solid ${N.border}`, borderRadius: 6, overflow: "hidden", background: N.bg }}>
      {items.map((it, i) => (
        <div key={it.label} style={{ padding: "12px 14px", borderRight: i < items.length - 1 ? `1px solid ${N.border}` : "none", display: "flex", flexDirection: "column", gap: 5 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, color: N.ink3 }}>
            <NIcon name={it.icon} size={12} color={N.ink3} />
            <span style={{ fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.04em" }}>{it.label}</span>
          </div>
          <div style={{ fontSize: 24, fontWeight: 600, color: N.ink, letterSpacing: "-0.02em", lineHeight: 1.1 }}>{it.value}</div>
          <Chip color={it.deltaColor}>{it.delta}</Chip>
        </div>
      ))}
    </div>
  );
}

// ── TABLE ─────────────────────────────────────────
function ColHeader({ icon, label, w }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", fontSize: 12, color: N.ink2, fontWeight: 500, borderRight: `1px solid ${N.border}`, width: w, minWidth: w, flexShrink: 0, cursor: "pointer", userSelect: "none" }}>
      <NIcon name={icon} size={12} color={N.ink3} />
      <span style={{ flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{label}</span>
    </div>
  );
}

function DatabaseTable({ ranked, selected, onSelect, dens, compareIds, toggleCompare }) {
  const rowH = dens === "compacta" ? 33 : 40;
  const pad = dens === "compacta" ? "5px 12px" : "8px 12px";
  return (
    <div style={{ border: `1px solid ${N.border}`, borderRadius: 6, overflow: "hidden", background: N.bg, display: "flex", flexDirection: "column", minHeight: 0 }}>
      <div style={{ display: "flex", borderBottom: `1px solid ${N.border}` }}>
        <div style={{ width: 36, minWidth: 36, borderRight: `1px solid ${N.border}` }} />
        <ColHeader icon="text" label="Candidato" w={220} />
        <ColHeader icon="number" label="Puntaje" w={150} />
        <ColHeader icon="selectIcon" label="Etapa" w={140} />
        <ColHeader icon="text" label="Email" w={220} />
        <ColHeader icon="date" label="Sentimiento" w={130} />
        <div style={{ flex: 1 }} />
      </div>
      <div style={{ flex: 1, overflow: "auto" }}>
        {ranked.map((p, i) => {
          const sel = selected && p.id === selected.id;
          const checked = compareIds.includes(p.id);
          return (
            <div key={p.id} onClick={() => onSelect(p)} style={{
              display: "flex", borderBottom: `1px solid ${N.border}`,
              background: checked || sel ? N.selrow : N.bg, cursor: "pointer", height: rowH,
            }}
            onMouseEnter={e => { if (!sel && !checked) e.currentTarget.style.background = N.hover; }}
            onMouseLeave={e => { if (!sel && !checked) e.currentTarget.style.background = N.bg; }}>
              <div style={{ width: 36, minWidth: 36, borderRight: `1px solid ${N.border}`, display: "grid", placeItems: "center" }}>
                <input type="checkbox" checked={checked} onChange={() => {}} onClick={e => { e.stopPropagation(); toggleCompare(p.id); }} style={{ accentColor: N.ink, cursor: "pointer" }} />
              </div>
              <div style={{ width: 220, borderRight: `1px solid ${N.border}`, padding: pad, display: "flex", alignItems: "center", gap: 8 }}>
                <NAvatar name={p.name} size={22} />
                <span style={{ fontSize: 14, color: N.ink, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</span>
              </div>
              <div style={{ width: 150, borderRight: `1px solid ${N.border}`, padding: pad, display: "flex", alignItems: "center" }}>
                <ScoreCell value={p.score} />
              </div>
              <div style={{ width: 140, borderRight: `1px solid ${N.border}`, padding: pad, display: "flex", alignItems: "center" }}>
                <Chip color={stageChip[p.etapa] || "gray"} dot>{stageLabel[p.etapa] || p.etapa}</Chip>
              </div>
              <div style={{ width: 220, borderRight: `1px solid ${N.border}`, padding: pad, fontSize: 13, color: N.ink2, display: "flex", alignItems: "center", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.email || "—"}</div>
              <div style={{ width: 130, padding: pad, fontSize: 13, display: "flex", alignItems: "center", color: p.sent >= 0.5 ? N.chip.green.fg : p.sent >= 0 ? N.ink2 : N.chip.red.fg, fontVariantNumeric: "tabular-nums" }}>
                {p.sent !== 0 ? `${p.sent >= 0 ? "+" : ""}${p.sent.toFixed(2)}` : "—"}
              </div>
              <div style={{ flex: 1 }} />
            </div>
          );
        })}
        {ranked.length === 0 && (
          <div style={{ padding: "32px 16px", textAlign: "center", fontSize: 13.5, color: N.ink3 }}>
            Sin candidatos aún · sube un CV con el botón "Subir CV"
          </div>
        )}
      </div>
      <div style={{ display: "flex", padding: "8px 16px 8px 46px", color: N.ink3, fontSize: 12, borderTop: `1px solid ${N.border}`, alignItems: "center", gap: 18, background: N.sidebar }}>
        <span>TOTAL <strong style={{ color: N.ink, marginLeft: 4 }}>{ranked.length}</strong></span>
        {ranked.length > 0 && <span>PUNTAJE MEDIO <strong style={{ color: N.ink, marginLeft: 4 }}>{Math.round(ranked.reduce((a, b) => a + b.score, 0) / ranked.length)}</strong></span>}
      </div>
    </div>
  );
}

function Board({ people, selected, onSelect, setStage }) {
  const [dragId, setDragId] = useState(null);
  const [overStage, setOverStage] = useState(null);
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${ETAPAS.length}, minmax(192px, 1fr))`, gap: 12, overflow: "auto", paddingBottom: 6 }}>
      {ETAPAS.map(e => {
        const col = people.filter(c => c.etapa === e.id).sort((a, b) => b.score - a.score);
        const isOver = overStage === e.id;
        return (
          <div key={e.id}
            onDragOver={ev => { ev.preventDefault(); setOverStage(e.id); }}
            onDragLeave={() => setOverStage(s => s === e.id ? null : s)}
            onDrop={ev => { ev.preventDefault(); if (dragId != null) setStage(dragId, e.id); setDragId(null); setOverStage(null); }}
            style={{ borderRadius: 8, padding: 4, background: isOver ? N.hover : "transparent", outline: isOver ? `1.5px dashed ${N.borderHi}` : "1.5px dashed transparent", transition: "background 0.12s" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, padding: "0 2px" }}>
              <Chip color={e.chip} dot>{e.label}</Chip>
              <span style={{ color: N.ink3, fontSize: 13 }}>{col.length}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, minHeight: 40 }}>
              {col.map(p => (
                <div key={p.id} draggable
                  onDragStart={ev => { setDragId(p.id); ev.dataTransfer.effectAllowed = "move"; }}
                  onDragEnd={() => { setDragId(null); setOverStage(null); }}
                  onClick={() => onSelect(p)} style={{
                  background: N.bg, border: `1px solid ${selected && selected.id === p.id ? N.ink4 : N.border}`,
                  borderRadius: 6, padding: "10px 12px", cursor: "grab",
                  boxShadow: "0 1px 2px rgba(15,15,15,0.04)", opacity: dragId === p.id ? 0.4 : 1,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <NAvatar name={p.name} size={22} />
                    <span style={{ fontSize: 13, color: N.ink, fontWeight: 500, flex: 1, minWidth: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</span>
                  </div>
                  <ScoreCell value={p.score} />
                  {p.match.length > 0 && (
                    <div style={{ display: "flex", gap: 4, marginTop: 8, flexWrap: "wrap" }}>
                      {p.match.slice(0, 2).map((s, j) => <Chip key={s} color={["blue", "purple"][j]}>{s}</Chip>)}
                    </div>
                  )}
                </div>
              ))}
              {col.length === 0 && <div style={{ fontSize: 12, color: N.ink4, padding: "12px 2px", fontStyle: "italic" }}>{isOver ? "Soltar aquí" : "— vacío —"}</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Ranking({ ranked, selected, onSelect }) {
  return (
    <div style={{ border: `1px solid ${N.border}`, borderRadius: 6, overflow: "hidden", background: N.bg }}>
      {ranked.map((p, i) => (
        <div key={p.id} onClick={() => onSelect(p)} style={{
          display: "grid", gridTemplateColumns: "28px 1fr 200px 140px", alignItems: "center", gap: 14,
          padding: "10px 16px", cursor: "pointer",
          borderBottom: i === ranked.length - 1 ? "none" : `1px solid ${N.border}`,
          background: selected && selected.id === p.id ? N.selrow : N.bg,
        }}
        onMouseEnter={e => { if (!(selected && selected.id === p.id)) e.currentTarget.style.background = N.hover; }}
        onMouseLeave={e => { if (!(selected && selected.id === p.id)) e.currentTarget.style.background = N.bg; }}>
          <div style={{ color: N.ink3, fontSize: 13, fontVariantNumeric: "tabular-nums", textAlign: "right" }}>{i + 1}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
            <NAvatar name={p.name} size={28} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 500, color: N.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</div>
              <div style={{ fontSize: 12, color: N.ink2 }}>{p.email || "—"}</div>
            </div>
          </div>
          <ScoreCell value={p.score} />
          <div><Chip color={stageChip[p.etapa] || "gray"} dot>{stageLabel[p.etapa] || p.etapa}</Chip></div>
        </div>
      ))}
      {ranked.length === 0 && (
        <div style={{ padding: "24px 16px", textAlign: "center", fontSize: 13.5, color: N.ink3 }}>Sin candidatos aún</div>
      )}
    </div>
  );
}

// ── PEEK PANEL ────────────────────────────────────
function PeekPanel({ p, onClose, onExpand, advanceStage, rejectCand }) {
  const [expl, setExpl] = useState(null);

  useEffect(() => {
    setExpl(null);
    if (!p.analisis_id) return;
    API.getExplicacion(p.analisis_id).then(setExpl).catch(() => {});
  }, [p.analisis_id]);

  const features = expl?.desglose || [];
  const match = expl?.skills_match || p.match || [];
  const miss = expl?.skills_faltantes || p.miss || [];

  const propRow = (icon, label, val) => (
    <div key={label} style={{ display: "grid", gridTemplateColumns: "120px 1fr", alignItems: "center", padding: "4px 0", minHeight: 28 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, color: N.ink2, fontSize: 13 }}>
        <NIcon name={icon} size={12} color={N.ink3} /><span>{label}</span>
      </div>
      <div>{val}</div>
    </div>
  );

  return (
    <aside className="peek-anim" style={{ width: 384, background: N.bg, borderLeft: `1px solid ${N.border}`, display: "flex", flexDirection: "column", flexShrink: 0, height: "100%" }}>
      <div style={{ height: 44, borderBottom: `1px solid ${N.border}`, display: "flex", alignItems: "center", gap: 4, padding: "0 12px" }}>
        <GhostBtn title="Abrir candidato" onClick={() => onExpand(p)}><NIcon name="expand" size={14} /></GhostBtn>
        <div style={{ flex: 1 }} />
        <GhostBtn title="Cerrar" onClick={onClose}><NIcon name="x" size={14} /></GhostBtn>
      </div>

      <div style={{ flex: 1, overflow: "auto", padding: "18px 22px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
          <NAvatar name={p.name} size={48} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 22, fontWeight: 600, color: N.ink, letterSpacing: "-0.01em", lineHeight: 1.2 }}>{p.name}</div>
            <div style={{ fontSize: 13, color: N.ink2, marginTop: 2 }}>{p.email || "—"}</div>
          </div>
        </div>

        <div style={{ marginBottom: 16, borderBottom: `1px solid ${N.border}`, paddingBottom: 12 }}>
          {propRow("number", "Puntaje", <ScoreCell value={p.score} width={180} />)}
          {propRow("selectIcon", "Etapa", <Chip color={stageChip[p.etapa] || "gray"} dot>{stageLabel[p.etapa] || p.etapa}</Chip>)}
          {p.email && propRow("text", "Email", <span style={{ fontSize: 13, color: N.ink }}>{p.email}</span>)}
          {p.sent !== 0 && propRow("bar", "Sentimiento", <span style={{ fontSize: 13, fontVariantNumeric: "tabular-nums", color: p.sent >= 0.5 ? N.chip.green.fg : p.sent >= 0 ? N.ink : N.chip.red.fg }}>{p.sent >= 0 ? "+" : ""}{p.sent.toFixed(2)}</span>)}
        </div>

        {features.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: N.ink2, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 10 }}>Desglose de features</div>
            {features.map(f => (
              <div key={f.categoria} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: N.ink, marginBottom: 4 }}>
                  <span>{f.categoria}</span>
                  <span style={{ color: N.ink3, fontVariantNumeric: "tabular-nums" }}>{f.puntaje}%{f.peso != null ? ` · peso ${f.peso.toFixed(2)}` : ""}</span>
                </div>
                <div style={{ height: 6, borderRadius: 3, background: N.track, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${f.puntaje}%`, background: N.ink3, borderRadius: 3 }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {(match.length > 0 || miss.length > 0) && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: N.ink2, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 10 }}>Habilidades</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
              {match.map((s, j) => <Chip key={s} color={["blue", "purple", "brown", "green"][j % 4]}>{s}</Chip>)}
              {miss.map(s => <Chip key={s} color="red">falta {s}</Chip>)}
            </div>
          </div>
        )}

        {expl?.disclaimer && (
          <div style={{ padding: "10px 12px", background: N.chip.gray.bg, borderRadius: 6, fontSize: 12, color: N.ink3, fontStyle: "italic" }}>
            {expl.disclaimer}
          </div>
        )}
      </div>

      <div style={{ padding: "10px 14px", borderTop: `1px solid ${N.border}`, display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={() => advanceStage(p.id)} style={{ background: N.ink, color: N.bg, border: "none", cursor: "pointer", padding: "8px 12px", fontSize: 13, fontFamily: fontN, fontWeight: 500, borderRadius: 6, flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <NIcon name="arrow" size={14} color={N.bg} /> Avanzar etapa
          </button>
          <button onClick={() => rejectCand(p.id)} title="Rechazar" style={{ background: "transparent", color: N.chip.red.fg, border: `1px solid ${N.border}`, cursor: "pointer", padding: "8px 12px", fontSize: 13, fontFamily: fontN, fontWeight: 500, borderRadius: 6, display: "inline-flex", alignItems: "center", gap: 6 }}>
            <NIcon name="x" size={14} color={N.chip.red.fg} /> Rechazar
          </button>
        </div>
        <button onClick={() => onExpand(p)} style={{ background: "transparent", color: N.ink, border: `1px solid ${N.border}`, cursor: "pointer", padding: "8px 12px", fontSize: 13, fontFamily: fontN, fontWeight: 500, borderRadius: 6, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
          <NIcon name="expand" size={14} color={N.ink2} /> Abrir candidato
        </button>
      </div>
    </aside>
  );
}

// ── DESCRIPCIÓN DEL PUESTO ────────────────────────
function JobDescription({ vacancy }) {
  const [open, setOpen] = useState(true);
  if (!vacancy) return null;
  return (
    <div style={{ border: `1px solid ${N.border}`, borderRadius: 6, background: N.bg, overflow: "hidden" }}>
      <div onClick={() => setOpen(o => !o)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", cursor: "pointer", background: open ? N.sidebar : N.bg, borderBottom: open ? `1px solid ${N.border}` : "none" }}
        onMouseEnter={e => { if (!open) e.currentTarget.style.background = N.hover; }}
        onMouseLeave={e => { if (!open) e.currentTarget.style.background = N.bg; }}>
        <NIcon name={open ? "chevD" : "chevR"} size={14} color={N.ink3} />
        <span style={{ fontSize: 13, fontWeight: 600, color: N.ink }}>Descripción del puesto</span>
      </div>
      {open && vacancy.descripcion && (
        <div style={{ padding: "14px 18px" }}>
          <p style={{ fontSize: 14, color: N.ink2, lineHeight: 1.6, margin: "0 0 12px" }}>{vacancy.descripcion}</p>
          {vacancy.requisitos_texto && (
            <div>
              <div style={{ fontSize: 12, color: N.ink2, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 8 }}>Requisitos</div>
              <pre style={{ fontSize: 13, color: N.ink2, lineHeight: 1.6, margin: 0, whiteSpace: "pre-wrap", fontFamily: fontN }}>{vacancy.requisitos_texto}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SimpleHeader({ title, tema, onToggleTheme }) {
  return (
    <header style={{ height: 52, borderBottom: `1px solid ${N.border}`, display: "flex", alignItems: "center", gap: 10, padding: "0 24px", flexShrink: 0, background: N.bg }}>
      <span style={{ color: N.ink, fontWeight: 600, fontSize: 14 }}>{title}</span>
      <div style={{ flex: 1 }} />
      <GhostBtn title="Cambiar tema" onClick={onToggleTheme}>
        <NIcon name={tema === "oscuro" ? "sun" : "moon"} size={16} />
      </GhostBtn>
    </header>
  );
}

// ── WORKSPACE ────────────────────────────────────
function Workspace({ t, view, setView, selected, onSelect, setSelected, closed, setClosed, ranked, people, toggleTheme, onUploadCV, onExpand, advanceStage, setStage, rejectCand, compareIds, toggleCompare, onCompare, clearCompare, vacancy, costo }) {
  const tabs = [
    { id: "table", label: "Tabla", icon: "selectIcon" },
    { id: "board", label: "Tablero", icon: "folder" },
    { id: "ranking", label: "Ranking", icon: "bar" },
  ];
  return (
    <React.Fragment>
      <AppHeader chrome={t.chrome} tema={t.tema} onToggleTheme={toggleTheme} vacancy={vacancy} closed={closed} onToggleClosed={() => setClosed(c => !c)} onUploadCV={onUploadCV} />

      <div style={{ flex: 1, display: "flex", minHeight: 0, overflow: "hidden" }}>
        <div style={{ flex: 1, padding: "18px 24px", display: "flex", flexDirection: "column", gap: 16, minWidth: 0, overflow: "auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <h1 style={{ fontSize: 22, fontWeight: 600, color: N.ink, letterSpacing: "-0.01em", margin: 0 }}>Pipeline</h1>
            <span style={{ color: N.ink3, fontSize: 13 }}>· {ranked.length} candidatos</span>
          </div>

          {closed && <ClosedBanner onReopen={() => setClosed(false)} />}

          <JobDescription vacancy={vacancy} />

          <KpiStrip kpis={t.kpis} people={people} costo={costo} />

          <div style={{ display: "flex", alignItems: "center", borderBottom: `1px solid ${N.border}` }}>
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setView(tab.id)} style={{
                background: "transparent", border: "none", cursor: "pointer", fontFamily: fontN, fontSize: 13,
                color: view === tab.id ? N.ink : N.ink2, padding: "8px 12px",
                borderBottom: view === tab.id ? `2px solid ${N.ink}` : "2px solid transparent",
                marginBottom: -1, display: "inline-flex", alignItems: "center", gap: 6, fontWeight: view === tab.id ? 600 : 400,
              }}>
                <NIcon name={tab.icon} size={14} color={view === tab.id ? N.ink : N.ink3} /> {tab.label}
              </button>
            ))}
            <div style={{ flex: 1 }} />
          </div>

          <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
            {view === "table"   && <DatabaseTable ranked={ranked} selected={selected} onSelect={onSelect} dens={t.densidad} compareIds={compareIds} toggleCompare={toggleCompare} />}
            {view === "board"   && <Board people={ranked} selected={selected} onSelect={onSelect} setStage={setStage} />}
            {view === "ranking" && <Ranking ranked={ranked} selected={selected} onSelect={onSelect} />}
          </div>
        </div>

        {selected && <PeekPanel p={selected} onClose={() => setSelected(null)} onExpand={onExpand} advanceStage={advanceStage} rejectCand={rejectCand} />}
      </div>

      {compareIds.length > 0 && <CompareBar count={compareIds.length} onCompare={onCompare} onClear={clearCompare} />}
    </React.Fragment>
  );
}

// ── APP ──────────────────────────────────────────
function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [route, setRoute] = useState("vacante");
  const [view, setView] = useState("table");
  const [selectedId, setSelectedId] = useState(null);
  const [detailId, setDetailId] = useState(null);
  const [closed, setClosed] = useState(false);

  // Sesión y flujos
  const [authed, setAuthed] = useState(false);
  const [isEmpty, setIsEmpty] = useState(false);
  const [wizard, setWizard] = useState(false);
  const [addCV, setAddCV] = useState(false);

  // Vacantes y candidatos desde API
  const [vacancies, setVacancies] = useState([]);
  const [selectedVacancy, setSelectedVacancy] = useState(null);
  const [people, setPeople] = useState([]);
  const [costo, setCosto] = useState(null);

  const ranked = useMemo(() => [...people].sort((a, b) => b.score - a.score), [people]);
  const selected = people.find(p => p.id === selectedId) || null;
  const detail   = people.find(p => p.id === detailId)   || null;

  // Comparar
  const [compareIds, setCompareIds] = useState([]);
  const [showCompare, setShowCompare] = useState(false);
  const toggleCompare = (id) => setCompareIds(s => s.includes(id) ? s.filter(x => x !== id) : (s.length >= 4 ? s : [...s, id]));
  const compareList = ranked.filter(p => compareIds.includes(p.id));

  // Acciones de etapa
  const STAGE_ORDER = ETAPAS.filter(e => e.id !== "rechazada");
  const setStage = useCallback((id, etapa) => {
    const p = people.find(x => x.id === id);
    if (!p) return;
    API.cambiarEtapa(p.aplicacion_id, etapa).catch(console.error);
    setPeople(ps => ps.map(x => x.id === id ? { ...x, etapa } : x));
  }, [people]);

  const advanceStage = useCallback((id) => {
    const p = people.find(x => x.id === id);
    if (!p) return;
    const idx = STAGE_ORDER.findIndex(e => e.id === p.etapa);
    if (idx < 0 || idx >= STAGE_ORDER.length - 1) return;
    setStage(id, STAGE_ORDER[idx + 1].id);
  }, [people, setStage]);

  const rejectCand = useCallback((id) => setStage(id, "rechazada"), [setStage]);

  // Cargar vacantes al autenticarse
  const loadVacancies = useCallback(() => {
    API.listVacancies().then(vs => {
      setVacancies(vs);
      if (vs.length > 0) {
        setSelectedVacancy(vs[0]);
        setIsEmpty(false);
      } else {
        setIsEmpty(true);
      }
    }).catch(console.error);
  }, []);

  useEffect(() => { if (authed) loadVacancies(); }, [authed]);

  // Cargar aplicaciones al cambiar de vacante
  const loadAplicaciones = useCallback((vacancy) => {
    if (!vacancy) return;
    setPeople([]);
    setSelectedId(null);
    API.listAplicaciones(vacancy.id).then(apls => {
      setPeople(apls.map(aplToCandidate));
    }).catch(console.error);
    API.getCosto(vacancy.id).then(r => setCosto(r.costo_usd)).catch(() => setCosto(null));
  }, []);

  useEffect(() => { if (authed && selectedVacancy) loadAplicaciones(selectedVacancy); }, [selectedVacancy]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", t.tema === "oscuro" ? "dark" : "light");
  }, [t.tema]);

  const toggleTheme = () => setTweak("tema", t.tema === "oscuro" ? "claro" : "oscuro");
  const onSelect    = (p) => setSelectedId(prev => prev === p.id ? null : p.id);
  const setSelected = (p) => setSelectedId(p ? p.id : null);
  const setDetail   = (p) => setDetailId(p ? p.id : null);
  const openCandidate = (p) => { setSelectedId(p.id); setRoute("vacante"); };
  const titles = { resumen: "Resumen", candidatos: "Candidatos", vacantes: "Vacantes", guias: "Guías de entrevista", config: "Configuración" };

  const handleSelectVacancy = (v) => {
    setSelectedVacancy(v);
    setClosed(false);
    setDetailId(null);
    setSelectedId(null);
    setCompareIds([]);
  };

  // Login gate
  if (!authed) {
    return (
      <div data-theme={t.tema === "oscuro" ? "dark" : "light"}>
        <LoginScreen onLogin={() => setAuthed(true)} />
        <TweaksPanel title="Tweaks">
          <TweakSection label="Tema" />
          <TweakRadio label="Apariencia" value={t.tema} options={["claro", "oscuro"]} onChange={v => setTweak("tema", v)} />
        </TweaksPanel>
      </div>
    );
  }

  return (
    <div data-theme={t.tema === "oscuro" ? "dark" : "light"} style={{ width: "100vw", height: "100vh", background: N.bg, color: N.ink, fontFamily: fontN, display: "flex", overflow: "hidden", fontSize: 14 }}>
      {!isEmpty && (
        <Sidebar
          vacancies={vacancies}
          selectedVacancyId={selectedVacancy?.id}
          route={route}
          onNavigate={r => { setDetail(null); setRoute(r); }}
          onNewVacancy={() => setWizard(true)}
          onSelectVacancy={handleSelectVacancy}
        />
      )}

      <main style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>
        {isEmpty ? (
          <React.Fragment>
            <SimpleHeader title="Inicio" tema={t.tema} onToggleTheme={toggleTheme} />
            <div style={{ flex: 1, overflow: "auto" }}><EmptyState onCreate={() => setWizard(true)} /></div>
          </React.Fragment>
        ) : detail ? (
          <CandidateDetail p={detail} onBack={() => setDetailId(null)} onAdvance={advanceStage} onReject={rejectCand} stageOrder={STAGE_ORDER} />
        ) : route === "vacante" ? (
          <Workspace
            t={t} view={view} setView={setView}
            selected={selected} onSelect={onSelect} setSelected={setSelected}
            closed={closed} setClosed={setClosed}
            ranked={ranked} people={people}
            toggleTheme={toggleTheme}
            onUploadCV={() => setAddCV(true)}
            onExpand={p => { setDetailId(p.id); setSelectedId(null); }}
            advanceStage={advanceStage} setStage={setStage} rejectCand={rejectCand}
            compareIds={compareIds} toggleCompare={toggleCompare}
            onCompare={() => setShowCompare(true)} clearCompare={() => setCompareIds([])}
            vacancy={selectedVacancy} costo={costo}
          />
        ) : (
          <React.Fragment>
            <SimpleHeader title={titles[route]} tema={t.tema} onToggleTheme={toggleTheme} />
            <div style={{ flex: 1, overflow: "auto", padding: "28px 32px" }}>
              {route === "resumen"    && <DashboardScreen people={people} vacancies={vacancies} onOpenVacante={() => setRoute("vacante")} onOpenCandidate={openCandidate} onAdvance={advanceStage} onReject={rejectCand} stageOrder={STAGE_ORDER} />}
              {route === "vacantes"   && <VacanciesScreen vacancies={vacancies} onOpenVacante={() => setRoute("vacante")} />}
              {route === "candidatos" && <CandidatesScreen people={ranked} onOpenCandidate={openCandidate} />}
              {route === "guias"      && <GuidesScreen vacancyId={selectedVacancy?.id} />}
              {route === "config"     && <SettingsScreen />}
            </div>
          </React.Fragment>
        )}
      </main>

      {wizard && (
        <NewVacancyWizard
          onClose={() => setWizard(false)}
          onDone={(newVacancy) => {
            setWizard(false);
            if (newVacancy) {
              setVacancies(vs => [...vs, newVacancy]);
              setSelectedVacancy(newVacancy);
              setIsEmpty(false);
              setRoute("vacante");
            }
          }}
        />
      )}
      {addCV && (
        <AddCandidates
          vacanteId={selectedVacancy?.id}
          onClose={() => setAddCV(false)}
          onDone={() => { setAddCV(false); if (selectedVacancy) loadAplicaciones(selectedVacancy); }}
        />
      )}
      {showCompare && compareList.length >= 2 && (
        <CompareView people={compareList} onClose={() => setShowCompare(false)} onOpen={p => { setShowCompare(false); setDetailId(p.id); }} />
      )}

      <TweaksPanel title="Tweaks">
        <TweakSection label="Tema" />
        <TweakRadio label="Apariencia" value={t.tema} options={["claro", "oscuro"]} onChange={v => setTweak("tema", v)} />
        <TweakSection label="Simplicidad" />
        <TweakRadio label="Chrome" value={t.chrome} options={["completo", "mínimo"]} onChange={v => setTweak("chrome", v)} />
        <TweakRadio label="KPIs" value={t.kpis} options={["completos", "esenciales", "ocultos"]} onChange={v => setTweak("kpis", v)} />
        <TweakRadio label="Densidad" value={t.densidad} options={["cómoda", "compacta"]} onChange={v => setTweak("densidad", v)} />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
