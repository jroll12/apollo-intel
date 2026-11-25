import { Check, ShieldCheck } from "lucide-react";
import { Section } from "@/components/shared";
import { ops } from "@/data";
import { cn } from "@/lib/utils";

const STATUS: Record<string, string> = {
  Approved: "bg-[color-mix(in_oklab,var(--success)_15%,transparent)] text-[var(--success)]",
  "Needs approval": "bg-[color-mix(in_oklab,var(--warning)_15%,transparent)] text-[var(--warning)]",
  "In edit": "bg-muted text-muted-foreground",
  Drafting: "bg-muted text-muted-foreground",
};

export function OpsPlaybook() {
  const totalMin = ops.weeklyRhythm.filter((d) => d.owner.includes("Coordinator")).reduce((s, d) => s + d.minutes, 0);
  return (
    <>
      <Section
        eyebrow="Ops Playbook"
        title="The operating system behind the content"
        intro="Content is the visible half of this role. The other half is the system that keeps it on time, on brand and compliant without pulling leaders into every decision."
      >
        <ul className="grid gap-2 sm:grid-cols-2">
          {ops.principles.map((p) => (
            <li key={p} className="flex gap-2 rounded-xl border bg-card p-4 text-[14px]">
              <Check className="mt-0.5 size-4 shrink-0 text-[var(--success)]" /> {p}
            </li>
          ))}
        </ul>
      </Section>

      <Section eyebrow="Weekly rhythm" title={`One week of content: about ${Math.round(totalMin / 30) / 2} hours of coordinator time`} intro="The CEO's part is the Wednesday approval: 15 minutes in one queue.">
        <div className="grid gap-3 md:grid-cols-5">
          {ops.weeklyRhythm.map((d) => (
            <div key={d.day} className="rounded-xl border bg-card p-4">
              <div className="text-[12px] text-muted-foreground">{d.day}</div>
              <div className="font-display text-xl font-semibold">{d.name}</div>
              <div className="mt-1 text-[12px] text-muted-foreground">{d.minutes} min · {d.owner}</div>
              <ul className="mt-3 space-y-1.5 text-[13px]">
                {d.steps.map((s) => <li key={s}>{s}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      <Section eyebrow="Approval queue" title="What the Wednesday review looks like">
        <div className="overflow-hidden rounded-xl border bg-card">
          {ops.approvalQueue.map((q, i) => (
            <div key={q.id} className={cn("flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3 text-[14px]", i > 0 && "border-t")}>
              <span className="font-mono text-[12px] text-muted-foreground">{q.id}</span>
              <span className="min-w-0 flex-1">{q.item}</span>
              <span className="text-[12px] text-muted-foreground">{q.owner}</span>
              <span className={cn("rounded-full px-2.5 py-0.5 text-[12px] font-medium", STATUS[q.status])}>{q.status}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section eyebrow="Who does what" title="RACI" intro="R = does the work, A = owns the outcome, C = consulted, I = kept informed. Roles match the team's current titles plus the new coordinator.">
        <div className="overflow-x-auto rounded-xl border bg-card">
          <table className="w-full min-w-[720px] text-[13px]">
            <thead className="bg-muted text-left">
              <tr>
                <th className="px-3 py-2 font-medium">Activity</th>
                {ops.raciRoles.map((r) => <th key={r} className="px-2 py-2 text-center font-medium">{r}</th>)}
              </tr>
            </thead>
            <tbody>
              {ops.raci.map((row) => (
                <tr key={row.activity} className="border-t">
                  <td className="px-3 py-2">{row.activity}</td>
                  {ops.raciRoles.map((r) => {
                    const v = [row.r.includes(r) && "R", row.a === r && "A", row.c.includes(r) && "C", row.i.includes(r) && "I"].filter(Boolean).join("/");
                    return <td key={r} className={cn("px-2 py-2 text-center font-mono", v.includes("A") && "font-semibold")}>{v || "·"}</td>;
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section eyebrow="Compliance" title="Checked before anything enters the queue" className="pb-0">
          <ul className="space-y-2">
            {ops.compliance.map((c) => (
              <li key={c} className="flex gap-2 text-[14px]">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-[var(--sand)]" /> {c}
              </li>
            ))}
          </ul>
        </Section>
        <Section eyebrow="Tools" title="More from the current stack, nothing new to buy" className="pb-0">
          <ul className="space-y-2">
            {ops.stack.map((s) => (
              <li key={s.tool} className="rounded-xl border bg-card p-3 text-[13px]">
                <b>{s.tool}</b> <span className="text-muted-foreground">({s.role})</span>
                <div className="mt-0.5">{s.move}</div>
              </li>
            ))}
          </ul>
        </Section>
      </div>

      <Section eyebrow="Measurement" title="KPIs the Friday snapshot reports" intro={ops.kpiNote}>
        <div className="overflow-x-auto rounded-xl border bg-card">
          <table className="w-full min-w-[560px] text-[13px]">
            <thead className="bg-muted text-left">
              <tr><th className="px-3 py-2 font-medium">Metric</th><th className="px-3 py-2 font-medium">Definition</th><th className="px-3 py-2 font-medium">Source</th><th className="px-3 py-2 font-medium">Cadence</th></tr>
            </thead>
            <tbody>
              {ops.kpis.map((k) => (
                <tr key={k.name} className="border-t">
                  <td className="px-3 py-2 font-medium">{k.name}</td>
                  <td className="px-3 py-2 text-muted-foreground">{k.definition}</td>
                  <td className="px-3 py-2">{k.source}</td>
                  <td className="px-3 py-2">{k.cadence}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section eyebrow="First 90 days" title="30-60-90 plan">
        <div className="grid gap-3 md:grid-cols-3">
          {ops.plan306090.map((p) => (
            <div key={p.phase} className="rounded-xl border bg-card p-5">
              <div className="font-display text-lg font-semibold">{p.phase}</div>
              <ul className="mt-3 list-disc space-y-1.5 pl-5 text-[14px]">
                {p.items.map((i) => <li key={i}>{i}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}
