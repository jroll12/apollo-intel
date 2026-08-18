/* ============================================================================
   LIVE REPS — the screen.

   One rep runs: set (pre-pitch) -> the ball is hit and animates -> freeze ->
   "what was your job?" -> answer, why, and the whole field.

   The DOM here is built once and mutated, not re-rendered, because the canvas
   holds animation state that a rebuild would throw away. That is why this
   module keeps its own `dom` object instead of returning fresh nodes the way
   focus.js does.
   ========================================================================= */

import { generateRep } from './data/live-reps.js';
import { POSITIONS } from './data/play-engine.js';
import { ZONES, BUNT_ZONES } from './data/field-geometry.js';
import { randomHype } from './data/hype.js';
import { getLiveProgress, recordLiveAnswer, setLivePosition } from './store.js';
import { FieldView } from './field.js';
import { el, clear, outsPips, POSITION_NAMES } from './ui.js';

const MIXED = '__mix__';

const liveState = {
  you: null, // chosen position, or MIXED
  rep: null,
  stage: 'ready', // ready | live | ask | done
  picked: null,
  hype: null,
};

let dom = null;
let view = null;

/* ---------- Entry ---------------------------------------------------------- */

export function renderLive(root) {
  if (!dom) build();
  root.append(dom.wrap);

  // The canvas was detached by the parent re-render; re-measure and repaint.
  requestAnimationFrame(() => {
    view.resize();
    repaint();
  });

  syncChrome();
}

export function exitLive() {
  if (view) view.destroy();
  liveState.rep = null;
  liveState.stage = 'ready';
  liveState.picked = null;
}

export function inLive() {
  return Boolean(dom && dom.wrap.isConnected);
}

/* ---------- Build once ------------------------------------------------------ */

function build() {
  const saved = getLiveProgress();
  liveState.you = saved.position || MIXED;

  const wrap = el('div', { class: 'live' });

  /* Position picker */
  const picker = el('div', { class: 'pospick' });
  const chips = {};
  const addChip = (value, label, title) => {
    const b = el('button', { class: 'pospick__chip', type: 'button', title, text: label });
    b.addEventListener('click', () => {
      liveState.you = value;
      setLivePosition(value);
      // Changing position mid-rep would make the current question wrong.
      liveState.rep = null;
      liveState.stage = 'ready';
      syncChrome();
      newRep();
    });
    chips[value] = b;
    picker.append(b);
  };
  addChip(MIXED, '🎲', 'A different position every rep');
  for (const p of POSITIONS) addChip(p, p, POSITION_NAMES[p]);

  const canvas = el('canvas', { class: 'field' });
  const situation = el('div', { class: 'live__sit' });
  const headline = el('div', { class: 'live__headline' });
  const action = el('div', { class: 'live__action' });
  const stats = el('div', { class: 'live__stats' });

  wrap.append(
    el('div', { class: 'section-label', text: 'Live reps' }),
    el('p', {
      class: 'card__sub',
      style: 'margin:0 0 12px 2px;',
      text: 'A real ball off a real bat. Read it live, then call your job — whether it comes to you or not.',
    }),
    picker,
    el('div', { class: 'live__stage' }, [situation, canvas]),
    headline,
    action,
    stats,
  );

  dom = { wrap, picker, chips, canvas, situation, headline, action, stats };
  view = new FieldView(canvas);

  window.addEventListener('resize', () => {
    if (!dom.wrap.isConnected) return;
    view.resize();
    repaint();
  });

  newRep();
}

/* ---------- Rep lifecycle --------------------------------------------------- */

function positionForRep() {
  return liveState.you === MIXED ? POSITIONS[Math.floor(Math.random() * POSITIONS.length)] : liveState.you;
}

function newRep() {
  liveState.rep = generateRep(positionForRep());
  liveState.stage = 'ready';
  liveState.picked = null;
  liveState.hype = null;
  paintStage();
}

