/* ============================================================================
   Fun & Focus — app shell. The Creamsicles.

   No accounts, no profiles, no name picker. Open the link and you're in.
   Progress belongs to the phone, not to a person.
   ========================================================================= */

import { CONFIG } from './config.js';
import { renderFun } from './fun.js';
import { renderFocus, exitPhase, inPhase } from './focus.js';
import { el, clear } from './ui.js';

const app = document.getElementById('app');

const ui = {
  tab: 'fun', // Fun opens first.
};

/* ---------- Render --------------------------------------------------------- */

function render() {
  clear(app);

  const shell = el('div', { class: 'shell' });
  shell.append(renderTopbar());

  const main = el('main', { class: 'main', id: 'main' });
  if (ui.tab === 'fun') renderFun(main, { goToFocus: () => switchTab('focus') });
  else renderFocus(main, { onStateChange: render });
  shell.append(main);

  app.append(shell, renderTabbar());
}

function switchTab(id) {
  ui.tab = id;
  render();
  window.scrollTo(0, 0);
}

function renderTopbar() {
  const title = el('div', { class: 'topbar__title' }, [
    el('small', { text: CONFIG.teamName || 'Team' }),
    document.createTextNode('Fun & Focus'),
  ]);

  return el('header', { class: 'topbar' }, [title]);
}

function renderTabbar() {
  const bar = el('nav', { class: 'tabbar', role: 'tablist' });

  for (const [id, icon, label] of [
    ['fun', '🍊', 'Fun'],
    ['focus', '⚾', 'Focus'],
  ]) {
    const btn = el(
      'button',
      { class: 'tabbar__btn', type: 'button', role: 'tab', 'aria-selected': String(ui.tab === id) },
      [el('span', { class: 'ico', text: icon }), el('span', { text: label })],
    );
    btn.addEventListener('click', () => switchTab(id));
    bar.append(btn);
  }

  return bar;
}

/* ---------- Boot ----------------------------------------------------------- */

function registerServiceWorker() {
  // file:// has no service worker support and doesn't need one.
  if (!('serviceWorker' in navigator) || !location.protocol.startsWith('http')) return;
  navigator.serviceWorker.register('sw.js').catch(() => {
    /* Offline caching is a bonus, not a requirement. */
  });
}

/* Back button closes a quiz before it leaves the app. */
window.addEventListener('popstate', () => {
  if (inPhase()) {
    exitPhase();
    render();
    history.pushState(null, '', location.href);
  }
});
history.pushState(null, '', location.href);

render();
registerServiceWorker();
