/* Small DOM + formatting helpers. No framework, no build step. */

/** Create an element. `attrs.class`, `attrs.html`, `attrs.text`, `on*` handlers. */
export function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (value === null || value === undefined || value === false) continue;
    if (key === 'class') node.className = value;
    else if (key === 'text') node.textContent = value;
    else if (key === 'html') node.innerHTML = value;
    else if (key.startsWith('on') && typeof value === 'function') {
      node.addEventListener(key.slice(2).toLowerCase(), value);
    } else node.setAttribute(key, value === true ? '' : String(value));
  }
  for (const child of [].concat(children)) {
    if (child === null || child === undefined || child === false) continue;
    node.append(child.nodeType ? child : document.createTextNode(String(child)));
  }
  return node;
}

export function clear(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
  return node;
}

/** "2026-08-18" or an ISO timestamp -> "Aug 18, 2026" */
export function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value ?? '');
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/** Today as YYYY-MM-DD in the phone's own timezone (not UTC). */
export function todayLocalISO() {
  const now = new Date();
  const offsetMs = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offsetMs).toISOString().slice(0, 10);
}

/** Deterministic 32-bit hash — used to shuffle answer order stably per question. */
export function hashString(str) {
  let hash = 2166136261;
  for (let i = 0; i < str.length; i += 1) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/**
 * Shuffle stably from a seed, so a given question always presents its options
 * in the same order (a kid re-reading a situation shouldn't see the answers
 * jump around) while different questions differ.
 */
export function seededShuffle(items, seed) {
  const out = items.slice();
  let state = seed || 1;
  for (let i = out.length - 1; i > 0; i -= 1) {
    state = (state * 1664525 + 1013904223) >>> 0;
    const j = state % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Fisher-Yates, genuinely random — used to order a phase's question deck. */
export function shuffle(items) {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function escapeHtml(str) {
  return String(str).replace(
    /[&<>"']/g,
    (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch],
  );
}

/* ---------- Baseball display helpers -------------------------------------- */

export const POSITION_NAMES = {
  P: 'Pitcher',
  C: 'Catcher',
  '1B': 'First base',
  '2B': 'Second base',
  SS: 'Shortstop',
  '3B': 'Third base',
  LF: 'Left field',
  CF: 'Center field',
  RF: 'Right field',
};

export const POSITION_ORDER = ['P', 'C', '1B', '2B', 'SS', '3B', 'LF', 'CF', 'RF'];

/** A tiny base diamond with occupied bases filled in. */
export function diamondSVG(basesOccupied = []) {
  const on = (n) => (basesOccupied.includes(n) ? '#FFC93C' : 'none');
  const stroke = 'rgba(255,253,247,0.55)';
  return `
  <svg class="diamond" viewBox="0 0 100 100" role="img"
       aria-label="Runners on ${basesOccupied.length ? basesOccupied.map(baseName).join(', ') : 'no bases'}">
    <path d="M50 82 L20 52 L50 22 L80 52 Z" fill="none" stroke="${stroke}" stroke-width="2.5"/>
    <rect x="73.5" y="45.5" width="13" height="13" rx="2" transform="rotate(45 80 52)" fill="${on(1)}" stroke="${stroke}" stroke-width="2.5"/>
    <rect x="43.5" y="15.5" width="13" height="13" rx="2" transform="rotate(45 50 22)" fill="${on(2)}" stroke="${stroke}" stroke-width="2.5"/>
    <rect x="13.5" y="45.5" width="13" height="13" rx="2" transform="rotate(45 20 52)" fill="${on(3)}" stroke="${stroke}" stroke-width="2.5"/>
    <path d="M45 78 L55 78 L55 84 L50 89 L45 84 Z" fill="none" stroke="${stroke}" stroke-width="2.5"/>
  </svg>`;
}

function baseName(n) {
  return { 1: 'first', 2: 'second', 3: 'third' }[n] || String(n);
}

/** Outs shown as filled pips — no numbers to misread at a glance. */
export function outsPips(outs) {
  const pips = [0, 1]
    .map((i) => `<span class="outs__pip ${i < outs ? 'outs__pip--on' : ''}"></span>`)
    .join('');
  return `<div class="outs">${pips}<span class="outs__label">${outs} out${outs === 1 ? '' : 's'}</span></div>`;
}
