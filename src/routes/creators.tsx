import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Avatar } from "@/components/Avatar";
import { creators, formatAudience, type Tag } from "@/lib/mock-data";
import { TrendingUp, Plus, Filter } from "lucide-react";

const ALL_TAGS: Tag[] = [
  "Apologetics", "Evangelism", "Gen Z", "Muslim Outreach", "Missions",
  "AI-Friendly", "Podcast", "Shorts Creator", "Debate Content", "Theology",
  "Digital Missionary", "Strategic Partner", "Emerging Creator", "Livestreamer",
  "Church Leadership", "High Trust Audience",
];

export const Route = createFileRoute("/creators")({
  head: () => ({
    meta: [
      { title: "Creator Database — Signal" },
      { name: "description", content: "Searchable intelligence database of Christian creators, apologists, and digital missionaries." },
    ],
  }),
  component: CreatorsPage,
});

function CreatorsPage() {
  const [q, setQ] = useState("");
  const [activeTags, setActiveTags] = useState<Set<Tag>>(new Set());

  const filtered = useMemo(() => {
    const ql = q.toLowerCase();
    return creators.filter((c) => {
      const matchQ =
        !ql ||
        c.name.toLowerCase().includes(ql) ||
        c.ministryFocus.toLowerCase().includes(ql) ||
        c.organization.toLowerCase().includes(ql) ||
        c.country.toLowerCase().includes(ql) ||
        c.tags.some((t) => t.toLowerCase().includes(ql));
      const matchT = activeTags.size === 0 || c.tags.some((t) => activeTags.has(t));
      return matchQ && matchT;
    });
  }, [q, activeTags]);

  const toggle = (t: Tag) => {
    const next = new Set(activeTags);
    next.has(t) ? next.delete(t) : next.add(t);
    setActiveTags(next);
  };

  return (
    <div className="fade-in">
      <PageHeader
        title="Creator Database"
        subtitle={`${filtered.length} creators · live intelligence`}
        search={{ value: q, onChange: setQ, placeholder: "Fuzzy search creators, tags, ministry focus…" }}
        action={
          <button className="inline-flex items-center gap-1.5 rounded-full bg-surface-950 px-4 py-2 text-sm font-medium text-white">
            <Plus className="size-4" /> Add Creator
          </button>
        }
      />

      <div className="mb-6 flex items-start gap-3">
        <Filter className="mt-1.5 size-4 text-surface-400" />
        <div className="flex flex-wrap gap-2">
          {ALL_TAGS.map((t) => {
            const on = activeTags.has(t);
            return (
              <button
                key={t}
                onClick={() => toggle(t)}
                className={`rounded-full border px-3 py-1 text-[11px] font-medium transition-colors ${
                  on
                    ? "border-brand bg-brand text-white"
                    : "border-border bg-white text-surface-600 hover:border-surface-300"
                }`}
              >
                {t}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((c) => (
          <Link
            key={c.id}
            to="/creators/$id"
            params={{ id: c.id }}
            className="group rounded-2xl border border-border bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-surface-300 hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Avatar name={c.name} hue={c.avatarHue} size={44} />
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold">{c.name}</h3>
                  <p className="text-[11px] text-surface-400">{c.handle}</p>
                </div>
              </div>
              <span className="rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-medium text-success">
                {c.alignment}%
              </span>
            </div>

            <p className="mt-3 text-xs text-surface-600">{c.title} · {c.country}</p>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {c.tags.slice(0, 3).map((t) => (
                <span key={t} className="rounded-md border border-border bg-surface-50 px-1.5 py-0.5 text-[10px] text-surface-600">
                  {t}
                </span>
              ))}
              {c.tags.length > 3 && (
                <span className="rounded-md border border-border bg-surface-50 px-1.5 py-0.5 text-[10px] text-surface-400">
                  +{c.tags.length - 3}
                </span>
              )}
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3 border-t border-border pt-4 text-center">
              <div>
                <p className="text-[10px] font-medium uppercase text-surface-400">Audience</p>
                <p className="text-sm font-semibold tabular-nums">{formatAudience(c.audienceSize)}</p>
              </div>
              <div>
                <p className="text-[10px] font-medium uppercase text-surface-400">Engagement</p>
                <p className="text-sm font-semibold tabular-nums">{c.engagementQuality}</p>
              </div>
              <div>
                <p className="text-[10px] font-medium uppercase text-surface-400">Stage</p>
                <p className="truncate text-[11px] font-medium text-brand">{c.stage}</p>
              </div>
            </div>

            <div className="mt-4 rounded-lg bg-surface-50 p-3 text-[11px] leading-relaxed text-surface-600">
              <span className="font-mono text-[10px] font-bold text-brand">AI ·</span> {c.outreachAngle}
              {c.trend === "rising" && (
                <div className="mt-1 inline-flex items-center gap-1 text-[10px] font-medium text-success">
                  <TrendingUp className="size-3" /> trending
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border bg-white p-12 text-center">
          <p className="text-sm text-surface-500">No creators match your filters.</p>
        </div>
      )}
    </div>
  );
}
