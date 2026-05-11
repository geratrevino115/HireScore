/* ============================================================
   HireScore — SPA dashboard
   Vanilla JS, sin dependencias. Routing por hash.
   ============================================================ */

const API_BASE = window.location.pathname.startsWith("/app")
  ? ""
  : "http://localhost:8000";

// ============================================================
// Iconos SVG inline
// ============================================================
const ICONS = {
  dashboard: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>',
  upload: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>',
  chart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>',
  briefcase: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>',
  users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  cog: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
  trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
  refresh: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>',
  arrow_right: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>',
  back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>',
  close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
  alert: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
  info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
  file: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',
  audio: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
  dollar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
  trophy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>',
  empty: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="8" y1="12" x2="16" y2="12"/></svg>',
};

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

// ============================================================
// API client
// ============================================================
async function api(path, opts = {}) {
  const url = API_BASE + path;
  const resp = await fetch(url, opts);
  const text = await resp.text();
  let body = null;
  try { body = text ? JSON.parse(text) : null; } catch { body = text; }
  if (!resp.ok) {
    const err = new Error(`HTTP ${resp.status}`);
    err.status = resp.status;
    err.body = body;
    err.detail = (body && (body.detail || body.message)) || text || resp.statusText;
    throw err;
  }
  return body;
}

const apiGet = (p) => api(p);
const apiJSON = (p, method, body) => api(p, {
  method,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});
const apiDelete = (p) => api(p, { method: "DELETE" });

// ============================================================
// Toasts
// ============================================================
function toast(kind, title, msg = "") {
  const el = document.createElement("div");
  el.className = `toast ${kind}`;
  const iconKey = { success: "check", danger: "alert", warning: "alert", info: "info" }[kind] || "info";
  el.innerHTML = `
    <div class="icon">${ICONS[iconKey]}</div>
    <div class="body">
      <strong>${escape(title)}</strong>
      ${msg ? `<p>${escape(msg)}</p>` : ""}
    </div>
  `;
  $("#toasts").appendChild(el);
  setTimeout(() => {
    el.classList.add("dismissing");
    setTimeout(() => el.remove(), 220);
  }, 4500);
}

const toastError = (e, fallback = "Algo salió mal") => {
  const msg = e && (e.detail || e.message) || String(e);
  toast("danger", fallback, msg);
};

// ============================================================
// Modal
// ============================================================
function modal({ title, body, footer, onClose }) {
  const root = $("#modal-root");
  const back = document.createElement("div");
  back.className = "modal-backdrop";
  back.innerHTML = `
    <div class="modal" role="dialog" aria-modal="true">
      <div class="modal-header">
        <h3>${escape(title)}</h3>
        <button class="icon-btn" data-close>${ICONS.close}</button>
      </div>
      <div class="modal-body"></div>
      ${footer ? '<div class="modal-footer"></div>' : ""}
    </div>
  `;
  const close = () => {
    back.remove();
    if (onClose) onClose();
  };
  back.addEventListener("click", (e) => {
    if (e.target === back || e.target.closest("[data-close]")) close();
  });
  document.addEventListener("keydown", function esc(e) {
    if (e.key === "Escape") {
      close();
      document.removeEventListener("keydown", esc);
    }
  });
  const bodyEl = $(".modal-body", back);
  if (typeof body === "string") bodyEl.innerHTML = body;
  else if (body) bodyEl.appendChild(body);
  if (footer) {
    const f = $(".modal-footer", back);
    if (typeof footer === "string") f.innerHTML = footer;
    else f.appendChild(footer);
  }
  root.appendChild(back);
  return { close, root: back };
}

function confirmModal(title, msg, onConfirm) {
  const m = modal({
    title,
    body: `<p style="margin:0;color:var(--text-1);">${escape(msg)}</p>`,
    footer: `
      <button class="btn btn-secondary" data-close>Cancelar</button>
      <button class="btn btn-danger" data-confirm>Confirmar</button>
    `,
  });
  $("[data-confirm]", m.root).addEventListener("click", async () => {
    m.close();
    await onConfirm();
  });
}

// ============================================================
// Helpers de formato
// ============================================================
const escape = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
})[c]);

