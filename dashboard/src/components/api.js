// js/api.js
export const API_BASE_URL = "http://localhost:8000";

/**
 * Envía datos de análisis al backend.
 */
export async function createAnalysis(analysisData) {
  const response = await fetch(`${API_BASE_URL}/analyses/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(analysisData)
  });
  if (!response.ok) {
    throw new Error("Error al guardar el análisis");
  }
  return response.json();
}

/**
 * Obtiene todos los análisis.
 */
export async function getAnalyses() {
  const response = await fetch(`${API_BASE_URL}/analyses/`);
  if (!response.ok) {
    throw new Error("Error al obtener análisis");
  }
  return response.json();
}

/**
 * Obtiene todas las vacantes.
 */
export async function getVacancies() {
  const response = await fetch(`${API_BASE_URL}/vacancies/`);
  if (!response.ok) {
    throw new Error("Error al obtener vacantes");
  }
  return response.json();
}

/**
 * Crea una nueva vacante.
 */
export async function createVacancy(vacancyData) {
  const response = await fetch(`${API_BASE_URL}/vacancies/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(vacancyData)
  });
  if (!response.ok) {
    throw new Error("Error al crear vacante");
  }
  return response.json();
}

/**
 * Envía el CV y el audio al backend para su procesamiento.
 * @param {File} cvFile - Archivo del CV (PDF, DOC, DOCX)
 * @param {File} audioFile - Archivo de audio (audio/*)
 * @returns {Promise<object>} Respuesta del servidor en formato JSON.
 */
export async function uploadCVandAudio(cvFile, audioFile, candidateId) {
  const formData = new FormData();
  formData.append("cv", cvFile);
  formData.append("audio", audioFile);
  formData.append("candidate_id", candidateId);

  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: "POST",
    body: formData
  });
  
  if (!response.ok) {
    throw new Error("Error al subir CV y audio");
  }
  
  return response.json();
}