// js/dashboard.js
import { createAnalysis, getAnalyses, uploadCVandAudio } from "./api.js";

const mainContent = document.getElementById("main-content");

let compatibilityChart;
let requirementsChart;

/**
 * Carga los detalles de la vacante seleccionada.
 * @param {string} vacancyId - El ID de la vacante.
 */
export function loadVacancyDetails(vacancyId) {
  clearMainContent();

  const container = document.createElement("div");

  // Título de la vacante
  const title = document.createElement("h2");
  title.textContent = `Vacante ${vacancyId}`;
  container.appendChild(title);

  // Sección: Vista Previa de Requisitos (central) y botón para editar
  const reqSection = document.createElement("div");
  reqSection.className = "section";
  reqSection.innerHTML = `
    <h2>Vista Previa de Requisitos del Cargo</h2>
    <div id="requirementsPreview" style="border: 1px solid #ccc; padding: 10px; margin-bottom: 10px; font-size: 0.9em;">
      Datos de ejemplo: Se requiere experiencia en desarrollo web, manejo de bases de datos y conocimientos en JavaScript.
    </div>
    <button id="editReqBtn">Editar Requisitos</button>
    <div id="reqForm" style="display: none; margin-top: 10px;">
      <div class="upload-group">
        <label for="req-upload">Archivo de Requisitos:</label>
        <input type="file" id="req-upload" accept=".pdf,.doc,.docx">
      </div>
      <div class="upload-group">
        <label for="req-text">O ingresa los requisitos:</label>
        <textarea id="req-text" placeholder="Describe los requisitos del cargo..."></textarea>
      </div>
      <button id="updateReqBtn">Actualizar Vista Previa</button>
    </div>
  `;
  container.appendChild(reqSection);

  // Sección: Subir CV y audios
  const uploadSection = document.createElement("div");
  uploadSection.className = "section";
  uploadSection.innerHTML = `
    <h2>Subir CV y Audios</h2>
    <div class="upload-group">
      <label for="cv-upload">Subir CV:</label>
      <input type="file" id="cv-upload" accept=".pdf,.doc,.docx">
    </div>
    <div class="upload-group">
      <label for="audio-upload">Subir Audio:</label>
      <input type="file" id="audio-upload" accept="audio/*">
    </div>
    <button id="upload-btn">Enviar Archivos</button>
    <div id="upload-result"></div>
  `;
  container.appendChild(uploadSection);

  // Sección: Reportes y Resultados
  const reportSection = document.createElement("div");
  reportSection.className = "section";
  reportSection.innerHTML = `
    <h2>Reportes y Resultados</h2>
    <button id="analyze-btn">Analizar</button>
    <div>
      <canvas id="compatibilityChart" width="400" height="200"></canvas>
      <canvas id="requirementsChart" width="400" height="200"></canvas>
    </div>
    <div id="report-template">
      <h3>Datos de Reporte (Template)</h3>
      <p id="compatibilityData">Compatibilidad: 0%</p>
      <ul id="requirementsData">
        <li>Requisito 1: 0%</li>
        <li>Requisito 2: 0%</li>
        <li>Requisito 3: 0%</li>
        <li>Requisito 4: 0%</li>
      </ul>
    </div>
  `;
  container.appendChild(reportSection);

  mainContent.appendChild(container);

  // Eventos: Alternar el formulario de edición de requisitos
  document.getElementById("editReqBtn").addEventListener("click", () => {
    const reqForm = document.getElementById("reqForm");
    reqForm.style.display = reqForm.style.display === "none" ? "block" : "none";
  });

  document.getElementById("updateReqBtn").addEventListener("click", () => {
    const newReqText = document.getElementById("req-text").value || 
      "No se ingresaron requisitos. Datos dummy: Se requiere manejo avanzado de frameworks y experiencia en proyectos internacionales.";
    document.getElementById("requirementsPreview").textContent = newReqText;
  });

  document.getElementById("analyze-btn").addEventListener("click", () => {
    handleAnalyze(vacancyId);
  });

  // Botón: Enviar archivos para guardar localmente y actualizar DB
  document.getElementById("upload-btn").addEventListener("click", async () => {
    const cvInput = document.getElementById("cv-upload");
    const audioInput = document.getElementById("audio-upload");
    const uploadResult = document.getElementById("upload-result");
    const uploadBtn = document.getElementById("upload-btn");
    const cvFile = cvInput.files[0];
    const audioFile = audioInput.files[0];
  
    if (!cvFile || !audioFile) {
      uploadResult.textContent = "Por favor, selecciona ambos archivos.";
      return;
    }
  
    // Supongamos que el id del candidato es 1 (puedes actualizarlo según tu lógica)
    const candidateId = 1;
  
    try {
      // Se envían los archivos junto con el candidateId
      const response = await uploadCVandAudio(cvFile, audioFile, candidateId);
      // Se actualiza el div de resultado con la información de la respuesta
      uploadResult.textContent = `Archivos guardados: CV: ${response.cv_filename}, Audio: ${response.audio_filename}`;
      // Se actualiza el texto del botón para indicar que se puede subir nuevamente
      uploadBtn.textContent = "Subir nuevamente";
    } catch (error) {
      uploadResult.textContent = `Error al subir archivos: ${error.message}`;
    }
  });
  

  // Cargar análisis guardados para esta vacante en forma de tabla (placeholder)
  loadSavedAnalyses(vacancyId);
}

/**
 * Limpia el contenido del panel principal y destruye gráficos previos.
 */
function clearMainContent() {
  mainContent.innerHTML = "";
  if (compatibilityChart) {
    compatibilityChart.destroy();
    compatibilityChart = null;
  }
  if (requirementsChart) {
    requirementsChart.destroy();
    requirementsChart = null;
  }
}

