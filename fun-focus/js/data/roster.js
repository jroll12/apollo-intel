/* Hardcoded for v1 — editing the roster in-app is explicitly out of scope.
   Kept in first-name-alphabetical order the way the lineup card reads. */
export const ROSTER = [
  'Vincent Boyd',
  'Kolby Dieter',
  'Jaxon Humphreys',
  'Anthony Lewis',
  'Grayson Monyhan',
  'Isaiah Roloff',
  'Connor Solomon',
  'Asher Sperka',
  'Dylan Vargas',
  'Maddox Walsh',
  'King Wilford',
];

/* Initials for the avatar chip, e.g. "Vincent Boyd" -> "VB" */
export function initials(name) {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}
