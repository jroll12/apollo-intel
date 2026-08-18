/* ============================================================================
   FUN TAB

     - Chant Book, with a full-screen Dugout Mode for the kid leading the cheer
     - Golden Chain history (shared across every phone)
     - Award the Golden Chain, behind the coach's PIN
     - Handshake, with the team's voted final move
     - Walk-up song sheet link-out
     - "What Fun Looks Like in a Game"

   Everything except the Golden Chain and the handshake move is static. Those
   two live in chain.js because they have to look the same on every phone.
   ========================================================================= */

import { CONFIG } from './config.js';
import { ROSTER } from './data/roster.js';
import { HANDSHAKE_BASE, FUN_CHECKLIST } from './data/fun-content.js';
import { CHANT_SECTIONS, ALL_CHANTS, CHANT_RULE } from './data/chants.js';
import { loadShared, addAward, saveHandshake, chainStatus, MAX_NOTE, MAX_HANDSHAKE } from './chain.js';
import { el, clear, formatDate, todayLocalISO } from './ui.js';

const funState = {
  loading: true,
  awards: [],
  handshake: '',
  coachUnlocked: false,
  view: 'main', // 'main' | 'chants' | 'pin' | 'award'
  openChant: null, // chant id showing in Dugout Mode
  message: null,
  pinError: null,
};

export async function loadFunData() {
  funState.loading = true;
  const data = await loadShared();
  funState.awards = data.awards;
  funState.handshake = data.handshake || CONFIG.handshakeFinalMoveDefault || '';
  funState.loading = false;
}

export function renderFun(root, { rerender }) {
  clear(root);

  if (funState.view === 'pin') return void root.append(pinGate(rerender));
  if (funState.view === 'award') return void root.append(awardForm(rerender));
  if (funState.view === 'chants') return void root.append(chantBook(rerender));

  root.append(mainView(rerender));

  if (funState.openChant) root.append(dugoutMode(rerender));
}

const teamName = () => CONFIG.teamName || 'TEAM';
const chantTeam = () => CONFIG.chantName || CONFIG.teamName || 'TEAM';

/* ---------- Main ----------------------------------------------------------- */

function mainView(rerender) {
  const wrap = el('div');
  const status = chainStatus();

  if (!status.synced) {
    wrap.append(
      banner('🔗', 'The chain is only saved on this phone', `${status.reason} Everything else works fine.`),
    );
  } else if (status.offline) {
    wrap.append(
      banner('📶', 'Showing the last list this phone saw', "Couldn't reach the shared list. It'll catch up on signal."),
    );
  }

  if (funState.message) {
    wrap.append(el('div', { class: `form-msg form-msg--${funState.message.kind}`, text: funState.message.text }));
    funState.message = null;
  }

  /* --- Chant Book entry --- */
  const chantCard = el('button', { class: 'bigcard', type: 'button' }, [
    el('div', { class: 'bigcard__eyebrow', text: 'Chant book' }),
    el('div', { class: 'bigcard__title', text: 'Get Loud' }),
    el('div', {
      class: 'bigcard__body',
      text: `${ALL_CHANTS.length} chants, sorted by when you use them. Tap one and hold your phone up.`,
    }),
    el('div', { class: 'bigcard__go', text: 'Open the book →' }),
  ]);
  chantCard.addEventListener('click', () => {
    funState.view = 'chants';
    rerender();
  });
  wrap.append(chantCard);

  /* --- Golden Chain --- */
  const chain = el('div', { class: 'card' }, [
    el('div', { class: 'card__title', text: '🔗 Golden Chain' }),
    el('p', { class: 'card__sub', text: 'Every time it has been handed over. Newest first.' }),
  ]);

  if (funState.loading) {
    chain.append(el('div', { class: 'empty', text: 'Loading the chain…' }));
  } else if (funState.awards.length === 0) {
    chain.append(el('div', { class: 'empty', text: 'No awards yet. The first one goes here.' }));
  } else {
    const list = el('ul', { class: 'chain-list' });
    for (const a of funState.awards) {
      list.append(
        el('li', { class: 'chain-item' }, [
          el('span', { class: 'chain-item__link', text: '🔗' }),
          el('div', { class: 'chain-item__body' }, [
            el('div', { class: 'chain-item__date', text: formatDate(a.date) }),
            el('div', { class: 'chain-item__name', text: a.player }),
            a.note ? el('div', { class: 'chain-item__note', text: a.note }) : null,
          ]),
        ]),
      );
    }
    chain.append(list);
  }

  const awardBtn = el('button', { class: 'btn btn--primary', type: 'button', style: 'margin-top:14px;' }, [
    'Award the Golden Chain',
  ]);
  awardBtn.addEventListener('click', () => {
    funState.view = funState.coachUnlocked ? 'award' : 'pin';
    funState.pinError = null;
    rerender();
  });
  chain.append(awardBtn, el('p', { class: 'form-note', style: 'margin:8px 0 0;text-align:center;', text: 'Coaches only' }));
  wrap.append(chain);

  /* --- Handshake --- */
  const shake = el('div', { class: 'card' }, [
    el('div', { class: 'card__title', text: 'The handshake' }),
    el('p', { class: 'card__sub', text: 'Clap, bump, spin — then the move the team voted on.' }),
  ]);

  const steps = el('div', { class: 'handshake' });
  for (const item of HANDSHAKE_BASE) {
    steps.append(el('div', { class: 'handshake__step' }, [el('span', { text: item.step }), el('b', { text: item.move })]));
  }
  steps.append(
    el('div', { class: 'handshake__step handshake__step--final' }, [
      el('span', { text: '4' }),
      el('b', { text: funState.handshake || '—' }),
    ]),
  );
  shake.append(steps);
  if (!funState.handshake) {
    shake.append(el('p', { class: 'form-note', style: 'margin-top:10px;', text: 'A coach can add the final move below.' }));
  }
  if (funState.coachUnlocked) shake.append(handshakeEditor(rerender));
  wrap.append(shake);

  /* --- Walk-up songs (link-out; not rebuilt here on purpose) --- */
  if (CONFIG.walkupSheetUrl) {
    wrap.append(
      el('div', { class: 'card' }, [
        el('div', { class: 'card__title', text: 'Walk-up songs' }),
        el('p', { class: 'card__sub', text: 'Still on the team sheet. Pick yours there.' }),
        el('a', { class: 'btn', href: CONFIG.walkupSheetUrl, target: '_blank', rel: 'noopener noreferrer' }, [
          'Open the walk-up sheet ↗',
        ]),
      ]),
    );
  }

  /* --- What fun looks like --- */
  const checklist = el('div', { class: 'card' }, [
    el('div', { class: 'card__title', text: 'What fun looks like in a game' }),
    el('p', { class: 'card__sub', text: 'Six moments. This is the standard.' }),
  ]);
  const items = el('ul', { class: 'checklist' });
  for (const item of FUN_CHECKLIST) {
    items.append(
      el('li', {}, [
        el('div', { class: 'checklist__moment', text: item.moment }),
        el('div', { class: 'checklist__looks', text: item.looks }),
      ]),
    );
  }
  checklist.append(items);
  wrap.append(checklist);

  return wrap;
}