const fmtDate = (iso) => {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return d.toLocaleString("es-MX", {
      year: "numeric", month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  } catch { return iso; }
};

const fmtUSD = (n) => {
  if (n == null) return "—";
  if (n >= 0.01) return `$${n.toFixed(4)}`;
  return `$${n.toFixed(6)}`;
};

const fmtNum = (n) => (n == null ? "—" : new Intl.NumberFormat("es-MX").format(n));

const scoreColor = (s) => {
  if (s == null) return "var(--text-3)";
  if (s >= 80) return "var(--success)";
  if (s >= 60) return "var(--accent)";
  if (s >= 40) return "var(--warning)";
  return "var(--danger)";
};

const truncate = (s, n) => {
  s = String(s ?? "");
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
};

// ============================================================
// Componentes reutilizables
// ============================================================

function gauge(value, opts = {}) {
  const { size = "lg", label = "Score" } = opts;
  const v = Math.max(0, Math.min(100, value || 0));
  const isLg = size === "lg";
  const radius = isLg ? 50 : 24;
  const cx = isLg ? 55 : 30;
  const circ = 2 * Math.PI * radius;
  const offset = circ * (1 - v / 100);
  const color = scoreColor(v);
  const sizeAttr = isLg ? "" : ' class="sm"';
  return `
    <div class="gauge${isLg ? "" : " sm"}">
      <svg viewBox="0 0 ${cx * 2} ${cx * 2}" width="100%" height="100%">
        <circle class="gauge-track" cx="${cx}" cy="${cx}" r="${radius}"></circle>
        <circle class="gauge-fill" cx="${cx}" cy="${cx}" r="${radius}"
          style="stroke:${color};stroke-dasharray:${circ};stroke-dashoffset:${offset};"></circle>
      </svg>
      <div class="gauge-value">
        <div class="num">${v}</div>
        <div class="lbl">${escape(label)}</div>
      </div>
    </div>
  `;
}

function emptyState(title, hint = "", icon = "empty") {
  return `
    <div class="empty">
      <div class="empty-icon">${ICONS[icon]}</div>
      <div class="empty-title">${escape(title)}</div>
      ${hint ? `<div>${escape(hint)}</div>` : ""}
    </div>
  `;
}

function dropzone(opts) {
  // opts: { id, accept, label, hint, optional }
  const { id, accept, label, hint, optional = false, iconKey = "file" } = opts;
  return `
    <div class="dropzone" data-dropzone="${id}">
      <div class="dz-icon">${ICONS[iconKey]}</div>
      <div class="dz-default">
        <div class="dz-title">${escape(label)} ${optional ? '<span class="muted text-xs">(opcional)</span>' : ""}</div>
        <div class="dz-hint">${escape(hint || `Arrastra o haz click para seleccionar`)}</div>
      </div>
      <div class="dz-file" hidden></div>
      <input id="${id}" type="file" accept="${accept}" />
    </div>
  `;
}

function attachDropzones(root) {
  $$(".dropzone", root).forEach((dz) => {
    const input = $("input[type=file]", dz);
    const fileEl = $(".dz-file", dz);
    const defaultEl = $(".dz-default", dz);

    const updateFile = (file) => {
      if (file) {
        dz.classList.add("has-file");
        defaultEl.hidden = true;
        fileEl.hidden = false;
        fileEl.innerHTML = `${ICONS.check} ${escape(file.name)} <span class="muted text-xs">(${(file.size / 1024).toFixed(1)} KB)</span>`;
      } else {
        dz.classList.remove("has-file");
        defaultEl.hidden = false;
        fileEl.hidden = true;
      }
    };

    input.addEventListener("change", () => updateFile(input.files[0]));
    dz.addEventListener("dragover", (e) => {
      e.preventDefault();
      dz.classList.add("dragover");
    });
    dz.addEventListener("dragleave", () => dz.classList.remove("dragover"));
    dz.addEventListener("drop", (e) => {
      e.preventDefault();
      dz.classList.remove("dragover");
      const f = e.dataTransfer.files[0];
      if (f) {
        const dt = new DataTransfer();
        dt.items.add(f);
        input.files = dt.files;
        updateFile(f);
      }
    });
  });
}

// ============================================================
// Health pill
// ============================================================
async function refreshHealth() {
  const pill = $("#health-pill");
  const label = $(".label", pill);
  try {
    const h = await apiGet("/health");
    const ok = h.status === "ok";
    const dbOk = h.database;
    const provider = (h.llm && h.llm.provider) || "?";
    pill.className = "health-pill " + (ok ? "ok" : (dbOk ? "warn" : "bad"));
    label.textContent = ok
      ? `Sistema OK · ${provider}`
      : !dbOk
        ? "BD desconectada"
        : `LLM (${provider}) caído`;
    if (Array.isArray(h.etapas_aplicacion) && h.etapas_aplicacion.length > 0) {
      ETAPAS = h.etapas_aplicacion;
    }
  } catch {
    pill.className = "health-pill bad";
    label.textContent = "API no responde";
  }
}

// ============================================================
// Routing
// ============================================================
const routes = {
  dashboard: { title: "Resumen", render: viewDashboard },
  analyses: { title: "Análisis", render: viewAnalysesList },
  "analyses/:id": { title: "Detalle de análisis", render: viewAnalysisDetail },
  "applications/:id": { title: "Detalle de aplicación", render: viewApplicationDetail },
  vacancies: { title: "Vacantes", render: viewVacancies },
  "vacancies/:id": { title: "Workspace de vacante", render: viewVacancyWorkspace },
  candidates: { title: "Candidatos", render: viewCandidates },
  settings: { title: "Configuración", render: viewSettings },
};

// Etapas del pipeline (las trae /health en runtime, este es el fallback).
let ETAPAS = [
  "nueva", "en_revision", "shortlist",
  "entrevista", "entrevista_tecnica",
  "oferta", "rechazada",
];
const ETAPA_LABEL = {
  nueva: "Nueva",
  en_revision: "En revisión",
  shortlist: "Shortlist",
  entrevista: "Entrevista",
  entrevista_tecnica: "Entrevista técnica",
  oferta: "Oferta",
  rechazada: "Rechazada",
};

function parseRoute(hash) {
  // Soporta query string después del path: #/vacancies/3?tab=ranking
  const raw = (hash || "").replace(/^#\/?/, "") || "vacancies";
  const [path] = raw.split("?");
  const parts = path.split("/").filter(Boolean);
  if (parts.length === 0) return { name: "vacancies", params: {} };
  if (parts.length === 1) return { name: parts[0], params: {} };
  if (parts.length === 2) return { name: `${parts[0]}/:id`, params: { id: parts[1] } };
  return { name: "vacancies", params: {} };
}

function navigate(route) {
  window.location.hash = "#/" + route;
}

async function router() {
  const { name, params } = parseRoute(window.location.hash);
  const route = routes[name] || routes.dashboard;
  $("#topbar-title").textContent = route.title;

  // Update nav active
  const baseRoute = name.split("/")[0];
  $$(".nav-link").forEach((a) => {
    a.classList.toggle("active", a.dataset.route === baseRoute);
  });

  const view = $("#view");
  view.innerHTML = `
    <div class="view-header"><h2>${route.title}</h2></div>
    <div class="grid grid-3">
      <div class="card"><div class="skeleton" style="width:60%"></div><div class="skeleton" style="margin-top:12px;height:24px"></div></div>
      <div class="card"><div class="skeleton" style="width:60%"></div><div class="skeleton" style="margin-top:12px;height:24px"></div></div>
      <div class="card"><div class="skeleton" style="width:60%"></div><div class="skeleton" style="margin-top:12px;height:24px"></div></div>
    </div>
  `;

  try {
    await route.render(view, params);
  } catch (e) {
    console.error(e);
    view.innerHTML = `
      <div class="alert danger">${ICONS.alert}<div>
        <strong>Error al cargar la vista</strong><br>
        <span class="text-sm">${escape(e.detail || e.message || String(e))}</span>
      </div></div>
    `;
  }
}

// ============================================================
// VISTA: Resumen / Dashboard
// ============================================================
async function viewDashboard(view) {
  const [vacantes, candidatos, analisis] = await Promise.all([
    apiGet("/vacancies/").catch(() => []),
    apiGet("/candidates/").catch(() => []),
    apiGet("/analyses/?limit=100").catch(() => []),
  ]);

  // Calcular costo total agregado
  let costoTotal = 0;
  let llamadasTotal = 0;
  if (vacantes.length > 0) {
    const costos = await Promise.all(
      vacantes.map((v) =>
        apiGet(`/vacancies/${v.id}/costo-total`).catch(() => null)
      )
    );
    costos.forEach((c) => {
      if (c) {
        costoTotal += c.costo_usd || 0;
        llamadasTotal += c.llamadas_llm || 0;
      }
    });
  }

  const promedio =
    analisis.length > 0
      ? Math.round(analisis.reduce((a, b) => a + (b.puntaje_total || 0), 0) / analisis.length)
      : 0;

  // Distribución de scores
  const dist = { excelente: 0, bueno: 0, medio: 0, bajo: 0 };
  analisis.forEach((a) => {
    const s = a.puntaje_total || 0;
    if (s >= 80) dist.excelente++;
    else if (s >= 60) dist.bueno++;
    else if (s >= 40) dist.medio++;
    else dist.bajo++;
  });

  const recientes = analisis.slice(0, 5);

  view.innerHTML = `
    <div class="view-header">
      <div>
        <h2>Resumen del sistema</h2>
        <p>Vista general de actividad, scores y costos.</p>
      </div>
      <div class="view-actions">
        <button class="btn" data-action="process">${ICONS.upload} Nuevo análisis</button>
      </div>
    </div>

    <div class="grid grid-4">
      ${kpi("Análisis totales", fmtNum(analisis.length), "chart")}
      ${kpi("Vacantes activas", fmtNum(vacantes.length), "briefcase")}
      ${kpi("Candidatos", fmtNum(candidatos.length), "users")}
      ${kpi("Costo LLM", fmtUSD(costoTotal), "dollar", `${llamadasTotal} llamadas`)}
    </div>

    <div class="grid grid-2" style="margin-top: var(--gap);">
      <div class="card">
        <div class="card-header">
          <h3>Distribución de puntajes</h3>
          <span class="subtitle">Promedio · ${promedio}</span>
        </div>
        ${analisis.length === 0
          ? emptyState("Sin análisis aún", "Procesa el primer CV para ver datos.")
          : `
            <div class="bar-row">
              <div class="lbl">Excelente (80-100)</div>
              <div class="bar-track"><div class="bar-fill" style="width:${pct(dist.excelente, analisis.length)};background:var(--success)"></div></div>
              <div class="pct">${dist.excelente}</div>
              <div class="weight">${pct(dist.excelente, analisis.length)}</div>
            </div>
            <div class="bar-row">
              <div class="lbl">Bueno (60-79)</div>
              <div class="bar-track"><div class="bar-fill" style="width:${pct(dist.bueno, analisis.length)};background:var(--accent)"></div></div>
              <div class="pct">${dist.bueno}</div>
              <div class="weight">${pct(dist.bueno, analisis.length)}</div>
            </div>
            <div class="bar-row">
              <div class="lbl">Medio (40-59)</div>
              <div class="bar-track"><div class="bar-fill" style="width:${pct(dist.medio, analisis.length)};background:var(--warning)"></div></div>
              <div class="pct">${dist.medio}</div>
              <div class="weight">${pct(dist.medio, analisis.length)}</div>
            </div>
            <div class="bar-row">
              <div class="lbl">Bajo (&lt;40)</div>
              <div class="bar-track"><div class="bar-fill" style="width:${pct(dist.bajo, analisis.length)};background:var(--danger)"></div></div>
              <div class="pct">${dist.bajo}</div>
              <div class="weight">${pct(dist.bajo, analisis.length)}</div>
            </div>
          `
        }
      </div>

      <div class="card">
        <div class="card-header">
          <h3>Análisis recientes</h3>
          <a class="btn btn-ghost btn-sm" href="#/analyses">Ver todos ${ICONS.arrow_right}</a>
        </div>
        ${recientes.length === 0
          ? emptyState("Sin análisis recientes")
          : `<div class="table-wrap"><table>
              <thead><tr><th>#</th><th>Score</th><th>Vacante</th><th>Cand.</th><th>Fecha</th></tr></thead>
              <tbody>
              ${recientes.map((a) => `
                <tr class="clickable" data-go="analyses/${a.id}">
                  <td><span class="muted">#${a.id}</span></td>
                  <td><strong style="color:${scoreColor(a.puntaje_total)}">${a.puntaje_total}</strong></td>
                  <td>#${a.vacante_id}</td>
                  <td>#${a.candidato_id}</td>
                  <td class="text-xs muted">${fmtDate(a.analizado_en)}</td>
                </tr>
              `).join("")}
              </tbody>
            </table></div>`
        }
      </div>
    </div>
  `;

  $$("[data-action=process]", view).forEach((b) =>
    b.addEventListener("click", () => navigate("vacancies"))
  );
  $$("[data-go]", view).forEach((r) =>
    r.addEventListener("click", () => navigate(r.dataset.go))
  );
}

function kpi(label, value, icon, trend = "") {
  return `
    <div class="kpi">
      <div class="kpi-label">${escape(label)}</div>
      <div class="kpi-value">${value}</div>
      ${trend ? `<div class="kpi-trend">${escape(trend)}</div>` : ""}
      <div class="kpi-icon">${ICONS[icon] || ICONS.info}</div>
    </div>
  `;
}

const pct = (n, total) => total === 0 ? "0%" : `${Math.round((n / total) * 100)}%`;

// ============================================================
// VISTA: Vacantes (lista)
// ============================================================
async function viewVacancies(view) {
  const list = await apiGet("/vacancies/");

  view.innerHTML = `
    <div class="view-header">
      <div>
        <h2>Vacantes</h2>
        <p>Define las posiciones contra las cuales se evalúan los candidatos.</p>
      </div>
      <div class="view-actions">
        <button class="btn btn-secondary" id="btn-refresh">${ICONS.refresh} Refrescar</button>
        <button class="btn" id="btn-new">${ICONS.plus} Nueva vacante</button>
      </div>
    </div>

    <div class="card" style="padding:0;">
      ${list.length === 0
        ? emptyState("Aún no hay vacantes", "Crea la primera para empezar.", "briefcase")
        : `<table>
          <thead>
            <tr>
              <th>ID</th><th>Título</th><th>Descripción</th>
              <th>Pesos</th><th>Requisitos</th><th></th>
            </tr>
          </thead>
          <tbody>
            ${list.map((v) => `
              <tr class="clickable" data-go="vacancies/${v.id}">
                <td><span class="muted">#${v.id}</span></td>
                <td><strong>${escape(v.titulo)}</strong></td>
                <td class="text-sm muted">${escape(truncate(v.descripcion || "", 60)) || "—"}</td>
                <td>${v.pesos_json
                  ? '<span class="badge accent">custom</span>'
                  : '<span class="badge">default</span>'}</td>
                <td>${v.requisitos_texto
                  ? '<span class="badge success">' + (v.requisitos_texto.length) + ' chars</span>'
                  : '<span class="badge danger">faltan</span>'}</td>
                <td class="text-right">${ICONS.arrow_right}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>`
      }
    </div>
  `;

  $("#btn-refresh", view).addEventListener("click", () => router());
  $("#btn-new", view).addEventListener("click", openNewVacancyModal);
  $$("[data-go]", view).forEach((r) =>
    r.addEventListener("click", () => navigate(r.dataset.go))
  );
}

function openNewVacancyModal() {
  const m = modal({
    title: "Nueva vacante",
    body: `
      <div class="mode-tabs">
        <button class="mode-tab active" data-mode="manual" type="button">
          <span class="label">${ICONS.plus} Manual</span>
          <span class="desc">Escribo título y requisitos a mano</span>
        </button>
        <button class="mode-tab" data-mode="file" type="button">
          <span class="label">${ICONS.file} Subir JD</span>
          <span class="desc">Tengo PDF/DOCX con la descripción del puesto</span>
        </button>
        <button class="mode-tab" data-mode="ai" type="button">
          <span class="label">${ICONS.info} Asistido por IA</span>
          <span class="desc">No tengo JD; que la IA me la redacte</span>
        </button>
      </div>
      <div id="wizard-body"></div>
    `,
    footer: `
      <button class="btn btn-secondary" data-close>Cancelar</button>
      <button class="btn" id="wizard-action">${ICONS.plus} Crear vacante</button>
    `,
  });
  m.root.querySelector(".modal").classList.add("lg");

  const setMode = (mode) => {
    $$(".mode-tab", m.root).forEach((t) =>
      t.classList.toggle("active", t.dataset.mode === mode)
    );
    const body = $("#wizard-body", m.root);
    if (mode === "manual") return renderManualForm(body, m);
    if (mode === "file") return renderFileForm(body, m);
    if (mode === "ai") return renderAIForm(body, m);
  };

  $$(".mode-tab", m.root).forEach((t) =>
    t.addEventListener("click", () => setMode(t.dataset.mode))
  );

  setMode("manual");
}

// ----------- Modo manual (default) -----------
function renderManualForm(host, m) {
  host.innerHTML = `
    <div class="field">
      <label>Título *</label>
      <input id="m-titulo" placeholder="Ej. Backend Senior Python" />
    </div>
    <div class="field">
      <label>Descripción</label>
      <input id="m-desc" placeholder="Resumen breve de la posición" />
    </div>
    <div class="field">
      <label>Requisitos <span class="hint">texto libre, se extrae con el LLM</span></label>
      <textarea id="m-req" rows="8" placeholder="Ej.&#10;- 5+ años Python&#10;- FastAPI, async&#10;- Postgres, Docker&#10;- Inglés intermedio"></textarea>
    </div>
  `;
  bindWizardSave(m);
}

// ----------- Modo subir archivo -----------
function renderFileForm(host, m) {
  host.innerHTML = `
    <p class="text-sm muted" style="margin:0 0 12px;">
      Sube el documento con la descripción del puesto. La IA extraerá título, descripción y requisitos.
    </p>
    <div class="dropzone" id="jd-dz">
      <div class="dz-icon">${ICONS.file}</div>
      <div class="dz-default">
        <div class="dz-title">Arrastra PDF/DOCX o haz click</div>
        <div class="dz-hint">Solo se procesa cuando subes el archivo</div>
      </div>
      <div class="dz-file" hidden></div>
      <input id="jd-file" type="file" accept=".pdf,.docx" />
    </div>
    <div id="jd-extract-status" style="margin-top:12px;"></div>
    <div id="jd-draft-form"></div>
  `;
  attachDropzones(host);

  $("#jd-file", host).addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const status = $("#jd-extract-status", host);
    status.innerHTML = `
      <div class="alert info">${ICONS.info}<div>
        <strong>Extrayendo descripción…</strong>
        <span class="text-xs"> · esto toma 5-15s</span>
      </div></div>
      <div class="processing-stripe" style="margin-top:6px;"></div>
    `;
    try {
      const fd = new FormData();
      fd.append("file", file);
      const draft = await api("/vacancies/extraer-desde-archivo", {
        method: "POST",
        body: fd,
      });
      status.innerHTML = `<div class="alert success">${ICONS.check}<div><strong>Listo, revisa antes de crear</strong></div></div>`;
      renderDraftEditor($("#jd-draft-form", host), draft);
      bindWizardSave(m);
    } catch (err) {
      status.innerHTML = `<div class="alert danger">${ICONS.alert}<div>${escape(err.detail || err.message)}</div></div>`;
    }
  });
}

// ----------- Modo IA asistida -----------
function renderAIForm(host, m) {
  host.innerHTML = `
    <p class="text-sm muted" style="margin:0 0 12px;">
      Cuéntame lo que sabes; la IA redacta una vacante completa que puedes editar.
    </p>
    <div class="grid grid-2">
      <div class="field">
        <label>Puesto *</label>
        <input id="ai-puesto" placeholder="Ej. Backend developer Python" />
      </div>
      <div class="field">
        <label>Seniority</label>
        <select id="ai-seniority">
          <option value="">— sin especificar —</option>
          <option value="junior">Junior</option>
          <option value="mid" selected>Mid</option>
          <option value="senior">Senior</option>
          <option value="lead">Lead / Principal</option>
        </select>
      </div>
    </div>
    <div class="field">
      <label>Industria <span class="hint">opcional</span></label>
      <input id="ai-industria" placeholder="Ej. fintech, salud, ecommerce" />
    </div>
    <div class="field">
      <label>Stack tecnológico <span class="hint">separado por comas</span></label>
      <input id="ai-stack" placeholder="Python, FastAPI, PostgreSQL, Docker, AWS" />
    </div>
    <div class="field">
      <label>Responsabilidades clave <span class="hint">opcional</span></label>
      <textarea id="ai-resp" rows="3" placeholder="Ej. diseñar APIs, liderar el módulo de pagos, mentoría de juniors"></textarea>
    </div>
    <div class="field">
      <label>Notas extra <span class="hint">opcional</span></label>
      <input id="ai-notas" placeholder="Ej. equipo distribuido, oficina híbrida CDMX" />
    </div>
    <button class="btn" id="ai-go">${ICONS.refresh} Generar borrador</button>
    <div id="ai-status" style="margin-top:12px;"></div>
    <div id="ai-draft-form"></div>
  `;

  $("#ai-go", host).addEventListener("click", async (ev) => {
    const puesto = $("#ai-puesto", host).value.trim();
    if (!puesto) return toast("warning", "Falta el puesto");
    ev.target.disabled = true;
    const status = $("#ai-status", host);
    status.innerHTML = `
      <div class="alert info">${ICONS.info}<div>
        <strong>Generando borrador…</strong>
        <span class="text-xs"> · esto toma 5-20s</span>
      </div></div>
      <div class="processing-stripe" style="margin-top:6px;"></div>
    `;
    try {
      const stackRaw = $("#ai-stack", host).value.trim();
      const body = {
        puesto,
        seniority: $("#ai-seniority", host).value || null,
        industria: $("#ai-industria", host).value.trim() || null,
        stack: stackRaw ? stackRaw.split(",").map((s) => s.trim()).filter(Boolean) : [],
        responsabilidades: $("#ai-resp", host).value.trim() || null,
        notas: $("#ai-notas", host).value.trim() || null,
      };
      const draft = await apiJSON("/vacancies/generar", "POST", body);
      status.innerHTML = `<div class="alert success">${ICONS.check}<div><strong>Borrador listo, revisa antes de crear</strong></div></div>`;
      renderDraftEditor($("#ai-draft-form", host), draft);
      bindWizardSave(m);
    } catch (err) {
      status.innerHTML = `<div class="alert danger">${ICONS.alert}<div>${escape(err.detail || err.message)}</div></div>`;
    } finally {
      ev.target.disabled = false;
    }
  });
}

// Inserta el form editable con el draft pre-llenado (compartido entre modo file e IA).
function renderDraftEditor(host, draft) {
  host.innerHTML = `
    <hr style="margin:18px 0;border:none;border-top:1px solid var(--border);" />
    <div class="field">
      <label>Título *</label>
      <input id="m-titulo" value="${escape(draft.titulo || "")}" />
    </div>
    <div class="field">
      <label>Descripción</label>
      <input id="m-desc" value="${escape(draft.descripcion || "")}" />
    </div>
    <div class="field">
      <label>Requisitos <span class="hint">edita lo que necesites</span></label>
      <textarea id="m-req" rows="10">${escape(draft.requisitos_texto || "")}</textarea>
    </div>
  `;
}

// Engancha el botón "Crear vacante" al estado actual del form (manual o draft).
function bindWizardSave(m) {
  const btn = $("#wizard-action", m.root);
  // Reemplaza listeners previos cloning the node
  const fresh = btn.cloneNode(true);
  btn.parentNode.replaceChild(fresh, btn);
  fresh.addEventListener("click", async (ev) => {
    const titEl = $("#m-titulo", m.root);
    if (!titEl) {
      toast("warning", "Primero genera o sube el borrador");
      return;
    }
    const titulo = titEl.value.trim();
    if (!titulo) return toast("warning", "Falta el título");
    const body = {
      titulo,
      descripcion: ($("#m-desc", m.root) || {}).value?.trim() || null,
      requisitos_texto: ($("#m-req", m.root) || {}).value?.trim() || null,
    };
    ev.target.disabled = true;
    try {
      const v = await apiJSON("/vacancies/", "POST", body);
      toast("success", "Vacante creada", `#${v.id} · ${v.titulo}`);
      m.close();
      // Si tiene requisitos, ofrecer generar guía después de crear
      if (body.requisitos_texto) {
        setTimeout(() => {
          if (confirm(`¿Generar guía de entrevista para "${v.titulo}" ahora? (la IA propondrá preguntas técnicas)`)) {
            generarGuiaParaVacante(v.id);
          } else {
            navigate("vacancies/" + v.id);
          }
        }, 200);
      } else {
        router();
      }
    } catch (e) {
      toastError(e, "No se pudo crear la vacante");
      ev.target.disabled = false;
    }
  });
}