function pitch() {
  liveState.stage = 'live';
  paintStage();
  const { rep } = liveState;
  view.playFlight(rep.flight, { youPos: rep.you, bases: rep.bases }, () => {
    liveState.stage = 'ask';
    paintStage();
  });
}

function answer(text) {
  if (liveState.stage !== 'ask') return;
  liveState.picked = text;
  const correct = text === liveState.rep.correctText;
  liveState.hype = correct ? randomHype() : null;
  recordLiveAnswer(correct);
  liveState.stage = 'done';
  paintStage();
}

/* ---------- Painting -------------------------------------------------------- */

function repaint() {
  const { rep, stage } = liveState;
  if (!rep || !view) return;
  if (stage === 'ready') {
    view.drawPrePitch({ youPos: rep.you, bases: rep.bases });
  } else if (stage !== 'live') {
    const zone = rep.play.hitType === 'bunt' ? BUNT_ZONES[rep.play.zoneKey] : ZONES[rep.play.zoneKey];
    view.drawSettled({
      youPos: rep.you,
      bases: rep.bases,
      ballPos: zone.spot,
      ballHandler: rep.play.fielder,
    });
  }
}

function syncChrome() {
  if (!dom) return;
  for (const [value, chip] of Object.entries(dom.chips)) {
    chip.setAttribute('aria-pressed', String(value === liveState.you));
  }
  const p = getLiveProgress();
  clear(dom.stats).append(
    el('span', { text: `${p.reps} rep${p.reps === 1 ? '' : 's'}` }),
    el(
      'span',
      { class: 'streak' },
      p.streak > 0 ? `🔥 ${p.streak} in a row` : p.bestStreak > 0 ? `Best run: ${p.bestStreak}` : 'Start a run',
    ),
  );
}

function paintStage() {
  const { rep, stage } = liveState;
  if (!rep) return;

  /* Situation strip over the field */
  clear(dom.situation);
  const meta = el('div', { class: 'live__meta' }, [
    el('span', { class: 'live__pos', text: rep.you }),
    el('span', { class: 'live__posname', text: POSITION_NAMES[rep.you] }),
  ]);
  const right = el('div', { class: 'live__right' });
  right.insertAdjacentHTML('beforeend', outsPips(rep.outs));
  right.append(el('span', { class: 'live__runners', text: rep.basesLabel }));
  dom.situation.append(meta, right);

  /* Headline appears only once the ball has been hit */
  clear(dom.headline);
  if (stage === 'ask' || stage === 'done') {
    dom.headline.append(el('div', { class: 'live__hit', text: rep.play.headline }));
  }

  clear(dom.action);
  repaint();

  if (stage === 'ready') {
    const btn = el('button', { class: 'btn btn--primary', type: 'button' }, ['Set — here comes the pitch']);
    btn.addEventListener('click', pitch);
    dom.action.append(
      el('p', { class: 'live__cue', text: 'Outs and runners are up there. Know your job before the ball moves.' }),
      btn,
    );
  }

  if (stage === 'live') {
    dom.action.append(el('p', { class: 'live__cue live__cue--watch', text: 'Track it…' }));
  }

  if (stage === 'ask' || stage === 'done') {
    dom.action.append(
      el('p', { class: `live__q ${rep.mine ? 'live__q--mine' : ''}`, text: rep.question }),
      choicesEl(),
    );
  }

  if (stage === 'done') {
    dom.action.append(resultEl(), revealEl());
    const next = el('button', { class: 'btn btn--primary', type: 'button' }, ['Next rep']);
    next.addEventListener('click', newRep);
    dom.action.append(next);
  }

  syncChrome();
}

