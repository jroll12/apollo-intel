import { useMemo, useState } from "react";
import { Instagram, Video, MapPin, Mail, FileText, Home, Mic } from "lucide-react";
import { Section, PillarDot, ReviewChip } from "@/components/shared";
import { AssetDrawer } from "@/components/AssetDrawer";
import { assets, channelGroup, GROUP_LABEL, PILLAR_META, grid, type Asset } from "@/data";
import { format, parse } from "@/components/date";
import { cn } from "@/lib/utils";

const ICON: Record<string, typeof Mail> = { instagram: Instagram, reel: Video, gbp: MapPin, email: Mail, blog: FileText, listing: Home, podcast: Mic };
const OPS: Record<number, string> = { 1: "Plan", 3: "Approve", 5: "Report" };

// One calendar entry per slot. Kits (listing, podcast) show their lead asset.
const LEAD: Record<string, string> = { S10: "S10-social", S33: "S33-script" };
const entries = [...grid.slots].sort((x, y) => x.date.localeCompare(y.date)).map((s) => {
  const a = assets.find((x) => x.id === (LEAD[s.id] ?? s.id)) ?? assets.find((x) => x.slot === s.id);
  return { slot: s, asset: a, group: channelGroup(s.channel) };
});

function Chip({ e, onOpen }: { e: (typeof entries)[number]; onOpen: (a: Asset) => void }) {
  const Icon = ICON[e.group];
  return (
    <button
      disabled={!e.asset}
      onClick={() => e.asset && onOpen(e.asset)}
      className="flex w-full items-start gap-1.5 rounded-md border bg-card px-1.5 py-1 text-left text-[11.5px] leading-tight hover:border-[var(--sand)] disabled:opacity-50"
      style={{ borderLeft: `3px solid ${PILLAR_META[e.slot.pillar].color}` }}
    >
      <Icon className="mt-px size-3.5 shrink-0 text-muted-foreground" />
      <span className="line-clamp-2">{e.asset?.visual.headline ?? e.slot.angle}</span>
    </button>
  );
}

export function CalendarPage() {
  const [open, setOpen] = useState<Asset | null>(null);
  const [groups, setGroups] = useState<Set<string>>(new Set());
  const [pillars, setPillars] = useState<Set<string>>(new Set());
  const toggle = (set: Set<string>, v: string, fn: (s: Set<string>) => void) => {
    const n = new Set(set);
    n.has(v) ? n.delete(v) : n.add(v);
    fn(n);
  };
  const visible = entries.filter((e) => (!groups.size || groups.has(e.group)) && (!pillars.size || pillars.has(e.slot.pillar)));

  // Sunday-start weeks covering Dec 2026
  const days = useMemo(() => {
    const start = parse("2026-11-29");
    return Array.from({ length: 35 }, (_, i) => {
      const d = new Date(start.getTime() + i * 86400000);
      return d.toISOString().slice(0, 10);
    });
  }, []);
  const byDay = (iso: string) => visible.filter((e) => e.slot.date === iso);

  return (
    <Section
      eyebrow="December 2026"
      title="30-day content calendar"
      intro={
        <>
          {grid.slots.length} slots across 7 channels and 5 content pillars. Dec 24 and 25 stay dark on purpose. Grey labels show the weekly operating rhythm (plan
          Monday, approve Wednesday, report Friday). Click any item to read the full draft, its sources and its review result.
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-1.5">
          {Object.keys(GROUP_LABEL).map((g) => {
            const Icon = ICON[g];
            const on = groups.has(g);
            return (
              <button key={g} onClick={() => toggle(groups, g, setGroups)} className={cn("inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[12.5px]", on && "border-primary bg-primary text-primary-foreground")}>
                <Icon className="size-3.5" /> {GROUP_LABEL[g]}
              </button>
            );
          })}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(PILLAR_META).map(([k, p]) => {
            const on = pillars.has(k);
            return (
              <button key={k} onClick={() => toggle(pillars, k, setPillars)} title={p.why} className={cn("inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[12.5px]", on && "border-foreground bg-muted")}>
                <PillarDot pillar={k} /> {p.name}
              </button>
            );
          })}
          {(groups.size > 0 || pillars.size > 0) && (
            <button onClick={() => (setGroups(new Set()), setPillars(new Set()))} className="px-2 text-[12.5px] text-muted-foreground underline">
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Desktop month grid */}
      <div className="mt-5 hidden overflow-hidden rounded-xl border md:block">
        <div className="grid grid-cols-7 bg-muted text-center text-[12px] font-medium text-muted-foreground">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d} className="py-2">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {days.map((iso) => {
            const d = parse(iso);
            const inMonth = d.getUTCMonth() === 11;
            const dark = grid.darkDays.includes(iso);
            const ops = inMonth && !dark ? OPS[d.getUTCDay()] : undefined;
            return (
              <div key={iso} className={cn("min-h-[118px] border-t border-l p-1.5 first:border-l-0 [&:nth-child(7n+1)]:border-l-0", !inMonth && "bg-muted/40", dark && "bg-[repeating-linear-gradient(135deg,transparent,transparent_6px,var(--muted)_6px,var(--muted)_8px)]")}>
                <div className="mb-1 flex items-center justify-between text-[11px]">
                  <span className={cn("font-medium", !inMonth && "text-muted-foreground/60")}>{d.getUTCDate()}</span>
                  {ops && <span className="rounded bg-muted px-1 text-[10px] text-muted-foreground">{ops}</span>}
                  {dark && <span className="text-[10px] text-muted-foreground">Dark</span>}
                </div>
                <div className="space-y-1">
                  {byDay(iso).map((e) => (
                    <Chip key={e.slot.id} e={e} onOpen={setOpen} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile agenda */}
      <ol className="mt-5 space-y-2 md:hidden">
        {visible.map((e) => {
          const Icon = ICON[e.group];
          return (
            <li key={e.slot.id}>
              <button onClick={() => e.asset && setOpen(e.asset)} className="flex w-full items-start gap-3 rounded-xl border bg-card p-3 text-left" style={{ borderLeft: `4px solid ${PILLAR_META[e.slot.pillar].color}` }}>
                <div className="w-14 shrink-0 text-[12px] text-muted-foreground">{format(e.slot.date).replace(",", "")}</div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
                    <Icon className="size-3.5" /> {GROUP_LABEL[e.group]}
                  </div>
                  <div className="mt-0.5 text-[14px] leading-snug font-medium">{e.asset?.visual.headline ?? e.slot.angle}</div>
                </div>
                {e.asset && <ReviewChip id={e.asset.id} compact />}
              </button>
            </li>
          );
        })}
      </ol>

      <AssetDrawer asset={open} onClose={() => setOpen(null)} />
    </Section>
  );
}