function banner(icon, title, body) {
  return el('div', { class: 'banner' }, [
    el('span', { class: 'banner__ico', text: icon }),
    el('div', {}, [el('strong', { text: title }), el('span', { text: body })]),
  ]);
}

/* ---------- Chant book ------------------------------------------------------ */

function chantBook(rerender) {
  const wrap = el('div');

  const back = el('button', { class: 'btn btn--ghost', style: 'width:auto;padding:8px 4px;' }, ['‹ Fun']);
  back.addEventListener('click', () => {
    funState.view = 'main';
    rerender();
  });
  wrap.append(el('div', { class: 'quizhead' }, [back, el('div', { class: 'quizhead__name', text: 'Chant book' })]));

  wrap.append(
    el('div', { class: 'rulecard' }, [
      el('div', { class: 'rulecard__title', text: CHANT_RULE.title }),
      el('div', { class: 'rulecard__body', text: CHANT_RULE.body }),
    ]),
  );

  for (const section of CHANT_SECTIONS) {
    wrap.append(
      el('div', { class: 'section-label', text: section.name }),
      el('p', { class: 'chantsec__blurb', text: section.blurb }),
    );

    for (const chant of section.chants) {
      const row = el('button', { class: `chantrow${chant.signature ? ' chantrow--sig' : ''}`, type: 'button' }, [
        el('div', { class: 'chantrow__main' }, [
          el('div', { class: 'chantrow__name', text: chant.name }),
          el('div', { class: 'chantrow__moment', text: chant.moment }),
        ]),
        el('span', { class: 'chantrow__go', text: '▶' }),
      ]);
      row.addEventListener('click', () => {
        funState.openChant = chant.id;
        funState.view = 'main';
        rerender();
        // Re-open the book underneath so closing Dugout Mode returns here.
        funState.view = 'chants';
      });
      wrap.append(row);
    }
  }

  return wrap;
}

/* ---------- Dugout Mode -----------------------------------------------------
   Full screen, huge type. The kid leading the cheer holds the phone up and the
   dugout reads it. That is the whole feature. */

