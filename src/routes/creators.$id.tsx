import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Avatar } from "@/components/Avatar";
import {
  getCreator, formatAudience, opportunities, timeline, type Creator,
} from "@/lib/mock-data";
import {
  ArrowLeft, Youtube, Instagram, Mic, Globe, Mail, MessageCircle,
  TrendingUp, ShieldAlert, Sparkles, Calendar,
} from "lucide-react";

export const Route = createFileRoute("/creators/$id")({
  loader: ({ params }) => {
    const creator = getCreator(params.id);
    if (!creator) throw notFound();
    return { creator };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.creator.name ?? "Creator"} — Signal` },
      { name: "description", content: loaderData?.creator.outreachAngle ?? "Creator intelligence profile." },
    ],
  }),
  notFoundComponent: () => (
    <div className="rounded-2xl border border-dashed border-border bg-white p-12 text-center">
      <p className="text-sm text-surface-500">Creator not found.</p>
      <Link to="/creators" className="mt-3 inline-block text-xs font-medium text-brand">← Back to database</Link>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="rounded-2xl border border-dashed border-border bg-white p-12 text-center">
      <p className="text-sm text-danger">{error.message}</p>
    </div>
  ),
  component: CreatorDetail,
});

const scoreLabels: Record<string, string> = {
  apologeticsDepth: "Apologetics Depth",
  evangelismOrientation: "Evangelism Orientation",
  aiOpenness: "AI Openness",
  genZRelevance: "Gen Z Relevance",
  missionsAlignment: "Missions Alignment",
  muslimOutreach: "Muslim Outreach",
  crossCultural: "Cross-Cultural",
  partnershipPotential: "Partnership Potential",
};

function CreatorDetail() {
  const { creator: c } = Route.useLoaderData() as { creator: Creator };
  const ops = opportunities.filter((o) => o.creatorIds.includes(c.id));
  const tl = timeline.filter((t) => t.creatorId === c.id);

  const socialItems = [
    { key: "youtube", icon: Youtube, value: c.socials.youtube },
    { key: "instagram", icon: Instagram, value: c.socials.instagram },
    { key: "tiktok", icon: MessageCircle, value: c.socials.tiktok },
    { key: "x", icon: MessageCircle, value: c.socials.x },
    { key: "podcast", icon: Mic, value: c.socials.podcast },
    { key: "website", icon: Globe, value: c.socials.website },
    { key: "email", icon: Mail, value: c.socials.email },
  ].filter((s) => s.value);

  return (
    <div className="fade-in">
      <Link to="/creators" className="mb-6 inline-flex items-center gap-1.5 text-xs font-medium text-surface-500 hover:text-surface-900">
        <ArrowLeft className="size-3.5" /> Creator Database
      </Link>

      <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex items-start gap-5">
          <Avatar name={c.name} hue={c.avatarHue} size={80} className="rounded-2xl" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight">{c.name}</h1>
              {c.trend === "rising" && (
                <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-medium text-success">
                  <TrendingUp className="size-3" /> rising
                </span>
              )}
            </div>
            <p className="text-sm text-surface-500">{c.title} · {c.organization}</p>
            <p className="mt-1 text-xs text-surface-400">{c.country} · {c.denomination} · {c.ministryFocus}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {c.tags.map((t) => (
                <span key={t} className="rounded-md border border-border bg-surface-50 px-2 py-0.5 text-[10px] font-medium text-surface-600">{t}</span>
              ))}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-medium text-brand">{c.stage}</span>
          <span className="rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success">{c.alignment}% alignment</span>
          <button className="rounded-full bg-surface-950 px-4 py-1.5 text-xs font-medium text-white">Draft Outreach</button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { l: "Audience", v: formatAudience(c.audienceSize) },
          { l: "Engagement", v: `${c.engagementQuality}/100` },
          { l: "Shorts Effectiveness", v: `${c.shortsEffectiveness}%` },
          { l: "Livestream", v: c.livestreamFrequency },
        ].map((s) => (
          <div key={s.l} className="rounded-xl border border-border bg-white p-4">
            <p className="text-[10px] font-medium uppercase text-surface-400">{s.l}</p>
            <p className="mt-1 text-lg font-semibold tabular-nums">{s.v}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-8">
          <section className="rounded-2xl border border-border bg-white p-6">
            <h2 className="mb-4 text-sm font-semibold">Missions Strategy Scores</h2>
            <div className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
              {Object.entries(c.scores).map(([k, v]) => (
                <div key={k}>
                  <div className="mb-1.5 flex items-center justify-between text-xs">
                    <span className="text-surface-600">{scoreLabels[k]}</span>
                    <span className="font-mono font-medium">{v}</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-100">
                    <div className="h-full rounded-full bg-brand" style={{ width: `${v}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-white p-6">
            <h2 className="mb-4 text-sm font-semibold">Content Analysis</h2>
            <dl className="grid grid-cols-1 gap-4 text-xs sm:grid-cols-2">
              <div>
                <dt className="text-[10px] font-bold uppercase text-surface-400">Primary Formats</dt>
                <dd className="mt-1 text-surface-700">{c.primaryFormats.join(" · ")}</dd>
              </div>
              <div>
                <dt className="text-[10px] font-bold uppercase text-surface-400">Viral Themes</dt>
                <dd className="mt-1 text-surface-700">{c.viralThemes.join(", ")}</dd>
              </div>
              <div>
                <dt className="text-[10px] font-bold uppercase text-surface-400">Audience</dt>
                <dd className="mt-1 text-surface-700">{c.audienceType} · {c.demographics}</dd>
              </div>
              <div>
                <dt className="text-[10px] font-bold uppercase text-surface-400">Tone</dt>
                <dd className="mt-1 text-surface-700">{c.tone}</dd>
              </div>
            </dl>
          </section>

          <section className="rounded-2xl border border-border bg-white p-6">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold">
              <Sparkles className="size-4 text-brand" /> Strategic Assessment
            </h2>
            <p className="rounded-lg bg-surface-50 p-3 text-xs text-surface-700">{c.reputation}</p>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <h3 className="mb-2 text-[10px] font-bold uppercase text-surface-400">Strengths</h3>
                <ul className="space-y-1.5 text-xs text-surface-700">
                  {c.strengths.map((s) => (
                    <li key={s} className="flex gap-2"><span className="text-success">+</span>{s}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="mb-2 flex items-center gap-1 text-[10px] font-bold uppercase text-surface-400">
                  <ShieldAlert className="size-3" /> Risks
                </h3>
                <ul className="space-y-1.5 text-xs text-surface-700">
                  {c.risks.map((s) => (
                    <li key={s} className="flex gap-2"><span className="text-warning">!</span>{s}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="mt-4 rounded-lg border border-brand/20 bg-brand/5 p-3">
              <p className="text-[10px] font-bold uppercase text-brand">Suggested outreach angle</p>
              <p className="mt-1 text-xs text-surface-800">{c.outreachAngle}</p>
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-white p-6">
            <h2 className="mb-4 text-sm font-semibold">Activity Timeline</h2>
            {tl.length === 0 ? (
              <p className="text-xs text-surface-400">No recorded interactions yet.</p>
            ) : (
              <div className="relative space-y-5 before:absolute before:left-[5px] before:top-2 before:h-[calc(100%-16px)] before:w-px before:bg-surface-200">
                {tl.map((t) => (
                  <div key={t.id} className="relative pl-7">
                    <div className="absolute left-0 top-1.5 size-2.5 rounded-full bg-brand ring-4 ring-white" />
                    <p className="text-[10px] font-medium uppercase tracking-tight text-surface-400">{t.date} · {t.kind}</p>
                    <p className="text-sm font-medium">{t.title}</p>
                    <p className="text-xs text-surface-600">{t.detail}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <aside className="space-y-6 lg:col-span-4">
          <div className="rounded-2xl border border-border bg-white p-6">
            <h3 className="mb-3 text-sm font-semibold">Digital Footprint</h3>
            <ul className="space-y-2 text-xs">
              {socialItems.map((s) => (
                <li key={s.key} className="flex items-center gap-2 text-surface-700">
                  <s.icon className="size-3.5 text-surface-400" />
                  <span className="truncate">{s.value}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-border bg-white p-6">
            <h3 className="mb-3 text-sm font-semibold">Relationship Intelligence</h3>
            <div className="space-y-3 text-xs">
              {c.warmPath && (
                <div className="rounded-lg bg-success/10 p-3">
                  <p className="text-[10px] font-bold uppercase text-success">Warm Path</p>
                  <p className="mt-1 text-surface-800">{c.warmPath}</p>
                </div>
              )}
              <div>
                <p className="text-[10px] font-bold uppercase text-surface-400">Known Collaborators</p>
                <p className="mt-1 text-surface-700">{c.knownCollaborators.join(", ") || "—"}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-surface-400">Conferences</p>
                <p className="mt-1 text-surface-700">{c.conferencesAttended.join(", ") || "—"}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-surface-400">Organizations</p>
                <p className="mt-1 text-surface-700">{c.organizations.join(", ") || "—"}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-surface-400">Last touch</p>
                <p className="mt-1 text-surface-700">{c.lastTouch}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-white p-6">
            <h3 className="mb-3 text-sm font-semibold">Internal Notes</h3>
            <p className="rounded-lg bg-surface-50 p-3 text-xs italic text-surface-700">{c.internalNotes}</p>
          </div>

          {ops.length > 0 && (
            <div className="rounded-2xl border border-border bg-white p-6">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                <Calendar className="size-4 text-brand" /> Active Opportunities
              </h3>
              <ul className="space-y-3 text-xs">
                {ops.map((o) => (
                  <li key={o.id} className="rounded-lg border border-border p-3">
                    <p className="font-medium">{o.title}</p>
                    <p className="mt-0.5 text-[10px] text-surface-400">{o.type} · {o.status}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
