/* global React, N, stageChip, stageLabel, Chip, NIcon, NAvatar, fontN */
// Comparar candidatos lado a lado (2–4 seleccionados)

function CompareView({ people, onClose, onOpen }) {
  const cols = people.slice(0, 4);
  const bestScore = Math.max(...cols.map(p => p.score));
  const bestSent = Math.max(...cols.map(p => p.sent));

  const gridCols = `190px repeat(${cols.length}, 1fr)`;
  const RowLabel = ({ icon, children }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: N.ink2, fontWeight: 500, padding: "12px 16px" }}>
      <NIcon name={icon} size={13} color={N.ink3} /> {children}
    </div>
  );
  const cellBase = { padding: "12px 16px", borderLeft: `1px solid ${N.border}`, display: "flex", alignItems: "center" };

  const Row = ({ label, icon, render, top, alt }) => (
    <div style={{ display: "grid", gridTemplateColumns: gridCols, borderTop: top ? "none" : `1px solid ${N.border}`, background: alt ? N.sidebar : N.bg }}>
      <RowLabel icon={icon}>{label}</RowLabel>
      {cols.map(p => <div key={p.id} style={cellBase}>{render(p)}</div>)}
    </div>
  );

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(15,15,15,0.34)", zIndex: 55, display: "grid", placeItems: "center", fontFamily: fontN, padding: 28 }}>
      <div onClick={e => e.stopPropagation()} style={{ width: "min(1040px, 96vw)", maxHeight: "92vh", background: N.bg, border: `1px solid ${N.border}`, borderRadius: 12, boxShadow: "0 20px 60px rgba(15,15,15,0.22)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 18px", borderBottom: `1px solid ${N.border}`, flexShrink: 0 }}>
          <NIcon name="scale" size={16} color={N.ink2} />
          <span style={{ fontSize: 15, fontWeight: 600, color: N.ink }}>Comparar candidatos</span>
          <Chip color="gray">{cols.length}</Chip>
          <div style={{ flex: 1 }} />
          <button onClick={onClose} style={{ background: "transparent", border: "none", cursor: "pointer", color: N.ink3, padding: 5, borderRadius: 6, display: "grid", placeItems: "center" }}
            onMouseEnter={e => e.currentTarget.style.background = N.hover}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
            <NIcon name="x" size={18} />
          </button>
        </div>

        <div style={{ flex: 1, overflow: "auto" }}>
          {/* Encabezado: avatares */}
          <div style={{ display: "grid", gridTemplateColumns: gridCols, position: "sticky", top: 0, background: N.bg, zIndex: 1, borderBottom: `1px solid ${N.border}` }}>
            <div style={{ padding: "16px" }} />
            {cols.map(p => (
              <div key={p.id} style={{ padding: "16px", borderLeft: `1px solid ${N.border}`, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, textAlign: "center" }}>
                <NAvatar name={p.name} size={44} />
                <div>
                  <div style={{ fontSize: 14.5, fontWeight: 600, color: N.ink, lineHeight: 1.2 }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: N.ink3, marginTop: 2 }}>{p.email || ""}</div>
                </div>
                <button onClick={() => onOpen(p)} style={{ background: "transparent", color: N.ink2, border: `1px solid ${N.border}`, cursor: "pointer", padding: "4px 10px", fontSize: 12, fontFamily: fontN, fontWeight: 500, borderRadius: 5, display: "inline-flex", alignItems: "center", gap: 5 }}>
                  <NIcon name="expand" size={12} color={N.ink3} /> Abrir
                </button>
              </div>
            ))}
          </div>

          {/* Score global */}
          <Row top label="Puntaje global" icon="number" render={p => (
            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <span style={{ fontSize: 30, fontWeight: 700, color: N.ink, letterSpacing: "-0.02em" }}>{p.score}</span>
              {p.score === bestScore && <Chip color="green" dot>mejor</Chip>}
            </div>
          )} />

          <Row label="Etapa" icon="selectIcon" render={p => <Chip color={stageChip[p.etapa]} dot>{stageLabel[p.etapa]}</Chip>} />


          {/* Skills match */}
          <Row label="Skills que cumple" icon="check" render={p => (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
              {(p.match||[]).length ? (p.match||[]).map(s => <Chip key={s} color="green">{s}</Chip>) : <span style={{ fontSize: 12.5, color: N.ink3 }}>—</span>}
            </div>
          )} />
          <Row alt label="Skills faltantes" icon="alert" render={p => (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
              {(p.miss||[]).length ? (p.miss||[]).map(s => <Chip key={s} color="red">{s}</Chip>) : <span style={{ fontSize: 12.5, color: N.ink3 }}>—</span>}
            </div>
          )} />
          <Row label="Sentimiento" icon="bar" render={p => (
            <span style={{ fontSize: 13.5, fontWeight: 600, color: p.sent === bestSent ? N.chip.green.fg : N.ink, fontVariantNumeric: "tabular-nums" }}>
              {p.sent >= 0 ? "+" : ""}{p.sent.toFixed(2)}
            </span>
          )} />

          {/* Recomendación */}
          <Row alt label="Recomendación IA" icon="sparkle" render={p => (
            <Chip color={p.score >= 80 ? "green" : p.score >= 65 ? "blue" : "yellow"} dot>
              {p.score >= 80 ? "Avanzar a oferta" : p.score >= 65 ? "Segunda entrevista" : "Mantener"}
            </Chip>
          )} />
        </div>
      </div>
    </div>
  );
}

window.CompareView = CompareView;
