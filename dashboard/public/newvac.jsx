/* global React, N, API, Chip, NIcon, fontN, PrimaryBtn */
// Wizard "Nueva vacante": subir JD o IA → extraer → revisar → guía → crear

const { useState: useStateW, useEffect: useEffectW, useRef: useRefW } = React;

const DEFAULT_WEIGHTS = [
  { key: "match_skills_obligatorios", label: "Skills core",     weight: 0.30 },
  { key: "match_skills_deseables",    label: "Skills deseables", weight: 0.10 },
  { key: "experiencia",               label: "Experiencia",      weight: 0.30 },
  { key: "educacion",                 label: "Educación",        weight: 0.10 },
  { key: "soft_skills",               label: "Soft skills",      weight: 0.10 },
  { key: "sentimiento",               label: "Sentimiento",      weight: 0.10 },
];

const WIZ_STEPS = [
  { id: "origen",  label: "Origen" },
  { id: "extract", label: "Extracción" },
  { id: "review",  label: "Revisar" },
  { id: "guide",   label: "Guía" },
];

function Stepper({ active }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      {WIZ_STEPS.map((s, i) => {
        const state = i < active ? "done" : i === active ? "now" : "todo";
        return (
          <React.Fragment key={s.id}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 22, height: 22, borderRadius: 999, display: "grid", placeItems: "center", fontSize: 12, fontWeight: 600,
                background: state === "todo" ? N.hover : N.ink, color: state === "todo" ? N.ink3 : N.bg,
              }}>{state === "done" ? <NIcon name="check" size={13} color={N.bg} /> : i + 1}</div>
              <span style={{ fontSize: 13, color: state === "now" ? N.ink : N.ink3, fontWeight: state === "now" ? 600 : 400 }}>{s.label}</span>
            </div>
            {i < WIZ_STEPS.length - 1 && <div style={{ width: 28, height: 1, background: N.border }} />}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function GhostNav({ onClick, label, icon }) {
  return (
    <button onClick={onClick} style={{ background: "transparent", color: N.ink2, border: `1px solid ${N.border}`, cursor: "pointer", padding: "9px 14px", fontSize: 14, fontFamily: fontN, fontWeight: 500, borderRadius: 6, display: "inline-flex", alignItems: "center", gap: 6 }}>
      <NIcon name={icon} size={14} color={N.ink3} /> {label}
    </button>
  );
}

function inp() { return { width: "100%", border: `1px solid ${N.border}`, background: N.bg, color: N.ink, borderRadius: 6, padding: "9px 11px", fontSize: 14, fontFamily: fontN, outline: "none" }; }
function FieldBlock({ label, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 12.5, color: N.ink2, fontWeight: 600, marginBottom: 8 }}>{label}</div>
      {children}
    </div>
  );
}

// ── Origen ────────────────────────────────────────
function OriginChoice({ onUpload, onAI }) {
  const Opt = ({ icon, title, desc, badge, onClick }) => (
    <button onClick={onClick} style={{
      flex: 1, textAlign: "left", background: N.bg, border: `1px solid ${N.border}`, borderRadius: 10,
      padding: 22, cursor: "pointer", fontFamily: fontN, display: "flex", flexDirection: "column", gap: 12,
    }}
    onMouseEnter={e => e.currentTarget.style.borderColor = N.borderHi}
    onMouseLeave={e => e.currentTarget.style.borderColor = N.border}>
      <div style={{ width: 40, height: 40, borderRadius: 10, background: N.hover, display: "grid", placeItems: "center" }}>
        <NIcon name={icon} size={20} color={N.ink2} />
      </div>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: N.ink }}>{title}</span>
          {badge && <Chip color="purple">{badge}</Chip>}
        </div>
        <p style={{ fontSize: 13, color: N.ink2, lineHeight: 1.5, margin: "6px 0 0" }}>{desc}</p>
      </div>
    </button>
  );
  return (
    <div style={{ maxWidth: 660, margin: "0 auto" }}>
      <h2 style={{ fontSize: 20, fontWeight: 600, color: N.ink, margin: "0 0 4px" }}>¿Tienes la descripción de la vacante?</h2>
      <p style={{ fontSize: 14, color: N.ink2, margin: "0 0 24px" }}>La IA extraerá los requisitos estructurados en ambos casos.</p>
      <div style={{ display: "flex", gap: 16 }}>
        <Opt icon="upload" title="Sí, subir archivo" desc="Sube un PDF o DOCX con la descripción del puesto." onClick={onUpload} />
        <Opt icon="sparkle" title="No, ayúdame con IA" badge="IA" desc="Rellena los campos clave y la IA redacta los requisitos." onClick={onAI} />
      </div>
    </div>
  );
}