function dugoutMode(rerender) {
  const chant = ALL_CHANTS.find((c) => c.id === funState.openChant);
  if (!chant) return el('div');

  const close = () => {
    funState.openChant = null;
    rerender();
  };

  const lines = el('div', { class: 'dugout__lines' });
  for (const line of chant.lines) {
    const text = line.text.replaceAll('[TEAM]', chantTeam().toUpperCase());
    if (line.who === 'lead') {
      lines.append(
        el('div', { class: 'dugout__line dugout__line--lead' }, [
          el('span', { class: 'dugout__who', text: 'One kid' }),
          el('span', { text }),
        ]),
      );
    } else if (line.who === 'all') {
      lines.append(
        el('div', { class: 'dugout__line dugout__line--all' }, [
          el('span', { class: 'dugout__who', text: 'Everybody' }),
          el('span', { text }),
        ]),
      );
    } else {
      lines.append(el('div', { class: 'dugout__line' }, [el('span', { text })]));
    }
  }

  const panel = el('div', { class: 'dugout' }, [
    el('div', { class: 'dugout__head' }, [
      el('div', { class: 'dugout__name', text: chant.name }),
      el('div', { class: 'dugout__moment', text: chant.moment }),
    ]),
    lines,
  ]);

  if (chant.note) panel.append(el('div', { class: 'dugout__note', text: chant.note }));

  const done = el('button', { class: 'btn dugout__close', type: 'button' }, ['Done']);
  done.addEventListener('click', close);
  panel.append(done);

  const scrim = el('div', { class: 'dugout__scrim', role: 'dialog', 'aria-modal': 'true' }, [panel]);
  scrim.addEventListener('click', (e) => {
    if (e.target === scrim) close();
  });
  return scrim;
}

/* ---------- Handshake editor (coach) ---------------------------------------- */

function handshakeEditor(rerender) {
  const box = el('div', { style: 'margin-top:16px;padding-top:16px;border-top:1px solid var(--line);' });
  const input = el('input', {
    type: 'text',
    id: 'handshake-move',
    maxlength: MAX_HANDSHAKE,
    placeholder: 'e.g. double high-five, then the freeze',
    value: funState.handshake,
  });
  box.append(el('div', { class: 'field' }, [el('label', { for: 'handshake-move', text: "The team's final move" }), input]));

  const save = el('button', { class: 'btn', type: 'button' }, ['Save the final move']);
  save.addEventListener('click', async () => {
    save.disabled = true;
    save.textContent = 'Saving…';
    try {
      funState.handshake = await saveHandshake(input.value.trim(), CONFIG.coachPin);
      funState.message = { kind: 'ok', text: 'Handshake updated.' };
    } catch {
      funState.handshake = input.value.trim();
      funState.message = { kind: 'info', text: "Couldn't reach the shared list — saved on this phone only." };
    }
    rerender();
  });
  box.append(save);
  return box;
}

/* ---------- PIN gate --------------------------------------------------------
   Friction so nobody taps "award" by accident. Not security — the PIN ships
   inside config.js and anyone can read it. */

function pinGate(rerender) {
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
    el('div', { class: 'field' }, [el('label', { for: 'coach-pin', class: 'sr-only', text: 'Coach PIN' }), input]),
  ]);

  if (funState.pinError) card.append(el('div', { class: 'form-msg form-msg--info', text: funState.pinError }));

  const submit = el('button', { class: 'btn btn--primary', type: 'button' }, ['Unlock']);
  const tryUnlock = () => {
    if (input.value.trim() === String(CONFIG.coachPin)) {
      funState.coachUnlocked = true;
      funState.view = 'award';
      funState.pinError = null;
    } else {
      funState.pinError = "That PIN didn't match. Try again.";
    }
    rerender();
  };
  submit.addEventListener('click', tryUnlock);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') tryUnlock();
  });

  const cancel = el('button', { class: 'btn btn--ghost', type: 'button' }, ['Cancel']);
  cancel.addEventListener('click', () => {
    funState.view = 'main';
    funState.pinError = null;
    rerender();
  });

  card.append(submit, cancel);
  setTimeout(() => input.focus(), 50);
  return el('div', {}, [card]);
}

/* ---------- Award form ------------------------------------------------------ */

function awardForm(rerender) {
  const select = el('select', { id: 'award-player' }, [
    el('option', { value: '', text: 'Pick a player…' }),
    ...ROSTER.map((name) => el('option', { value: name, text: name })),
  ]);
  const dateInput = el('input', { id: 'award-date', type: 'date', value: todayLocalISO() });
  const noteInput = el('textarea', { id: 'award-note', maxlength: MAX_NOTE, placeholder: 'What earned it? (optional)' });

  const card = el('div', { class: 'card' }, [
    el('div', { class: 'card__title', text: '🔗 Award the Golden Chain' }),
    el('p', { class: 'card__sub', text: "This goes to everyone's phone." }),
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
      funState.message = { kind: 'ok', text: `🔗 ${payload.player} has the chain.` };
    } catch {
      funState.message = {
        kind: 'info',
        text: "Saved on this phone, but it didn't reach the shared list. Re-award it when you're back on signal.",
      };
    }

    await loadFunData();
    funState.view = 'main';
    rerender();
  });

  const cancel = el('button', { class: 'btn btn--ghost', type: 'button' }, ['Back']);
  cancel.addEventListener('click', () => {
    funState.view = 'main';
    rerender();
  });

  card.append(submit, cancel);
  return el('div', {}, [card]);
}

/* Leaving the tab drops coach mode, so a phone handed back to a kid is not
   still unlocked. */
export function lockCoachMode() {
  funState.coachUnlocked = false;
  funState.view = 'main';
  funState.openChant = null;
}

export { teamName };
