export const API_BASE_URL = "http://localhost:8000";

async function apiFetch(url, options = {}) {
  const response = await fetch(`${API_BASE_URL}${url}`, options);
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || `Error ${response.status}`);
  }
  return response.json();
}

// --- Vacantes ---
export async function getVacancies() {
  return apiFetch("/vacancies/");
}

export async function createVacancy(data) {
  return apiFetch("/vacancies/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function updateVacanteRequisitos(vacanteId, requisitosTexto) {
  return apiFetch(`/vacancies/${vacanteId}/requisitos`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ requisitos_texto: requisitosTexto }),
  });
}

// --- Candidatos ---
export async function createCandidato(nombre) {
  return apiFetch("/candidates/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nombre }),
  });
}

export async function getCandidatos() {
  return apiFetch("/candidates/");
}

// --- Análisis ---
export async function getAnalyses() {
  return apiFetch("/analyses/");
}

export async function getAnalisesPorVacante(vacanteId) {
  return apiFetch(`/analyses/vacante/${vacanteId}`);
}

export async function procesarAnalisis(cvFile, audioFile, candidatoId, vacanteId) {
  const formData = new FormData();
  formData.append("cv_file", cvFile);
  if (audioFile) formData.append("audio_file", audioFile);
  formData.append("candidato_id", candidatoId);
  formData.append("vacante_id", vacanteId);

  const response = await fetch(`${API_BASE_URL}/analyses/procesar`, {
    method: "POST",
    body: formData,
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || `Error ${response.status}`);
  }
  return response.json();
}

// --- Upload unificado ---
export async function uploadCVandAudio(cvFile, audioFile) {
  const formData = new FormData();
  formData.append("cv", cvFile);
  if (audioFile) formData.append("audio", audioFile);

  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: "POST",
    body: formData,
  });
  if (!response.ok) throw new Error("Error al subir archivos");
  return response.json();
}
