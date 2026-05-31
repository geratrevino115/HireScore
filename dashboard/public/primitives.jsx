/* global React, N */
// Primitivas Notion — sin emojis

const { useState, useMemo, useEffect } = React;
const fontN = "ui-sans-serif, -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif";

function Chip({ color = "gray", children, dot, style }) {
  const c = N.chip[color] || N.chip.gray;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      background: c.bg, color: c.fg,
      padding: "1px 8px", borderRadius: 4,
      fontSize: 12, fontWeight: 500, lineHeight: "18px",
      whiteSpace: "nowrap", ...style,
    }}>
      {dot && <span style={{ width: 6, height: 6, borderRadius: 999, background: c.fg }} />}
      {children}
    </span>
  );
}

const ICON_PATHS = {
  chevR: "M9 18l6-6-6-6",
  chevD: "M6 9l6 6 6-6",
  search: "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.35-4.35",
  cog: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z",
  plus: "M12 5v14M5 12h14",
  dots: "M5 12h.01M12 12h.01M19 12h.01",
  page: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6",
  folder: "M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z",
  trash: "M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2",
  briefcase: "M2 7h20v14H2zM16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16",
  clock: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 6v6l4 2",
  star: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z",
  user: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  users: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
  text: "M4 7V4h16v3M9 20h6M12 4v16",
  selectIcon: "M3 6h18M3 12h18M3 18h12",
  number: "M4 9h16M4 15h16M10 3L8 21M16 3l-2 18",
  date: "M3 9h18M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zM16 2v4M8 2v4",
  bar: "M3 3v18h18M7 14l4-4 4 4 5-5",
  filter: "M22 3H2l8 9.46V19l4 2v-8.54L22 3z",
  sort: "M3 6h13M3 12h9M3 18h5M17 8l4-4 4 4M17 16l4 4 4-4",
  comment: "M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z",
  check: "M20 6L9 17l-5-5",
  x: "M18 6L6 18M6 6l12 12",
  mail: "M4 4h16v16H4zM4 4l8 8 8-8",
  upload: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12",
  sparkle: "M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8",
  expand: "M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7",
  arrow: "M5 12h14M12 5l7 7-7 7",
  dollar: "M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",
  sun: "M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4",
  moon: "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z",
  archive: "M21 8v13H3V8M1 3h22v5H1zM10 12h4",
  rotate: "M3 12a9 9 0 1 0 9-9 9 9 0 0 0-6.4 2.6L3 8M3 3v5h5",
  chevL: "M15 18l-6-6 6-6",
  link: "M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71",
  mic: "M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3zM19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8",
  fileText: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8",
  edit: "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4z",
  send: "M22 2L11 13M22 2l-7 20-4-9-9-4z",
  play: "M5 3l14 9-14 9z",
  grad: "M22 10L12 5 2 10l10 5 10-5zM6 12v5c0 1 2.5 3 6 3s6-2 6-3v-5",
  code: "M16 18l6-6-6-6M8 6l-6 6 6 6",
  building: "M3 21h18M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16M9 7h1M9 11h1M9 15h1M14 7h1M14 11h1M14 15h1",
  pin: "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0zM12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  download: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3",
  lock: "M5 11h14v10H5zM7 11V7a5 5 0 0 1 10 0v4",
  zap: "M13 2L3 14h9l-1 8 10-12h-9z",
  layers: "M12 2L2 7l10 5 10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
  trend: "M23 6l-9.5 9.5-5-5L1 18M17 6h6v6",
  alert: "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01",
  video: "M23 7l-7 5 7 5zM1 5h15v14H1z",
  scale: "M12 3v18M3 7h18M7 7l-3 7h6zM17 7l-3 7h6z",
};

function NIcon({ name, size = 16, color = "currentColor", strokeWidth = 1.6 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}
      strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <path d={ICON_PATHS[name] || ""} />
    </svg>
  );
}

function NAvatar({ name, size = 22 }) {
  const initials = name.split(" ").map(w => w[0]).slice(0, 2).join("");
  const palette = ["#c98f8f", "#c9aa7d", "#a9b87f", "#7fa9b8", "#9a8bc4", "#c48ba9"];
  const hash = [...name].reduce((a, c) => a + c.charCodeAt(0), 0);
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: palette[hash % palette.length],
      color: "#fff", fontSize: size * 0.42, fontWeight: 600,
      display: "grid", placeItems: "center", flexShrink: 0,
    }}>{initials}</div>
  );
}

// Monograma neutro para "páginas" del sidebar (sin emoji)
function Monogram({ label, size = 18 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: 4,
      background: N.hover, color: N.ink2,
      fontSize: 10.5, fontWeight: 600,
      display: "grid", placeItems: "center", flexShrink: 0,
    }}>{label}</div>
  );
}

function SBItem({ icon, label, indent = 0, selected, badge, onClick, hot }) {
  return (
    <div onClick={onClick} style={{
      display: "flex", alignItems: "center", gap: 7,
      paddingLeft: 6 + indent * 16, paddingRight: 8, paddingTop: 4, paddingBottom: 4,
      borderRadius: 4,
      background: selected ? N.selected : "transparent",
      color: selected ? N.ink : N.ink2,
      fontSize: 14, fontWeight: 400, cursor: "pointer", minHeight: 28,
    }}
    onMouseEnter={e => { if (!selected) e.currentTarget.style.background = N.hover; }}
    onMouseLeave={e => { if (!selected) e.currentTarget.style.background = "transparent"; }}
    >
      {icon && <span style={{ width: 20, display: "grid", placeItems: "center", color: N.ink3 }}>{icon}</span>}
      <span style={{ flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{label}</span>
      {hot && <span style={{ color: N.ink3, fontSize: 11 }}>{hot}</span>}
      {badge !== undefined && <span style={{ color: N.ink3, fontSize: 12, fontVariantNumeric: "tabular-nums" }}>{badge}</span>}
    </div>
  );
}

function ScoreCell({ value, width }) {
  const color = value >= 80 ? N.chip.green.fg : value >= 60 ? N.chip.blue.fg : value >= 40 ? N.chip.yellow.fg : N.chip.red.fg;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, width: width || "100%" }}>
      <div style={{ flex: 1, height: 6, borderRadius: 3, background: N.track, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${value}%`, background: color, borderRadius: 3 }} />
      </div>
      <span style={{ color: N.ink, fontSize: 13, fontVariantNumeric: "tabular-nums", fontWeight: 600, minWidth: 22, textAlign: "right" }}>{value}</span>
    </div>
  );
}

Object.assign(window, { Chip, NIcon, NAvatar, Monogram, SBItem, ScoreCell, fontN });
