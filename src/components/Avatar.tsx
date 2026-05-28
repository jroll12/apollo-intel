interface Props {
  name: string;
  hue: number;
  size?: number;
  className?: string;
}

export function Avatar({ name, hue, size = 40, className = "" }: Props) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("");
  const bg = `linear-gradient(135deg, hsl(${hue} 70% 60%), hsl(${(hue + 40) % 360} 70% 45%))`;
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-lg font-semibold text-white ${className}`}
      style={{
        width: size,
        height: size,
        background: bg,
        fontSize: size * 0.38,
        letterSpacing: "-0.02em",
      }}
      aria-hidden
    >
      {initials}
    </div>
  );
}
