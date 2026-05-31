/* global window */
// Datos extra para las vistas del flujo: CV estructurado, entrevista, evaluación.

// CV estructurado por defecto (se personaliza por candidato con buildCV)
function buildCV(p) {
  const firstSkills = p.match.slice(0, 6);
  return {
    contacto: {
      email: p.email,
      tel: "+52 55 •• •• ••" + String(10 + (p.id % 80)),
      ubicacion: ["CDMX, México", "Guadalajara, México", "Monterrey, México", "Remoto · LATAM"][p.id % 4],
      links: ["github.com/" + p.name.split(" ")[0].toLowerCase(), "linkedin.com/in/" + p.name.split(" ")[0].toLowerCase()],
    },
    resumen: `Ingeniero/a de software con ${p.exp} de experiencia, especializado en backend con Python. ${p.title.split("·")[0].trim()}. Enfoque en sistemas de alto tráfico, calidad de código y mentoría.`,
    experiencia: [
      { rol: p.title.split("·")[0].trim(), empresa: (p.title.split("·")[1] || "Empresa").trim(), periodo: "2022 — Actual", puntos: [
        "Lideré el rediseño de APIs del módulo de pagos, reduciendo la latencia p95 en 38%.",
        "Mentoría a 3 ingenieros junior y definición de estándares de código.",
      ] },
      { rol: "Backend Engineer", empresa: "Startup fintech", periodo: "2019 — 2022", puntos: [
        "Migré servicios monolíticos a microservicios con FastAPI y Docker.",
        "Implementé caché con Redis para endpoints de catálogo (−60% en lecturas a BD).",
      ] },
    ],
    educacion: [
      { titulo: "Ing. en Sistemas Computacionales", inst: "Universidad Nacional", periodo: "2014 — 2018" },
    ],
    proyectos: [
      { nombre: "pay-core", desc: "Librería interna de idempotencia para pagos.", tags: ["Python", "PostgreSQL"] },
      { nombre: "async-toolkit", desc: "Utilidades para tareas asíncronas con colas.", tags: ["FastAPI", "Redis"] },
    ],
    skills: firstSkills,
    flags: p.miss.length > 2
      ? ["No se detectó experiencia explícita en " + p.miss.slice(0, 2).join(" ni "), "Verificar profundidad en " + (p.miss[0] || "skills core")]
      : ["Sin banderas relevantes en el CV"],
  };
}

// Preguntas extra que la IA genera a partir del CV del candidato
function buildCVQuestions(p) {
  return [
    { text: `En ${(p.title.split("·")[1] || "tu rol actual").trim()} mencionas reducir latencia p95. ¿Cómo lo midieron y qué cambió en la arquitectura?`, origen: "CV · Experiencia" },
    { text: `Trabajaste con ${p.match[1] || "tu stack"}. ¿En qué caso lo cambiarías por otra herramienta y por qué?`, origen: "CV · Skills" },
    p.miss[0]
      ? { text: `No vimos ${p.miss[0]} en tu CV. ¿Has trabajado con algo equivalente? Cuéntame un ejemplo.`, origen: "CV · Gap detectado" }
      : { text: "Describe un proyecto personal del que estés orgulloso/a y tu rol en él.", origen: "CV · Proyectos" },
  ];
}

// Transcripción de la entrevista (diarización)
const TRANSCRIPT = [
  { who: "Reclutador", t: "00:12", text: "Cuéntame cómo diseñarías un endpoint asíncrono de alto tráfico en FastAPI." },
  { who: "Candidato", t: "00:20", text: "Usaría async/await con un pool de conexiones limitado, evitaría llamadas bloqueantes dentro del event loop y movería el trabajo pesado a una cola con workers separados." },
  { who: "Reclutador", t: "01:05", text: "¿Y cómo garantizas idempotencia en pagos?" },
  { who: "Candidato", t: "01:14", text: "Con una clave de idempotencia por request, guardada en una tabla con restricción única; si llega un duplicado devuelvo el resultado previo en lugar de reprocesar." },
  { who: "Reclutador", t: "02:30", text: "Un deploy rompió producción. ¿Tus primeros 15 minutos?" },
  { who: "Candidato", t: "02:38", text: "Primero confirmo el blast radius con métricas, hago rollback si el cambio es claro, comunico en el canal de incidentes y recién después busco la causa raíz." },
];

// Evaluación de la entrevista vs CV + vacante
const EVAL = {
  dims: [
    { label: "Consistencia CV ↔ entrevista", pct: 90, color: "green", nota: "Lo que dijo coincide con la experiencia del CV." },
    { label: "Profundidad técnica", pct: 86, color: "green", nota: "Maneja concurrencia, idempotencia y diseño de APIs con criterio." },
    { label: "Comunicación", pct: 78, color: "blue", nota: "Explica con orden; podría ser más conciso." },
    { label: "Soft skills / liderazgo", pct: 72, color: "blue", nota: "Buenos ejemplos de mentoría, menos de manejo de conflicto." },
  ],
  sentimiento: 0.64,
  evidencias: [
    { dim: "Profundidad técnica", quote: "…evitaría llamadas bloqueantes dentro del event loop y movería el trabajo pesado a una cola…", t: "00:20" },
    { dim: "Respuesta a incidentes", quote: "…hago rollback si el cambio es claro, comunico en el canal de incidentes…", t: "02:38" },
  ],
};

// Reporte final
function buildFinal(p) {
  return {
    scoreCV: p.score,
    scoreEntrevista: 81,
    scoreFinal: Math.round(p.score * 0.6 + 81 * 0.4),
    fortalezas: [
      "Diseño de APIs asíncronas con criterio de escala.",
      "Idempotencia y manejo de incidentes sólidos.",
      "Experiencia real de mentoría técnica.",
    ],
    gaps: [
      ...(p.miss.length ? ["Validar experiencia práctica en " + p.miss.slice(0, 2).join(" y ") + "."] : []),
      "Comunicación a veces extensa; afinar síntesis.",
      "Pocos ejemplos de manejo de conflicto en equipo.",
    ],
    recomendacion: p.score >= 80 ? "Avanzar a oferta" : p.score >= 65 ? "Segunda entrevista" : "Mantener en pipeline",
  };
}

window.buildCV = buildCV;
window.buildCVQuestions = buildCVQuestions;
window.TRANSCRIPT = TRANSCRIPT;
window.EVAL = EVAL;
window.buildFinal = buildFinal;
