// "Winter night from the air": ink-blue ground, sodium-amber roads and towns, snow-white type,
// and one teal accent reserved for change (the -6.3%, the +180, the subject home).
export const C = {
  ink: "#060b15",
  deep: "#0b1524",
  county: "#0f1a2b",
  hamilton: "#16263d",
  hamiltonSide: "#0d1726",
  edgeDim: "#2b4163",
  amber: "#ffb04d",
  amberHot: "#ffd68a",
  amberDim: "#b9773a",
  snow: "#f4f7fb",
  snowDim: "#c9d4e4",
  muted: "#9fb0c8",
  teal: "#3fe0c5",
  tealDeep: "#0f6b60",
} as const;

export const FONT = {
  display: '"Bricolage Grotesque", sans-serif',
  body: '"Inter", sans-serif',
} as const;

export type Format = "portrait" | "feed";

// Safe areas. Portrait keeps clear of the Reels/TikTok/Shorts UI (bottom 380 px, right 150 px).
export const LAYOUT = {
  portrait: { w: 1080, h: 1920, top: 210, bottom: 1540, left: 80, right: 930, captionY: 1330 },
  feed: { w: 1080, h: 1350, top: 90, bottom: 1270, left: 80, right: 1000, captionY: 1110 },
} as const;
