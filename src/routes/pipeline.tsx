import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { Avatar } from "@/components/Avatar";
import { useStore } from "@/lib/store";
import { PIPELINE_STAGES, formatAudience, type PipelineStage } from "@/lib/mock-data";
import { useState } from "react";
import { CommunicationForm } from "@/components/forms/CommunicationForm";

export const Route = createFileRoute("/pipeline")({
  head: () => ({
    meta: [
      { title: "Outreach Pipeline — Signal" },
      { name: "description", content: "Kanban view of creator outreach across every relationship stage." },
    ],
  }),
  component: PipelinePage,
});

function PipelinePage() {
  const creators = useStore((s) => s.creators.filter((c) => !c.archived));
  const setStage = useStore((s) => s.setStage);
  const [logFor, setLogFor] = useState<string | null>(null);

  return (
    <div className="fade-in">
      <PageHeader
        title="Outreach Pipeline"
        subtitle={`${creators.length} active creators across ${PIPELINE_STAGES.length} stages`}
      />

      <div className="-mx-6 overflow-x-auto px-6 pb-6 lg:-mx-8 lg:px-8">
        <div className="flex min-w-max gap-4">
          {PIPELINE_STAGES.map((stage) => {
            const items = creators.filter((c) => c.stage === stage);
            return (
              <div key={stage} className="flex w-72 shrink-0 flex-col rounded-2xl bg-surface-100/70 p-3">
                <div className="mb-3 flex items-center justify-between px-2">
                  <h3 className="text-[11px] font-bold uppercase tracking-wider text-surface-600">{stage}</h3>
                  <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-surface-500">{items.length}</span>
                </div>
                <div className="space-y-2">
                  {items.map((c) => (
                    <div key={c.id} className="rounded-xl border border-border bg-white p-3 transition-all hover:shadow-sm">
                      <Link to="/creators/$id" params={{ id: c.id }} className="block">
                        <div className="flex items-center gap-2">
                          <Avatar name={c.name} hue={c.avatarHue} size={28} />
                          <div className="min-w-0">
                            <p className="truncate text-xs font-semibold">{c.name}</p>
                            <p className="truncate text-[10px] text-surface-400">{c.country}</p>
                          </div>
                        </div>
                        {c.outreachAngle && <p className="mt-2 line-clamp-2 text-[11px] text-surface-600">{c.outreachAngle}</p>}
                        <div className="mt-2 flex items-center justify-between text-[10px] text-surface-400">
                          <span>{formatAudience(c.audienceSize)} audience</span>
                          <span className="font-medium text-success">{c.alignment}%</span>
                        </div>
                      </Link>
                      <div className="mt-2 flex items-center gap-1.5">
                        <select value={c.stage} onChange={(e) => setStage(c.id, e.target.value as PipelineStage)}
                          className="flex-1 rounded-md border border-border bg-white px-1.5 py-1 text-[10px] outline-none">
                          {PIPELINE_STAGES.map((s) => <option key={s}>{s}</option>)}
                        </select>
                        <button onClick={() => setLogFor(c.id)} className="rounded-md border border-border bg-white px-2 py-1 text-[10px] font-medium hover:bg-surface-100">Log</button>
                      </div>
                    </div>
                  ))}
                  {items.length === 0 && (
                    <div className="rounded-lg border border-dashed border-border bg-white/50 p-3 text-center text-[10px] text-surface-400">
                      Empty
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {logFor && <CommunicationForm open={!!logFor} onOpenChange={(v) => !v && setLogFor(null)} creatorId={logFor} />}
    </div>
  );
}