/**
 * Actualiza los gráficos con los nuevos datos.
 * @param {number} compatibility - Valor de compatibilidad.
 * @param {Array<number>} requirements - Array de coincidencias para requisitos.
 */
function updateCharts(compatibility, requirements) {
  const ctx1 = document.getElementById("compatibilityChart").getContext("2d");
  if (compatibilityChart) compatibilityChart.destroy();
  compatibilityChart = new Chart(ctx1, {
    type: "doughnut",
    data: {
      labels: ["Compatibilidad", "Diferencia"],
      datasets: [{
        data: [compatibility, 100 - compatibility],
        backgroundColor: ["#36A2EB", "#FF6384"]
      }]
    },
    options: {
      responsive: true,
      plugins: { title: { display: true, text: "Compatibilidad del Candidato" } }
    }
  });

  const ctx2 = document.getElementById("requirementsChart").getContext("2d");
  if (requirementsChart) requirementsChart.destroy();
  requirementsChart = new Chart(ctx2, {
    type: "bar",
    data: {
      labels: ["Requisito 1", "Requisito 2", "Requisito 3", "Requisito 4"],
      datasets: [{
        label: "Nivel de Coincidencia (%)",
        data: requirements,
        backgroundColor: ["#4BC0C0"]
      }]
    },
    options: {
      responsive: true,
      plugins: { title: { display: true, text: "Comparación con Requisitos del Cargo" } },
      scales: { y: { beginAtZero: true, max: 100 } }
    }
  });
}

/**
 * Actualiza la plantilla de reporte con los datos generados.
 * @param {number} compatibility - Valor de compatibilidad.
 * @param {Array<number>} requirements - Array de datos para requisitos.
 */
function updateReportTemplate(compatibility, requirements) {
  document.getElementById("compatibilityData").textContent = `Compatibilidad: ${compatibility}%`;
  const reqList = document.getElementById("requirementsData");
  reqList.innerHTML = "";
  requirements.forEach((req, index) => {
    const li = document.createElement("li");
    li.textContent = `Requisito ${index + 1}: ${req}%`;
    reqList.appendChild(li);
  });
}

/**
 * Función que simula el análisis, envía datos al backend y actualiza la vista.
 * @param {string} vacancyId - El ID de la vacante seleccionada.
 */
export async function handleAnalyze(vacancyId) {
  const compatibility = Math.floor(Math.random() * 100);
  const requirements = [
    Math.floor(Math.random() * 100),
    Math.floor(Math.random() * 100),
    Math.floor(Math.random() * 100),
    Math.floor(Math.random() * 100)
  ];

  const analysisData = {
    candidate_id: 1,
    vacancy_id: `Vacante ${vacancyId}`,
    compatibility: compatibility,
    requirements: requirements,
    analyzed_at: new Date().toISOString()
  };

  try {
    const savedAnalysis = await createAnalysis(analysisData);
    console.log("Análisis guardado:", savedAnalysis);
    updateCharts(compatibility, requirements);
    updateReportTemplate(compatibility, requirements);
    loadSavedAnalyses(vacancyId);
  } catch (error) {
    console.error("Error al guardar el análisis:", error);
  }
}

/**
 * Consulta los análisis guardados desde el backend y los muestra en una tabla.
 * Al hacer clic en una fila se actualizan los gráficos y la plantilla con ese análisis.
 * @param {string} vacancyId - El ID de la vacante para filtrar los análisis.
 */
async function loadSavedAnalyses(vacancyId) {
  try {
    const analyses = await getAnalyses();
    const filtered = analyses.filter(a => a.vacancy_id === `Vacante ${vacancyId}`);
    const analysesContainer = document.createElement("div");
    analysesContainer.className = "section";
    analysesContainer.innerHTML = "<h2>Análisis Guardados</h2>";

    if (filtered.length === 0) {
      analysesContainer.innerHTML += "<p>No hay análisis guardados para esta vacante.</p>";
    } else {
      const table = document.createElement("table");
      table.style.width = "100%";
      table.style.borderCollapse = "collapse";
      const thead = document.createElement("thead");
      thead.innerHTML = `
        <tr>
          <th style="border:1px solid #ddd; padding:8px;">ID</th>
          <th style="border:1px solid #ddd; padding:8px;">Candidato</th>
          <th style="border:1px solid #ddd; padding:8px;">Compatibilidad</th>
          <th style="border:1px solid #ddd; padding:8px;">Fecha de Análisis</th>
        </tr>
      `;
      table.appendChild(thead);
      const tbody = document.createElement("tbody");
      filtered.forEach(a => {
        const tr = document.createElement("tr");
        tr.style.cursor = "pointer";
        tr.innerHTML = `
          <td style="border:1px solid #ddd; padding:8px;">${a.id}</td>
          <td style="border:1px solid #ddd; padding:8px;">Candidato ${a.candidate_id}</td>
          <td style="border:1px solid #ddd; padding:8px;">${a.compatibility}%</td>
          <td style="border:1px solid #ddd; padding:8px;">${new Date(a.analyzed_at).toLocaleString()}</td>
        `;
        tr.addEventListener("click", () => {
          updateCharts(a.compatibility, a.requirements);
          updateReportTemplate(a.compatibility, a.requirements);
        });
        tbody.appendChild(tr);
      });
      table.appendChild(tbody);
      analysesContainer.appendChild(table);
    }
    mainContent.appendChild(analysesContainer);
  } catch (error) {
    console.error("Error al cargar análisis guardados:", error);
  }
}