async function generarGuiaParaVacante(vacanteId) {
  const t = toast("info", "Generando guía de entrevista…", "Esto toma 10-30s");
  try {
    await apiJSON(`/vacancies/${vacanteId}/guia-entrevista`, "POST");
    toast("success", "Guía generada");
    navigate(`vacancies/${vacanteId}?tab=guide`);
  } catch (e) {
    toastError(e, "No se pudo generar la guía");
    navigate("vacancies/" + vacanteId);
  }
}

// ============================================================
// VISTA: Workspace de vacante (kanban + bulk upload + tabs)
// ============================================================
async function viewVacancyWorkspace(view, params) {
  const id = parseInt(params.id, 10);
  const [vacante, costo] = await Promise.all([
    apiGet(`/vacancies/${id}`),
    apiGet(`/vacancies/${id}/costo-total`).catch(() => ({ costo_usd: 0, llamadas_llm: 0 })),
  ]);

  const tab = (window.location.hash.match(/\?tab=([^&]+)/) || [])[1] || "pipeline";

  view.innerHTML = `
    <div class="view-header">
      <div>
        <a class="btn btn-ghost btn-sm" href="#/vacancies">${ICONS.back} Vacantes</a>
        <h2 style="margin-top:8px;">${escape(vacante.titulo)}</h2>
        <p>Vacante #${vacante.id} · ${escape(truncate(vacante.descripcion || "Sin descripción", 120))}</p>
      </div>
      <div class="view-actions">
        <button class="btn btn-secondary" id="btn-cv-pick">${ICONS.upload} Subir CV(s)</button>
        <input type="file" id="cv-pick-input" accept=".pdf,.docx" multiple hidden />
      </div>
    </div>

    <div class="tabs">
      <button class="tab ${tab === "pipeline" ? "active" : ""}" data-tab="pipeline">Pipeline</button>
      <button class="tab ${tab === "ranking" ? "active" : ""}" data-tab="ranking">Ranking</button>
      <button class="tab ${tab === "guide" ? "active" : ""}" data-tab="guide">Guía de entrevista</button>
      <button class="tab ${tab === "requirements" ? "active" : ""}" data-tab="requirements">Requisitos</button>
      <button class="tab ${tab === "weights" ? "active" : ""}" data-tab="weights">Pesos</button>
      <button class="tab ${tab === "costs" ? "active" : ""}" data-tab="costs">Costos</button>
    </div>

    <div id="tab-content"></div>
  `;

  const renderTab = (t) => {
    const content = $("#tab-content", view);
    $$(".tab", view).forEach((b) => b.classList.toggle("active", b.dataset.tab === t));
    const url = `#/vacancies/${id}?tab=${t}`;
    if (window.location.hash !== url) {
      history.replaceState(null, "", url);
    }
    if (t === "pipeline") return renderVacPipeline(content, vacante, costo);
    if (t === "ranking") return renderVacRanking(content, vacante);
    if (t === "guide") return renderVacGuide(content, vacante);
    if (t === "weights") return renderVacWeights(content, vacante);
    if (t === "requirements") return renderVacRequirements(content, vacante);
    if (t === "costs") return renderVacCosts(content, vacante, costo);
  };

  $$(".tab", view).forEach((btn) =>
    btn.addEventListener("click", () => renderTab(btn.dataset.tab))
  );

  // El botón "Subir CV" del header dispara el mismo flujo que el dropzone
  $("#btn-cv-pick", view).addEventListener("click", () =>
    $("#cv-pick-input", view).click()
  );
  $("#cv-pick-input", view).addEventListener("change", (e) => {
    procesarCVsBulk(Array.from(e.target.files), vacante);
  });

  renderTab(tab);
}

// ============================================================
// Tab: Pipeline (kanban con bulk upload)
// ============================================================
async function renderVacPipeline(content, vacante, costo) {
  content.innerHTML = `
    <div class="bulk-dz" id="bulk-dz">
      <div class="left">
        <div class="icon">${ICONS.upload}</div>
        <div class="text">
          <strong>Sube CVs (PDF/DOCX) a esta vacante</strong>
          <span>Arrastra varios archivos a la vez · el candidato se identifica automáticamente por email</span>
        </div>
      </div>
      <button class="btn btn-secondary btn-sm" id="bulk-pick">Seleccionar archivos</button>
      <input type="file" id="bulk-input" accept=".pdf,.docx" multiple />
    </div>
    <div class="upload-queue" id="upload-queue"></div>

    <div id="workspace-summary" style="margin-top:var(--gap);"></div>
    <div id="kanban-host" style="margin-top:var(--gap);"></div>
  `;

  // Bulk upload handlers
  const dz = $("#bulk-dz", content);
  const input = $("#bulk-input", content);
  $("#bulk-pick", content).addEventListener("click", (e) => {
    e.stopPropagation();
    input.click();
  });
  dz.addEventListener("click", (e) => {
    if (e.target.tagName !== "BUTTON") input.click();
  });
  input.addEventListener("change", () => {
    procesarCVsBulk(Array.from(input.files), vacante);
    input.value = "";
  });
  ["dragover", "dragenter"].forEach((evt) =>
    dz.addEventListener(evt, (e) => {
      e.preventDefault();
      dz.classList.add("dragover");
    })
  );
  ["dragleave", "dragend"].forEach((evt) =>
    dz.addEventListener(evt, () => dz.classList.remove("dragover"))
  );
  dz.addEventListener("drop", (e) => {
    e.preventDefault();
    dz.classList.remove("dragover");
    procesarCVsBulk(Array.from(e.dataTransfer.files), vacante);
  });

  await reloadPipeline(content, vacante, costo);
}

