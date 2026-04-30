import {
  procesarAnalisis,
  getAnalisesPorVacante,
  uploadCVandAudio,
  createCandidato,
  updateVacanteRequisitos,
} from "./api.js";

const mainContent = document.getElementById("main-content");

let compatibilityChart;
let requirementsChart;

export function loadVacancyDetails(vacancyId) {
  clearMainContent();

  const container = document.createElement("div");

  const title = document.createElement("h2");
  title.textContent = `Vacante #${vacancyId}`;
  container.appendChild(title);

  // Sección: Requisitos
  const reqSection = document.createElement("div");
  reqSection.className = "section";
  reqSection.innerHTML = `
    <h2>Requisitos del Cargo</h2>
    <div id="requirementsPreview" style="border:1px solid #ccc; padding:10px; margin-bottom:10px; font-size:0.9em; min-height:40px;">
      Sin requisitos definidos. Usa el formulario para agregarlos.
    </div>
    <button id="editReqBtn">Editar Requisitos</button>
    <div id="reqForm" style="display:none; margin-top:10px;">
      <div class="upload-group">
        <label for="req-text">Requisitos del puesto:</label>
        <textarea id="req-text" placeholder="Describe las habilidades, experiencia y educación requeridas..." style="width:100%; height:100px;"></textarea>
      </div>
      <button id="updateReqBtn">Guardar Requisitos</button>
      <span id="req-status" style="margin-left:10px; font-size:0.85em;"></span>
    </div>
  `;
  container.appendChild(reqSection);

  // Sección: Subir CV y Audio
  const uploadSection = document.createElement("div");
  uploadSection.className = "section";
  uploadSection.innerHTML = `
    <h2>Subir Archivos</h2>
    <div class="upload-group">
      <label for="cv-upload">CV del candidato (PDF o DOCX):</label>
      <input type="file" id="cv-upload" accept=".pdf,.docx">
    </div>
    <div class="upload-group">
      <label for="audio-upload">Audio de entrevista (opcional):</label>
      <input type="file" id="audio-upload" accept="audio/*">
    </div>
    <button id="upload-btn">Subir Archivos</button>
    <div id="upload-result" style="margin-top:8px; font-size:0.85em;"></div>
  `;
  container.appendChild(uploadSection);

  // Sección: Análisis
  const reportSection = document.createElement("div");
  reportSection.className = "section";
  reportSection.innerHTML = `
    <h2>Analizar Candidato</h2>
    <div class="upload-group">
      <label for="candidato-nombre">Nombre del candidato:</label>
      <input type="text" id="candidato-nombre" placeholder="Ej: Juan Pérez" style="width:60%;" />
    </div>
    <div class="upload-group">
      <label for="cv-analizar">CV a analizar (PDF o DOCX):</label>
      <input type="file" id="cv-analizar" accept=".pdf,.docx">
    </div>
    <div class="upload-group">
      <label for="audio-analizar">Audio de entrevista (opcional):</label>
      <input type="file" id="audio-analizar" accept="audio/*">
    </div>
    <button id="analyze-btn">Analizar</button>
    <div id="analyze-status" style="margin-top:8px; font-size:0.85em; color:#555;"></div>
    <div style="display:flex; gap:20px; flex-wrap:wrap; margin-top:10px;">
      <canvas id="compatibilityChart" width="300" height="300"></canvas>
      <canvas id="requirementsChart" width="400" height="300"></canvas>
    </div>
    <div id="report-template" style="margin-top:10px;">
      <h3>Resultado del Análisis</h3>
      <p id="compatibilityData">Puntaje total: —</p>
      <ul id="requirementsData"></ul>
      <p id="sentimientoData" style="font-size:0.9em; color:#666;"></p>
    </div>
  `;
  container.appendChild(reportSection);

  mainContent.appendChild(container);

  // Evento: mostrar/ocultar formulario de requisitos
  document.getElementById("editReqBtn").addEventListener("click", () => {
    const form = document.getElementById("reqForm");
    form.style.display = form.style.display === "none" ? "block" : "none";
  });

  // Evento: guardar requisitos en BD
  document.getElementById("updateReqBtn").addEventListener("click", async () => {
    const texto = document.getElementById("req-text").value.trim();
    const status = document.getElementById("req-status");
    if (!texto) { status.textContent = "Escribe los requisitos antes de guardar."; return; }
    try {
      status.textContent = "Guardando...";
      await updateVacanteRequisitos(vacancyId, texto);
      document.getElementById("requirementsPreview").textContent = texto;
      document.getElementById("reqForm").style.display = "none";
      status.textContent = "";
    } catch (e) {
      status.textContent = "Error al guardar: " + e.message;
    }
  });

  // Evento: subir archivos (solo almacenamiento, sin análisis)
  document.getElementById("upload-btn").addEventListener("click", async () => {
    const cvFile = document.getElementById("cv-upload").files[0];
    const audioFile = document.getElementById("audio-upload").files[0];
    const result = document.getElementById("upload-result");
    if (!cvFile) { result.textContent = "Selecciona al menos el CV."; return; }
    try {
      result.textContent = "Subiendo...";
      const res = await uploadCVandAudio(cvFile, audioFile || null);
      result.textContent = `CV guardado: ${res.cv_filename}${res.audio_filename ? " | Audio: " + res.audio_filename : ""}`;
    } catch (e) {
      result.textContent = "Error: " + e.message;
    }
  });

  // Evento: analizar candidato
  document.getElementById("analyze-btn").addEventListener("click", () => {
    handleAnalyze(vacancyId);
  });

  loadSavedAnalyses(vacancyId);
}

