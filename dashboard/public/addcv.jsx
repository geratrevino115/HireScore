/* global React, N, API, Chip, NIcon, NAvatar, ScoreCell, fontN */
// Agregar candidatos: sube CV(s), llama /analyses/procesar, muestra resultados

const { useState: useStateC, useEffect: useEffectC, useRef: useRefC } = React;

// ── Procesar uno a uno ────────────────────────────
function Processing({ files, vacanteId, onDone }) {
  const [rows, setRows] = useStateC(files.map(f => ({ name: f.name, status: "pending", cand: null, score: null, error: null })));
  const started = useRefC(false);

  useEffectC(() => {
    if (started.current) return;
    started.current = true;

    (async () => {
      for (let i = 0; i < files.length; i++) {
        setRows(r => r.map((x, j) => j === i ? { ...x, status: "processing" } : x));
        try {
          const res = await API.procesarCV(vacanteId, files[i]);
          setRows(r => r.map((x, j) => j === i ? {
            ...x, status: "done",
            cand: res.aplicacion ? res.aplicacion.candidato_id : null,
            score: res.analisis?.puntaje_total ?? null,
            name: res.analisis ? (x.name) : x.name,
          } : x));
        } catch (err) {
          setRows(r => r.map((x, j) => j === i ? { ...x, status: "error", error: err.message } : x));
        }
      }
      setTimeout(onDone, 800);
    })();
  }, []);

  const done = rows.filter(r => r.status === "done").length;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
        <NIcon name="sparkle" size={17} color={N.chip.purple.fg} />
        <span style={{ fontSize: 16, fontWeight: 600, color: N.ink }}>Procesando candidatos</span>
      </div>
      <p style={{ fontSize: 13, color: N.ink3, margin: "0 0 16px" }}>{done}/{files.length} listos</p>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 340, overflow: "auto" }}>
        {rows.map((row, i) => (
          <div key={i} style={{ border: `1px solid ${N.border}`, borderRadius: 8, padding: "11px 13px", background: row.status === "done" ? N.sidebar : N.bg }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {row.status === "done"
                ? <NAvatar name={row.name} size={24} />
                : <div style={{ width: 24, height: 24, borderRadius: 999, background: N.hover, display: "grid", placeItems: "center" }}><NIcon name="fileText" size={13} color={N.ink3} /></div>}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 500, color: N.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{row.name}</div>
                <div style={{ fontSize: 12, color: row.status === "error" ? N.chip.red.fg : N.ink3 }}>
                  {row.status === "pending" && "En espera…"}
                  {row.status === "processing" && "Procesando…"}
                  {row.status === "done" && "Listo"}
                  {row.status === "error" && `Error: ${row.error}`}
                </div>
              </div>
              {row.status === "done" && row.score != null && <ScoreCell value={row.score} width={120} />}
              {row.status === "processing" && <div className="spin2" style={{ width: 15, height: 15, border: `1.8px solid ${N.border}`, borderTopColor: N.ink3, borderRadius: 999 }} />}
            </div>
          </div>
        ))}
      </div>
      <style>{`.spin2{animation:spin2 0.7s linear infinite}@keyframes spin2{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

// ── Modal ─────────────────────────────────────────
function AddCandidates({ vacanteId, onClose, onDone }) {
  const [mode, setMode] = useStateC("individual");
  const [stage, setStage] = useStateC("pick");
  const [files, setFiles] = useStateC([]);
  const inputRef = useRefC(null);

  const canStart = files.length > 0 && !!vacanteId;

  const handleFiles = (newFiles) => {
    const valid = Array.from(newFiles).filter(f => f.name.endsWith(".pdf") || f.name.endsWith(".docx"));
    if (mode === "individual") setFiles(valid.slice(0, 1));
    else setFiles(prev => [...prev, ...valid].slice(0, 50));
  };

  const Tab = ({ id, label, icon }) => (
    <button onClick={() => { setMode(id); setFiles([]); }} style={{
      flex: 1, background: mode === id ? N.bg : "transparent", border: "none",
      borderBottom: `2px solid ${mode === id ? N.ink : "transparent"}`,
      color: mode === id ? N.ink : N.ink3, cursor: "pointer", padding: "10px 0", fontSize: 13.5, fontFamily: fontN,
      fontWeight: mode === id ? 600 : 400, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7,
    }}>
      <NIcon name={icon} size={15} color={mode === id ? N.ink : N.ink3} /> {label}
    </button>
  );

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(15,15,15,0.32)", zIndex: 50, display: "grid", placeItems: "center", fontFamily: fontN }}>
      <div onClick={e => e.stopPropagation()} style={{ width: 540, maxHeight: "84vh", background: N.bg, border: `1px solid ${N.border}`, borderRadius: 12, boxShadow: "0 16px 48px rgba(15,15,15,0.18)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", padding: "14px 18px", borderBottom: `1px solid ${N.border}` }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: N.ink, flex: 1 }}>Agregar candidatos</span>
          <button onClick={onClose} style={{ background: "transparent", border: "none", cursor: "pointer", color: N.ink3, padding: 4, borderRadius: 6, display: "grid", placeItems: "center" }}>
            <NIcon name="x" size={17} />
          </button>
        </div>

        {!vacanteId && (
          <div style={{ padding: "12px 18px", background: N.chip.yellow.bg, fontSize: 13, color: N.chip.yellow.fg }}>
            Selecciona una vacante en el sidebar antes de subir candidatos.
          </div>
        )}

        {stage === "pick" && (
          <React.Fragment>
            <div style={{ display: "flex", borderBottom: `1px solid ${N.border}` }}>
              <Tab id="individual" label="CV individual" icon="user" />
              <Tab id="bulk" label="En lote" icon="layers" />
            </div>

            <input ref={inputRef} type="file" accept=".pdf,.docx" multiple={mode === "bulk"} style={{ display: "none" }}
              onChange={e => handleFiles(e.target.files)} />

            <div style={{ padding: 18, overflow: "auto" }}>
              <div
                onClick={() => inputRef.current.click()}
                onDrop={e => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
                onDragOver={e => e.preventDefault()}
                style={{ border: `1.5px dashed ${files.length ? N.borderHi : N.border}`, borderRadius: 10, padding: "28px 20px", textAlign: "center", cursor: "pointer", background: N.sidebar, marginBottom: files.length ? 14 : 0 }}>
                <NIcon name={files.length ? "fileText" : "upload"} size={24} color={N.ink3} />
                <div style={{ fontSize: 14, fontWeight: 500, color: N.ink, marginTop: 10 }}>
                  {files.length
                    ? `${files.length} archivo${files.length > 1 ? "s" : ""} seleccionado${files.length > 1 ? "s" : ""}`
                    : mode === "individual" ? "Sube un CV (PDF o DOCX)" : "Suelta varios CV o una carpeta"}
                </div>
                <div style={{ fontSize: 12, color: N.ink3, marginTop: 4 }}>
                  {files.length ? "Haz clic para cambiar" : "PDF o DOCX"}
                </div>
              </div>

              {files.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {files.map((f, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 9, padding: "7px 10px", border: `1px solid ${N.border}`, borderRadius: 6 }}>
                      <NIcon name="fileText" size={14} color={N.ink3} />
                      <span style={{ fontSize: 13, color: N.ink, flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{f.name}</span>
                      <span style={{ fontSize: 12, color: N.ink4 }}>{(f.size / 1024).toFixed(0)}KB</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, padding: "14px 18px", borderTop: `1px solid ${N.border}` }}>
              <button onClick={onClose} style={{ background: "transparent", color: N.ink2, border: `1px solid ${N.border}`, cursor: "pointer", padding: "8px 14px", fontSize: 13.5, fontFamily: fontN, fontWeight: 500, borderRadius: 6 }}>Cancelar</button>
              <button disabled={!canStart} onClick={() => setStage("processing")} style={{
                background: canStart ? N.ink : N.hover, color: canStart ? N.bg : N.ink3, border: "none",
                cursor: canStart ? "pointer" : "default", padding: "8px 14px", fontSize: 13.5, fontFamily: fontN, fontWeight: 500, borderRadius: 6,
                display: "inline-flex", alignItems: "center", gap: 7,
              }}>
                <NIcon name="zap" size={14} color={canStart ? N.bg : N.ink3} /> Procesar {files.length > 0 ? `(${files.length})` : ""}
              </button>
            </div>
          </React.Fragment>
        )}

        {stage === "processing" && (
          <div style={{ padding: 18, overflow: "auto" }}>
            <Processing files={files} vacanteId={vacanteId} onDone={onDone} />
          </div>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { AddCandidates });