async function reloadPipeline(content, vacante, costo) {
  const [aplicaciones, pipeline] = await Promise.all([
    apiGet(`/vacancies/${vacante.id}/aplicaciones`).catch(() => []),
    apiGet(`/vacancies/${vacante.id}/pipeline`).catch(() => ({ counts: {}, total: 0 })),
  ]);

  // Resumen header
  const counts = pipeline.counts || {};
  const total = pipeline.total || 0;
  const promedio = aplicaciones.length > 0
    ? Math.round(
        aplicaciones.filter((a) => a.puntaje_total != null)
          .reduce((s, a) => s + a.puntaje_total, 0) /
        Math.max(1, aplicaciones.filter((a) => a.puntaje_total != null).length)
      )
    : 0;

  $("#workspace-summary", content).innerHTML = `
    <div class="grid grid-4">
      ${kpi("Aplicantes", String(total), "users")}
      ${kpi("Score promedio", String(promedio || "—"), "chart")}
      ${kpi("En proceso", String((counts.nueva || 0) + (counts.en_revision || 0) + (counts.shortlist || 0) + (counts.entrevista || 0)), "trophy")}
      ${kpi("Costo LLM", fmtUSD(costo.costo_usd || 0), "dollar", `${costo.llamadas_llm || 0} llamadas`)}
    </div>
    ${total > 0 ? renderStageBar(counts, total) : ""}
  `;

  // Kanban
  const grouped = {};
  ETAPAS.forEach((e) => (grouped[e] = []));
  aplicaciones.forEach((a) => {
    if (!grouped[a.etapa]) grouped[a.etapa] = [];
    grouped[a.etapa].push(a);
  });

  const host = $("#kanban-host", content);
  host.innerHTML = `
    <div class="kanban">
      ${ETAPAS.map((etapa) => `
        <div class="kanban-col" data-stage="${etapa}">
          <div class="kanban-col-header">
            <span class="col-name">${escape(ETAPA_LABEL[etapa] || etapa)}</span>
            <span class="col-count">${grouped[etapa].length}</span>
          </div>
          <div class="kanban-col-body" data-drop="${etapa}">
            ${grouped[etapa].length === 0
              ? `<div class="kanban-col-empty">— sin aplicantes —</div>`
              : grouped[etapa].map(renderAppCard).join("")}
          </div>
        </div>
      `).join("")}
    </div>
  `;

  attachKanbanDragDrop(host, vacante, content, costo);
}

function renderStageBar(counts, total) {
  const segs = ETAPAS.filter((e) => counts[e] > 0).map((e) => `
    <span class="${e}" style="width:${(counts[e] / total) * 100}%" title="${ETAPA_LABEL[e]}: ${counts[e]}"></span>
  `).join("");
  const legend = ETAPAS.map((e) => `
    <span class="item">
      <span class="swatch" style="background:${stageColor(e)};"></span>
      ${ETAPA_LABEL[e]} <strong>${counts[e] || 0}</strong>
    </span>
  `).join("");
  return `
    <div class="card" style="margin-top:var(--gap);">
      <div class="card-header">
        <h3>Distribución del pipeline</h3>
        <span class="subtitle">${total} aplicantes</span>
      </div>
      <div class="stage-bar">${segs}</div>
      <div class="stage-legend">${legend}</div>
    </div>
  `;
}

function stageColor(etapa) {
  return {
    nueva: "var(--info)",
    en_revision: "var(--accent)",
    shortlist: "#a855f7",
    entrevista: "var(--warning)",
    entrevista_tecnica: "#22d3ee",
    oferta: "var(--success)",
    rechazada: "var(--danger)",
  }[etapa] || "var(--text-3)";
}

function renderAppCard(a) {
  const score = a.puntaje_total;
  const hasScore = score != null;
  const sentiment = a.sentimiento_compound;
  const sentimentBadge = sentiment != null
    ? `<span style="color:${sentiment > 0.05 ? 'var(--success)' : sentiment < -0.05 ? 'var(--danger)' : 'var(--text-2)'}">${sentiment.toFixed(2)}</span>`
    : "";
  return `
    <div class="app-card ${hasScore ? "" : "no-score"}" draggable="true"
         data-app-id="${a.aplicacion_id}" data-stage="${a.etapa}">
      <div class="app-card-top">
        <div style="flex:1;min-width:0;">
          <div class="name">${escape(a.candidato_nombre || "(sin nombre)")}</div>
          ${a.candidato_email ? `<div class="email">${escape(a.candidato_email)}</div>` : ""}
        </div>
        <div class="app-card-score">
          ${hasScore ? gauge(score, { size: "sm", label: "" }) : "n/a"}
        </div>
      </div>
      <div class="meta">
        <span>#${a.aplicacion_id}</span>
        ${sentiment != null ? `<span class="dot"></span>${sentimentBadge}` : ""}
        ${a.notas ? `<span class="dot"></span>📝` : ""}
      </div>
    </div>
  `;
}

function attachKanbanDragDrop(host, vacante, content, costo) {
  let draggedId = null;
  let originStage = null;

  $$(".app-card", host).forEach((card) => {
    card.addEventListener("click", () =>
      navigate("applications/" + card.dataset.appId)
    );
    card.addEventListener("dragstart", (e) => {
      draggedId = card.dataset.appId;
      originStage = card.dataset.stage;
      card.classList.add("dragging");
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", draggedId);
    });
    card.addEventListener("dragend", () => {
      card.classList.remove("dragging");
      $$(".kanban-col", host).forEach((c) => c.classList.remove("drop-active"));
    });
  });

  $$(".kanban-col-body", host).forEach((col) => {
    const stage = col.dataset.drop;
    const colEl = col.parentElement;
    col.addEventListener("dragover", (e) => {
      e.preventDefault();
      colEl.classList.add("drop-active");
    });
    col.addEventListener("dragleave", (e) => {
      // solo quitar si realmente salimos de la columna
      if (!col.contains(e.relatedTarget)) {
        colEl.classList.remove("drop-active");
      }
    });
    col.addEventListener("drop", async (e) => {
      e.preventDefault();
      colEl.classList.remove("drop-active");
      if (!draggedId || stage === originStage) return;
      const id = draggedId;
      draggedId = null;
      try {
        await apiJSON(`/aplicaciones/${id}/etapa`, "PATCH", { etapa: stage });
        toast("success", "Etapa actualizada", `Movido a ${ETAPA_LABEL[stage]}`);
        await reloadPipeline(content, vacante, costo);
      } catch (err) {
        toastError(err, "No se pudo mover");
      }
    });
  });
}

// ============================================================
// Bulk upload de CVs
// ============================================================
async function procesarCVsBulk(files, vacante) {
  const cvs = files.filter((f) => /\.(pdf|docx)$/i.test(f.name));
  if (cvs.length === 0) {
    toast("warning", "Solo PDF o DOCX", "No se detectaron archivos válidos.");
    return;
  }
  const queue = $("#upload-queue");
  if (!queue) {
    toast("info", "Sube los archivos desde la pestaña Pipeline");
    return;
  }
  cvs.forEach((f) => {
    const item = document.createElement("div");
    item.className = "upload-item busy";
    item.dataset.file = f.name;
    item.innerHTML = `
      <span class="spinner"></span>
      <span class="filename">${escape(f.name)}</span>
      <span class="status">subiendo…</span>
    `;
    queue.appendChild(item);
  });

  // Procesa secuencial para no sobrecargar el LLM local
  for (const f of cvs) {
    const item = queue.querySelector(`[data-file="${cssEscape(f.name)}"]`);
    try {
      const fd = new FormData();
      fd.append("vacante_id", vacante.id);
      fd.append("cv_file", f);
      const r = await api("/analyses/procesar", { method: "POST", body: fd });
      const score = r.analisis ? r.analisis.puntaje_total : "?";
      const dedupe = r.candidato_creado === false;
      item.classList.remove("busy");
      item.classList.add("ok");
      item.querySelector(".spinner")?.remove();
      item.querySelector(".status").innerHTML =
        `${ICONS.check} score ${score}${dedupe ? " · candidato existente" : " · candidato nuevo"}`;
    } catch (e) {
      item.classList.remove("busy");
      item.classList.add("err");
      item.querySelector(".spinner")?.remove();
      item.querySelector(".status").innerHTML =
        `${ICONS.alert} ${escape(e.detail || e.message || "error")}`;
    }
  }

  // refrescar pipeline cuando termina
  const content = queue.parentElement;
  const costo = await apiGet(`/vacancies/${vacante.id}/costo-total`).catch(() => ({ costo_usd: 0, llamadas_llm: 0 }));
  await reloadPipeline(content, vacante, costo);
}

