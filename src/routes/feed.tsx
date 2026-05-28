import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { Avatar } from "@/components/Avatar";
import { activity, creators } from "@/lib/mock-data";
import { useState } from "react";

export const Route = createFileRoute("/feed")({
  head: () => ({
    meta: [
      { title: "Notes & Activity — Signal" },
      { name: "description", content: "Collaborative internal activity feed across creators, outreach, and AI signals." },
    ],
  }),
  component: FeedPage,
});

const kindLabel: Record<string, { label: string; tone: string }> = {
  note: { label: "Note", tone: "bg-surface-100 text-surface-700" },
  signal: { label: "Signal", tone: "bg-success/10 text-success" },
  stage: { label: "Stage Change", tone: "bg-warning/10 text-warning" },
  tag: { label: "Tag", tone: "bg-surface-100 text-surface-700" },
  outreach: { label: "Outreach", tone: "bg-brand/10 text-brand" },
  ai: { label: "AI", tone: "bg-brand/10 text-brand" },
  event: { label: "Event", tone: "bg-warning/10 text-warning" },
};

function FeedPage() {
  const [note, setNote] = useState("");
  return (
    <div className="fade-in">
      <PageHeader title="Notes & Activity" subtitle="What the team is doing right now" />

      <div className="mb-6 rounded-2xl border border-border bg-white p-5">
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          placeholder="Drop a note for the team — @mention a creator…"
          className="w-full resize-none border-none bg-transparent text-sm outline-none placeholder:text-surface-400"
        />
        <div className="mt-3 flex items-center justify-between">
          <p className="text-[10px] text-surface-400">Markdown supported · Press ⌘↵ to post</p>
          <button
            disabled={!note.trim()}
            onClick={() => setNote("")}
            className="rounded-full bg-surface-950 px-4 py-1.5 text-xs font-medium text-white disabled:opacity-40"
          >
            Post note
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {activity.map((a) => {
          const c = a.creatorId ? creators.find((x) => x.id === a.creatorId) : null;
          const k = kindLabel[a.kind];
          return (
            <div key={a.id} className="flex gap-4 rounded-2xl border border-border bg-white p-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-surface-100 text-xs font-semibold">
                {a.actor.split(" ").map((s) => s[0]).join("").slice(0, 2)}
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold">{a.actor}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${k.tone}`}>{k.label}</span>
                  <span className="text-[10px] text-surface-400">{a.ts}</span>
                </div>
                <p className="mt-1 text-sm text-surface-700">{a.message}</p>
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
    </div>
  );
}
