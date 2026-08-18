/* ============================================================================
   Field geometry, in feet, with home plate at the origin.
     +x  toward right field        +y  toward center field        +z  up

   Dimensions are 10U/11U, not big-league: 60-foot basepaths and a 46-foot
   mound. A kid should recognise their own field, and the whole point of the
   live reps is that distances feel right — a throw from short to first is a
   throw they have actually made.
   ========================================================================= */

export const BASEPATH = 60;
const DIAG = BASEPATH / Math.SQRT2; // 42.4 ft — the x/y offset of 1st and 3rd

export const BASES = {
  home: [0, 0],
  first: [DIAG, DIAG],
  second: [0, BASEPATH * Math.SQRT2],
  third: [-DIAG, DIAG],
};

/** Standing positions before the pitch. */
export const FIELDER_SPOTS = {
  P: [0, 46],
  C: [0, -8],
  '1B': [34, 54],
  '2B': [20, 76],
  SS: [-20, 76],
  '3B': [-34, 54],
  LF: [-70, 148],
  CF: [0, 165],
  RF: [70, 148],
};

export const OUTFIELD_FENCE = 200;

/* ---------- Hit zones ------------------------------------------------------
   Each zone knows who gets to the ball and roughly where the ball ends up.
   `infield` drives which branch of the rules engine runs. */
export const ZONES = {
  mound: { fielder: 'P', spot: [0, 44], infield: true, desc: 'right back at the mound' },
  '3B-line': { fielder: '3B', spot: [-36, 50], infield: true, desc: 'down the third-base line' },
  'SS-hole': { fielder: 'SS', spot: [-28, 70], infield: true, desc: 'in the hole at short' },
  'up-middle': { fielder: 'SS', spot: [-8, 82], infield: true, desc: 'up the middle' },
  '2B-hole': { fielder: '2B', spot: [26, 72], infield: true, desc: 'to the right side' },
  '1B-line': { fielder: '1B', spot: [36, 50], infield: true, desc: 'down the first-base line' },

  'LF-line': { fielder: 'LF', spot: [-108, 132], infield: false, desc: 'down the left-field line' },
  LF: { fielder: 'LF', spot: [-72, 150], infield: false, desc: 'out to left' },
  'LC-gap': { fielder: 'CF', spot: [-48, 168], infield: false, desc: 'into the left-center gap' },
  CF: { fielder: 'CF', spot: [0, 172], infield: false, desc: 'to straightaway center' },
  'RC-gap': { fielder: 'CF', spot: [48, 168], infield: false, desc: 'into the right-center gap' },
  RF: { fielder: 'RF', spot: [72, 150], infield: false, desc: 'out to right' },
  'RF-line': { fielder: 'RF', spot: [108, 132], infield: false, desc: 'down the right-field line' },
};

/* Bunts resolve their fielder at runtime — with a runner on second the third
   baseman holds the bag and the pitcher takes that side (see play-engine). */
export const BUNT_ZONES = {
  'bunt-3B': { spot: [-15, 17], desc: 'bunted up the third-base line' },
  'bunt-mid': { spot: [0, 13], desc: 'bunted right in front of the plate' },
  'bunt-1B': { spot: [15, 17], desc: 'bunted up the first-base line' },
};

export const INFIELD_ZONES = Object.keys(ZONES).filter((k) => ZONES[k].infield);
export const OUTFIELD_ZONES = Object.keys(ZONES).filter((k) => !ZONES[k].infield);
