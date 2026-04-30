import { getVacancies, createVacancy } from "./api.js";
import { loadVacancyDetails } from "./dashboard.js";

const vacancyListEl = document.getElementById("vacancyList");
const addVacancyBtn = document.getElementById("addVacancyBtn");

export async function renderVacancies() {
  try {
    const vacancies = await getVacancies();
    vacancyListEl.innerHTML = "";
    vacancies.forEach(vacancy => {
      const li = document.createElement("li");
      li.textContent = vacancy.titulo;
      li.setAttribute("data-vacancy", vacancy.id);
      vacancyListEl.appendChild(li);
    });
  } catch (error) {
    console.error("Error al cargar vacantes:", error);
  }
}

vacancyListEl.addEventListener("click", (e) => {
  if (e.target && e.target.nodeName === "LI") {
    const vacancyId = e.target.getAttribute("data-vacancy");
    loadVacancyDetails(vacancyId);
  }
});

addVacancyBtn.addEventListener("click", openVacancyModal);

function openVacancyModal() {
  const modalOverlay = document.createElement("div");
  modalOverlay.className = "modal-overlay";

  const modalContent = document.createElement("div");
  modalContent.className = "modal-content";
  modalContent.innerHTML = `
    <h3>Agregar Vacante</h3>
    <div class="upload-group">
      <label for="vacancy-name">Nombre del puesto:</label>
      <input type="text" id="vacancy-name" style="width: 100%;" placeholder="Ej: Desarrollador Backend" />
    </div>
    <div class="upload-group" style="margin-top: 8px;">
      <label for="vacancy-desc">Descripción (opcional):</label>
      <textarea id="vacancy-desc" style="width: 100%; height: 80px;" placeholder="Descripción del puesto..."></textarea>
    </div>
    <div style="margin-top: 10px; text-align: right;">
      <button id="cancelVacancyBtn">Cancelar</button>
      <button id="saveVacancyBtn">Guardar</button>
    </div>
  `;
  modalOverlay.appendChild(modalContent);
  document.body.appendChild(modalOverlay);

  document.getElementById("cancelVacancyBtn").addEventListener("click", () => {
    document.body.removeChild(modalOverlay);
  });

  document.getElementById("saveVacancyBtn").addEventListener("click", async () => {
    const titulo = document.getElementById("vacancy-name").value.trim();
    const descripcion = document.getElementById("vacancy-desc").value.trim();
    if (!titulo) {
      alert("Por favor, ingresa el nombre del puesto.");
      return;
    }
    try {
      await createVacancy({ titulo, descripcion: descripcion || null });
      await renderVacancies();
      document.body.removeChild(modalOverlay);
    } catch (error) {
      console.error("Error al crear vacante:", error);
      alert("Error al crear la vacante. Revisa la consola.");
    }
  });
}

renderVacancies();
