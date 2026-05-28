import { createFileRoute, Link } from "@tanstack/react-router";
import { Avatar } from "@/components/Avatar";
import { PageHeader } from "@/components/PageHeader";
import { useState } from "react";
import {
  creators, opportunities, events, activity, insights, formatAudience,
} from "@/lib/mock-data";
import { TrendingUp, ArrowUpRight, Plus, Sparkles, AlertCircle } from "lucide-react";

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
  const [q, setQ] = useState("");
  const highPriority = creators.filter((c) => c.priority === "High");
  const rising = creators.filter((c) => c.trend === "rising");
  const recommended = insights.filter((i) => i.kind === "Partnership" || i.kind === "Similarity").slice(0, 2);

  const stats = [
    { label: "Tracked Creators", value: creators.length.toString(), foot: "+2 this week", tone: "text-success" },
    { label: "Active Outreach", value: opportunities.filter((o) => o.status !== "Idea" && o.status !== "Completed").length.toString(), foot: "3 awaiting reply", tone: "text-brand" },
    { label: "Combined Reach", value: formatAudience(creators.reduce((s, c) => s + c.audienceSize, 0)), foot: "Across 10 creators", tone: "text-success" },
    { label: "Strategic Allies", value: highPriority.length.toString(), foot: "High-trust network", tone: "text-warning" },
  ];

  return (
    <div className="fade-in">
      <PageHeader
        title="Mission Control"
        subtitle="Strategic overview for Q4 outreach"
        search={{ value: q, onChange: setQ, placeholder: "Search creators, tags, or events…" }}
        action={
          <button className="inline-flex items-center gap-1.5 rounded-full bg-surface-950 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90">
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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <section className="space-y-6 lg:col-span-8">
          <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-brand" />
                <h2 className="text-base font-semibold">AI Recommended Partnerships</h2>
              </div>
              <Link to="/insights" className="text-xs font-medium text-brand hover:underline">
                View all insights →
              </Link>
            </div>
            <div className="space-y-3">
              {recommended.map((rec) => {
                const main = creators.find((c) => c.id === rec.creatorIds[0]);
                if (!main) return null;
                return (
                  <Link
                    key={rec.id}
                    to="/creators/$id"
                    params={{ id: main.id }}
                    className="flex items-start gap-4 rounded-xl border border-surface-100 bg-surface-50/40 p-4 transition-colors hover:bg-surface-50"
                  >
                    <Avatar name={main.name} hue={main.avatarHue} size={48} className="rounded-xl" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h4 className="truncate text-sm font-semibold">
                            {rec.title}
                          </h4>
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

          <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-base font-semibold">Trending Creators</h2>
              <Link to="/creators" className="text-xs font-medium text-brand hover:underline">All creators →</Link>
            </div>
            <div className="space-y-2">
              {rising.slice(0, 5).map((c) => (
                <Link
                  key={c.id}
                  to="/creators/$id"
                  params={{ id: c.id }}
                  className="flex items-center gap-4 rounded-lg px-2 py-2 transition-colors hover:bg-surface-50"
                >
                  <Avatar name={c.name} hue={c.avatarHue} size={36} />
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium">{c.name}</p>
                    <p className="truncate text-[11px] text-surface-400">{c.ministryFocus} · {c.country}</p>
                  </div>
                  <div className="hidden items-center gap-1 text-[11px] font-medium text-success sm:flex">
                    <TrendingUp className="size-3" />
                    rising
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

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-border bg-white p-6">
              <h3 className="mb-4 text-sm font-semibold">Upcoming Events</h3>
              <div className="space-y-4">
                {events.slice(0, 3).map((e) => {
                  const d = new Date(e.date);
                  return (
                    <Link
                      key={e.id}
                      to="/events"
                      className="flex items-center gap-3"
                    >
                      <div className="flex w-12 flex-col items-center justify-center rounded-lg bg-surface-100 px-2 py-1">
                        <span className="text-[10px] font-bold uppercase text-surface-500">
                          {d.toLocaleString("en", { month: "short" })}
                        </span>
                        <span className="text-xs font-bold">{d.getDate()}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-xs font-medium">{e.name}</p>
                        <p className="truncate text-[10px] text-surface-400">
                          {e.location} · {e.targetCreatorIds.length} target creators
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-white p-6">
              <h3 className="mb-4 text-sm font-semibold">Trending Conversations</h3>
              <div className="space-y-3">
                {[
                  { tag: "#AIandFaith", value: "+42% volume" },
                  { tag: "#DigitalMissionary", value: "+18% volume" },
                  { tag: "#MuslimDialogue", value: "+9% volume" },
                  { tag: "#GenZChurch", value: "stable" },
                ].map((t) => (
                  <div key={t.tag} className="flex items-center justify-between text-xs">
                    <span className="italic text-surface-600">{t.tag}</span>
                    <span className="font-semibold">{t.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <aside className="space-y-6 lg:col-span-4">
          <div className="rounded-2xl border border-border bg-white p-6">
            <h3 className="mb-6 text-sm font-semibold">Intelligence Feed</h3>
            <div className="relative space-y-5 before:absolute before:left-[5px] before:top-2 before:h-[calc(100%-16px)] before:w-px before:bg-surface-200">
              {activity.slice(0, 6).map((a) => {
                const dot =
                  a.kind === "ai" ? "bg-brand" :
                  a.kind === "signal" ? "bg-success" :
                  a.kind === "stage" ? "bg-warning" : "bg-surface-300";
                return (
                  <div key={a.id} className="relative pl-7">
                    <div className={`absolute left-0 top-1.5 size-2.5 rounded-full ${dot} ring-4 ring-white`} />
                    <p className="text-[10px] font-medium uppercase tracking-tight text-surface-400">{a.ts}</p>
                    <p className="mt-0.5 text-xs text-surface-700">
                      <strong className="text-surface-900">{a.actor}</strong> {a.message}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-white p-6">
            <h3 className="mb-4 text-sm font-semibold">Priority Reminders</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 rounded-lg border border-border p-3">
                <AlertCircle className="size-4 text-warning" />
                <div className="flex-1">
                  <p className="text-[11px] font-medium">Follow up with Sana Khan</p>
                  <p className="text-[10px] text-surface-400">Q4 debate security protocol</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg border border-border p-3">
                <AlertCircle className="size-4 text-brand" />
                <div className="flex-1">
                  <p className="text-[11px] font-medium">Send Thorne treatment</p>
                  <p className="text-[10px] text-surface-400">AI consciousness Shorts series</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg border border-border p-3 opacity-60">
                <div className="size-2 rounded-full bg-surface-300" />
                <div className="flex-1">
                  <p className="text-[11px] font-medium">Review Dallas attendee list</p>
                  <p className="text-[10px] text-surface-400">Completed 3h ago</p>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
