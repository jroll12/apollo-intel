import type { ReactNode } from "react";
import { CheckCircle2, AlertTriangle, CircleDashed } from "lucide-react";
import { PILLAR_META, validation } from "@/data";
import { cn } from "@/lib/utils";

export function Section({ id, eyebrow, title, intro, children, className }: { id?: string; eyebrow?: string; title: string; intro?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section id={id} className={cn("py-8 sm:py-12", className)}>
      {eyebrow && <div className="text-[12px] font-semibold tracking-[0.16em] text-[var(--sand)] uppercase">{eyebrow}</div>}
      <h2 className="font-display mt-1 text-[1.65rem] leading-tight font-semibold text-balance sm:text-3xl">{title}</h2>
      {intro && <div className="mt-3 max-w-3xl text-[15px] leading-relaxed text-muted-foreground">{intro}</div>}
      <div className="mt-6">{children}</div>
    </section>
  );
}

export function PillarDot({ pillar, label = false }: { pillar: string; label?: boolean }) {
  const p = PILLAR_META[pillar];
  return (
    <span className="inline-flex items-center gap-1.5 text-[12px]">
      <span className="size-2.5 shrink-0 rounded-full" style={{ background: p?.color }} />
      {label && <span>{p?.name}</span>}
    </span>
  );
}

export function ReviewChip({ id, compact }: { id: string; compact?: boolean }) {
  const c = validation.compliance[id];
  const e = validation.editor[id];
  if (!c && !e)
    return (
      <span className="inline-flex items-center gap-1 text-[12px] text-muted-foreground">
        <CircleDashed className="size-3.5" /> {compact ? "" : "Not reviewed"}
      </span>
    );
  const editorOk = e ? Object.values(e.scores).every((v) => v >= 4) : true;
  const ok = (c?.pass ?? true) && editorOk;
  return ok ? (
    <span className="inline-flex items-center gap-1 text-[12px] font-medium text-[var(--success)]">
      <CheckCircle2 className="size-3.5" /> {compact ? "" : "Passed blind review"}
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-[12px] font-medium text-[var(--warning)]">
      <AlertTriangle className="size-3.5" /> {compact ? "" : "Flagged in review"}
    </span>
  );
}

export function Stat({ value, label, sub }: { value: ReactNode; label: string; sub?: string }) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="font-display text-3xl leading-none font-semibold">{value}</div>
      <div className="mt-2 text-[13px] font-medium">{label}</div>
      {sub && <div className="mt-0.5 text-[12px] text-muted-foreground">{sub}</div>}
    </div>
  );
}
