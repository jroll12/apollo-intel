/* ============================================================================
   Fun & Focus — app shell.

   No accounts and no login. A kid picks their name off the roster once and
   that phone remembers it. Two tabs; Fun opens first.
   ========================================================================= */

import { CONFIG } from './config.js';
import { ROSTER, initials } from './data/roster.js';
import { getPlayer, setPlayer } from './store.js';
import { initChain } from './chain.js';
import { renderFun, loadFunData, lockCoachMode } from './fun.js';
import { renderFocus, exitPhase, inPhase } from './focus.js';
import { el, clear } from './ui.js';

const app = document.getElementById('app');

const ui = {
  tab: 'fun', // Fun opens first, always.
  player: getPlayer(),
  switchingPlayer: false,
};

/* ---------- Boot ----------------------------------------------------------- */

async function boot() {
  render();
  await initChain();
  await loadFunData();
  render();
  registerServiceWorker();
}

function registerServiceWorker() {
  // file:// has no service worker support and doesn't need one.
  if (!('serviceWorker' in navigator) || !location.protocol.startsWith('http')) return;
  navigator.serviceWorker.register('sw.js').catch(() => {
    /* Offline caching is a bonus, not a requirement. */
  });
}

/* ---------- Render --------------------------------------------------------- */

function render() {
  clear(app);

  if (!ui.player || ui.switchingPlayer) {
    app.append(renderPicker());
    return;
  }

  const shell = el('div', { class: 'shell' });
  shell.append(renderTopbar());

  const main = el('main', { class: 'main', id: 'main' });
  if (ui.tab === 'fun') renderFun(main, { rerender: render });
  else renderFocus(main, { player: ui.player, onStateChange: render });
  shell.append(main);

  app.append(shell, renderTabbar());
}

function renderTopbar() {
  const title = el('div', { class: 'topbar__title' }, [
    el('small', { text: CONFIG.teamName || 'Team' }),
    document.createTextNode('Fun & Focus'),
  ]);

  const chip = el('button', { class: 'playerchip', type: 'button', title: 'Switch player' }, [
    el('span', { class: 'playerchip__avatar', text: initials(ui.player) }),
    el('span', { text: ui.player.split(' ')[0] }),
  ]);
  chip.addEventListener('click', () => {
    ui.switchingPlayer = true;
    render();
  });

  return el('header', { class: 'topbar' }, [title, chip]);
}

function renderTabbar() {
  const bar = el('nav', { class: 'tabbar', role: 'tablist' });

  for (const [id, icon, label] of [
    ['fun', '🔗', 'Fun'],
    ['focus', '⚾', 'Focus'],
  ]) {
    const btn = el(
      'button',
      { class: 'tabbar__btn', type: 'button', role: 'tab', 'aria-selected': String(ui.tab === id) },
      [el('span', { class: 'ico', text: icon }), el('span', { text: label })],
    );
    btn.addEventListener('click', () => {
      if (ui.tab === 'fun' && id !== 'fun') lockCoachMode();
      ui.tab = id;
      render();
      window.scrollTo(0, 0);
    });
    bar.append(btn);
  }

  return bar;
}

/* ---------- Player picker --------------------------------------------------
   The whole of "logging in". No accounts, no passwords, nothing typed. */

function renderPicker() {
  const wrap = el('div', { class: 'picker' });

  wrap.append(
    el('div', { class: 'picker__hero' }, [
      el('h1', {}, [document.createTextNode('Fun '), el('em', { text: '&' }), document.createTextNode(' Focus')]),
      el('p', { text: ui.switchingPlayer ? 'Whose phone is this now?' : "Tap your name to get started." }),
    ]),
  );

  const grid = el('div', { class: 'picker__grid' });
  for (const name of ROSTER) {
    const btn = el('button', {
      class: 'namebtn',
      type: 'button',
      'aria-pressed': String(name === ui.player),
      text: name,
    });
    btn.addEventListener('click', () => {
      ui.player = name;
      setPlayer(name);
      ui.switchingPlayer = false;
      // A different kid means a different quiz session.
      exitPhase();
      ui.tab = 'fun';
      render();
      window.scrollTo(0, 0);
    });
    grid.append(btn);
  }
  wrap.append(grid);

  if (ui.switchingPlayer && ui.player) {
    const cancel = el('button', { class: 'btn btn--ghost', type: 'button', style: 'margin-top:16px;' }, [
      'Never mind',
    ]);
    cancel.addEventListener('click', () => {
      ui.switchingPlayer = false;
      render();
    });
    wrap.append(cancel);
  }

  wrap.append(
    el('p', {
      class: 'linkout',
      text: 'Your name is only saved on this phone. Nothing to sign up for.',
    }),
  );

  return wrap;
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

boot();