function clearMainContent() {
  mainContent.innerHTML = "";
  if (compatibilityChart) { compatibilityChart.destroy(); compatibilityChart = null; }
  if (requirementsChart) { requirementsChart.destroy(); requirementsChart = null; }
}

function updateCharts(puntajeTotal, desglose) {
  const labels = desglose.map(d => d.categoria);
  const scores = desglose.map(d => d.puntaje);

  const ctx1 = document.getElementById("compatibilityChart").getContext("2d");
  if (compatibilityChart) compatibilityChart.destroy();
  compatibilityChart = new Chart(ctx1, {
    type: "doughnut",
    data: {
      labels: ["Puntaje", "Restante"],
      datasets: [{ data: [puntajeTotal, 100 - puntajeTotal], backgroundColor: ["#36A2EB", "#FF6384"] }],
    },
    options: {
      responsive: true,
      plugins: { title: { display: true, text: "Puntaje Total del Candidato" } },
    },
  });

  const ctx2 = document.getElementById("requirementsChart").getContext("2d");
  if (requirementsChart) requirementsChart.destroy();
  requirementsChart = new Chart(ctx2, {
    type: "bar",
    data: {
      labels,
      datasets: [{ label: "Puntaje por Categoría (%)", data: scores, backgroundColor: "#4BC0C0" }],
    },
    options: {
      responsive: true,
      plugins: { title: { display: true, text: "Desglose por Categoría" } },
      scales: { y: { beginAtZero: true, max: 100 } },
    },
  });
}

function updateReportTemplate(analisis) {
  document.getElementById("compatibilityData").textContent = `Puntaje total: ${analisis.puntaje_total}%`;

  const reqList = document.getElementById("requirementsData");
  reqList.innerHTML = "";
  (analisis.desglose || []).forEach(d => {
    const li = document.createElement("li");
    li.textContent = `${d.categoria}: ${d.puntaje}%${d.comentario ? " — " + d.comentario : ""}`;
    reqList.appendChild(li);
  });

  const sent = document.getElementById("sentimientoData");
  if (analisis.sentimiento_compound !== null && analisis.sentimiento_compound !== undefined) {
    const val = analisis.sentimiento_compound.toFixed(2);
    sent.textContent = `Sentimiento en entrevista: ${val} (rango -1 negativo / +1 positivo)`;
  } else {
    sent.textContent = "";
  }
}

export async function handleAnalyze(vacancyId) {
  const nombreInput = document.getElementById("candidato-nombre");
  const cvInput = document.getElementById("cv-analizar");
  const audioInput = document.getElementById("audio-analizar");
  const status = document.getElementById("analyze-status");

  const nombre = nombreInput ? nombreInput.value.trim() : "";
  const cvFile = cvInput ? cvInput.files[0] : null;
  const audioFile = audioInput ? audioInput.files[0] : null;

  if (!nombre) { status.textContent = "Ingresa el nombre del candidato."; return; }
  if (!cvFile) { status.textContent = "Selecciona el CV del candidato."; return; }

  status.textContent = "Creando candidato...";
  let candidato;
  try {
    candidato = await createCandidato(nombre);
  } catch (e) {
    status.textContent = "Error al crear candidato: " + e.message;
    return;
  }

  status.textContent = "Analizando CV... esto puede tardar 30-90 segundos.";
  try {
    const analisis = await procesarAnalisis(cvFile, audioFile || null, candidato.id, vacancyId);
    status.textContent = `Análisis completado. Puntaje: ${analisis.puntaje_total}%`;
    updateCharts(analisis.puntaje_total, analisis.desglose || []);
    updateReportTemplate(analisis);
    loadSavedAnalyses(vacancyId);
  } catch (e) {
    status.textContent = "Error al analizar: " + e.message;
  }
}

async function loadSavedAnalyses(vacancyId) {
  // Eliminar sección anterior si existe
  const prev = document.getElementById("saved-analyses-section");
  if (prev) prev.remove();

  try {
    const analyses = await getAnalisesPorVacante(vacancyId);
    const section = document.createElement("div");
    section.className = "section";
    section.id = "saved-analyses-section";
    section.innerHTML = "<h2>Análisis Guardados</h2>";

    if (!analyses.length) {
      section.innerHTML += "<p>No hay análisis guardados para esta vacante.</p>";
    } else {
      const table = document.createElement("table");
      table.style.cssText = "width:100%; border-collapse:collapse;";
      table.innerHTML = `
        <thead>
          <tr>
            <th style="border:1px solid #ddd; padding:8px;">ID</th>
            <th style="border:1px solid #ddd; padding:8px;">Candidato ID</th>
            <th style="border:1px solid #ddd; padding:8px;">Puntaje</th>
            <th style="border:1px solid #ddd; padding:8px;">Fecha</th>
          </tr>
        </thead>
      `;
      const tbody = document.createElement("tbody");
      analyses.forEach(a => {
        const tr = document.createElement("tr");
        tr.style.cursor = "pointer";
        tr.innerHTML = `
          <td style="border:1px solid #ddd; padding:8px;">${a.id}</td>
          <td style="border:1px solid #ddd; padding:8px;">${a.candidato_id}</td>
          <td style="border:1px solid #ddd; padding:8px;">${a.puntaje_total}%</td>
          <td style="border:1px solid #ddd; padding:8px;">${new Date(a.analizado_en).toLocaleString()}</td>
        `;
        tr.addEventListener("click", () => {
          updateCharts(a.puntaje_total, a.desglose || []);
          updateReportTemplate(a);
        });
        tbody.appendChild(tr);
      });
      table.appendChild(tbody);
      section.appendChild(table);
    }
    mainContent.appendChild(section);
  } catch (error) {
    console.error("Error al cargar análisis guardados:", error);
  }
}
