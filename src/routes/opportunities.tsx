import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { Avatar } from "@/components/Avatar";
import { opportunities, creators } from "@/lib/mock-data";
import { Sparkles } from "lucide-react";

export const Route = createFileRoute("/opportunities")({
  head: () => ({
    meta: [
      { title: "Collaboration Opportunities — Signal" },
      { name: "description", content: "Tracked collaboration opportunities across podcasts, livestreams, debates, and campaigns." },
    ],
  }),
  component: OpportunitiesPage,
});

const statusTone: Record<string, string> = {
  Idea: "bg-surface-100 text-surface-600",
  Proposed: "bg-brand/10 text-brand",
  Confirmed: "bg-success/10 text-success",
  "In Production": "bg-warning/10 text-warning",
  Live: "bg-danger/10 text-danger",
  Completed: "bg-surface-100 text-surface-400",
};

function OpportunitiesPage() {
  return (
    <div className="fade-in">
      <PageHeader
        title="Collaboration Opportunities"
        subtitle={`${opportunities.length} tracked across podcasts, debates, campaigns, and missions`}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {opportunities.map((o) => {
          const involved = o.creatorIds.map((id) => creators.find((c) => c.id === id)).filter(Boolean);
          return (
            <div key={o.id} className="rounded-2xl border border-border bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-surface-400">{o.type}</p>
                  <h3 className="mt-1 text-base font-semibold">{o.title}</h3>
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-medium ${statusTone[o.status]}`}>
                  {o.status}
                </span>
              </div>

              <div className="mt-4 flex -space-x-2">
                {involved.map((c) =>
                  c ? (
                    <Link key={c.id} to="/creators/$id" params={{ id: c.id }} title={c.name}>
                      <Avatar name={c.name} hue={c.avatarHue} size={32} className="ring-2 ring-white" />
                    </Link>
                  ) : null
                )}
                <div className="ml-3 flex flex-col text-[10px] text-surface-500">
                  <span className="font-medium text-surface-700">{involved.map((c) => c?.name).join(" × ")}</span>
                </div>
              </div>

              <p className="mt-4 text-xs text-surface-600">{o.notes}</p>

              <div className="mt-4 grid grid-cols-3 gap-3 border-t border-border pt-4 text-center text-[10px]">
                <div>
                  <p className="font-bold uppercase text-surface-400">Value</p>
                  <p className="mt-1 text-sm font-semibold tabular-nums">{o.strategicValue}</p>
                </div>
                <div>
                  <p className="font-bold uppercase text-surface-400">Impact</p>
                  <p className="mt-1 text-[11px] font-medium">{o.estimatedImpact}</p>
                </div>
                <div>
                  <p className="font-bold uppercase text-surface-400">Platform</p>
                  <p className="mt-1 text-[11px] font-medium">{o.platform}</p>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 rounded-lg bg-surface-50 p-3 text-xs">
                <Sparkles className="size-3.5 shrink-0 text-brand" />
                <span><span className="font-medium">Next:</span> {o.nextAction}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
