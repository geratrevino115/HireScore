/* global window */
// Cliente API — wrappers sobre fetch hacia el backend FastAPI

const BASE = window.location.origin;

async function apiFetch(path, opts = {}) {
  const res = await fetch(BASE + path, opts);
  if (!res.ok) {
    let msg;
    try { const j = await res.json(); msg = j.detail || JSON.stringify(j); }
    catch (_) { msg = res.statusText; }
    throw new Error(msg || `HTTP ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

const API = {
  // Vacantes
  listVacancies:   ()             => apiFetch('/vacancies/'),
  getVacancy:      (id)           => apiFetch(`/vacancies/${id}`),
  createVacancy:   (body)         => apiFetch('/vacancies/', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(body) }),
  extractFromFile: (file)         => { const fd = new FormData(); fd.append('file', file); return apiFetch('/vacancies/extraer-desde-archivo', { method: 'POST', body: fd }); },
  generateDraft:   (body)         => apiFetch('/vacancies/generar', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(body) }),
  setPesos:        (id, body)     => apiFetch(`/vacancies/${id}/pesos`, { method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify(body) }),
  getGuia:         (id)           => apiFetch(`/vacancies/${id}/guia-entrevista`),
  generateGuia:    (id)           => apiFetch(`/vacancies/${id}/guia-entrevista`, { method: 'POST' }),
  getCosto:        (id)           => apiFetch(`/vacancies/${id}/costo-total`),

  // Pipeline
  listAplicaciones: (vid)         => apiFetch(`/vacancies/${vid}/aplicaciones`),
  cambiarEtapa:    (aplId, etapa) => apiFetch(`/aplicaciones/${aplId}/etapa`, { method: 'PATCH', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ etapa }) }),

  // Análisis
  procesarCV: (vid, cvFile, audioFile) => {
    const fd = new FormData();
    fd.append('vacante_id', String(vid));
    fd.append('cv_file', cvFile);
    if (audioFile) fd.append('audio_file', audioFile);
    return apiFetch('/analyses/procesar', { method: 'POST', body: fd });
  },
  getExplicacion: (analisisId) => apiFetch(`/analyses/${analisisId}/explicacion`),
};

// Convierte AplicacionConCandidato → shape interna del candidato
function aplToCandidate(apl) {
  return {
    id:           apl.aplicacion_id,
    aplicacion_id: apl.aplicacion_id,
    candidato_id: apl.candidato_id,
    analisis_id:  apl.ultimo_analisis_id || null,
    name:         apl.candidato_nombre,
    email:        apl.candidato_email || '',
    etapa:        apl.etapa,
    score:        apl.puntaje_total   || 0,
    sent:         apl.sentimiento_compound || 0,
    title:        '',
    exp:          '',
    salary:       '',
    match:        [],
    miss:         [],
  };
}

// Derive two-letter monogram from vacancy title
function initials(titulo) {
  const words = (titulo || '').replace(/[·/·—\-]/g, ' ').split(/\s+/).filter(Boolean);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return (titulo || '??').slice(0, 2).toUpperCase();
}

window.API = API;
window.aplToCandidate = aplToCandidate;
window.initials = initials;
