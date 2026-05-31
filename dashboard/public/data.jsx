/* Tokens de tema (leen CSS vars → cambian solos en claro/oscuro) + datos de ejemplo */

const N = {
  bg:       "var(--n-bg)",
  sidebar:  "var(--n-sidebar)",
  ink:      "var(--n-ink)",
  ink2:     "var(--n-ink2)",
  ink3:     "var(--n-ink3)",
  ink4:     "var(--n-ink4)",
  hover:    "var(--n-hover)",
  selected: "var(--n-selected)",
  selrow:   "var(--n-selrow)",
  border:   "var(--n-border)",
  borderHi: "var(--n-border-hi)",
  track:    "var(--n-track)",
  chip: {
    gray:   { bg: "var(--c-gray-bg)",   fg: "var(--c-gray-fg)"   },
    brown:  { bg: "var(--c-brown-bg)",  fg: "var(--c-brown-fg)"  },
    orange: { bg: "var(--c-orange-bg)", fg: "var(--c-orange-fg)" },
    yellow: { bg: "var(--c-yellow-bg)", fg: "var(--c-yellow-fg)" },
    green:  { bg: "var(--c-green-bg)",  fg: "var(--c-green-fg)"  },
    cyan:   { bg: "var(--c-cyan-bg)",   fg: "var(--c-cyan-fg)"   },
    blue:   { bg: "var(--c-blue-bg)",   fg: "var(--c-blue-fg)"   },
    purple: { bg: "var(--c-purple-bg)", fg: "var(--c-purple-fg)" },
    red:    { bg: "var(--c-red-bg)",    fg: "var(--c-red-fg)"    },
  },
};

// Etapas reales del pipeline (app.js)
const ETAPAS = [
  { id: "nueva",              label: "Nueva",              chip: "blue"   },
  { id: "en_revision",        label: "En revisión",        chip: "yellow" },
  { id: "shortlist",          label: "Shortlist",          chip: "purple" },
  { id: "entrevista",         label: "Entrevista",         chip: "orange" },
  { id: "entrevista_tecnica", label: "Entrevista técnica", chip: "cyan"   },
  { id: "oferta",             label: "Oferta",             chip: "green"  },
  { id: "rechazada",          label: "Rechazada",          chip: "red"    },
];
const stageChip = Object.fromEntries(ETAPAS.map(e => [e.id, e.chip]));
const stageLabel = Object.fromEntries(ETAPAS.map(e => [e.id, e.label]));

window.N = N;
window.ETAPAS = ETAPAS;
window.stageChip = stageChip;
window.stageLabel = stageLabel;
