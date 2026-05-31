/* global React, N, NIcon, fontN */
// Login del reclutador + Estado vacío (primera vacante)

const { useState: useStateA } = React;

function PrimaryBtn({ children, onClick, full, type }) {
  return (
    <button type={type} onClick={onClick} style={{
      background: N.ink, color: N.bg, border: "none", cursor: "pointer",
      padding: "10px 16px", fontSize: 14, fontFamily: fontN, fontWeight: 500,
      borderRadius: 6, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
      width: full ? "100%" : "auto",
    }}>{children}</button>
  );
}

function Field({ label, value, type = "text", placeholder, onChange }) {
  return (
    <label style={{ display: "block" }}>
      <div style={{ fontSize: 12.5, color: N.ink2, fontWeight: 500, marginBottom: 6 }}>{label}</div>
      <input type={type} value={value} placeholder={placeholder} onChange={e => onChange && onChange(e.target.value)} style={{
        width: "100%", border: `1px solid ${N.border}`, background: N.bg, color: N.ink,
        borderRadius: 6, padding: "9px 11px", fontSize: 14, fontFamily: fontN, outline: "none",
      }}
      onFocus={e => e.currentTarget.style.borderColor = N.borderHi}
      onBlur={e => e.currentTarget.style.borderColor = N.border} />
    </label>
  );
}

// ── LOGIN ─────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [email, setEmail] = useStateA("camila.rivera@empresa.com");
  const [pass, setPass] = useStateA("••••••••••");
  return (
    <div style={{ width: "100vw", height: "100vh", background: N.sidebar, display: "grid", placeItems: "center", fontFamily: fontN }}>
      <div style={{ width: 380 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 22 }}>
          <div style={{ width: 30, height: 30, borderRadius: 7, background: N.ink, color: N.bg, fontSize: 16, fontWeight: 700, display: "grid", placeItems: "center" }}>H</div>
          <span style={{ fontSize: 18, fontWeight: 600, color: N.ink }}>HireScore</span>
        </div>

        <div style={{ background: N.bg, border: `1px solid ${N.border}`, borderRadius: 10, padding: 26 }}>
          <h1 style={{ fontSize: 19, fontWeight: 600, color: N.ink, margin: "0 0 4px" }}>Inicia sesión</h1>
          <p style={{ fontSize: 13.5, color: N.ink3, margin: "0 0 20px" }}>Accede a tu panel de reclutamiento.</p>

          <form onSubmit={e => { e.preventDefault(); onLogin(); }} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Field label="Correo de trabajo" type="email" value={email} onChange={setEmail} />
            <Field label="Contraseña" type="password" value={pass} onChange={setPass} />
            <div style={{ marginTop: 4 }}>
              <PrimaryBtn type="submit" full>
                <NIcon name="lock" size={14} color={N.bg} /> Entrar
              </PrimaryBtn>
            </div>
          </form>

          <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "18px 0" }}>
            <div style={{ flex: 1, height: 1, background: N.border }} />
            <span style={{ fontSize: 11.5, color: N.ink3 }}>o continúa con</span>
            <div style={{ flex: 1, height: 1, background: N.border }} />
          </div>
          <button onClick={onLogin} style={{
            width: "100%", background: N.bg, color: N.ink, border: `1px solid ${N.border}`, cursor: "pointer",
            padding: "9px 14px", fontSize: 13.5, fontFamily: fontN, fontWeight: 500, borderRadius: 6,
            display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}
          onMouseEnter={e => e.currentTarget.style.background = N.hover}
          onMouseLeave={e => e.currentTarget.style.background = N.bg}>
            <span style={{ width: 16, height: 16, borderRadius: 3, background: N.hover, display: "grid", placeItems: "center", fontSize: 11, fontWeight: 700, color: N.ink2 }}>G</span>
            Google Workspace
          </button>
        </div>

        <p style={{ fontSize: 12, color: N.ink3, textAlign: "center", marginTop: 16 }}>
          ¿No tienes cuenta? <span style={{ color: N.ink, fontWeight: 500, cursor: "pointer" }}>Solicita acceso</span>
        </p>
      </div>
    </div>
  );
}

// ── ESTADO VACÍO ──────────────────────────────────
function EmptyState({ onCreate }) {
  return (
    <div style={{ display: "grid", placeItems: "center", minHeight: "70vh", textAlign: "center" }}>
      <div style={{ maxWidth: 440 }}>
        <div style={{ width: 56, height: 56, borderRadius: 14, background: N.hover, display: "grid", placeItems: "center", margin: "0 auto 20px" }}>
          <NIcon name="briefcase" size={26} color={N.ink3} />
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 600, color: N.ink, margin: "0 0 8px", letterSpacing: "-0.01em" }}>Aún no tienes vacantes</h2>
        <p style={{ fontSize: 14.5, color: N.ink2, lineHeight: 1.55, margin: "0 0 24px" }}>
          Crea tu primera vacante para empezar a recibir y evaluar candidatos automáticamente con puntajes auditables.
        </p>
        <PrimaryBtn onClick={onCreate}>
          <NIcon name="plus" size={15} color={N.bg} /> Crear primera vacante
        </PrimaryBtn>
        <div style={{ display: "flex", justifyContent: "center", gap: 28, marginTop: 36 }}>
          {[
            { icon: "fileText", t: "Sube la descripción", s: "PDF, DOCX o con ayuda de IA" },
            { icon: "users", t: "Agrega candidatos", s: "CV individual o en lote" },
            { icon: "bar", t: "Recibe puntajes", s: "Desglose auditable 0–100" },
          ].map(s => (
            <div key={s.t} style={{ width: 130 }}>
              <NIcon name={s.icon} size={18} color={N.ink3} />
              <div style={{ fontSize: 13, fontWeight: 600, color: N.ink, marginTop: 8 }}>{s.t}</div>
              <div style={{ fontSize: 12, color: N.ink3, marginTop: 2, lineHeight: 1.4 }}>{s.s}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { LoginScreen, EmptyState, PrimaryBtn, Field });
