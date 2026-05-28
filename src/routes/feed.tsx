import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { Avatar } from "@/components/Avatar";
import { useStore, formatRelative } from "@/lib/store";

export const Route = createFileRoute("/feed")({
  head: () => ({
    meta: [
      { title: "Notes & Activity — Signal" },
      { name: "description", content: "Collaborative internal activity feed across creators, outreach, and AI signals." },
    ],
  }),
  component: FeedPage,
});

function FeedPage() {
  const activities = useStore((s) => s.activities);
  const creators = useStore((s) => s.creators);

  return (
    <div className="fade-in">
      <PageHeader title="Notes & Activity" subtitle={`${activities.length} events tracked`} />

      {activities.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-white p-12 text-center">
          <p className="text-sm text-surface-500">No activity yet. Actions you take across the app will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {activities.map((a) => {
            const c = a.creatorId ? creators.find((x) => x.id === a.creatorId) : null;
            return (
              <div key={a.id} className="flex gap-4 rounded-2xl border border-border bg-white p-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-surface-100 text-xs font-semibold">
                  {a.actor.split(" ").map((s) => s[0]).join("").slice(0, 2)}
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold">{a.actor}</span>
                    <span className="rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-medium text-brand">{a.action}</span>
                    <span className="text-[10px] text-surface-400">{formatRelative(a.createdAt)}</span>
                  </div>
                  <p className="mt-1 text-sm text-surface-700">{a.description}</p>
                  {c && (
                    <Link to="/creators/$id" params={{ id: c.id }} className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-surface-50 px-2 py-0.5 text-[11px] hover:bg-surface-100">
                      <Avatar name={c.name} hue={c.avatarHue} size={16} />
                      {c.name}
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
