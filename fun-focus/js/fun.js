/* ============================================================================
   FUN TAB — opens first.

   Golden Chain history (shared), the coach's award form behind a PIN, the
   team chant and handshake, the walk-up sheet link-out, and the "What Fun
   Looks Like in a Game" card.
   ========================================================================= */

import { CONFIG } from './config.js';
import { ROSTER } from './data/roster.js';
import { CHANT_LINES, CHANT_CLOSER, HANDSHAKE_BASE, FUN_CHECKLIST } from './data/fun-content.js';
import { loadShared, addAward, saveHandshake, chainStatus, MAX_NOTE, MAX_HANDSHAKE } from './chain.js';
import { el, clear, formatDate, todayLocalISO } from './ui.js';

const state = {
  loading: true,
  awards: [],
  handshake: '',
  coachUnlocked: false,
  view: 'main', // 'main' | 'pin' | 'award'
  message: null, // { kind: 'ok' | 'info', text }
  pinError: null,
};

export async function loadFunData() {
  state.loading = true;
  const data = await loadShared();
  state.awards = data.awards;
  state.handshake = data.handshake || CONFIG.handshakeFinalMoveDefault || '';
  state.loading = false;
}

export function renderFun(root, { rerender }) {
  clear(root);

  if (state.view === 'pin') return void root.append(renderPinGate(rerender));
  if (state.view === 'award') return void root.append(renderAwardForm(rerender));

  root.append(renderMain(rerender));
}

/* ---------- Main view ------------------------------------------------------ */