// ── Upload JD ─────────────────────────────────────
function UploadJD({ onBack, onExtract }) {
  const [file, setFile] = useStateW(null);
  const inputRef = useRefW(null);

  const handleFile = (f) => {
    if (f && (f.name.endsWith(".pdf") || f.name.endsWith(".docx"))) setFile(f);
  };

  const onDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  };

  return (
    <div style={{ maxWidth: 560, margin: "0 auto" }}>
      <h2 style={{ fontSize: 20, fontWeight: 600, color: N.ink, margin: "0 0 4px" }}>Subir descripción del puesto</h2>
      <p style={{ fontSize: 14, color: N.ink2, margin: "0 0 20px" }}>PDF o DOCX, hasta 10 MB.</p>

      <input ref={inputRef} type="file" accept=".pdf,.docx" style={{ display: "none" }}
        onChange={e => handleFile(e.target.files[0])} />

      <div onClick={() => inputRef.current.click()}
        onDrop={onDrop} onDragOver={e => e.preventDefault()}
        style={{ border: `1.5px dashed ${file ? N.borderHi : N.border}`, borderRadius: 10, padding: "34px 20px", textAlign: "center", cursor: "pointer", background: N.sidebar }}>
        <NIcon name={file ? "fileText" : "upload"} size={26} color={N.ink3} />
        {file ? (
          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: N.ink }}>{file.name}</div>
            <div style={{ fontSize: 12, color: N.ink3, marginTop: 2 }}>{(file.size / 1024).toFixed(0)} KB · listo para procesar</div>
          </div>
        ) : (
          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 14, color: N.ink, fontWeight: 500 }}>Arrastra el archivo o haz clic para seleccionar</div>
            <div style={{ fontSize: 12, color: N.ink3, marginTop: 4 }}>PDF o DOCX</div>
          </div>
        )}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}>
        <GhostNav onClick={onBack} label="Atrás" icon="chevL" />
        <button disabled={!file} onClick={() => onExtract(file)} style={{
          background: file ? N.ink : N.hover, color: file ? N.bg : N.ink3, border: "none",
          cursor: file ? "pointer" : "default", padding: "9px 16px", fontSize: 14, fontFamily: fontN,
          fontWeight: 500, borderRadius: 6, display: "inline-flex", alignItems: "center", gap: 8,
        }}>
          Extraer requisitos <NIcon name="arrow" size={14} color={file ? N.bg : N.ink3} />
        </button>
      </div>
    </div>
  );
}

// ── AI Gen ────────────────────────────────────────
function AIGen({ onBack, onExtract }) {
  const [puesto, setPuesto] = useStateW("");
  const [seniority, setSeniority] = useStateW("");
  const [stack, setStack] = useStateW("");
  const [notas, setNotas] = useStateW("");

  const canSend = puesto.trim().length > 2;

  const handleSubmit = () => {
    const body = {
      puesto: puesto.trim(),
      seniority: seniority.trim() || undefined,
      stack: stack.split(",").map(s => s.trim()).filter(Boolean),
      notas: notas.trim() || undefined,
    };
    onExtract(null, body);
  };

  return (
    <div style={{ maxWidth: 560, margin: "0 auto" }}>
      <h2 style={{ fontSize: 20, fontWeight: 600, color: N.ink, margin: "0 0 4px" }}>Generar requisitos con IA</h2>
      <p style={{ fontSize: 14, color: N.ink2, margin: "0 0 22px" }}>Completa los datos clave y la IA redactará los requisitos estructurados.</p>

      <FieldBlock label="Nombre del puesto *">
        <input value={puesto} onChange={e => setPuesto(e.target.value)} placeholder="ej. Backend Senior Engineer" style={inp()} />
      </FieldBlock>
      <FieldBlock label="Seniority">
        <input value={seniority} onChange={e => setSeniority(e.target.value)} placeholder="ej. Senior, Mid-level…" style={inp()} />
      </FieldBlock>
      <FieldBlock label="Stack / Skills clave (separados por comas)">
        <input value={stack} onChange={e => setStack(e.target.value)} placeholder="ej. Python, FastAPI, PostgreSQL, Docker" style={inp()} />
      </FieldBlock>
      <FieldBlock label="Notas adicionales">
        <textarea value={notas} onChange={e => setNotas(e.target.value)} rows={3} placeholder="Modalidad, industria, responsabilidades clave…" style={{ ...inp(), resize: "vertical", lineHeight: 1.5 }} />
      </FieldBlock>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
        <GhostNav onClick={onBack} label="Atrás" icon="chevL" />
        <button disabled={!canSend} onClick={handleSubmit} style={{
          background: canSend ? N.ink : N.hover, color: canSend ? N.bg : N.ink3, border: "none",
          cursor: canSend ? "pointer" : "default", padding: "9px 16px", fontSize: 14, fontFamily: fontN,
          fontWeight: 500, borderRadius: 6, display: "inline-flex", alignItems: "center", gap: 8,
        }}>
          Generar con IA <NIcon name="sparkle" size={14} color={canSend ? N.bg : N.ink3} />
        </button>
      </div>
    </div>
  );
}

