/* ============================================================================
   FOCUS TAB — situational practice.

   One quiz loop serves all four phases:
     1. situation screen (outs, runners, your position, what's your job)
     2. answer + one line of why, plus a trap line only when there is one
     3. whole-field reveal — all nine positions, every time
     4. on a correct answer, one random Golden-Chain hype line

   Grading is about knowing the job and calling it, never about whether the
   throw would have been caught. Nothing here counts misses, and there is no
   consequence system to build one on: a wrong answer resets the current
   streak and shows the right read, and that is all it does.
   ========================================================================= */

import { PHASES, getPhase } from './data/phases.js';
import { randomHype } from './data/hype.js';
import { getPhaseProgress, recordAnswer } from './store.js';
import { el, clear, shuffle, diamondSVG, outsPips, POSITION_NAMES } from './ui.js';

let session = null; // { phaseId, deck, index, answered, pickedKey }

export function renderFocus(root, { player, onStateChange }) {
  clear(root);
  if (session) root.append(renderQuiz(player, onStateChange));
  else root.append(renderPhaseList(player, onStateChange));
}

/* ---------- Phase list ----------------------------------------------------- */

function renderPhaseList(player, onStateChange) {
  const wrap = el('div');

  wrap.append(
    el('div', { class: 'section-label', text: 'Situational practice' }),
    el('p', {
      class: 'card__sub',
      style: 'margin:0 0 14px 2px;',
      text: 'Four phases. Work through them in order, or jump around — nothing locks.',
    }),
  );

  for (const phase of PHASES) {
    const progress = getPhaseProgress(player, phase.id);
    const total = phase.questions.length;
    const done = progress.correctIds.length;
    const pct = total ? Math.round((done / total) * 100) : 0;

    const card = el('button', { class: 'phase', type: 'button' }, [
      el('div', { class: 'phase__top' }, [
        el('span', { class: 'phase__num', text: phase.num }),
      ]),
      el('div', { class: 'phase__name', text: phase.name }),
      el('div', { class: 'phase__standard', text: phase.standard }),
      el('div', { class: 'bar' }, [el('div', { class: 'bar__fill', style: `width:${pct}%` })]),
      el('div', { class: 'phase__stats' }, [
        el('span', { text: `${done} of ${total} situations` }),
        el(
          'span',
          { class: 'streak' },
          progress.streak > 0
            ? `🔗 ${progress.streak} in a row`
            : progress.bestStreak > 0
              ? `Best run: ${progress.bestStreak}`
              : 'Start a run',
        ),
      ]),
    ]);

    card.addEventListener('click', () => {
      startPhase(phase.id, player);
      onStateChange();
    });

    wrap.append(card);
  }

  return wrap;
}

/* ---------- Deck ----------------------------------------------------------- */

function startPhase(phaseId, player) {
  const phase = getPhase(phaseId);
  const progress = getPhaseProgress(player, phaseId);
  const alreadyRight = new Set(progress.correctIds);

  // Situations not yet answered correctly come first, so completion is
  // reachable instead of endlessly re-serving the same easy ones.
  const fresh = shuffle(phase.questions.filter((q) => !alreadyRight.has(q.id)));
  const review = shuffle(phase.questions.filter((q) => alreadyRight.has(q.id)));

  session = { phaseId, deck: [...fresh, ...review], index: 0, answered: false, pickedKey: null, hype: null };
}

export function exitPhase() {
  session = null;
}

export function inPhase() {
  return Boolean(session);
}

/* ---------- Quiz ----------------------------------------------------------- */

function renderQuiz(player, onStateChange) {
  const phase = getPhase(session.phaseId);
  const wrap = el('div');

  const backBtn = el('button', { class: 'btn btn--ghost', style: 'width:auto;padding:8px 4px;' }, ['‹ Phases']);
  backBtn.addEventListener('click', () => {
    exitPhase();
    onStateChange();
  });

  const progress = getPhaseProgress(player, session.phaseId);

  wrap.append(
    el('div', { class: 'quizhead' }, [
      backBtn,
      el('div', { class: 'quizhead__name', text: phase.name }),
      el(
        'div',
        { class: 'quizhead__count' },
        progress.streak > 0 ? `🔗 ${progress.streak}` : `${progress.correctIds.length}/${phase.questions.length}`,
      ),
    ]),
  );

  if (session.index >= session.deck.length) {
    wrap.append(renderDone(phase, player, onStateChange));
    return wrap;
  }

  const q = session.deck[session.index];

  wrap.append(renderSituation(q));
  wrap.append(renderChoices(q, player, onStateChange));

  if (session.answered) {
    wrap.append(renderResult(q));
    wrap.append(renderReveal(q));

    const next = el('button', { class: 'btn btn--primary', type: 'button' }, [
      session.index + 1 >= session.deck.length ? 'Finish' : 'Next situation',
    ]);
    next.addEventListener('click', () => {
      session.index += 1;
      session.answered = false;
      session.pickedKey = null;
      session.hype = null;
      onStateChange();
      window.scrollTo(0, 0);
    });
    wrap.append(next);
  }

  return wrap;
}

