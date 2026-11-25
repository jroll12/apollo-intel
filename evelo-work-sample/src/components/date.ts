const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAY = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const parse = (iso: string) => new Date(`${iso}T12:00:00Z`);
export const format = (iso: string) => {
  const d = parse(iso);
  return `${DAY[d.getUTCDay()]}, ${MON[d.getUTCMonth()]} ${d.getUTCDate()}`;
};
export const monthLabel = (iso: string) => {
  const d = parse(iso);
  return `${MON[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
};
