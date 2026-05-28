import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { Avatar } from "@/components/Avatar";
import { insights, creators } from "@/lib/mock-data";
import { Brain, Sparkles } from "lucide-react";

export const Route = createFileRoute("/insights")({
  head: () => ({
    meta: [
      { title: "AI Insights — Signal" },
      { name: "description", content: "AI-generated partnership recommendations, audience overlap analysis, and trend detection." },
    ],
  }),
  component: InsightsPage,
});

const kindTone: Record<string, string> = {
  Partnership: "from-brand/20 to-brand/0",
  "Audience Overlap": "from-success/20 to-success/0",
  Trend: "from-warning/20 to-warning/0",
  Similarity: "from-brand/20 to-brand/0",
  "Content Opportunity": "from-success/20 to-success/0",
};

function InsightsPage() {
  return (
    <div className="fade-in">
      <PageHeader
        title="AI Insights"
        subtitle="Strategic recommendations generated from creator graph + content signals"
        action={
          <button className="inline-flex items-center gap-1.5 rounded-full bg-surface-950 px-4 py-2 text-sm font-medium text-white">
            <Brain className="size-4" /> Regenerate
          </button>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {insights.map((i) => {
          const cs = i.creatorIds.map((id) => creators.find((c) => c.id === id)).filter(Boolean);
          return (
            <div key={i.id} className={`relative overflow-hidden rounded-2xl border border-border bg-white p-6 shadow-sm`}>
              <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${kindTone[i.kind]} opacity-60`} />
              <div className="relative">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="size-4 text-brand" />
                    <p className="text-[10px] font-bold uppercase tracking-wider text-brand">{i.kind}</p>
                  </div>
                  <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-mono font-medium text-surface-700">
                    {i.confidence}% confidence
                  </span>
                </div>
                <h3 className="mt-3 text-base font-semibold">{i.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-surface-700">{i.body}</p>

                <div className="mt-5 flex flex-wrap items-center gap-2">
                  {cs.map((c) => c && (
                    <Link key={c.id} to="/creators/$id" params={{ id: c.id }} className="flex items-center gap-1.5 rounded-full border border-border bg-white px-2 py-1 text-[11px] hover:border-brand">
                      <Avatar name={c.name} hue={c.avatarHue} size={16} />
                      {c.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
