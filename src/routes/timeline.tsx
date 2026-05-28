import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { Avatar } from "@/components/Avatar";
import { timeline, creators } from "@/lib/mock-data";

export const Route = createFileRoute("/timeline")({
  head: () => ({
    meta: [
      { title: "Relationship Timeline — Signal" },
      { name: "description", content: "Unified timeline of outreach, meetings, collaborations, and creator milestones." },
    ],
  }),
  component: TimelinePage,
});

const kindColor: Record<string, string> = {
  outreach: "bg-brand",
  meeting: "bg-warning",
  email: "bg-surface-400",
  collab: "bg-success",
  conference: "bg-brand",
  podcast: "bg-success",
  milestone: "bg-warning",
  ai: "bg-brand",
};

function TimelinePage() {
  const sorted = [...timeline].sort((a, b) => b.date.localeCompare(a.date));
  return (
    <div className="fade-in">
      <PageHeader title="Relationship Timeline" subtitle="Every interaction, signal, and milestone in one feed" />

      <div className="rounded-2xl border border-border bg-white p-6 lg:p-8">
        <div className="relative space-y-6 before:absolute before:left-[7px] before:top-3 before:h-[calc(100%-24px)] before:w-px before:bg-surface-200">
          {sorted.map((t) => {
            const c = creators.find((x) => x.id === t.creatorId);
            return (
              <div key={t.id} className="relative flex gap-4 pl-8">
                <div className={`absolute left-0 top-2 size-3.5 rounded-full ${kindColor[t.kind]} ring-4 ring-white`} />
                <div className="flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-surface-400">
                    {t.date} · {t.kind}
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <p className="text-sm font-semibold">{t.title}</p>
                    {c && (
                      <Link to="/creators/$id" params={{ id: c.id }} className="flex items-center gap-1.5 rounded-full bg-surface-50 px-2 py-0.5 text-[10px] hover:bg-surface-100">
                        <Avatar name={c.name} hue={c.avatarHue} size={14} />
                        {c.name}
                      </Link>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-surface-600">{t.detail}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