// ── Extrayendo (llama API real) ───────────────────
function Extracting({ file, aiBody, onDone, onError }) {
  useEffectW(() => {
    const call = file
      ? API.extractFromFile(file)
      : API.generateDraft(aiBody);

    call.then(draft => onDone(draft)).catch(err => onError(err.message));
  }, []);

  const items = file
    ? ["Leyendo documento", "Extrayendo título y descripción", "Detectando skills y requisitos"]
    : ["Enviando al modelo", "Generando descripción del puesto", "Estructurando requisitos"];

  const [idx, setIdx] = useStateW(0);
  useEffectW(() => {
    if (idx >= items.length) return;
    const t = setTimeout(() => setIdx(i => i + 1), 620);
    return () => clearTimeout(t);
  }, [idx]);

  return (
    <div style={{ maxWidth: 420, margin: "60px auto 0" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 22 }}>
        <NIcon name="sparkle" size={18} color={N.chip.purple.fg} />
        <span style={{ fontSize: 16, fontWeight: 600, color: N.ink }}>Procesando con IA…</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {items.map((it, i) => {
          const state = i < idx ? "done" : i === idx ? "now" : "todo";
          return (
            <div key={it} style={{ display: "flex", alignItems: "center", gap: 10, opacity: state === "todo" ? 0.45 : 1 }}>
              <div style={{ width: 18, height: 18, borderRadius: 999, border: `1.6px solid ${state === "done" ? N.chip.green.fg : N.border}`, display: "grid", placeItems: "center", background: state === "done" ? N.chip.green.fg : "transparent" }}>
                {state === "done" && <NIcon name="check" size={11} color={N.bg} />}
                {state === "now" && <div className="spin" style={{ width: 9, height: 9, border: `1.6px solid ${N.ink3}`, borderTopColor: "transparent", borderRadius: 999 }} />}
              </div>
              <span style={{ fontSize: 14, color: state === "now" ? N.ink : N.ink2 }}>{it}</span>
            </div>
          );
        })}
      </div>
      <style>{`.spin{animation:spin 0.7s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

// ── Revisar / editar ──────────────────────────────
function ReviewVac({ draft, onBack, onNext, weights, setWeights }) {
  const [titulo, setTitulo] = useStateW(draft?.titulo || "");
  const [descripcion, setDescripcion] = useStateW(draft?.descripcion || "");
  const [requisitos, setRequisitos] = useStateW(draft?.requisitos_texto || "");
  const total = weights.reduce((a, b) => a + b.weight, 0);

  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }}>
      <h2 style={{ fontSize: 20, fontWeight: 600, color: N.ink, margin: "0 0 4px" }}>Revisa lo que extrajo la IA</h2>
      <p style={{ fontSize: 14, color: N.ink2, margin: "0 0 22px" }}>Edita cualquier campo antes de crear la vacante.</p>

      <FieldBlock label="Título de la vacante">
        <input value={titulo} onChange={e => setTitulo(e.target.value)} style={inp()} />
      </FieldBlock>
      <FieldBlock label="Descripción">
        <textarea value={descripcion} onChange={e => setDescripcion(e.target.value)} rows={3} style={{ ...inp(), resize: "vertical", lineHeight: 1.5 }} />
      </FieldBlock>
      <FieldBlock label="Requisitos">
        <textarea value={requisitos} onChange={e => setRequisitos(e.target.value)} rows={6} style={{ ...inp(), resize: "vertical", lineHeight: 1.6 }} />
      </FieldBlock>

      <FieldBlock label={`Ponderación del scoring · suma ${total.toFixed(2)}`}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {weights.map((f, i) => (
            <div key={f.key} style={{ display: "grid", gridTemplateColumns: "160px 1fr 44px", alignItems: "center", gap: 14 }}>
              <span style={{ fontSize: 13.5, color: N.ink }}>{f.label}</span>
              <input type="range" min="0" max="0.6" step="0.05" value={f.weight}
                onChange={e => setWeights(w => w.map((x, j) => j === i ? { ...x, weight: parseFloat(e.target.value) } : x))}
                style={{ accentColor: N.ink, width: "100%" }} />
              <span style={{ fontSize: 13, color: N.ink, fontWeight: 600, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{f.weight.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </FieldBlock>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
        <GhostNav onClick={onBack} label="Atrás" icon="chevL" />
        <button onClick={() => onNext({ titulo, descripcion, requisitos_texto: requisitos })} style={{ background: N.ink, color: N.bg, border: "none", cursor: "pointer", padding: "9px 16px", fontSize: 14, fontFamily: fontN, fontWeight: 500, borderRadius: 6, display: "inline-flex", alignItems: "center", gap: 8 }}>
          Crear vacante y generar guía <NIcon name="arrow" size={14} color={N.bg} />
        </button>
      </div>
    </div>
  );
}

// ── Crear vacante + Guía ──────────────────────────
function GuideGen({ reviewed, weights, onBack, onFinish, onError }) {
  const [guia, setGuia] = useStateW(null);
  const [vacanteId, setVacanteId] = useStateW(null);
  const [vacancy, setVacancy] = useStateW(null);

  useEffectW(() => {
    const pesosBody = {};
    const sum = weights.reduce((a, b) => a + b.weight, 0) || 1;
    weights.forEach(w => { pesosBody[w.key] = parseFloat((w.weight / sum).toFixed(4)); });

    let vid;
    API.createVacancy({ titulo: reviewed.titulo, descripcion: reviewed.descripcion, requisitos_texto: reviewed.requisitos_texto })
      .then(v => {
        vid = v.id;
        setVacanteId(v.id);
        setVacancy(v);
        return API.setPesos(v.id, pesosBody);
      })
      .then(() => API.generateGuia(vid))
      .then(g => setGuia(g))
      .catch(err => onError(err.message));
  }, []);

  if (!guia) {
    return (
      <div style={{ maxWidth: 420, margin: "70px auto 0", textAlign: "center" }}>
        <div className="spin" style={{ width: 30, height: 30, border: `2.5px solid ${N.border}`, borderTopColor: N.ink3, borderRadius: 999, margin: "0 auto 18px" }} />
        <div style={{ fontSize: 15, fontWeight: 600, color: N.ink }}>Creando vacante y guía de entrevista…</div>
        <div style={{ fontSize: 13, color: N.ink3, marginTop: 6 }}>Un momento, esto puede tardar unos segundos.</div>
        <style>{`.spin{animation:spin 0.7s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  const tecnicas    = guia.preguntas?.filter(q => q.tipo === "tecnica")       || [];
  const comportam   = guia.preguntas?.filter(q => q.tipo === "comportamiento") || [];
  const situacional = guia.preguntas?.filter(q => q.tipo === "situacional")   || [];
  const senales     = guia.senales_de_alerta  || [];
  const criterios   = guia.criterios_evaluacion || [];

  return (
    <div style={{ maxWidth: 680, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, color: N.ink, margin: 0 }}>Guía lista</h2>
        <Chip color="green"><NIcon name="check" size={11} color={N.chip.green.fg} /> Vacante creada</Chip>
        <Chip color="purple">Guía generada por IA</Chip>
      </div>

      {tecnicas.length > 0 && (
        <div style={{ border: `1px solid ${N.border}`, borderRadius: 10, padding: 18, marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: N.ink2, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 10 }}>Preguntas técnicas</div>
          {tecnicas.slice(0, 3).map((q, i) => (
            <div key={i} style={{ padding: "10px 12px", border: `1px solid ${N.border}`, borderLeft: `3px solid ${N.chip.blue.fg}`, borderRadius: 6, marginBottom: 8 }}>
              <div style={{ fontSize: 13.5, color: N.ink, fontWeight: 500, lineHeight: 1.45 }}>{q.pregunta}</div>
              {q.objetivo && <div style={{ fontSize: 12, color: N.ink3, marginTop: 5, fontStyle: "italic" }}>{q.objetivo}</div>}
            </div>
          ))}
          <div style={{ fontSize: 12.5, color: N.ink3, marginTop: 6 }}>
            {tecnicas.length > 3 ? `+ ${tecnicas.length - 3} técnicas` : ""}
            {comportam.length > 0 ? ` · ${comportam.length} de comportamiento` : ""}
            {situacional.length > 0 ? ` · ${situacional.length} situacional` : ""}
            {senales.length > 0 ? ` · ${senales.length} señales de alerta` : ""}
          </div>
        </div>
      )}

      {criterios.length > 0 && (
        <div style={{ border: `1px solid ${N.border}`, borderRadius: 10, padding: 18, marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: N.ink2, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 10 }}>Criterios de evaluación</div>
          {criterios.map((c, i) => (
            <div key={i} style={{ fontSize: 13.5, color: N.ink, padding: "4px 0", display: "flex", gap: 8 }}>
              <span style={{ color: N.chip.green.fg }}>✓</span>{c}
            </div>
          ))}
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button onClick={() => onFinish(vacancy)} style={{ background: N.ink, color: N.bg, border: "none", cursor: "pointer", padding: "9px 16px", fontSize: 14, fontFamily: fontN, fontWeight: 500, borderRadius: 6, display: "inline-flex", alignItems: "center", gap: 8 }}>
          <NIcon name="arrow" size={14} color={N.bg} /> Abrir vacante
        </button>
      </div>
    </div>
  );
}

// ── Wizard container ──────────────────────────────
function NewVacancyWizard({ onClose, onDone }) {
  const [step, setStep] = useStateW("origen");
  const [file, setFile] = useStateW(null);
  const [aiBody, setAiBody] = useStateW(null);
  const [draft, setDraft] = useStateW(null);
  const [weights, setWeights] = useStateW(DEFAULT_WEIGHTS.map(w => ({ ...w })));
  const [reviewed, setReviewed] = useStateW(null);
  const [error, setError] = useStateW(null);

  const activeIdx = ["origen","upload","ai"].includes(step) ? 0
    : step === "extract" ? 1 : step === "review" ? 2 : 3;

  return (
    <div style={{ position: "fixed", inset: 0, background: N.bg, zIndex: 50, display: "flex", flexDirection: "column", fontFamily: fontN }}>
      <header style={{ height: 56, borderBottom: `1px solid ${N.border}`, display: "flex", alignItems: "center", gap: 14, padding: "0 20px", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 22, height: 22, borderRadius: 5, background: N.ink, color: N.bg, fontSize: 12, fontWeight: 700, display: "grid", placeItems: "center" }}>H</div>
          <span style={{ fontSize: 14, fontWeight: 600, color: N.ink }}>Nueva vacante</span>
        </div>
        <div style={{ flex: 1, display: "flex", justifyContent: "center" }}><Stepper active={activeIdx} /></div>
        <button onClick={onClose} style={{ background: "transparent", border: "none", cursor: "pointer", color: N.ink3, padding: 6, borderRadius: 6, display: "grid", placeItems: "center" }}
          onMouseEnter={e => e.currentTarget.style.background = N.hover}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
          <NIcon name="x" size={18} />
        </button>
      </header>

      <div style={{ flex: 1, overflow: "auto", padding: "40px 24px" }}>
        {error && (
          <div style={{ maxWidth: 600, margin: "0 auto 20px", padding: "12px 16px", background: N.chip.red.bg, border: `1px solid ${N.chip.red.fg}`, borderRadius: 8, display: "flex", alignItems: "center", gap: 10 }}>
            <NIcon name="x" size={14} color={N.chip.red.fg} />
            <span style={{ fontSize: 13.5, color: N.chip.red.fg }}>{error}</span>
            <button onClick={() => { setError(null); setStep("origen"); }} style={{ marginLeft: "auto", background: "transparent", border: "none", cursor: "pointer", color: N.chip.red.fg, fontSize: 13 }}>Reintentar</button>
          </div>
        )}

        {step === "origen" && <OriginChoice onUpload={() => setStep("upload")} onAI={() => setStep("ai")} />}
        {step === "upload" && <UploadJD onBack={() => setStep("origen")} onExtract={(f) => { setFile(f); setStep("extract"); }} />}
        {step === "ai"     && <AIGen onBack={() => setStep("origen")} onExtract={(_, body) => { setAiBody(body); setStep("extract"); }} />}
        {step === "extract" && (
          <Extracting
            file={file} aiBody={aiBody}
            onDone={(d) => { setDraft(d); setStep("review"); }}
            onError={(msg) => { setError(msg); }}
          />
        )}
        {step === "review" && (
          <ReviewVac
            draft={draft}
            onBack={() => setStep("origen")}
            onNext={(rev) => { setReviewed(rev); setStep("guide"); }}
            weights={weights} setWeights={setWeights}
          />
        )}
        {step === "guide" && (
          <GuideGen
            reviewed={reviewed} weights={weights}
            onBack={() => setStep("review")}
            onFinish={(v) => onDone(v)}
            onError={(msg) => { setError(msg); setStep("review"); }}
          />
        )}
      </div>
    </div>
  );
}

Object.assign(window, { NewVacancyWizard });