function renderMain(rerender) {
  const wrap = el('div');
  const status = chainStatus();

  if (!status.synced) {
    wrap.append(
      el('div', { class: 'banner' }, [
        el('span', { class: 'banner__ico', text: '🔗' }),
        el('div', {}, [
          el('strong', { text: 'The chain is only saved on this phone' }),
          el('span', {
            text: `${status.reason} Everything else in the app works fine — see README.md to switch the shared list on.`,
          }),
        ]),
      ]),
    );
  } else if (status.offline) {
    wrap.append(
      el('div', { class: 'banner' }, [
        el('span', { class: 'banner__ico', text: '📶' }),
        el('div', {}, [
          el('strong', { text: 'Showing the last list this phone saw' }),
          el('span', { text: "Couldn't reach the shared list just now. It'll catch up when you have signal." }),
        ]),
      ]),
    );
  }

  if (state.message) {
    wrap.append(el('div', { class: `form-msg form-msg--${state.message.kind}`, text: state.message.text }));
    state.message = null;
  }

  /* --- Golden Chain history --- */
  const chainCard = el('div', { class: 'card' }, [
    el('div', { class: 'card__title', text: '🔗 Golden Chain' }),
    el('p', { class: 'card__sub', text: 'Every time it has been handed over. Newest first.' }),
  ]);

  if (state.loading) {
    chainCard.append(el('div', { class: 'empty', text: 'Loading the chain…' }));
  } else if (state.awards.length === 0) {
    chainCard.append(
      el('div', { class: 'empty', text: 'No awards yet. The first one goes here.' }),
    );
  } else {
    const list = el('ul', { class: 'chain-list' });
    for (const award of state.awards) {
      list.append(
        el('li', { class: 'chain-item' }, [
          el('span', { class: 'chain-item__link', text: '🔗' }),
          el('div', { class: 'chain-item__body' }, [
            el('div', { class: 'chain-item__date', text: formatDate(award.date) }),
            el('div', { class: 'chain-item__name', text: award.player }),
            award.note ? el('div', { class: 'chain-item__note', text: award.note }) : null,
          ]),
        ]),
      );
    }
    chainCard.append(list);
  }

  const awardBtn = el('button', { class: 'btn btn--primary', type: 'button', style: 'margin-top:14px;' }, [
    'Award the Golden Chain',
  ]);
  awardBtn.addEventListener('click', () => {
    state.view = state.coachUnlocked ? 'award' : 'pin';
    state.pinError = null;
    rerender();
  });
  chainCard.append(awardBtn);
  chainCard.append(el('p', { class: 'form-note', style: 'margin:8px 0 0;text-align:center;', text: 'Coaches only' }));

  wrap.append(chainCard);

  /* --- Chant & handshake --- */
  const team = CONFIG.teamName || 'TEAM';
  const chantCard = el('div', { class: 'card' }, [
    el('div', { class: 'card__title', text: 'Team chant' }),
    el('p', { class: 'card__sub', text: 'Hands in. Loud.' }),
  ]);

  const chant = el('div', { class: 'chant' });
  for (const line of CHANT_LINES) chant.append(el('p', { text: line }));
  chant.append(el('p', { text: CHANT_CLOSER.replaceAll('[TEAM]', team) }));
  chantCard.append(chant);

  chantCard.append(el('div', { class: 'card__title', style: 'margin-top:20px;font-size:16px;', text: 'Handshake' }));

  const steps = el('div', { class: 'handshake' });
  for (const item of HANDSHAKE_BASE) {
    steps.append(
      el('div', { class: 'handshake__step' }, [
        el('span', { text: item.step }),
        el('b', { text: item.move }),
      ]),
    );
  }
  steps.append(
    el('div', { class: 'handshake__step handshake__step--final' }, [
      el('span', { text: '4' }),
      el('b', { text: state.handshake || '—' }),
    ]),
  );
  chantCard.append(steps);
  chantCard.append(
    el('p', {
      class: 'form-note',
      style: 'margin-top:10px;',
      text: state.handshake
        ? "Clap, bump, spin — then the move the team voted on."
        : "Clap, bump, spin — the team's final move goes in slot 4. A coach can add it below.",
    }),
  );

  if (state.coachUnlocked) {
    chantCard.append(renderHandshakeEditor(rerender));
  }

  wrap.append(chantCard);

  /* --- Walk-up songs: out of scope to rebuild, just link out --- */
  if (CONFIG.walkupSheetUrl) {
    wrap.append(
      el('div', { class: 'card' }, [
        el('div', { class: 'card__title', text: 'Walk-up songs' }),
        el('p', { class: 'card__sub', text: 'Still lives on the team sheet. Pick yours there.' }),
        el(
          'a',
          { class: 'btn', href: CONFIG.walkupSheetUrl, target: '_blank', rel: 'noopener noreferrer' },
          ['Open the walk-up sheet ↗'],
        ),
      ]),
    );
  }

  /* --- What fun looks like --- */
  const checklistCard = el('div', { class: 'card' }, [
    el('div', { class: 'card__title', text: 'What fun looks like in a game' }),
    el('p', { class: 'card__sub', text: 'Six moments. This is the standard.' }),
  ]);
  const checklist = el('ul', { class: 'checklist' });
  for (const item of FUN_CHECKLIST) {
    checklist.append(
      el('li', {}, [
        el('div', { class: 'checklist__moment', text: item.moment }),
        el('div', { class: 'checklist__looks', text: item.looks }),
      ]),
    );
  }
  checklistCard.append(checklist);
  wrap.append(checklistCard);

  return wrap;
}

function renderHandshakeEditor(rerender) {
  const box = el('div', { style: 'margin-top:16px;padding-top:16px;border-top:1px solid var(--line);' });

  const input = el('input', {
    type: 'text',
    id: 'handshake-move',
    maxlength: MAX_HANDSHAKE,
    placeholder: 'e.g. double high-five, then a bat flip',
    value: state.handshake,
  });

  box.append(
    el('div', { class: 'field' }, [
      el('label', { for: 'handshake-move', text: "The team's final move" }),
      input,
    ]),
  );

  const save = el('button', { class: 'btn', type: 'button' }, ['Save the final move']);
  save.addEventListener('click', async () => {
    save.disabled = true;
    save.textContent = 'Saving…';
    try {
      state.handshake = await saveHandshake(input.value.trim(), CONFIG.coachPin);
      state.message = { kind: 'ok', text: 'Handshake updated.' };
    } catch {
      state.message = {
        kind: 'info',
        text: "Couldn't reach the shared list — saved on this phone only for now.",
      };
      state.handshake = input.value.trim();
    }
    rerender();
  });
  box.append(save);

  return box;
}

/* ---------- PIN gate -------------------------------------------------------
   A friction gate so nobody taps "award" by accident. Not security — the PIN
   ships inside config.js and anyone can read it. */