function choicesEl() {
  const { rep, stage, picked } = liveState;
  const list = el('div', { class: `choices${stage === 'done' ? ' choices--locked' : ''}` });

  rep.options.forEach((opt, i) => {
    let mark = null;
    if (stage === 'done') {
      if (opt.text === rep.correctText) mark = 'correct';
      else if (opt.text === picked) mark = 'picked';
      else mark = 'muted';
    }
    const btn = el('button', { class: 'choice', type: 'button', 'data-state': mark }, [
      el('span', { class: 'choice__key', text: 'ABCD'[i] || '·' }),
      el('span', { text: opt.text }),
    ]);
    btn.addEventListener('click', () => answer(opt.text));
    list.append(btn);
  });

  return list;
}

function resultEl() {
  const { rep, picked, hype } = liveState;
  const correct = picked === rep.correctText;
  const mineAndPrimary = rep.mine;

  const box = el('div', { class: `result ${correct ? 'result--correct' : 'result--info'}` }, [
    el('div', { class: 'result__head', text: correct ? 'That’s the job' : 'Here’s the read' }),
    el('div', { class: 'result__play', text: rep.correctText }),
    // The explanation has to be about YOUR job. When the ball is yours that is
    // the engine's own reasoning; when it isn't, explaining the ball-getter's
    // decision answers a question nobody asked.
    el('div', { class: 'result__why', text: mineAndPrimary ? rep.play.why : roleWhy(rep) }),
  ]);

  if (!mineAndPrimary) {
    box.append(
      el('div', {
        class: 'result__context',
        text: `On the ball: ${rep.play.fielder} is going ${describeTarget(rep.play)}.`,
      }),
    );
  }

  if (rep.play.trap && mineAndPrimary) {
    const trap = el('div', { class: 'result__trap' });
    trap.append(el('b', { text: 'Why it fools people: ' }), document.createTextNode(rep.play.trap));
    box.append(trap);
  }

  if (correct && hype) {
    box.append(el('div', { class: 'hype' }, [el('span', { text: '🍊' }), el('span', { text: hype })]));
  }

  return box;
}

/** Why YOUR assignment exists, in the language of the job you were given. */
function roleWhy(rep) {
  const { role } = rep.play.assignments[rep.you];
  const base = BASE_LABEL[rep.play.target.base] || 'the base';

  if (role === 'cutoff') {
    return `Every throw in from the outfield goes through a cutoff man, and on a throw to ${base} from ${rep.play.fielder} that is you.`;
  }
  if (role === 'cover') {
    return 'The ball is going somewhere else, so somebody has to be standing on that bag when a runner gets there. That is the whole job.';
  }
  if (role === 'backup') {
    return 'Every throw needs a body behind it. If this one gets away, you are the reason it stays one base instead of two.';
  }
  return 'You are not on the ball and you still move. The only wrong answer here is standing still.';
}

const BASE_LABEL = { 1: 'first', 2: 'second', 3: 'third', H: 'home' };

function describeTarget(play) {
  const names = { 1: 'to first', 2: 'to second', 3: 'to third', H: 'home' };
  return play.target.base ? names[play.target.base] : 'nowhere — the catch is the play';
}

function revealEl() {
  const { rep } = liveState;
  const box = el('div', { class: 'reveal' }, [
    el('div', { class: 'reveal__title', text: 'The whole field on that play' }),
    el('div', { class: 'reveal__sub', text: 'Every position had a job. Here they all are.' }),
  ]);

  const list = el('ul', { class: 'reveal__list' });
  for (const pos of POSITIONS) {
    const a = rep.play.assignments[pos];
    const isYou = pos === rep.you;
    const li = el(
      'li',
      {
        class: `reveal__row${a.role === 'primary' ? ' reveal__row--primary' : ''}${isYou ? ' reveal__row--you' : ''}`,
      },
      [el('span', { class: 'reveal__pos', text: pos })],
    );
    const job = el('span', { class: 'reveal__job' }, [a.text]);
    if (isYou) job.append(el('span', { class: 'reveal__you-tag', text: 'You' }));
    li.append(job);
    list.append(li);
  }

  box.append(list);
  return box;
}
