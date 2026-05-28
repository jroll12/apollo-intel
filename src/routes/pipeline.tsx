import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { Avatar } from "@/components/Avatar";
import { creators, PIPELINE_STAGES, formatAudience } from "@/lib/mock-data";

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
  return (
    <div className="fade-in">
      <PageHeader
        title="Outreach Pipeline"
        subtitle="Track every relationship from identified to strategic ally"
        action={
          <button className="rounded-full border border-border bg-white px-4 py-2 text-sm font-medium hover:bg-surface-100">
            New stage
          </button>
        }
      />

      <div className="-mx-6 overflow-x-auto px-6 pb-6 lg:-mx-8 lg:px-8">
        <div className="flex min-w-max gap-4">
          {PIPELINE_STAGES.map((stage) => {
            const items = creators.filter((c) => c.stage === stage);
            return (
              <div key={stage} className="flex w-72 shrink-0 flex-col rounded-2xl bg-surface-100/70 p-3">
                <div className="mb-3 flex items-center justify-between px-2">
                  <h3 className="text-[11px] font-bold uppercase tracking-wider text-surface-600">{stage}</h3>
                  <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-surface-500">
                    {items.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {items.map((c) => (
                    <Link
                      key={c.id}
                      to="/creators/$id"
                      params={{ id: c.id }}
                      className="block rounded-xl border border-border bg-white p-3 transition-all hover:-translate-y-0.5 hover:shadow-sm"
                    >
                      <div className="flex items-center gap-2">
                        <Avatar name={c.name} hue={c.avatarHue} size={28} />
                        <div className="min-w-0">
                          <p className="truncate text-xs font-semibold">{c.name}</p>
                          <p className="truncate text-[10px] text-surface-400">{c.country}</p>
                        </div>
                      </div>
                      <p className="mt-2 line-clamp-2 text-[11px] text-surface-600">{c.outreachAngle}</p>
                      <div className="mt-2 flex items-center justify-between text-[10px] text-surface-400">
                        <span>{formatAudience(c.audienceSize)} audience</span>
                        <span className="font-medium text-success">{c.alignment}%</span>
                      </div>
                    </Link>
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
    </div>
  );
}
