/* global React, N, API, stageChip, stageLabel,
   buildCV, buildCVQuestions, TRANSCRIPT, EVAL, buildFinal,
   Chip, NIcon, NAvatar, ScoreCell, fontN */
// Detalle del candidato dentro de la vacante: CV · Score · Guía · Entrevista · Reporte final

const { useState: useStateD, useEffect: useEffectD } = React;

function SectionTitle({ children, right }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 14 }}>
      <div style={{ fontSize: 12, color: N.ink2, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>{children}</div>
      {right}
    </div>
  );
}
function Panel({ children, pad = 20, style }) {
  return <div style={{ border: `1px solid ${N.border}`, borderRadius: 10, background: N.bg, padding: pad, ...style }}>{children}</div>;
}

// ── TAB: CV estructurado ──────────────────────────
function TabCV({ cv }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 20, alignItems: "start" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <Panel>
          <SectionTitle>Resumen profesional</SectionTitle>
          <p style={{ fontSize: 14, color: N.ink, lineHeight: 1.6, margin: 0 }}>{cv.resumen}</p>
        </Panel>

        <Panel>
          <SectionTitle>Experiencia</SectionTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {cv.experiencia.map((e, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "16px 1fr", gap: 12 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{ width: 9, height: 9, borderRadius: 999, background: N.ink3, marginTop: 4 }} />
                  {i < cv.experiencia.length - 1 && <div style={{ width: 1, flex: 1, background: N.border, marginTop: 4 }} />}
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 14.5, fontWeight: 600, color: N.ink }}>{e.rol}</span>
                    <span style={{ fontSize: 13, color: N.ink2 }}>· {e.empresa}</span>
                    <span style={{ fontSize: 12, color: N.ink3, marginLeft: "auto" }}>{e.periodo}</span>
                  </div>
                  <ul style={{ margin: "8px 0 0", paddingLeft: 16 }}>
                    {e.puntos.map((p, j) => <li key={j} style={{ fontSize: 13.5, color: N.ink2, lineHeight: 1.5, marginBottom: 3 }}>{p}</li>)}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
          <Panel>
            <SectionTitle>Educación</SectionTitle>
            {cv.educacion.map((ed, i) => (
              <div key={i} style={{ display: "flex", gap: 10 }}>
                <NIcon name="grad" size={16} color={N.ink3} />
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 500, color: N.ink }}>{ed.titulo}</div>
                  <div style={{ fontSize: 12.5, color: N.ink3 }}>{ed.inst} · {ed.periodo}</div>
                </div>
              </div>
            ))}
          </Panel>
          <Panel>
            <SectionTitle>Proyectos</SectionTitle>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {cv.proyectos.map(pr => (
                <div key={pr.nombre}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: N.ink, fontFamily: "ui-monospace, monospace" }}>{pr.nombre}</div>
                  <div style={{ fontSize: 12.5, color: N.ink2, margin: "2px 0 5px" }}>{pr.desc}</div>
                  <div style={{ display: "flex", gap: 4 }}>{pr.tags.map(t => <Chip key={t} color="gray">{t}</Chip>)}</div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 18, position: "sticky", top: 0 }}>
        <Panel>
          <SectionTitle>Contacto</SectionTitle>
          {[["mail", cv.contacto.email], ["clock", cv.contacto.tel], ["pin", cv.contacto.ubicacion]].map(([ic, v]) => (
            <div key={v} style={{ display: "flex", alignItems: "center", gap: 9, padding: "4px 0", fontSize: 13, color: N.ink }}>
              <NIcon name={ic} size={13} color={N.ink3} /> <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v}</span>
            </div>
          ))}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
            {cv.contacto.links.map(l => <Chip key={l} color="blue">{l}</Chip>)}
          </div>
        </Panel>
        <Panel>
          <SectionTitle>Skills detectados</SectionTitle>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {cv.skills.map((s, j) => <Chip key={s} color={["blue", "purple", "brown", "green", "cyan", "orange"][j % 6]}>{s}</Chip>)}
          </div>
        </Panel>
        <Panel style={{ background: N.chip.yellow.bg, border: "none" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <NIcon name="alert" size={14} color={N.chip.yellow.fg} />
            <span style={{ fontSize: 12, color: N.chip.yellow.fg, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>A verificar</span>
          </div>
          {cv.flags.map(f => <div key={f} style={{ fontSize: 13, color: N.ink, lineHeight: 1.5, marginBottom: 4 }}>· {f}</div>)}
        </Panel>
      </div>
    </div>
  );
}

// ── TAB: Score vs vacante ─────────────────────────
function TabScore({ p, expl }) {
  const features = expl?.desglose || [];
  const match = expl?.skills_match || p.match || [];
  const miss = expl?.skills_faltantes || p.miss || [];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20, alignItems: "start" }}>
      <Panel>
        <SectionTitle right={<Chip color="gray">pesos del modelo</Chip>}>Desglose del puntaje</SectionTitle>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {features.length === 0 && <div style={{ fontSize: 13, color: N.ink3 }}>Sin desglose disponible.</div>}
          {features.map(f => (
            <div key={f.categoria}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: N.ink, marginBottom: 5 }}>
                <span style={{ fontWeight: 500 }}>{f.categoria}</span>
                <span style={{ color: N.ink3, fontVariantNumeric: "tabular-nums" }}>{f.puntaje}%{f.peso != null ? ` · peso ${f.peso.toFixed(2)}` : ""}</span>
              </div>
              <div style={{ height: 8, borderRadius: 4, background: N.track, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${f.puntaje}%`, background: N.ink3, borderRadius: 4 }} />
              </div>
            </div>
          ))}
        </div>
        {(match.length > 0 || miss.length > 0) && (
          <div style={{ marginTop: 20, padding: "12px 14px", background: N.chip.blue.bg, borderRadius: 8, display: "flex", gap: 10, alignItems: "flex-start" }}>
            <NIcon name="sparkle" size={14} color={N.chip.blue.fg} />
            <div style={{ fontSize: 13, color: N.ink, lineHeight: 1.55 }}>
              Coincide en {match.length}/{match.length + miss.length} skills. {miss.length ? `Faltan: ${miss.join(", ")}.` : "Cumple todos los skills."}
            </div>
          </div>
        )}
      </Panel>

      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <Panel style={{ textAlign: "center" }}>
          <div style={{ fontSize: 12, color: N.ink2, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>Score CV vs vacante</div>
          <div style={{ fontSize: 52, fontWeight: 700, color: N.ink, letterSpacing: "-0.03em", lineHeight: 1.1, margin: "8px 0 2px" }}>{p.score}</div>
          <Chip color={p.score >= 80 ? "green" : p.score >= 60 ? "blue" : "yellow"} dot>{p.score >= 80 ? "Excelente match" : p.score >= 60 ? "Buen match" : "Match medio"}</Chip>
        </Panel>
        {(match.length > 0 || miss.length > 0) && (
          <Panel>
            <SectionTitle>Skills vs requisitos</SectionTitle>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {match.map(s => <Chip key={s} color="green" dot>{s}</Chip>)}
              {miss.map(s => <Chip key={s} color="red">falta {s}</Chip>)}
            </div>
          </Panel>
        )}
      </div>
    </div>
  );
}

// ── TAB: Guía personalizada ───────────────────────
function TabGuide({ p, expl }) {
  const cvQs = expl?.preguntas_cv || [];
  const Q = ({ text, sub, accent, badge }) => (
    <div style={{ padding: "12px 14px", border: `1px solid ${N.border}`, borderLeft: `3px solid ${accent}`, borderRadius: 6, marginBottom: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
        <div style={{ fontSize: 14, color: N.ink, fontWeight: 500, lineHeight: 1.45 }}>{text}</div>
        {badge && <Chip color={badge === "CV" ? "purple" : "blue"} style={{ flexShrink: 0 }}>{badge}</Chip>}
      </div>
      {sub && <div style={{ fontSize: 12, color: N.ink3, marginTop: 6, fontStyle: "italic" }}>{sub}</div>}
    </div>
  );
  if (cvQs.length === 0) return (
    <div style={{ maxWidth: 820 }}>
      <div style={{ padding: "20px", fontSize: 13.5, color: N.ink3, border: `1px solid ${N.border}`, borderRadius: 8 }}>
        Sin preguntas generadas para este candidato. Procesa su CV para generarlas automáticamente.
      </div>
    </div>
  );
  return (
    <div style={{ maxWidth: 820 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, padding: "10px 14px", background: N.chip.purple.bg, borderRadius: 8 }}>
        <NIcon name="sparkle" size={15} color={N.chip.purple.fg} />
        <span style={{ fontSize: 13.5, color: N.ink, lineHeight: 1.5 }}>Preguntas generadas desde el <strong>CV de {p.name.split(" ")[0]}</strong> por la IA.</span>
      </div>
      <Panel>
        <SectionTitle>Preguntas específicas del CV</SectionTitle>
        {cvQs.map((q, i) => <Q key={i} text={q.pregunta} sub={q.objetivo} accent={N.chip.purple.fg} badge="CV" />)}
      </Panel>
    </div>
  );
}

// ── TAB: Entrevista (link/audio → transcripción → evaluación) ──
function TabInterview({ p }) {
  const [stage, setStage] = useStateD("setup"); // setup | transcribing | done
  const [src, setSrc] = useStateD(null);          // link | audio
  useEffectD(() => {
    if (stage === "transcribing") { const t = setTimeout(() => setStage("done"), 1800); return () => clearTimeout(t); }
  }, [stage]);

  if (stage === "setup") {
    const Opt = ({ icon, title, desc, onClick }) => (
      <button onClick={onClick} style={{ flex: 1, textAlign: "left", background: N.bg, border: `1px solid ${N.border}`, borderRadius: 10, padding: 20, cursor: "pointer", fontFamily: fontN }}
        onMouseEnter={e => e.currentTarget.style.borderColor = N.borderHi}
        onMouseLeave={e => e.currentTarget.style.borderColor = N.border}>
        <div style={{ width: 38, height: 38, borderRadius: 9, background: N.hover, display: "grid", placeItems: "center", marginBottom: 12 }}><NIcon name={icon} size={19} color={N.ink2} /></div>
        <div style={{ fontSize: 15, fontWeight: 600, color: N.ink }}>{title}</div>
        <p style={{ fontSize: 13, color: N.ink2, lineHeight: 1.5, margin: "5px 0 0" }}>{desc}</p>
      </button>
    );
    return (
      <div style={{ maxWidth: 640 }}>
        <SectionTitle>Capturar la entrevista</SectionTitle>
        <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
          <Opt icon="link" title="Pegar link de reunión" desc="Zoom, Meet o Teams. Nos unimos como nota-tomador y transcribimos en vivo." onClick={() => { setSrc("link"); }} />
          <Opt icon="mic" title="Subir grabación" desc="Sube el audio o video de la entrevista ya realizada para transcribir." onClick={() => { setSrc("audio"); }} />
        </div>

        {src === "link" && (
          <Panel>
            <div style={{ fontSize: 12.5, color: N.ink2, fontWeight: 600, marginBottom: 8 }}>Link de la reunión</div>
            <div style={{ display: "flex", gap: 8 }}>
              <input defaultValue="https://meet.google.com/abc-defg-hij" style={{ flex: 1, border: `1px solid ${N.border}`, background: N.bg, color: N.ink, borderRadius: 6, padding: "9px 11px", fontSize: 14, fontFamily: fontN, outline: "none" }} />
              <button onClick={() => setStage("transcribing")} style={{ background: N.ink, color: N.bg, border: "none", cursor: "pointer", padding: "9px 14px", fontSize: 13.5, fontFamily: fontN, fontWeight: 500, borderRadius: 6, whiteSpace: "nowrap" }}>Conectar</button>
            </div>
          </Panel>
        )}
        {src === "audio" && (
          <Panel>
            <div onClick={() => setStage("transcribing")} style={{ border: `1.5px dashed ${N.border}`, borderRadius: 10, padding: "26px 20px", textAlign: "center", cursor: "pointer", background: N.sidebar }}>
              <NIcon name="upload" size={22} color={N.ink3} />
              <div style={{ fontSize: 14, fontWeight: 500, color: N.ink, marginTop: 9 }}>Sube audio o video (mp3, m4a, mp4)</div>
              <div style={{ fontSize: 12, color: N.ink3, marginTop: 3 }}>Hasta 200 MB · transcripción con diarización</div>
            </div>
          </Panel>
        )}
      </div>
    );
  }

  if (stage === "transcribing") {
    return (
      <div style={{ maxWidth: 420, margin: "50px auto 0", textAlign: "center" }}>
        <div className="spin3" style={{ width: 30, height: 30, border: `2.5px solid ${N.border}`, borderTopColor: N.ink3, borderRadius: 999, margin: "0 auto 18px" }} />
        <div style={{ fontSize: 15, fontWeight: 600, color: N.ink }}>Transcribiendo y separando hablantes…</div>
        <div style={{ fontSize: 13, color: N.ink3, marginTop: 6 }}>Diarización: identificando reclutador y candidato.</div>
        <style>{`.spin3{animation:spin3 0.7s linear infinite}@keyframes spin3{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  // done → transcript + evaluación
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 20, alignItems: "start" }}>
      <Panel pad={0}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "14px 18px", borderBottom: `1px solid ${N.border}` }}>
          <NIcon name="video" size={15} color={N.ink3} />
          <span style={{ fontSize: 13.5, fontWeight: 600, color: N.ink }}>Transcripción</span>
          <Chip color="gray">diarizada</Chip>
          <div style={{ flex: 1 }} />
          <span style={{ fontSize: 12, color: N.ink3 }}>14:20 min</span>
        </div>
        <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 14, maxHeight: 480, overflow: "auto" }}>
          {TRANSCRIPT.map((l, i) => {
            const me = l.who === "Reclutador";
            return (
              <div key={i} style={{ display: "flex", gap: 10 }}>
                {me ? <div style={{ width: 26, height: 26, borderRadius: 999, background: N.hover, display: "grid", placeItems: "center", flexShrink: 0 }}><NIcon name="user" size={13} color={N.ink3} /></div> : <NAvatar name={p.name} size={26} />}
                <div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                    <span style={{ fontSize: 12.5, fontWeight: 600, color: me ? N.ink2 : N.ink }}>{me ? "Reclutador" : p.name.split(" ")[0]}</span>
                    <span style={{ fontSize: 11.5, color: N.ink4 }}>{l.t}</span>
                  </div>
                  <div style={{ fontSize: 13.5, color: N.ink, lineHeight: 1.55, marginTop: 2 }}>{l.text}</div>
                </div>
              </div>
            );
          })}
        </div>
      </Panel>

      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <Panel>
          <SectionTitle>Evaluación de la entrevista</SectionTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
            {EVAL.dims.map(d => (
              <div key={d.label}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, color: N.ink, marginBottom: 4 }}>
                  <span>{d.label}</span><span style={{ color: N.ink3, fontVariantNumeric: "tabular-nums" }}>{d.pct}</span>
                </div>
                <div style={{ height: 6, borderRadius: 3, background: N.track, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${d.pct}%`, background: N.chip[d.color].fg, borderRadius: 3 }} />
                </div>
                <div style={{ fontSize: 12, color: N.ink3, marginTop: 4, lineHeight: 1.4 }}>{d.nota}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 16, paddingTop: 14, borderTop: `1px solid ${N.border}` }}>
            <span style={{ fontSize: 12.5, color: N.ink2 }}>Sentimiento global</span>
            <Chip color="green" dot>+{EVAL.sentimiento.toFixed(2)}</Chip>
          </div>
        </Panel>
        <Panel>
          <SectionTitle>Evidencias literales</SectionTitle>
          {EVAL.evidencias.map((e, i) => (
            <div key={i} style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, color: N.ink2, fontWeight: 600, marginBottom: 4 }}>{e.dim} <span style={{ color: N.ink4, fontWeight: 400 }}>· {e.t}</span></div>
              <div style={{ fontSize: 13, color: N.ink, lineHeight: 1.5, fontStyle: "italic", paddingLeft: 10, borderLeft: `2px solid ${N.border}` }}>{e.quote}</div>
            </div>
          ))}
        </Panel>
      </div>
    </div>
  );
}

// ── TAB: Reporte final ────────────────────────────
function TabFinal({ p }) {
  const f = buildFinal(p);
  const ScoreBox = ({ label, value, big }) => (
    <div style={{ flex: 1, textAlign: "center", padding: "16px 12px" }}>
      <div style={{ fontSize: 11.5, color: N.ink2, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</div>
      <div style={{ fontSize: big ? 46 : 30, fontWeight: 700, color: N.ink, letterSpacing: "-0.02em", lineHeight: 1.15, marginTop: 6 }}>{value}</div>
    </div>
  );
  return (
    <div style={{ maxWidth: 880, display: "flex", flexDirection: "column", gap: 18 }}>
      <Panel pad={0}>
        <div style={{ display: "flex", alignItems: "stretch" }}>
          <ScoreBox label="Score CV" value={f.scoreCV} />
          <div style={{ width: 1, background: N.border }} />
          <ScoreBox label="Entrevista" value={f.scoreEntrevista} />
          <div style={{ width: 1, background: N.border }} />
          <div style={{ flex: 1.3, textAlign: "center", padding: "16px 12px", background: N.sidebar }}>
            <div style={{ fontSize: 11.5, color: N.ink2, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>Score final ponderado</div>
            <div style={{ fontSize: 46, fontWeight: 700, color: N.ink, letterSpacing: "-0.02em", lineHeight: 1.15, marginTop: 6 }}>{f.scoreFinal}</div>
            <Chip color={f.scoreFinal >= 80 ? "green" : "blue"} dot>{f.recomendacion}</Chip>
          </div>
        </div>
      </Panel>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
        <Panel>
          <SectionTitle><span style={{ color: N.chip.green.fg }}>Fortalezas</span></SectionTitle>
          {f.fortalezas.map(s => (
            <div key={s} style={{ display: "flex", gap: 9, alignItems: "flex-start", marginBottom: 9 }}>
              <NIcon name="check" size={15} color={N.chip.green.fg} />
              <span style={{ fontSize: 13.5, color: N.ink, lineHeight: 1.5 }}>{s}</span>
            </div>
          ))}
        </Panel>
        <Panel>
          <SectionTitle><span style={{ color: N.chip.orange.fg }}>Puntos a desarrollar</span></SectionTitle>
          {f.gaps.map(s => (
            <div key={s} style={{ display: "flex", gap: 9, alignItems: "flex-start", marginBottom: 9 }}>
              <NIcon name="alert" size={15} color={N.chip.orange.fg} />
              <span style={{ fontSize: 13.5, color: N.ink, lineHeight: 1.5 }}>{s}</span>
            </div>
          ))}
        </Panel>
      </div>

      <Panel style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <NIcon name="alert" size={16} color={N.ink3} />
        <div style={{ flex: 1, fontSize: 12.5, color: N.ink2, lineHeight: 1.5 }}>
          Este puntaje es <strong>asistencia para la decisión, no una decisión final</strong>. El reclutador conserva la decisión y puede solicitar revisión humana.
        </div>
        <button style={{ background: N.ink, color: N.bg, border: "none", cursor: "pointer", padding: "8px 14px", fontSize: 13.5, fontFamily: fontN, fontWeight: 500, borderRadius: 6, display: "inline-flex", alignItems: "center", gap: 7, flexShrink: 0 }}>
          <NIcon name="download" size={14} color={N.bg} /> Exportar PDF
        </button>
      </Panel>
    </div>
  );
}

// ── Página de detalle ─────────────────────────────
function CandidateDetail({ p, onBack, onAdvance, onReject, stageOrder }) {
  const [tab, setTab] = useStateD("cv");
  const [expl, setExpl] = useStateD(null);

  useEffectD(() => {
    setExpl(null);
    if (p.analisis_id) API.getExplicacion(p.analisis_id).then(setExpl).catch(() => {});
  }, [p.analisis_id]);

  const cvData = expl?.cv_estructurado;
  const cv = cvData
    ? {
        contacto: { email: p.email, tel: "", ubicacion: "", links: [] },
        resumen: cvData.resumen || "",
        experiencia: (cvData.experiencia_tecnica || []).map(e => ({
          rol: e.puesto || e.rol || "Rol",
          empresa: e.empresa || "",
          periodo: e.periodo || "",
          puntos: e.logros || e.responsabilidades || [],
        })),
        educacion: (cvData.educacion || []).map(e => ({ titulo: e.titulo || e.grado || "", inst: e.institucion || "", periodo: e.periodo || "" })),
        proyectos: (cvData.proyectos_relevantes || []).map(pr => ({ nombre: pr.nombre || "", desc: pr.descripcion || "", tags: pr.tecnologias || [] })),
        skills: expl.skills_match || [],
        flags: expl.skills_faltantes?.length ? [`Faltan skills: ${expl.skills_faltantes.slice(0, 3).join(", ")}`] : ["Sin banderas detectadas"],
      }
    : buildCV(p);
  const atEnd = stageOrder && stageOrder.findIndex(e => e.id === p.etapa) >= stageOrder.length - 1;
  const tabs = [
    { id: "cv",        label: "CV estructurado", icon: "fileText" },
    { id: "score",     label: "Score",           icon: "bar" },
    { id: "guide",     label: "Guía de entrevista", icon: "page" },
    { id: "interview", label: "Entrevista",      icon: "video" },
    { id: "final",     label: "Reporte final",   icon: "scale" },
  ];
  return (
    <React.Fragment>
      <header style={{ height: 52, borderBottom: `1px solid ${N.border}`, display: "flex", alignItems: "center", gap: 10, padding: "0 20px", flexShrink: 0, background: N.bg }}>
        <button onClick={onBack} style={{ background: "transparent", border: "none", cursor: "pointer", color: N.ink2, padding: 6, borderRadius: 6, display: "inline-flex", alignItems: "center", gap: 4, fontFamily: fontN, fontSize: 13 }}
          onMouseEnter={e => e.currentTarget.style.background = N.hover}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
          <NIcon name="chevL" size={15} /> Pipeline
        </button>
        <div style={{ width: 1, height: 20, background: N.border }} />
        <NAvatar name={p.name} size={22} />
        <span style={{ fontSize: 15, fontWeight: 600, color: N.ink }}>{p.name}</span>
        <Chip color={stageChip[p.etapa]} dot>{stageLabel[p.etapa]}</Chip>
        <div style={{ flex: 1 }} />
        <button onClick={() => onReject && onReject(p.id)} style={{ background: "transparent", color: N.chip.red.fg, border: `1px solid ${N.border}`, cursor: "pointer", padding: "6px 12px", fontSize: 13, fontFamily: fontN, fontWeight: 500, borderRadius: 6, display: "inline-flex", alignItems: "center", gap: 6 }}>
          <NIcon name="x" size={14} color={N.chip.red.fg} /> Rechazar
        </button>
        <button onClick={() => onAdvance && onAdvance(p.id)} disabled={atEnd} style={{ background: atEnd ? N.hover : N.ink, color: atEnd ? N.ink3 : N.bg, border: "none", cursor: atEnd ? "default" : "pointer", padding: "6px 12px", fontSize: 13, fontFamily: fontN, fontWeight: 500, borderRadius: 6, display: "inline-flex", alignItems: "center", gap: 6 }}>
          <NIcon name="arrow" size={14} color={atEnd ? N.ink3 : N.bg} /> {atEnd ? "Etapa final" : "Avanzar etapa"}
        </button>
      </header>

      <div style={{ borderBottom: `1px solid ${N.border}`, display: "flex", alignItems: "center", padding: "0 20px", flexShrink: 0, background: N.bg }}>
        {tabs.map(tb => (
          <button key={tb.id} onClick={() => setTab(tb.id)} style={{
            background: "transparent", border: "none", cursor: "pointer", fontFamily: fontN, fontSize: 13,
            color: tab === tb.id ? N.ink : N.ink2, padding: "11px 14px",
            borderBottom: tab === tb.id ? `2px solid ${N.ink}` : "2px solid transparent", marginBottom: -1,
            display: "inline-flex", alignItems: "center", gap: 6, fontWeight: tab === tb.id ? 600 : 400,
          }}>
            <NIcon name={tb.icon} size={14} color={tab === tb.id ? N.ink : N.ink3} /> {tb.label}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflow: "auto", padding: "22px 24px", background: N.bg }}>
        {tab === "cv" && <TabCV cv={cv} />}
        {tab === "score" && <TabScore p={p} expl={expl} />}
        {tab === "guide" && <TabGuide p={p} expl={expl} />}
        {tab === "interview" && <TabInterview p={p} />}
        {tab === "final" && <TabFinal p={p} />}
      </div>
    </React.Fragment>
  );
}

Object.assign(window, { CandidateDetail });
