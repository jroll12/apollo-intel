import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { Avatar } from "@/components/Avatar";
import { useStore } from "@/lib/store";
import { OpportunityForm } from "@/components/forms/OpportunityForm";
import { Sparkles, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

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
  Paused: "bg-surface-100 text-surface-500",
  Rejected: "bg-danger/10 text-danger",
};

function OpportunitiesPage() {
  const opportunities = useStore((s) => s.opportunities);
  const creators = useStore((s) => s.creators);
  const remove = useStore((s) => s.deleteOpportunity);
  const [addOpen, setAddOpen] = useState(false);

  return (
    <div className="fade-in">
      <PageHeader
        title="Collaboration Opportunities"
        subtitle={`${opportunities.length} tracked`}
        action={
          <button onClick={() => setAddOpen(true)} className="inline-flex items-center gap-1.5 rounded-full bg-surface-950 px-4 py-2 text-sm font-medium text-white">
            <Plus className="size-4" /> Add Opportunity
          </button>
        }
      />

      {opportunities.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-white p-12 text-center">
          <p className="text-sm text-surface-500">No opportunities tracked yet.</p>
          <button onClick={() => setAddOpen(true)} className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-surface-950 px-4 py-2 text-sm font-medium text-white">
            <Plus className="size-4" /> Create one
          </button>
        </div>
      ) : (
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
                  <div className="flex shrink-0 items-center gap-2">
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium ${statusTone[o.status] ?? "bg-surface-100"}`}>{o.status}</span>
                    <button onClick={() => { if (confirm("Delete opportunity?")) { remove(o.id); toast.success("Deleted"); } }}
                      className="text-surface-300 hover:text-danger"><Trash2 className="size-3.5" /></button>
                  </div>
                </div>

                {involved.length > 0 && (
                  <div className="mt-4 flex -space-x-2">
                    {involved.map((c) => c ? (
                      <Link key={c.id} to="/creators/$id" params={{ id: c.id }} title={c.name}>
                        <Avatar name={c.name} hue={c.avatarHue} size={32} className="ring-2 ring-white" />
                      </Link>
                    ) : null)}
                    <div className="ml-3 flex flex-col text-[10px] text-surface-500">
                      <span className="font-medium text-surface-700">{involved.map((c) => c?.name).join(" × ")}</span>
                    </div>
                  </div>
                )}

                {o.notes && <p className="mt-4 text-xs text-surface-600">{o.notes}</p>}

                <div className="mt-4 grid grid-cols-3 gap-3 border-t border-border pt-4 text-center text-[10px]">
                  <div>
                    <p className="font-bold uppercase text-surface-400">Value</p>
                    <p className="mt-1 text-sm font-semibold tabular-nums">{o.strategicValue}</p>
                  </div>
                  <div>
                    <p className="font-bold uppercase text-surface-400">Impact</p>
                    <p className="mt-1 text-[11px] font-medium">{o.estimatedImpact || "—"}</p>
                  </div>
                  <div>
                    <p className="font-bold uppercase text-surface-400">Platform</p>
                    <p className="mt-1 text-[11px] font-medium">{o.platform || "—"}</p>
                  </div>
                </div>

                {o.nextAction && (
                  <div className="mt-4 flex items-center gap-2 rounded-lg bg-surface-50 p-3 text-xs">
                    <Sparkles className="size-3.5 shrink-0 text-brand" />
                    <span><span className="font-medium">Next:</span> {o.nextAction}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <OpportunityForm open={addOpen} onOpenChange={setAddOpen} />
    </div>
  );
}
