// js/vacancies.js
import { getVacancies, createVacancy } from "./api.js";
import { loadVacancyDetails } from "./dashboard.js";

const vacancyListEl = document.getElementById("vacancyList");
const addVacancyBtn = document.getElementById("addVacancyBtn");

/**
 * Renderiza la lista de vacantes consultadas desde el backend.
 */
export async function renderVacancies() {
  try {
    const vacancies = await getVacancies();
    vacancyListEl.innerHTML = "";
    vacancies.forEach(vacancy => {
      const li = document.createElement("li");
      li.textContent = vacancy.name;
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
  // Crear modal
  const modalOverlay = document.createElement("div");
  modalOverlay.className = "modal-overlay";

  const modalContent = document.createElement("div");
  modalContent.className = "modal-content";
  modalContent.innerHTML = `
    <h3>Agregar Vacante</h3>
    <div class="upload-group">
      <label for="vacancy-name">Nombre de la Vacante:</label>
      <input type="text" id="vacancy-name" style="width: 100%;" />
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
    const vacancyNameInput = document.getElementById("vacancy-name");
    const vacancyName = vacancyNameInput.value.trim();
    if (vacancyName) {
      try {
        await createVacancy({ name: vacancyName });
        await renderVacancies();
        document.body.removeChild(modalOverlay);
      } catch (error) {
        console.error("Error al crear vacante:", error);
      }
    } else {
      alert("Por favor, ingresa el nombre de la vacante.");
    }
  });
}

// Renderización inicial de vacantes
renderVacancies();
