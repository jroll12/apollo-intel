/* ============================================================================
   FUN TAB — parked.

   The full Fun tab is built and working: shared Golden Chain history, the
   coach award form behind a PIN gate, the team chant, the handshake with a
   coach-editable final move, the walk-up sheet link-out, and the six-item
   "what fun looks like in a game" card. It is held back for now and this
   placeholder ships in its place.

   Nothing was thrown away. To bring it back:
     git show 9b596ed:fun-focus/js/fun.js       > js/fun.js
     git show 9b596ed:fun-focus/styles.css      # the .chain-*, .chant,
                                                # .handshake, .checklist,
                                                # .field and .form-msg blocks
   The data it reads is still here and still wired: js/data/fun-content.js,
   js/data/roster.js, js/chain.js, and netlify/functions/chain.mjs. Restoring
   it means calling initChain() and loadFunData() from app.js again — see the
   same commit.
   ========================================================================= */

import { el, clear } from './ui.js';

export function renderFun(root, { goToFocus }) {
  clear(root);

  const card = el('div', { class: 'card' }, [
    el('div', { class: 'soon' }, [
      el('div', { class: 'soon__mark', text: '🍊' }),
      el('div', { class: 'soon__rule' }),
      el('h2', { class: 'soon__title', text: 'More coming soon' }),
      el('p', {
        class: 'soon__body',
        text: "There's more headed for this tab. Nothing to do here yet — the Focus tab is up and running.",
      }),
    ]),
  ]);

  const go = el('button', { class: 'btn btn--primary', type: 'button' }, ['Go to Focus ⚾']);
  go.addEventListener('click', goToFocus);
  card.append(go);

  root.append(card);
}