function cssEscape(s) {
  return String(s).replace(/["\\]/g, "\\$&");
}

async function renderVacRanking(content, v) {
  content.innerHTML = `<div class="empty"><div class="spinner" style="margin:0 auto;"></div></div>`;
  const ranking = await apiGet(`/vacancies/${v.id}/ranking`).catch(() => []);
  if (!ranking.length) {
    content.innerHTML = `<div class="card">${emptyState("Aún no hay candidatos analizados para esta vacante", "Procesa un CV asociado a esta vacante.", "trophy")}</div>`;
    return;
  }
  content.innerHTML = `
    <div class="card" style="padding:0;">
      <table>
        <thead>
          <tr>
            <th>Pos</th><th>Candidato</th><th>Score</th>
            <th>Sentimiento</th><th>Fecha</th><th></th>
          </tr>
        </thead>
        <tbody>
          ${ranking.map((r, i) => `
            <tr class="clickable" data-go="analyses/${r.analisis_id}">
              <td><strong>${i + 1}</strong></td>
              <td><strong>${escape(r.nombre)}</strong> <span class="muted text-xs">#${r.candidato_id}</span></td>
              <td>
                <div class="flex items-center gap-sm">
                  ${gauge(r.puntaje_total, { size: "sm" })}
                </div>
              </td>
              <td>${r.sentimiento_compound != null
                ? `<span class="badge ${r.sentimiento_compound > 0.05 ? 'success' : r.sentimiento_compound < -0.05 ? 'danger' : ''}">${r.sentimiento_compound.toFixed(2)}</span>`
                : '<span class="muted">—</span>'}</td>
              <td class="text-xs muted">${fmtDate(r.analizado_en)}</td>
              <td class="text-right">${ICONS.arrow_right}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
  $$("[data-go]", content).forEach((r) =>
    r.addEventListener("click", () => navigate(r.dataset.go))
  );
}

function renderVacWeights(content, v) {
  const p = v.pesos_json || {
    match_skills_obligatorios: 0.35,
    match_skills_deseables: 0.15,
    experiencia: 0.20,
    educacion: 0.10,
    soft_skills: 0.15,
    sentimiento: 0.05,
  };
  const isCustom = !!v.pesos_json;

  content.innerHTML = `
    <div class="card">
      <div class="card-header">
        <h3>Pesos de scoring</h3>
        ${isCustom
          ? '<span class="badge accent">custom</span>'
          : '<span class="badge">usando default</span>'}
      </div>
      <p class="text-sm muted" style="margin:0 0 16px;">
        Las dimensiones se ponderan al calcular el puntaje 0-100. Deben sumar ~1.0.
      </p>

      <div class="grid grid-3">
        ${weightInput("p-obl", "Skills obligatorios", p.match_skills_obligatorios)}
        ${weightInput("p-des", "Skills deseables", p.match_skills_deseables)}
        ${weightInput("p-exp", "Experiencia", p.experiencia)}
        ${weightInput("p-edu", "Educación", p.educacion)}
        ${weightInput("p-soft", "Soft skills", p.soft_skills)}
        ${weightInput("p-sent", "Sentimiento", p.sentimiento)}
      </div>

      <div class="alert info" id="sum-alert">${ICONS.info}<div>
        <strong>Suma actual: <span id="weight-sum">1.00</span></strong>
        <span class="text-xs"> · debe estar entre 0.95 y 1.05</span>
      </div></div>

      <div class="btn-group" style="margin-top:16px;">
        <button class="btn" id="btn-save-weights">Guardar pesos custom</button>
        ${isCustom ? '<button class="btn btn-danger" id="btn-reset-weights">' + ICONS.trash + ' Restablecer al default</button>' : ''}
      </div>
    </div>
  `;

  const sumWeights = () => {
    const sum = ["p-obl", "p-des", "p-exp", "p-edu", "p-soft", "p-sent"]
      .reduce((a, id) => a + parseFloat($("#" + id, content).value || 0), 0);
    $("#weight-sum", content).textContent = sum.toFixed(2);
    const alert = $("#sum-alert", content);
    alert.classList.remove("info", "warning", "success", "danger");
    if (sum >= 0.95 && sum <= 1.05) alert.classList.add("success");
    else alert.classList.add("warning");
  };

  $$("input[type=number]", content).forEach((i) =>
    i.addEventListener("input", sumWeights)
  );
  sumWeights();

  $("#btn-save-weights", content).addEventListener("click", async (ev) => {
    const body = {
      match_skills_obligatorios: parseFloat($("#p-obl", content).value),
      match_skills_deseables: parseFloat($("#p-des", content).value),
      experiencia: parseFloat($("#p-exp", content).value),
      educacion: parseFloat($("#p-edu", content).value),
      soft_skills: parseFloat($("#p-soft", content).value),
      sentimiento: parseFloat($("#p-sent", content).value),
    };
    ev.target.disabled = true;
    try {
      await apiJSON(`/vacancies/${v.id}/pesos`, "PUT", body);
      toast("success", "Pesos guardados", `Vacante #${v.id} ahora usa pesos custom`);
      router();
    } catch (e) {
      toastError(e, "No se pudieron guardar");
      ev.target.disabled = false;
    }
  });

  const resetBtn = $("#btn-reset-weights", content);
  if (resetBtn) {
    resetBtn.addEventListener("click", () =>
      confirmModal(
        "Restablecer pesos",
        "¿Volver a usar los pesos default del sistema? Esta acción se aplica solo a esta vacante.",
        async () => {
          try {
            await apiDelete(`/vacancies/${v.id}/pesos`);
            toast("success", "Pesos restablecidos");
            router();
          } catch (e) { toastError(e); }
        }
      )
    );
  }
}

function weightInput(id, label, val) {
  return `
    <div class="field">
      <label>${escape(label)}</label>
      <input id="${id}" type="number" step="0.05" min="0" max="1" value="${val}" />
    </div>
  `;
}

function renderVacRequirements(content, v) {
  content.innerHTML = `
    <div class="card">
      <div class="card-header">
        <h3>Requisitos de la vacante</h3>
        <span class="subtitle">${v.requisitos_texto ? v.requisitos_texto.length + " caracteres" : "vacíos"}</span>
      </div>
      <p class="text-sm muted" style="margin:0 0 12px;">
        Texto que el LLM extrae para poblar skills, experiencia mínima y educación.
        Modificarlo invalida el cache y se re-extraerá en el siguiente análisis.
      </p>
      <textarea id="req-text" rows="14" placeholder="Pega o escribe los requisitos aquí...">${escape(v.requisitos_texto || "")}</textarea>
      <div style="margin-top:12px;">
        <button class="btn" id="btn-save-req">Guardar requisitos</button>
      </div>
    </div>
  `;
  $("#btn-save-req", content).addEventListener("click", async (ev) => {
    const txt = $("#req-text", content).value.trim();
    if (!txt) {
      toast("warning", "Texto vacío", "Agrega al menos algún contenido.");
      return;
    }
    ev.target.disabled = true;
    try {
      await apiJSON(`/vacancies/${v.id}/requisitos`, "PUT", { requisitos_texto: txt });
      toast("success", "Requisitos actualizados");
      router();
    } catch (e) {
      toastError(e);
      ev.target.disabled = false;
    }
  });
}

async function renderVacGuide(content, v) {
  content.innerHTML = `<div class="empty"><div class="spinner" style="margin:0 auto;"></div></div>`;
  let guia = null;
  try {
    guia = await apiGet(`/vacancies/${v.id}/guia-entrevista`);
  } catch (e) {
    if (e.status !== 404) {
      content.innerHTML = `<div class="alert danger">${ICONS.alert}<div>${escape(e.detail || e.message)}</div></div>`;
      return;
    }
  }

  if (!guia) {
    const tieneReqs = !!(v.requisitos_texto && v.requisitos_texto.trim());
    content.innerHTML = `
      <div class="card">
        ${emptyState(
          tieneReqs
            ? "Aún no se ha generado la guía de entrevista"
            : "Esta vacante no tiene requisitos definidos",
          tieneReqs
            ? "La IA propondrá preguntas técnicas, criterios de evaluación y señales de alerta basándose en los requisitos."
            : "Agrega requisitos en la pestaña Requisitos antes de generar la guía.",
          "info"
        )}
        ${tieneReqs ? `<div style="text-align:center;"><button class="btn" id="btn-gen-guia">${ICONS.refresh} Generar guía con IA</button></div>` : ""}
      </div>
    `;
    if (tieneReqs) {
      $("#btn-gen-guia", content).addEventListener("click", async (ev) => {
        ev.target.disabled = true;
        ev.target.innerHTML = `<span class="spinner"></span> Generando…`;
        try {
          await apiJSON(`/vacancies/${v.id}/guia-entrevista`, "POST");
          toast("success", "Guía generada");
          await renderVacGuide(content, v);
        } catch (err) {
          toastError(err, "No se pudo generar");
          ev.target.disabled = false;
          ev.target.innerHTML = `${ICONS.refresh} Generar guía con IA`;
        }
      });
    }
    return;
  }

  // Tiene guía: mostrarla
  const preguntasPorTipo = { tecnica: [], comportamiento: [], situacional: [] };
  (guia.preguntas || []).forEach((p) => {
    const tipo = (p.tipo || "tecnica").toLowerCase();
    if (preguntasPorTipo[tipo]) preguntasPorTipo[tipo].push(p);
    else preguntasPorTipo.tecnica.push(p);
  });

  const renderQ = (p) => `
    <div class="guide-question tipo-${escape((p.tipo || "tecnica").toLowerCase())}">
      <div class="text">${escape(p.pregunta)}</div>
      <div class="meta">
        <span class="tag tipo">${escape(p.tipo || "técnica")}</span>
        ${p.skill_relacionada ? `<span class="tag">${escape(p.skill_relacionada)}</span>` : ""}
      </div>
      ${p.objetivo ? `<div class="objetivo">↳ ${escape(p.objetivo)}</div>` : ""}
    </div>
  `;

  content.innerHTML = `
    <div class="card">
      <div class="card-header">
        <h3>Guía de entrevista</h3>
        <span class="subtitle text-xs">Generada ${fmtDate(guia.generada_en)} · ${guia.preguntas.length} preguntas</span>
      </div>
      <div class="btn-group" style="margin-bottom:14px;">
        <button class="btn btn-secondary btn-sm" id="btn-regen">${ICONS.refresh} Regenerar</button>
        <button class="btn btn-danger btn-sm" id="btn-del-guia">${ICONS.trash} Eliminar</button>
        <button class="btn btn-ghost btn-sm" id="btn-copy-guia">📋 Copiar como texto</button>
      </div>

      ${["tecnica", "comportamiento", "situacional"].map((tipo) => {
        const lista = preguntasPorTipo[tipo];
        if (!lista.length) return "";
        const titulo = { tecnica: "Preguntas técnicas", comportamiento: "Preguntas de comportamiento (STAR)", situacional: "Preguntas situacionales" }[tipo];
        return `
          <h4 style="margin:18px 0 10px;font-size:13px;color:var(--text-2);text-transform:uppercase;letter-spacing:0.05em;">${titulo} (${lista.length})</h4>
          ${lista.map(renderQ).join("")}
        `;
      }).join("")}

      ${guia.criterios_evaluacion && guia.criterios_evaluacion.length > 0 ? `
        <h4 style="margin:18px 0 10px;font-size:13px;color:var(--success);text-transform:uppercase;letter-spacing:0.05em;">Criterios de evaluación</h4>
        <ul class="criterion-list">${guia.criterios_evaluacion.map((c) => `<li>${escape(c)}</li>`).join("")}</ul>
      ` : ""}

      ${guia.senales_de_alerta && guia.senales_de_alerta.length > 0 ? `
        <h4 style="margin:18px 0 10px;font-size:13px;color:var(--danger);text-transform:uppercase;letter-spacing:0.05em;">Señales de alerta</h4>
        <ul class="signal-list">${guia.senales_de_alerta.map((s) => `<li>⚠ ${escape(s)}</li>`).join("")}</ul>
      ` : ""}
    </div>
  `;

  $("#btn-regen", content).addEventListener("click", async (ev) => {
    if (!confirm("¿Regenerar la guía? Reemplazará la versión actual.")) return;
    ev.target.disabled = true;
    try {
      await apiJSON(`/vacancies/${v.id}/guia-entrevista`, "POST");
      toast("success", "Guía regenerada");
      await renderVacGuide(content, v);
    } catch (err) {
      toastError(err);
      ev.target.disabled = false;
    }
  });

  $("#btn-del-guia", content).addEventListener("click", async () => {
    if (!confirm("¿Eliminar la guía?")) return;
    try {
      await apiDelete(`/vacancies/${v.id}/guia-entrevista`);
      toast("success", "Guía eliminada");
      await renderVacGuide(content, v);
    } catch (err) { toastError(err); }
  });

  $("#btn-copy-guia", content).addEventListener("click", () => {
    const text = formatGuideAsText(v.titulo, guia);
    navigator.clipboard.writeText(text).then(
      () => toast("success", "Copiado al portapapeles"),
      () => toast("danger", "No se pudo copiar")
    );
  });
}

function formatGuideAsText(titulo, guia) {
  const lines = [`Guía de entrevista — ${titulo}`, "=".repeat(40), ""];
  guia.preguntas.forEach((p, i) => {
    lines.push(`${i + 1}. [${p.tipo || "técnica"}] ${p.pregunta}`);
    if (p.skill_relacionada) lines.push(`   skill: ${p.skill_relacionada}`);
    if (p.objetivo) lines.push(`   objetivo: ${p.objetivo}`);
    lines.push("");
  });
  if (guia.criterios_evaluacion?.length) {
    lines.push("CRITERIOS DE EVALUACIÓN");
    guia.criterios_evaluacion.forEach((c) => lines.push(` · ${c}`));
    lines.push("");
  }
  if (guia.senales_de_alerta?.length) {
    lines.push("SEÑALES DE ALERTA");
    guia.senales_de_alerta.forEach((s) => lines.push(` ⚠ ${s}`));
  }
  return lines.join("\n");
}

function renderVacCosts(content, v, costo) {
  content.innerHTML = `
    <div class="grid grid-2">
      ${kpi("Costo LLM total", fmtUSD(costo.costo_usd || 0), "dollar")}
      ${kpi("Llamadas LLM", fmtNum(costo.llamadas_llm || 0), "chart")}
    </div>
    <div class="alert info" style="margin-top:var(--gap);">${ICONS.info}
      <div>
        <strong>Cómo se calcula</strong>
        <p style="margin:4px 0 0;font-size:12.5px;">Cada análisis registra cada llamada al LLM (extract_cv, extract_requisitos, evaluate_soft_skills) con tokens input/output, cache reads y latencia. El total agrega todos los análisis asociados a esta vacante.</p>
      </div>
    </div>
  `;
}

// ============================================================
// VISTA: Candidatos
// ============================================================
async function viewCandidates(view) {
  view.innerHTML = `
    <div class="view-header">
      <div>
        <h2>Candidatos</h2>
        <p>Personas evaluadas en el sistema.</p>
      </div>
      <div class="view-actions">
        <button class="btn" id="btn-new">${ICONS.plus} Nuevo candidato</button>
      </div>
    </div>

    <div class="card">
      <div class="field">
        <label>Buscar por nombre</label>
        <div style="position:relative;">
          <input id="search" placeholder="Escribe para filtrar…" style="padding-left:36px;" />
          <div style="position:absolute;left:12px;top:9px;width:14px;height:14px;color:var(--text-3);">${ICONS.search}</div>
        </div>
      </div>
    </div>

    <div class="card" id="cand-table" style="padding:0;margin-top:var(--gap);">
      <div class="empty"><div class="spinner" style="margin:0 auto;"></div></div>
    </div>
  `;

  const renderTable = async (q = "") => {
    const list = await apiGet(q ? `/candidates/?nombre=${encodeURIComponent(q)}` : "/candidates/");
    const t = $("#cand-table", view);
    if (!list.length) {
      t.innerHTML = emptyState("Sin candidatos", q ? "Ningún candidato coincide con la búsqueda." : "Crea el primer candidato.");
      return;
    }
    t.innerHTML = `
      <table>
        <thead><tr><th>ID</th><th>Nombre</th><th>Acciones</th></tr></thead>
        <tbody>
          ${list.map((c) => `
            <tr>
              <td><span class="muted">#${c.id}</span></td>
              <td><strong>${escape(c.nombre)}</strong></td>
              <td>
                <span class="muted text-xs">Para subir un CV, abre la vacante donde quieres evaluarlo.</span>
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    `;
  };

  let timeout;
  $("#search", view).addEventListener("input", (e) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => renderTable(e.target.value.trim()), 250);
  });

  $("#btn-new", view).addEventListener("click", () => {
    const m = modal({
      title: "Nuevo candidato",
      body: `
        <div class="field">
          <label>Nombre completo</label>
          <input id="m-cand-nombre" placeholder="Ej. Ana García López" />
        </div>
      `,
      footer: `
        <button class="btn btn-secondary" data-close>Cancelar</button>
        <button class="btn" data-save>${ICONS.plus} Crear</button>
      `,
    });
    $("[data-save]", m.root).addEventListener("click", async (ev) => {
      const nombre = $("#m-cand-nombre", m.root).value.trim();
      if (!nombre) return toast("warning", "Falta el nombre");
      ev.target.disabled = true;
      try {
        const c = await apiJSON("/candidates/", "POST", { nombre });
        toast("success", "Candidato creado", `#${c.id} · ${c.nombre}`);
        m.close();
        renderTable();
      } catch (e) { toastError(e); ev.target.disabled = false; }
    });
  });

  await renderTable();
}