function renderSituation(q) {
  const box = el('div', { class: 'situation' });

  const meta = el('div', { class: 'situation__meta' }, [
    el('div', { class: 'pos-badge', text: q.pos }),
    el('div', { class: 'situation__posname', text: POSITION_NAMES[q.pos] || q.pos }),
  ]);
  meta.insertAdjacentHTML('beforeend', outsPips(q.outs));
  meta.append(el('div', { class: 'situation__state', text: q.basesLabel }));

  const row = el('div', { class: 'situation__row' }, [meta]);
  row.insertAdjacentHTML('beforeend', diamondSVG(q.bases));

  box.append(
    row,
    el('p', { class: 'situation__text', text: q.situation }),
    el('p', { class: 'situation__q', text: q.question }),
  );
  return box;
}

function renderChoices(q, player, onStateChange) {
  const list = el('div', { class: `choices${session.answered ? ' choices--locked' : ''}` });

  q.options.forEach((option, i) => {
    let state = null;
    if (session.answered) {
      if (option.key === q.correct) state = 'correct';
      else if (option.key === session.pickedKey) state = 'picked';
      else state = 'muted';
    }

    const btn = el('button', { class: 'choice', type: 'button', 'data-state': state }, [
      el('span', { class: 'choice__key', text: 'ABCD'[i] || '·' }),
      el('span', { text: option.text }),
    ]);

    btn.addEventListener('click', () => {
      if (session.answered) return;
      session.answered = true;
      session.pickedKey = option.key;
      const wasCorrect = option.key === q.correct;
      session.hype = wasCorrect ? randomHype() : null;
      recordAnswer(player, session.phaseId, q.id, wasCorrect);
      onStateChange();
    });

    list.append(btn);
  });

  return list;
}

function renderResult(q) {
  const wasCorrect = session.pickedKey === q.correct;

  const box = el('div', { class: `result ${wasCorrect ? 'result--correct' : 'result--info'}` }, [
    el('div', {
      class: 'result__head',
      // Nothing here says wrong, missed, or failed. A pick that wasn't the
      // coached play simply gets shown the read.
      text: wasCorrect ? 'That’s the job' : 'Here’s the read',
    }),
    el('div', { class: 'result__play', text: q.correctText }),
    el('div', { class: 'result__why', text: q.why }),
  ]);

  if (q.trap) {
    const trap = el('div', { class: 'result__trap' });
    trap.append(el('b', { text: 'Why it fools people: ' }), document.createTextNode(q.trap));
    box.append(trap);
  }

  if (wasCorrect && session.hype) {
    box.append(el('div', { class: 'hype' }, [el('span', { text: '🔗' }), el('span', { text: session.hype })]));
  }

  return box;
}

function renderReveal(q) {
  const box = el('div', { class: 'reveal' }, [
    el('div', { class: 'reveal__title', text: 'The whole field on that play' }),
    el('div', { class: 'reveal__sub', text: 'Every position had a job. Here they all are.' }),
  ]);

  const list = el('ul', { class: 'reveal__list' });
  for (const row of q.reveal) {
    const isYou = row.pos === q.pos;
    const li = el(
      'li',
      {
        class: `reveal__row${row.primary ? ' reveal__row--primary' : ''}${isYou ? ' reveal__row--you' : ''}`,
      },
      [el('span', { class: 'reveal__pos', text: row.pos })],
    );

    const job = el('span', { class: 'reveal__job' }, [row.job]);
    if (isYou) job.append(el('span', { class: 'reveal__you-tag', text: 'You' }));
    li.append(job);
    list.append(li);
  }

  box.append(list);
  return box;
}

function renderDone(phase, player, onStateChange) {
  const progress = getPhaseProgress(player, phase.id);
  const total = phase.questions.length;
  const done = progress.correctIds.length;

  const wrap = el('div', { class: 'done' }, [
    el('div', { class: 'done__big', text: done >= total ? 'Phase complete 🔗' : 'Nice run' }),
    el('div', {
      class: 'done__sub',
      text:
        done >= total
          ? `You've called every situation in ${phase.name} correctly at least once. Best run: ${progress.bestStreak} in a row.`
          : `${done} of ${total} situations called. Best run so far: ${progress.bestStreak} in a row.`,
    }),
  ]);

  const again = el('button', { class: 'btn btn--primary', type: 'button' }, ['Go again']);
  again.addEventListener('click', () => {
    startPhase(phase.id, player);
    onStateChange();
  });

  const back = el('button', { class: 'btn btn--ghost', type: 'button' }, ['Back to phases']);
  back.addEventListener('click', () => {
    exitPhase();
    onStateChange();
  });

  wrap.append(again, back);
  return wrap;
}