function renderPinGate(rerender) {
  const wrap = el('div');

  const input = el('input', {
    class: 'pin-input',
    id: 'coach-pin',
    type: 'text',
    inputmode: 'numeric',
    pattern: '[0-9]*',
    maxlength: '4',
    autocomplete: 'off',
    placeholder: '••••',
  });

  const card = el('div', { class: 'card' }, [
    el('div', { class: 'card__title', text: 'Coach PIN' }),
    el('p', { class: 'card__sub', text: 'Four digits to award the chain.' }),
    el('div', { class: 'field' }, [
      el('label', { for: 'coach-pin', class: 'sr-only', text: 'Coach PIN' }),
      input,
    ]),
  ]);

  if (state.pinError) {
    card.append(el('div', { class: 'form-msg form-msg--info', text: state.pinError }));
  }

  const submit = el('button', { class: 'btn btn--primary', type: 'button' }, ['Unlock']);
  const tryUnlock = () => {
    if (input.value.trim() === String(CONFIG.coachPin)) {
      state.coachUnlocked = true;
      state.view = 'award';
      state.pinError = null;
    } else {
      state.pinError = "That PIN didn't match. Try again.";
    }
    rerender();
  };
  submit.addEventListener('click', tryUnlock);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') tryUnlock();
  });

  const cancel = el('button', { class: 'btn btn--ghost', type: 'button' }, ['Cancel']);
  cancel.addEventListener('click', () => {
    state.view = 'main';
    state.pinError = null;
    rerender();
  });

  card.append(submit, cancel);
  wrap.append(card);

  setTimeout(() => input.focus(), 50);
  return wrap;
}

/* ---------- Award form ----------------------------------------------------- */

function renderAwardForm(rerender) {
  const wrap = el('div');

  const select = el('select', { id: 'award-player' }, [
    el('option', { value: '', text: 'Pick a player…' }),
    ...ROSTER.map((name) => el('option', { value: name, text: name })),
  ]);

  const dateInput = el('input', { id: 'award-date', type: 'date', value: todayLocalISO() });
  const noteInput = el('textarea', {
    id: 'award-note',
    maxlength: MAX_NOTE,
    placeholder: 'What earned it? (optional)',
  });

  const card = el('div', { class: 'card' }, [
    el('div', { class: 'card__title', text: '🔗 Award the Golden Chain' }),
    el('p', { class: 'card__sub', text: 'This goes to everyone’s phone.' }),
    el('div', { class: 'field' }, [el('label', { for: 'award-player', text: 'Player' }), select]),
    el('div', { class: 'field' }, [el('label', { for: 'award-date', text: 'Date' }), dateInput]),
    el('div', { class: 'field' }, [el('label', { for: 'award-note', text: 'Note' }), noteInput]),
  ]);

  const msgSlot = el('div');
  card.append(msgSlot);

  const submit = el('button', { class: 'btn btn--primary', type: 'button' }, ['Award it']);
  submit.addEventListener('click', async () => {
    if (!select.value) {
      clear(msgSlot).append(el('div', { class: 'form-msg form-msg--info', text: 'Pick a player first.' }));
      return;
    }

    submit.disabled = true;
    submit.textContent = 'Sending…';

    const payload = {
      player: select.value,
      note: noteInput.value.trim(),
      date: dateInput.value || todayLocalISO(),
      pin: CONFIG.coachPin,
    };

    try {
      await addAward(payload);
      state.message = { kind: 'ok', text: `🔗 ${payload.player} has the chain.` };
    } catch {
      state.message = {
        kind: 'info',
        text: `Saved on this phone, but it didn't reach the shared list. Check the connection and re-award it when you're back on signal.`,
      };
    }

    await loadFunData();
    state.view = 'main';
    rerender();
  });

  const cancel = el('button', { class: 'btn btn--ghost', type: 'button' }, ['Back']);
  cancel.addEventListener('click', () => {
    state.view = 'main';
    rerender();
  });

  card.append(submit, cancel);
  wrap.append(card);
  return wrap;
}

/* Leaving the tab drops coach mode, so a phone handed back to a kid isn't
   still unlocked. */
export function lockCoachMode() {
  state.coachUnlocked = false;
  state.view = 'main';
}