// ============================================================
// VISTA: Análisis (lista)
// ============================================================
async function viewAnalysesList(view) {
  const [analisis, vacantes, candidatos] = await Promise.all([
    apiGet("/analyses/?limit=100"),
    apiGet("/vacancies/").catch(() => []),
    apiGet("/candidates/").catch(() => []),
  ]);

  const vMap = Object.fromEntries(vacantes.map((v) => [v.id, v]));
  const cMap = Object.fromEntries(candidatos.map((c) => [c.id, c]));

  view.innerHTML = `
    <div class="view-header">
      <div>
        <h2>Análisis</h2>
        <p>Historial completo de evaluaciones procesadas.</p>
      </div>
      <div class="view-actions">
        <button class="btn" id="btn-new">${ICONS.upload} Nuevo análisis</button>
      </div>
    </div>

    <div class="card" style="padding:0;">
      ${analisis.length === 0
        ? emptyState("Aún no hay análisis", "Procesa el primer CV para empezar.", "chart")
        : `<table>
            <thead><tr>
              <th>#</th><th>Score</th><th>Candidato</th>
              <th>Vacante</th><th>Sentimiento</th><th>Fecha</th><th></th>
            </tr></thead>
            <tbody>
              ${analisis.map((a) => {
                const v = vMap[a.vacante_id];
                const c = cMap[a.candidato_id];
                return `
                  <tr class="clickable" data-go="analyses/${a.id}">
                    <td><span class="muted">#${a.id}</span></td>
                    <td><strong style="color:${scoreColor(a.puntaje_total)}">${a.puntaje_total}</strong></td>
                    <td>${c ? escape(c.nombre) : `<span class="muted">#${a.candidato_id}</span>`}</td>
                    <td>${v ? escape(v.titulo) : `<span class="muted">#${a.vacante_id}</span>`}</td>
                    <td>${a.sentimiento_compound != null
                      ? `<span class="badge ${a.sentimiento_compound > 0.05 ? 'success' : a.sentimiento_compound < -0.05 ? 'danger' : ''}">${a.sentimiento_compound.toFixed(2)}</span>`
                      : '<span class="muted">—</span>'}</td>
                    <td class="text-xs muted">${fmtDate(a.analizado_en)}</td>
                    <td class="text-right">${ICONS.arrow_right}</td>
                  </tr>
                `;
              }).join("")}
            </tbody>
          </table>`
      }
    </div>
  `;
  $("#btn-new", view).addEventListener("click", () => navigate("vacancies"));
  $$("[data-go]", view).forEach((r) =>
    r.addEventListener("click", () => navigate(r.dataset.go))
  );
}

// ============================================================
// VISTA: Análisis detalle
// ============================================================
async function viewAnalysisDetail(view, params) {
  const id = parseInt(params.id, 10);
  const [explicacion, costo] = await Promise.all([
    apiGet(`/analyses/${id}/explicacion`),
    apiGet(`/analyses/${id}/costo`).catch(() => null),
  ]);
  const x = explicacion;

  view.innerHTML = `
    <div class="view-header">
      <div>
        <a class="btn btn-ghost btn-sm" href="#/analyses">${ICONS.back} Análisis</a>
        <h2 style="margin-top:8px;">Análisis #${x.analisis_id}</h2>
      </div>
    </div>

    <div class="score-hero">
      ${gauge(x.puntaje_total)}
      <div>
        <div class="meta-grid">
          <div class="meta-cell">
            <div class="lbl">Sentimiento</div>
            <div class="val">${x.sentimiento_compound != null ? x.sentimiento_compound.toFixed(2) : "—"}</div>
          </div>
          <div class="meta-cell">
            <div class="lbl">Skills cubiertos</div>
            <div class="val">${(x.skills_match || []).length}</div>
          </div>
          <div class="meta-cell">
            <div class="lbl">Skills faltantes</div>
            <div class="val" style="color:${x.skills_faltantes && x.skills_faltantes.length > 0 ? 'var(--danger)' : 'var(--text-0)'};">${(x.skills_faltantes || []).length}</div>
          </div>
          <div class="meta-cell">
            <div class="lbl">Costo LLM</div>
            <div class="val">${costo ? fmtUSD(costo.costo_usd_total) : "—"}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-2" style="margin-top:var(--gap);align-items:start;">
      <div>
        <div class="card">
          <div class="card-header"><h3>Desglose por dimensión</h3></div>
          ${(x.desglose || []).map((d) => `
            <div class="bar-row">
              <div class="lbl">${escape(d.categoria.replace(/_/g, " "))}</div>
              <div class="bar-track">
                <div class="bar-fill" style="width:${d.puntaje}%;background:${scoreColor(d.puntaje)};"></div>
              </div>
              <div class="pct">${d.puntaje}</div>
              <div class="weight">${d.peso != null ? "×" + d.peso.toFixed(2) : "—"}</div>
            </div>
          `).join("")}
        </div>

        <div class="card">
          <div class="card-header">
            <h3>Skills</h3>
            <span class="subtitle">${(x.skills_match || []).length} / ${(x.skills_match || []).length + (x.skills_faltantes || []).length}</span>
          </div>
          <div style="margin-bottom:14px;">
            <div class="text-xs muted" style="margin-bottom:6px;">Cubiertos</div>
            <div class="chip-list">
              ${(x.skills_match || []).length === 0
                ? '<span class="muted text-sm">— ninguno —</span>'
                : x.skills_match.map((s) => `<span class="chip match">${ICONS.check} ${escape(s)}</span>`).join("")}
            </div>
          </div>
          <div>
            <div class="text-xs muted" style="margin-bottom:6px;">Faltantes</div>
            <div class="chip-list">
              ${(x.skills_faltantes || []).length === 0
                ? '<span class="muted text-sm">— ninguno —</span>'
                : x.skills_faltantes.map((s) => `<span class="chip miss">${escape(s)}</span>`).join("")}
            </div>
          </div>
        </div>
      </div>

      <div>
        ${renderSoftSkills(x.soft_skills)}
        ${costo ? renderCostCard(costo) : ""}
      </div>
    </div>

    <div class="card" style="margin-top:var(--gap);">
      <div class="card-header"><h3>Información estructurada (LLM)</h3></div>
      <div class="grid grid-2">
        <details>
          <summary>Ver CV estructurado</summary>
          <pre>${escape(JSON.stringify(x.cv_estructurado || {}, null, 2))}</pre>
        </details>
        <details>
          <summary>Ver requisitos extraídos</summary>
          <pre>${escape(JSON.stringify(x.requisitos || {}, null, 2))}</pre>
        </details>
      </div>
      <details style="margin-top:12px;">
        <summary>Ver respuesta JSON completa</summary>
        <pre>${escape(JSON.stringify(x, null, 2))}</pre>
      </details>
    </div>

    <p class="disclaimer">${escape(x.disclaimer)}</p>
  `;
}

function renderSoftSkills(soft) {
  if (!soft) {
    return `
      <div class="card">
        <div class="card-header"><h3>Soft skills</h3></div>
        ${emptyState("No hubo entrevista en audio", "Las soft skills se evalúan al subir un audio de entrevista.", "audio")}
      </div>
    `;
  }
  const dims = ["comunicacion", "resolucion_problemas", "trabajo_equipo"];
  return `
    <div class="card">
      <div class="card-header">
        <h3>Soft skills (evidencias)</h3>
        ${soft.score_global != null
          ? `<span class="badge accent">Global: ${soft.score_global}</span>`
          : ""}
      </div>
      ${dims.map((d) => {
        const dim = soft[d];
        if (!dim) return "";
        const ev = dim.evidencias || dim.evidence || [];
        return `
          <div style="margin-bottom:14px;">
            <div class="flex items-center justify-between" style="margin-bottom:6px;">
              <strong style="text-transform:capitalize;font-size:13.5px;">${escape(d.replace(/_/g, " "))}</strong>
              <span class="badge ${dim.puntaje >= 70 ? 'success' : dim.puntaje >= 50 ? 'info' : 'warning'}">${dim.puntaje}/100</span>
            </div>
            ${dim.justificacion ? `<p class="text-sm muted" style="margin:0 0 6px;">${escape(dim.justificacion)}</p>` : ""}
            ${ev.length ? `<ul class="evidence-list">${ev.map(e => `<li>${escape(e)}</li>`).join("")}</ul>` : ""}
          </div>
        `;
      }).join("")}
    </div>
  `;
}

function renderCostCard(costo) {
  return `
    <div class="card">
      <div class="card-header">
        <h3>Costo del análisis</h3>
        <span class="badge accent">${fmtUSD(costo.costo_usd_total)}</span>
      </div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Operación</th><th>Modelo</th><th>In</th><th>Out</th><th>Latencia</th><th>USD</th></tr></thead>
          <tbody>
            ${costo.llamadas.map((l) => `
              <tr>
                <td>${escape(l.operacion || "?")}</td>
                <td class="text-xs muted">${escape(l.provider || "?")}/${escape(truncate(l.model || "?", 14))}</td>
                <td class="num">${fmtNum(l.tokens_input)}</td>
                <td class="num">${fmtNum(l.tokens_output)}</td>
                <td class="num text-xs">${l.duracion_ms.toFixed(0)} ms</td>
                <td class="num">${fmtUSD(l.costo_usd)}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// ============================================================
// VISTA: Detalle de aplicación (candidato dentro de vacante)
// ============================================================
async function viewApplicationDetail(view, params) {
  const id = parseInt(params.id, 10);
  const aplicacion = await apiGet(`/aplicaciones/${id}`);
  const [vacante, candidato] = await Promise.all([
    apiGet(`/vacancies/${aplicacion.vacante_id}`),
    apiGet(`/candidates/${aplicacion.candidato_id}`),
  ]);

  // Buscar el último análisis de esta aplicación dentro del listado de la vacante
  const lista = await apiGet(`/vacancies/${aplicacion.vacante_id}/aplicaciones`);
  const fila = lista.find((a) => a.aplicacion_id === id);
  const analisisId = fila ? fila.ultimo_analisis_id : null;

  let explicacion = null;
  let costo = null;
  if (analisisId) {
    [explicacion, costo] = await Promise.all([
      apiGet(`/analyses/${analisisId}/explicacion`).catch(() => null),
      apiGet(`/analyses/${analisisId}/costo`).catch(() => null),
    ]);
  }

  view.innerHTML = `
    <div class="view-header">
      <div>
        <a class="btn btn-ghost btn-sm" href="#/vacancies/${aplicacion.vacante_id}">${ICONS.back} ${escape(vacante.titulo)}</a>
        <h2 style="margin-top:8px;">${escape(candidato.nombre)}</h2>
        <div class="contact-row">
          ${candidato.email ? `<span class="pill">@ ${escape(candidato.email)}</span>` : ""}
          ${candidato.telefono ? `<span class="pill">☎ ${escape(candidato.telefono)}</span>` : ""}
          <span class="pill">Aplicación #${aplicacion.id}</span>
        </div>
      </div>
      <div class="view-actions" style="display:flex;flex-direction:column;align-items:flex-end;gap:8px;">
        <select id="stage-select" class="stage-select">
          ${ETAPAS.map((e) => `<option value="${e}" ${e === aplicacion.etapa ? "selected" : ""}>${escape(ETAPA_LABEL[e] || e)}</option>`).join("")}
        </select>
        <span class="text-xs muted">Etapa del pipeline</span>
      </div>
    </div>

    ${explicacion ? renderApplicationDetailScore(explicacion, costo, id) : `
      <div class="card">${emptyState("Aún no se ha procesado un CV para esta aplicación", "Sube el CV en el Pipeline de la vacante para generar el score.", "chart")}</div>
    `}

    <div class="card" style="margin-top:var(--gap);">
      <div class="card-header">
        <h3>Notas del reclutador</h3>
        <span class="subtitle text-xs">privadas, no se comparten con el candidato</span>
      </div>
      <textarea id="apl-notas" rows="4" placeholder="Agrega tus observaciones internas…">${escape(aplicacion.notas || "")}</textarea>
      <div style="margin-top:8px;">
        <button class="btn btn-secondary btn-sm" id="btn-save-notas">Guardar notas</button>
      </div>
    </div>

    <p class="disclaimer">${escape(explicacion ? explicacion.disclaimer : "Este puntaje es asistencia a la decisión, no decisión final. Toda contratación debe involucrar revisión humana.")}</p>
  `;

  $("#stage-select", view).addEventListener("change", async (e) => {
    try {
      await apiJSON(`/aplicaciones/${id}/etapa`, "PATCH", { etapa: e.target.value });
      toast("success", "Etapa actualizada", ETAPA_LABEL[e.target.value]);
    } catch (err) {
      toastError(err);
      e.target.value = aplicacion.etapa;
    }
  });

  $("#btn-save-notas", view).addEventListener("click", async (ev) => {
    ev.target.disabled = true;
    try {
      await apiJSON(`/aplicaciones/${id}/notas`, "PATCH", {
        notas: $("#apl-notas", view).value.trim() || null,
      });
      toast("success", "Notas guardadas");
    } catch (err) { toastError(err); }
    finally { ev.target.disabled = false; }
  });

  // Botones de preguntas-cv (regenerar + copiar). Solo existen si hay análisis.
  const btnRegen = $("#btn-regen-qcv", view);
  if (btnRegen && analisisId) {
    btnRegen.addEventListener("click", async (ev) => {
      ev.target.disabled = true;
      const original = ev.target.innerHTML;
      ev.target.innerHTML = `<span class="spinner"></span> Generando…`;
      try {
        await apiJSON(`/analyses/${analisisId}/preguntas-cv`, "POST");
        toast("success", "Preguntas regeneradas");
        router(); // recarga la vista para refrescar
      } catch (err) {
        toastError(err, "No se pudieron generar");
        ev.target.disabled = false;
        ev.target.innerHTML = original;
      }
    });
  }
  const btnCopy = $("#btn-copy-qcv", view);
  if (btnCopy && explicacion?.preguntas_cv) {
    btnCopy.addEventListener("click", () => {
      const lines = [
        `Preguntas adaptadas — ${candidato.nombre} → ${vacante.titulo}`,
        "=".repeat(40),
        "",
      ];
      explicacion.preguntas_cv.forEach((p, i) => {
        lines.push(`${i + 1}. [${p.tipo || "técnica"}] ${p.pregunta}`);
        if (p.skill_relacionada) lines.push(`   skill: ${p.skill_relacionada}`);
        if (p.objetivo) lines.push(`   objetivo: ${p.objetivo}`);
        lines.push("");
      });
      navigator.clipboard.writeText(lines.join("\n")).then(
        () => toast("success", "Copiado al portapapeles"),
        () => toast("danger", "No se pudo copiar")
      );
    });
  }

  // Audio upload → evaluación de entrevista
  const audioInput = $("#audio-input", view);
  if (audioInput) {
    audioInput.addEventListener("change", async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const statusEl = $("#audio-upload-status", view);
      if (statusEl) statusEl.innerHTML = `<div class="text-sm" style="margin:8px 0;display:flex;align-items:center;gap:8px;"><span class="spinner"></span> Transcribiendo y evaluando… puede tomar varios minutos.</div>`;
      const form = new FormData();
      form.append("audio_file", file);
      try {
        const resp = await fetch(`/aplicaciones/${id}/audio`, { method: "POST", body: form });
        if (!resp.ok) {
          const err = await resp.json().catch(() => ({ detail: resp.statusText }));
          throw err;
        }
        toast("success", "Evaluación completada", "Recargando…");
        setTimeout(() => router(), 600);
      } catch (err) {
        if (statusEl) statusEl.innerHTML = "";
        toastError(err, "Error al procesar el audio");
      }
    });
  }
}

function renderApplicationDetailScore(x, costo, aplicacionId) {
  return `
    <div class="score-hero">
      ${gauge(x.puntaje_total)}
      <div>
        <div class="meta-grid">
          <div class="meta-cell">
            <div class="lbl">Sentimiento</div>
            <div class="val">${x.sentimiento_compound != null ? x.sentimiento_compound.toFixed(2) : "—"}</div>
          </div>
          <div class="meta-cell">
            <div class="lbl">Skills cubiertos</div>
            <div class="val">${(x.skills_match || []).length}</div>
          </div>
          <div class="meta-cell">
            <div class="lbl">Skills faltantes</div>
            <div class="val" style="color:${x.skills_faltantes && x.skills_faltantes.length > 0 ? 'var(--danger)' : 'var(--text-0)'};">${(x.skills_faltantes || []).length}</div>
          </div>
          <div class="meta-cell">
            <div class="lbl">Costo LLM</div>
            <div class="val">${costo ? fmtUSD(costo.costo_usd_total) : "—"}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-2" style="margin-top:var(--gap);align-items:start;">
      <div>
        <div class="card">
          <div class="card-header"><h3>Desglose por dimensión</h3></div>
          ${(x.desglose || []).map((d) => `
            <div class="bar-row">
              <div class="lbl">${escape(d.categoria.replace(/_/g, " "))}</div>
              <div class="bar-track">
                <div class="bar-fill" style="width:${d.puntaje}%;background:${scoreColor(d.puntaje)};"></div>
              </div>
              <div class="pct">${d.puntaje}</div>
              <div class="weight">${d.peso != null ? "×" + d.peso.toFixed(2) : "—"}</div>
            </div>
          `).join("")}
        </div>

        <div class="card">
          <div class="card-header">
            <h3>Skills</h3>
            <span class="subtitle">${(x.skills_match || []).length} / ${(x.skills_match || []).length + (x.skills_faltantes || []).length}</span>
          </div>
          <div style="margin-bottom:14px;">
            <div class="text-xs muted" style="margin-bottom:6px;">Cubiertos</div>
            <div class="chip-list">
              ${(x.skills_match || []).length === 0
                ? '<span class="muted text-sm">— ninguno —</span>'
                : x.skills_match.map((s) => `<span class="chip match">${ICONS.check} ${escape(s)}</span>`).join("")}
            </div>
          </div>
          <div>
            <div class="text-xs muted" style="margin-bottom:6px;">Faltantes</div>
            <div class="chip-list">
              ${(x.skills_faltantes || []).length === 0
                ? '<span class="muted text-sm">— ninguno —</span>'
                : x.skills_faltantes.map((s) => `<span class="chip miss">${escape(s)}</span>`).join("")}
            </div>
          </div>
        </div>
      </div>

      <div>
        ${renderSoftSkills(x.soft_skills)}
        ${costo ? renderCostCard(costo) : ""}
      </div>
    </div>

    <div class="card" style="margin-top:var(--gap);">
      <div class="card-header"><h3>CV estructurado</h3></div>
      ${renderCVSummary(x.cv_estructurado)}
    </div>

    ${renderPreguntasCVCard(x)}

    ${renderEntrevistaCard(x, aplicacionId)}
  `;
}

function renderEntrevistaCard(x, aplicacionId) {
  const ev = x.evaluacion_entrevista;
  const dims = ev
    ? [
        { key: "cobertura", label: "Cobertura de temas", icon: "📋" },
        { key: "consistencia", label: "Consistencia con CV", icon: "🔍" },
        { key: "profundidad", label: "Profundidad técnica", icon: "⚡" },
      ].map(({ key, label, icon }) => {
        const d = ev[key] || {};
        const pct = Math.round(d.puntaje || 0);
        const evids = (d.evidencias || []).slice(0, 3);
        return `
          <div class="bar-row" style="align-items:flex-start;flex-direction:column;gap:4px;margin-bottom:12px;">
            <div style="display:flex;justify-content:space-between;width:100%;align-items:center;">
              <div class="lbl">${icon} ${label}</div>
              <div class="pct" style="font-weight:700;color:${scoreColor(pct)};">${pct}</div>
            </div>
            <div class="bar-track" style="width:100%;">
              <div class="bar-fill" style="width:${pct}%;background:${scoreColor(pct)};"></div>
            </div>
            ${d.justificacion ? `<div class="text-xs muted" style="margin-top:2px;">${escape(d.justificacion)}</div>` : ""}
            ${evids.length > 0 ? `
              <div style="margin-top:4px;display:flex;flex-direction:column;gap:3px;">
                ${evids.map((e) => `<div class="text-xs" style="padding:3px 8px;background:var(--surface-2);border-radius:4px;font-style:italic;">"${escape(e)}"</div>`).join("")}
              </div>
            ` : ""}
          </div>
        `;
      }).join("")
    : null;

  const puntajeTotal = ev
    ? Math.round((((ev.cobertura || {}).puntaje || 0) + ((ev.consistencia || {}).puntaje || 0) + ((ev.profundidad || {}).puntaje || 0)) / 3)
    : null;

  return `
    <div class="card" style="margin-top:var(--gap);" id="entrevista-card">
      <div class="card-header">
        <h3>${ICONS.audio} Evaluación de entrevista</h3>
        <div class="flex gap-sm">
          ${puntajeTotal != null ? `<span class="pill" style="font-weight:700;font-size:14px;color:${scoreColor(puntajeTotal)};">${puntajeTotal} / 100</span>` : ""}
          <label class="btn btn-secondary btn-sm" style="cursor:pointer;">
            ${ICONS.upload} ${ev ? "Nuevo audio" : "Subir audio"}
            <input type="file" id="audio-input" accept=".wav,.mp3,.ogg,.m4a,.flac" style="display:none;" data-apl-id="${aplicacionId}">
          </label>
        </div>
      </div>
      <div id="audio-upload-status"></div>
      ${ev ? `
        ${ev.resumen_ejecutivo ? `<p class="text-sm" style="margin:0 0 16px;padding:10px;background:var(--surface-2);border-radius:6px;">${escape(ev.resumen_ejecutivo)}</p>` : ""}
        ${dims}
      ` : `
        <p class="text-sm muted" style="margin:0 0 6px;">
          Sube el audio de la entrevista para evaluar automáticamente:
          <strong>cobertura de temas requeridos</strong>, <strong>consistencia con el CV</strong> y <strong>profundidad técnica</strong> de las respuestas.
        </p>
        <div class="text-xs muted">.wav · .mp3 · .ogg · .m4a · .flac</div>
      `}
    </div>
  `;
}

function renderPreguntasCVCard(x) {
  const preguntas = x.preguntas_cv;
  const tienePreguntas = Array.isArray(preguntas) && preguntas.length > 0;

  const list = tienePreguntas
    ? preguntas.map((p) => `
        <div class="guide-question tipo-${escape((p.tipo || "tecnica").toLowerCase())}">
          <div class="text">${escape(p.pregunta)}</div>
          <div class="meta">
            <span class="tag tipo">${escape(p.tipo || "técnica")}</span>
            ${p.skill_relacionada ? `<span class="tag">${escape(p.skill_relacionada)}</span>` : ""}
          </div>
          ${p.objetivo ? `<div class="objetivo">↳ ${escape(p.objetivo)}</div>` : ""}
        </div>
      `).join("")
    : `<div class="empty" style="padding:20px 12px;">
        <div class="empty-title">Aún no hay preguntas adaptadas a este CV</div>
        <div class="text-xs">Se generan automáticamente al procesar el CV. Si la generación falló, regénerala.</div>
      </div>`;

  return `
    <div class="card" style="margin-top:var(--gap);" id="qcv-card">
      <div class="card-header">
        <h3>Preguntas adaptadas a este candidato</h3>
        <div class="flex gap-sm">
          <button class="btn btn-secondary btn-sm" id="btn-regen-qcv">${ICONS.refresh} ${tienePreguntas ? "Regenerar" : "Generar"}</button>
          ${tienePreguntas ? `<button class="btn btn-ghost btn-sm" id="btn-copy-qcv">📋 Copiar</button>` : ""}
        </div>
      </div>
      <p class="text-sm muted" style="margin:0 0 14px;">
        Complementan la <strong>guía base</strong> de la vacante con preguntas específicas al CV — proyectos, empresas y pretensiones declaradas. Úsalas en conjunto durante la entrevista.
      </p>
      ${list}
    </div>
  `;
}

function renderCVSummary(cv) {
  if (!cv) return '<div class="empty">Sin CV estructurado.</div>';
  const dp = cv.datos_personales || {};
  const skills = cv.skills || [];
  const exp = cv.experiencia || [];
  const edu = cv.educacion || [];
  const proy = cv.proyectos || [];
  return `
    <div class="grid grid-2">
      <div>
        <div class="text-xs muted" style="margin-bottom:6px;">Resumen</div>
        <p style="margin:0 0 14px;font-size:13px;color:var(--text-1);">${escape(cv.resumen || "—")}</p>

        <div class="text-xs muted" style="margin-bottom:6px;">Skills detectados (${skills.length})</div>
        <div class="chip-list" style="margin-bottom:14px;">
          ${skills.length === 0 ? '<span class="muted text-sm">—</span>' :
            skills.slice(0, 20).map((s) => `<span class="chip">${escape(s.nombre)}${s.años_experiencia ? ` <span class="muted">${s.años_experiencia}y</span>` : ""}</span>`).join("")}
        </div>

        <div class="text-xs muted" style="margin-bottom:6px;">Experiencia total</div>
        <div style="font-size:18px;font-weight:600;color:var(--text-0);">${cv.años_experiencia_total || 0} años</div>
      </div>

      <div>
        <div class="text-xs muted" style="margin-bottom:6px;">Trayectoria laboral (${exp.length})</div>
        ${exp.length === 0 ? '<div class="muted text-sm">—</div>' : exp.slice(0, 5).map((e) => `
          <div style="margin-bottom:10px;padding-left:10px;border-left:2px solid var(--accent);">
            <div style="font-weight:600;font-size:13px;color:var(--text-0);">${escape(e.puesto || "—")}</div>
            <div class="text-sm muted">${escape(e.empresa || "")} · ${escape(e.fecha_inicio || "")} → ${escape(e.fecha_fin || "actual")}</div>
          </div>
        `).join("")}

        <div class="text-xs muted" style="margin:14px 0 6px;">Educación (${edu.length})</div>
        ${edu.length === 0 ? '<div class="muted text-sm">—</div>' : edu.map((e) => `
          <div class="text-sm">${escape(e.titulo || e.nivel || "—")}<span class="muted"> · ${escape(e.institucion || "")}${e.año_fin ? " (" + e.año_fin + ")" : ""}</span></div>
        `).join("")}

        ${proy.length > 0 ? `
          <div class="text-xs muted" style="margin:14px 0 6px;">Proyectos (${proy.length})</div>
          ${proy.slice(0, 3).map((p) => `<div class="text-sm">· ${escape(p.nombre)}</div>`).join("")}
        ` : ""}
      </div>
    </div>
  `;
}

// ============================================================
// VISTA: Configuración / Sistema
// ============================================================
async function viewSettings(view) {
  let health;
  try {
    health = await apiGet("/health");
  } catch (e) {
    health = { status: "error", database: false, llm: { provider: "?", ok: false }, error: e.detail };
  }

  view.innerHTML = `
    <div class="view-header">
      <div>
        <h2>Sistema</h2>
        <p>Estado del backend, proveedor LLM y enlaces de utilidad.</p>
      </div>
      <div class="view-actions">
        <button class="btn btn-secondary" id="btn-refresh">${ICONS.refresh} Refrescar</button>
      </div>
    </div>

    <div class="grid grid-3">
      <div class="card">
        <div class="card-header"><h3>Estado general</h3></div>
        <div class="kpi-value" style="color:${health.status === 'ok' ? 'var(--success)' : 'var(--warning)'};">${escape(health.status || "?")}</div>
        <div class="text-sm muted">Endpoint <code>/health</code></div>
      </div>
      <div class="card">
        <div class="card-header"><h3>Base de datos</h3></div>
        <div class="kpi-value" style="color:${health.database ? 'var(--success)' : 'var(--danger)'};">${health.database ? "Conectada" : "Caída"}</div>
        <div class="text-sm muted">PostgreSQL local</div>
      </div>
      <div class="card">
        <div class="card-header"><h3>Proveedor LLM</h3></div>
        <div class="kpi-value">${escape((health.llm && health.llm.provider) || "?")}</div>
        <div class="text-sm muted">${(health.llm && health.llm.ok) ? "Respondiendo OK" : "No disponible"}</div>
      </div>
    </div>

    <div class="card" style="margin-top:var(--gap);">
      <div class="card-header"><h3>Enlaces</h3></div>
      <div class="grid grid-3">
        <a href="/docs" target="_blank" rel="noopener" class="btn btn-secondary btn-block">📘 Swagger /docs</a>
        <a href="/redoc" target="_blank" rel="noopener" class="btn btn-secondary btn-block">📗 ReDoc /redoc</a>
        <a href="/health" target="_blank" rel="noopener" class="btn btn-secondary btn-block">❤ Health JSON</a>
      </div>
    </div>

    <div class="card" style="margin-top:var(--gap);">
      <div class="card-header"><h3>Acerca de HireScore</h3></div>
      <p class="text-sm muted" style="margin:0 0 8px;">
        Sistema de evaluación auditable de CVs y entrevistas. El LLM solo extrae datos; el scoring es determinístico
        y explicable. Soporta proveedores Claude (cloud) y Ollama (local). Cumple con AI Act (UE),
        AEDT (NY), GDPR Art. 22 y LFPDPPP (México).
      </p>
      <details>
        <summary>Ver respuesta cruda del health check</summary>
        <pre>${escape(JSON.stringify(health, null, 2))}</pre>
      </details>
    </div>
  `;

  $("#btn-refresh", view).addEventListener("click", () => router());
}

// ============================================================
// Init
// ============================================================
$$(".nav-link").forEach((a) => {
  const key = a.dataset.icon;
  if (key && ICONS[key]) {
    a.insertAdjacentHTML("afterbegin", ICONS[key]);
  }
  a.addEventListener("click", () => navigate(a.dataset.route));
});

$("#menu-toggle").addEventListener("click", () => {
  $("#sidebar").classList.toggle("open");
});

window.addEventListener("hashchange", router);
window.addEventListener("DOMContentLoaded", () => {
  router();
  refreshHealth();
  setInterval(refreshHealth, 30000);
});

// Initial run if DOM is already parsed
if (document.readyState !== "loading") {
  router();
  refreshHealth();
  setInterval(refreshHealth, 30000);
}
