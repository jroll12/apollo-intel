import { createFileRoute, Link } from "@tanstack/react-router";
import { Avatar } from "@/components/Avatar";
import { PageHeader } from "@/components/PageHeader";
import { useMemo, useState } from "react";
import { formatAudience } from "@/lib/mock-data";
import { useStore, formatRelative, formatDate } from "@/lib/store";
import { CreatorForm } from "@/components/forms/CreatorForm";
import { TaskForm } from "@/components/forms/TaskForm";
import { CommunicationForm } from "@/components/forms/CommunicationForm";
import { TrendingUp, ArrowUpRight, Plus, Sparkles, AlertCircle, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Mission Control — Signal" },
      { name: "description", content: "Strategic overview of creator partnerships and digital missions operations." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const creators = useStore((s) => s.creators);
  const tasks = useStore((s) => s.tasks);
  const opportunities = useStore((s) => s.opportunities);
  const activities = useStore((s) => s.activities);
  const communications = useStore((s) => s.communications);
  const insights = useStore((s) => s.insights);
  const updateTask = useStore((s) => s.updateTask);

  const [q, setQ] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [taskOpen, setTaskOpen] = useState(false);
  const [logFor, setLogFor] = useState<string | null>(null);

  const active = creators.filter((c) => !c.archived);
  const highPriority = active.filter((c) => c.priority === "High");
  const rising = active.filter((c) => c.trend === "rising");

  const todayKey = new Date().toISOString().slice(0, 10);
  const openTasks = tasks.filter((t) => t.status !== "done" && t.status !== "canceled");
  const overdue = openTasks.filter((t) => t.dueDate && t.dueDate < todayKey);
  const dueToday = openTasks.filter((t) => t.dueDate === todayKey);
  const followUps = communications.filter((c) => c.followUpNeeded && c.followUpDate && c.followUpDate >= todayKey);

  const inOutreach = active.filter((c) =>
    !["Identified", "Researching", "Archive", "Dormant"].includes(c.stage)
  );

  const stats = [
    { label: "Active Creators", value: active.length.toString(), foot: `${creators.length - active.length} archived`, tone: "text-success" },
    { label: "Active Outreach", value: inOutreach.length.toString(), foot: `${followUps.length} follow-ups due`, tone: "text-brand" },
    { label: "Combined Reach", value: formatAudience(active.reduce((s, c) => s + c.audienceSize, 0)), foot: `Across ${active.length} creators`, tone: "text-success" },
    { label: "Open Tasks", value: openTasks.length.toString(), foot: `${overdue.length} overdue · ${dueToday.length} today`, tone: overdue.length > 0 ? "text-warning" : "text-success" },
  ];

  const recommended = insights.filter((i) => i.kind === "Partnership" || i.kind === "Similarity").slice(0, 2);

  const recentActivity = useMemo(() => activities.slice(0, 6), [activities]);

  const recentlyContacted = useMemo(() => {
    const byCreator = new Map<string, string>();
    for (const c of communications) {
      if (!byCreator.has(c.creatorId)) byCreator.set(c.creatorId, c.date);
    }
    return active
      .filter((c) => byCreator.has(c.id))
      .map((c) => ({ c, date: byCreator.get(c.id)! }))
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 5);
  }, [active, communications]);

  return (
    <div className="fade-in">
      <PageHeader
        title="Mission Control"
        subtitle={`${active.length} creators · ${openTasks.length} open tasks · ${opportunities.length} opportunities`}
        search={{ value: q, onChange: setQ, placeholder: "Search creators, tags, or events…" }}
        action={
          <button onClick={() => setAddOpen(true)} className="inline-flex items-center gap-1.5 rounded-full bg-surface-950 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90">
            <Plus className="size-4" /> Add Creator
          </button>
        }
      />

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-white p-5">
            <p className="text-xs font-medium text-surface-400">{s.label}</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight">{s.value}</p>
            <p className={`mt-2 text-[10px] font-medium ${s.tone}`}>{s.foot}</p>
          </div>
        ))}
      </div>

      {active.length === 0 && (
        <div className="mb-8 rounded-2xl border border-dashed border-border bg-white p-10 text-center">
          <h3 className="text-base font-semibold">No creators yet</h3>
          <p className="mt-1 text-sm text-surface-500">Add your first creator or apologist to start tracking outreach.</p>
          <button onClick={() => setAddOpen(true)} className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-surface-950 px-4 py-2 text-sm font-medium text-white">
            <Plus className="size-4" /> Add Creator
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <section className="space-y-6 lg:col-span-8">
          {recommended.length > 0 && (
            <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="size-4 text-brand" />
                  <h2 className="text-base font-semibold">AI Recommended Partnerships</h2>
                </div>
                <Link to="/insights" className="text-xs font-medium text-brand hover:underline">View all insights →</Link>
              </div>
              <div className="space-y-3">
                {recommended.map((rec) => {
                  const main = creators.find((c) => c.id === rec.creatorIds[0]);
                  if (!main) return null;
                  return (
                    <Link key={rec.id} to="/creators/$id" params={{ id: main.id }}
                      className="flex items-start gap-4 rounded-xl border border-surface-100 bg-surface-50/40 p-4 transition-colors hover:bg-surface-50">
                      <Avatar name={main.name} hue={main.avatarHue} size={48} className="rounded-xl" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h4 className="truncate text-sm font-semibold">{rec.title}</h4>
                            <p className="truncate text-[11px] text-surface-400">
                              {rec.creatorIds.map((id) => creators.find((c) => c.id === id)?.name).filter(Boolean).join(" × ")}
                            </p>
                          </div>
                          <span className="shrink-0 rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-medium text-success">
                            {rec.confidence}% confidence
                          </span>
                        </div>
                        <p className="mt-2 text-xs text-surface-600">{rec.body}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {rising.length > 0 && (
            <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-base font-semibold">Trending Creators</h2>
                <Link to="/creators" className="text-xs font-medium text-brand hover:underline">All creators →</Link>
              </div>
              <div className="space-y-2">
                {rising.slice(0, 5).map((c) => (
                  <Link key={c.id} to="/creators/$id" params={{ id: c.id }}
                    className="flex items-center gap-4 rounded-lg px-2 py-2 transition-colors hover:bg-surface-50">
                    <Avatar name={c.name} hue={c.avatarHue} size={36} />
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium">{c.name}</p>
                      <p className="truncate text-[11px] text-surface-400">{c.ministryFocus} · {c.country}</p>
                    </div>
                    <div className="hidden items-center gap-1 text-[11px] font-medium text-success sm:flex">
                      <TrendingUp className="size-3" /> rising
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold tabular-nums">{formatAudience(c.audienceSize)}</p>
                      <p className="text-[10px] text-surface-400">audience</p>
                    </div>
                    <ArrowUpRight className="size-4 text-surface-300" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-border bg-white p-6">
              <h3 className="mb-4 text-sm font-semibold">Recently Contacted</h3>
              {recentlyContacted.length === 0 ? (
                <p className="text-xs text-surface-400">No communications logged yet.</p>
              ) : (
                <div className="space-y-3">
                  {recentlyContacted.map(({ c, date }) => (
                    <Link key={c.id} to="/creators/$id" params={{ id: c.id }} className="flex items-center gap-3">
                      <Avatar name={c.name} hue={c.avatarHue} size={28} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium">{c.name}</p>
                        <p className="text-[10px] text-surface-400">{formatDate(date)}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-border bg-white p-6">
              <h3 className="mb-4 text-sm font-semibold">By Stage</h3>
              <div className="space-y-2">
                {Object.entries(
                  active.reduce<Record<string, number>>((acc, c) => {
                    acc[c.stage] = (acc[c.stage] ?? 0) + 1; return acc;
                  }, {})
                ).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([stage, count]) => (
                  <div key={stage} className="flex items-center justify-between text-xs">
                    <span className="text-surface-600">{stage}</span>
                    <span className="font-semibold">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <aside className="space-y-6 lg:col-span-4">
          <div className="rounded-2xl border border-border bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold">Tasks</h3>
              <button onClick={() => setTaskOpen(true)} className="text-[11px] font-medium text-brand">+ Add task</button>
            </div>
            {openTasks.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border p-4 text-center">
                <p className="text-xs text-surface-500">No open tasks.</p>
                <button onClick={() => setTaskOpen(true)} className="mt-2 text-[11px] font-medium text-brand">Create one →</button>
              </div>
            ) : (
              <div className="space-y-2">
                {openTasks.slice(0, 6).map((t) => {
                  const creator = t.creatorId ? creators.find((c) => c.id === t.creatorId) : null;
                  const isOverdue = t.dueDate && t.dueDate < todayKey;
                  return (
                    <div key={t.id} className={`flex items-start gap-2 rounded-lg border p-3 ${isOverdue ? "border-warning/40 bg-warning/5" : "border-border"}`}>
                      <button onClick={() => updateTask(t.id, { status: "done" })} className="mt-0.5 shrink-0 text-surface-300 hover:text-success">
                        <CheckCircle2 className="size-4" />
                      </button>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium">{t.title}</p>
                        <p className="text-[10px] text-surface-400">
                          {creator ? `${creator.name} · ` : ""}{t.priority} priority{t.dueDate ? ` · due ${t.dueDate}` : ""}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-border bg-white p-6">
            <h3 className="mb-4 text-sm font-semibold">Activity Feed</h3>
            {recentActivity.length === 0 ? (
              <p className="text-xs text-surface-400">No activity yet.</p>
            ) : (
              <div className="relative space-y-5 before:absolute before:left-[5px] before:top-2 before:h-[calc(100%-16px)] before:w-px before:bg-surface-200">
                {recentActivity.map((a) => {
                  const dot =
                    a.action === "logged" ? "bg-brand" :
                    a.action === "stage" ? "bg-warning" :
                    a.action === "created" ? "bg-success" : "bg-surface-300";
                  return (
                    <div key={a.id} className="relative pl-7">
                      <div className={`absolute left-0 top-1.5 size-2.5 rounded-full ${dot} ring-4 ring-white`} />
                      <p className="text-[10px] font-medium uppercase tracking-tight text-surface-400">{formatRelative(a.createdAt)}</p>
                      <p className="mt-0.5 text-xs text-surface-700">
                        <strong className="text-surface-900">{a.actor}</strong> {a.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {highPriority.length > 0 && (
            <div className="rounded-2xl border border-border bg-white p-6">
              <h3 className="mb-4 text-sm font-semibold">High Priority</h3>
              <div className="space-y-2">
                {highPriority.slice(0, 4).map((c) => (
                  <div key={c.id} className="flex items-center gap-3">
                    <AlertCircle className="size-4 text-warning shrink-0" />
                    <Link to="/creators/$id" params={{ id: c.id }} className="min-w-0 flex-1">
                      <p className="truncate text-[11px] font-medium">{c.name}</p>
                      <p className="truncate text-[10px] text-surface-400">{c.stage}</p>
                    </Link>
                    <button onClick={() => setLogFor(c.id)} className="text-[10px] font-medium text-brand">Log</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>

      <CreatorForm open={addOpen} onOpenChange={setAddOpen} />
      <TaskForm open={taskOpen} onOpenChange={setTaskOpen} />
      {logFor && <CommunicationForm open={!!logFor} onOpenChange={(v) => !v && setLogFor(null)} creatorId={logFor} />}
    </div>
  );
}
