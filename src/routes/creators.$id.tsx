import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Avatar } from "@/components/Avatar";
import { formatAudience } from "@/lib/mock-data";
import { useStore, formatDate } from "@/lib/store";
import { CreatorForm } from "@/components/forms/CreatorForm";
import { CommunicationForm } from "@/components/forms/CommunicationForm";
import { NoteForm } from "@/components/forms/NoteForm";
import { TaskForm } from "@/components/forms/TaskForm";
import { OpportunityForm } from "@/components/forms/OpportunityForm";
import { PIPELINE_STAGES, type PipelineStage } from "@/lib/mock-data";
import { useState } from "react";
import { toast } from "sonner";
import {
  ArrowLeft, Youtube, Instagram, Mic, Globe, Mail, MessageCircle,
  TrendingUp, ShieldAlert, Sparkles, Plus, Pencil, Archive,
  CheckCircle2, Pin, Trash2, ArrowDownLeft, ArrowUpRight,
} from "lucide-react";

export const Route = createFileRoute("/creators/$id")({
  head: ({ params }) => ({
    meta: [{ title: `Creator — Signal` }, { name: "description", content: `Creator intelligence profile.` }],
  }),
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

type Tab = "overview" | "platforms" | "communications" | "notes" | "tasks" | "opportunities";

function CreatorDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const c = useStore((s) => s.creators.find((x) => x.id === id));
  const communications = useStore((s) => s.communications.filter((x) => x.creatorId === id));
  const notes = useStore((s) => s.notes.filter((x) => x.creatorId === id));
  const tasks = useStore((s) => s.tasks.filter((x) => x.creatorId === id));
  const opportunities = useStore((s) => s.opportunities.filter((o) => o.creatorIds.includes(id)));
  const setStage = useStore((s) => s.setStage);
  const archive = useStore((s) => s.archiveCreator);
  const unarchive = useStore((s) => s.unarchiveCreator);
  const remove = useStore((s) => s.deleteCreator);
  const togglePin = useStore((s) => s.togglePinNote);
  const deleteNote = useStore((s) => s.deleteNote);
  const updateTask = useStore((s) => s.updateTask);
  const deleteTask = useStore((s) => s.deleteTask);

  const [tab, setTab] = useState<Tab>("overview");
  const [editOpen, setEditOpen] = useState(false);
  const [logOpen, setLogOpen] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [taskOpen, setTaskOpen] = useState(false);
  const [oppOpen, setOppOpen] = useState(false);

  if (!c) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-white p-12 text-center">
        <p className="text-sm text-surface-500">Creator not found.</p>
        <Link to="/creators" className="mt-3 inline-block text-xs font-medium text-brand">← Back to database</Link>
      </div>
    );
  }

  const socialItems = [
    { key: "youtube", icon: Youtube, value: c.socials.youtube },
    { key: "instagram", icon: Instagram, value: c.socials.instagram },
    { key: "tiktok", icon: MessageCircle, value: c.socials.tiktok },
    { key: "x", icon: MessageCircle, value: c.socials.x },
    { key: "podcast", icon: Mic, value: c.socials.podcast },
    { key: "website", icon: Globe, value: c.socials.website },
    { key: "email", icon: Mail, value: c.socials.email },
  ].filter((s) => s.value);

  const pinnedNotes = notes.filter((n) => n.pinned);
  const otherNotes = notes.filter((n) => !n.pinned);
  const openTasks = tasks.filter((t) => t.status !== "done" && t.status !== "canceled");
  const doneTasks = tasks.filter((t) => t.status === "done");

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: "overview", label: "Overview" },
    { key: "platforms", label: "Platforms", count: socialItems.length },
    { key: "communications", label: "Communications", count: communications.length },
    { key: "notes", label: "Notes", count: notes.length },
    { key: "tasks", label: "Tasks", count: openTasks.length },
    { key: "opportunities", label: "Opportunities", count: opportunities.length },
  ];

  return (
    <div className="fade-in">
      <Link to="/creators" className="mb-6 inline-flex items-center gap-1.5 text-xs font-medium text-surface-500 hover:text-surface-900">
        <ArrowLeft className="size-3.5" /> Creator Database
      </Link>

      <div className="mb-6 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-5">
          <Avatar name={c.name} hue={c.avatarHue} size={80} className="rounded-2xl" />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight">{c.name}</h1>
              {c.archived && <span className="rounded-full bg-surface-200 px-2 py-0.5 text-[10px] font-medium text-surface-600">Archived</span>}
              {c.trend === "rising" && (
                <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-medium text-success">
                  <TrendingUp className="size-3" /> rising
                </span>
              )}
            </div>
            <p className="text-sm text-surface-500">{c.title}{c.organization ? ` · ${c.organization}` : ""}</p>
            <p className="mt-1 text-xs text-surface-400">{[c.country, c.denomination, c.ministryFocus].filter(Boolean).join(" · ")}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {c.tags.map((t) => (
                <span key={t} className="rounded-md border border-border bg-surface-50 px-2 py-0.5 text-[10px] font-medium text-surface-600">{t}</span>
              ))}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select value={c.stage} onChange={(e) => setStage(c.id, e.target.value as PipelineStage)}
            className="rounded-full border border-brand/30 bg-brand/5 px-3 py-1.5 text-xs font-medium text-brand outline-none">
            {PIPELINE_STAGES.map((s) => <option key={s}>{s}</option>)}
          </select>
          <button onClick={() => setLogOpen(true)} className="rounded-full bg-surface-950 px-3 py-1.5 text-xs font-medium text-white">Log Communication</button>
          <button onClick={() => setNoteOpen(true)} className="rounded-full border border-border bg-white px-3 py-1.5 text-xs font-medium">Add Note</button>
          <button onClick={() => setTaskOpen(true)} className="rounded-full border border-border bg-white px-3 py-1.5 text-xs font-medium">Add Task</button>
          <button onClick={() => setOppOpen(true)} className="rounded-full border border-border bg-white px-3 py-1.5 text-xs font-medium">Add Opportunity</button>
          <button onClick={() => setEditOpen(true)} className="rounded-full border border-border bg-white p-1.5" title="Edit"><Pencil className="size-3.5" /></button>
          {c.archived ? (
            <button onClick={() => { unarchive(c.id); toast.success("Restored"); }} className="rounded-full border border-border bg-white p-1.5" title="Unarchive"><Archive className="size-3.5" /></button>
          ) : (
            <button onClick={() => { archive(c.id); toast.success("Archived"); }} className="rounded-full border border-border bg-white p-1.5" title="Archive"><Archive className="size-3.5" /></button>
          )}
          <button onClick={() => {
            if (confirm(`Delete ${c.name}? This removes all linked notes, tasks, and communications.`)) {
              remove(c.id); toast.success("Deleted"); navigate({ to: "/creators" });
            }
          }} className="rounded-full border border-danger/30 bg-white p-1.5 text-danger" title="Delete"><Trash2 className="size-3.5" /></button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { l: "Audience", v: formatAudience(c.audienceSize) },
          { l: "Engagement", v: `${c.engagementQuality}/100` },
          { l: "Communications", v: communications.length.toString() },
          { l: "Open Tasks", v: openTasks.length.toString() },
        ].map((s) => (
          <div key={s.l} className="rounded-xl border border-border bg-white p-4">
            <p className="text-[10px] font-medium uppercase text-surface-400">{s.l}</p>
            <p className="mt-1 text-lg font-semibold tabular-nums">{s.v}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 border-b border-border">
        <div className="flex gap-1 overflow-x-auto">
          {tabs.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`relative shrink-0 px-4 py-2.5 text-xs font-medium transition-colors ${
                tab === t.key ? "text-surface-900" : "text-surface-500 hover:text-surface-700"
              }`}>
              {t.label}{t.count !== undefined && t.count > 0 && <span className="ml-1.5 rounded-full bg-surface-100 px-1.5 py-0.5 text-[10px]">{t.count}</span>}
              {tab === t.key && <span className="absolute inset-x-2 -bottom-px h-0.5 bg-brand" />}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6">
        {tab === "overview" && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
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

              {(c.strengths.length > 0 || c.risks.length > 0 || c.outreachAngle) && (
                <section className="rounded-2xl border border-border bg-white p-6">
                  <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold">
                    <Sparkles className="size-4 text-brand" /> Strategic Assessment
                  </h2>
                  {c.reputation && <p className="rounded-lg bg-surface-50 p-3 text-xs text-surface-700">{c.reputation}</p>}
                  <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {c.strengths.length > 0 && (
                      <div>
                        <h3 className="mb-2 text-[10px] font-bold uppercase text-surface-400">Strengths</h3>
                        <ul className="space-y-1.5 text-xs text-surface-700">
                          {c.strengths.map((s) => <li key={s} className="flex gap-2"><span className="text-success">+</span>{s}</li>)}
                        </ul>
                      </div>
                    )}
                    {c.risks.length > 0 && (
                      <div>
                        <h3 className="mb-2 flex items-center gap-1 text-[10px] font-bold uppercase text-surface-400">
                          <ShieldAlert className="size-3" /> Risks
                        </h3>
                        <ul className="space-y-1.5 text-xs text-surface-700">
                          {c.risks.map((s) => <li key={s} className="flex gap-2"><span className="text-warning">!</span>{s}</li>)}
                        </ul>
                      </div>
                    )}
                  </div>
                  {c.outreachAngle && (
                    <div className="mt-4 rounded-lg border border-brand/20 bg-brand/5 p-3">
                      <p className="text-[10px] font-bold uppercase text-brand">Suggested outreach angle</p>
                      <p className="mt-1 text-xs text-surface-800">{c.outreachAngle}</p>
                    </div>
                  )}
                </section>
              )}
            </div>

            <aside className="space-y-6 lg:col-span-4">
              <div className="rounded-2xl border border-border bg-white p-6">
                <h3 className="mb-3 text-sm font-semibold">Relationship Intelligence</h3>
                <div className="space-y-3 text-xs">
                  {c.warmPath && (
                    <div className="rounded-lg bg-success/10 p-3">
                      <p className="text-[10px] font-bold uppercase text-success">Warm Path</p>
                      <p className="mt-1 text-surface-800">{c.warmPath}</p>
                    </div>
                  )}
                  <div><p className="text-[10px] font-bold uppercase text-surface-400">Last touch</p><p className="mt-1 text-surface-700">{c.lastTouch || "—"}</p></div>
                  <div><p className="text-[10px] font-bold uppercase text-surface-400">Updated</p><p className="mt-1 text-surface-700">{formatDate(c.updatedAt)}</p></div>
                </div>
              </div>
              {c.internalNotes && (
                <div className="rounded-2xl border border-border bg-white p-6">
                  <h3 className="mb-3 text-sm font-semibold">Internal Notes</h3>
                  <p className="rounded-lg bg-surface-50 p-3 text-xs italic text-surface-700">{c.internalNotes}</p>
                </div>
              )}
            </aside>
          </div>
        )}

        {tab === "platforms" && (
          <div className="rounded-2xl border border-border bg-white p-6">
            <h3 className="mb-4 text-sm font-semibold">Digital Footprint</h3>
            {socialItems.length === 0 ? (
              <p className="text-xs text-surface-400">No platforms recorded yet. <button onClick={() => setEditOpen(true)} className="font-medium text-brand">Add some →</button></p>
            ) : (
              <ul className="space-y-2 text-xs">
                {socialItems.map((s) => (
                  <li key={s.key} className="flex items-center gap-2 text-surface-700">
                    <s.icon className="size-3.5 text-surface-400" />
                    <span className="truncate">{s.value}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {tab === "communications" && (
          <div className="rounded-2xl border border-border bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold">Communication History</h3>
              <button onClick={() => setLogOpen(true)} className="inline-flex items-center gap-1 rounded-full bg-surface-950 px-3 py-1.5 text-xs font-medium text-white">
                <Plus className="size-3" /> Log Communication
              </button>
            </div>
            {communications.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border p-8 text-center">
                <p className="text-xs text-surface-500">No communications logged yet.</p>
                <button onClick={() => setLogOpen(true)} className="mt-2 text-xs font-medium text-brand">Log the first one →</button>
              </div>
            ) : (
              <div className="space-y-3">
                {communications.map((cm) => (
                  <div key={cm.id} className="rounded-lg border border-border p-4">
                    <div className="mb-1 flex items-center gap-2 text-[10px] uppercase tracking-wide text-surface-400">
                      {cm.direction === "outbound" ? <ArrowUpRight className="size-3 text-brand" /> : <ArrowDownLeft className="size-3 text-success" />}
                      <span>{cm.type}</span>
                      <span>·</span>
                      <span>{formatDate(cm.date)}</span>
                      <span>·</span>
                      <span>{cm.contactedBy}</span>
                      <span className="ml-auto rounded-full bg-surface-100 px-2 py-0.5 text-[10px] font-medium text-surface-700">{cm.responseStatus}</span>
                    </div>
                    <p className="text-sm text-surface-800">{cm.summary}</p>
                    {cm.followUpNeeded && (
                      <p className="mt-2 text-[11px] font-medium text-warning">Follow-up{cm.followUpDate ? ` by ${cm.followUpDate}` : ""}</p>
                    )}
                    {cm.linkOrAttachment && <a href={cm.linkOrAttachment} target="_blank" rel="noreferrer" className="mt-1 inline-block text-[11px] text-brand underline">{cm.linkOrAttachment}</a>}
                    {cm.internalNotes && <p className="mt-2 rounded bg-surface-50 p-2 text-[11px] italic text-surface-600">{cm.internalNotes}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "notes" && (
          <div className="rounded-2xl border border-border bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold">Notes</h3>
              <button onClick={() => setNoteOpen(true)} className="inline-flex items-center gap-1 rounded-full bg-surface-950 px-3 py-1.5 text-xs font-medium text-white">
                <Plus className="size-3" /> Add Note
              </button>
            </div>
            {notes.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border p-8 text-center">
                <p className="text-xs text-surface-500">No notes yet.</p>
                <button onClick={() => setNoteOpen(true)} className="mt-2 text-xs font-medium text-brand">Add first note →</button>
              </div>
            ) : (
              <div className="space-y-3">
                {[...pinnedNotes, ...otherNotes].map((n) => (
                  <div key={n.id} className={`rounded-lg border p-4 ${n.pinned ? "border-warning/30 bg-warning/5" : "border-border"}`}>
                    <div className="mb-1 flex items-center gap-2 text-[10px] uppercase tracking-wide text-surface-400">
                      <span>{n.category}</span>
                      <span>·</span>
                      <span>{formatDate(n.date)}</span>
                      <span>·</span>
                      <span>{n.author}</span>
                      <div className="ml-auto flex gap-1">
                        <button onClick={() => togglePin(n.id)} className={`p-1 ${n.pinned ? "text-warning" : "text-surface-300 hover:text-warning"}`}><Pin className="size-3" /></button>
                        <button onClick={() => deleteNote(n.id)} className="p-1 text-surface-300 hover:text-danger"><Trash2 className="size-3" /></button>
                      </div>
                    </div>
                    <p className="whitespace-pre-wrap text-sm text-surface-800">{n.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "tasks" && (
          <div className="rounded-2xl border border-border bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold">Tasks</h3>
              <button onClick={() => setTaskOpen(true)} className="inline-flex items-center gap-1 rounded-full bg-surface-950 px-3 py-1.5 text-xs font-medium text-white">
                <Plus className="size-3" /> Add Task
              </button>
            </div>
            {tasks.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border p-8 text-center">
                <p className="text-xs text-surface-500">No tasks yet.</p>
                <button onClick={() => setTaskOpen(true)} className="mt-2 text-xs font-medium text-brand">Create one →</button>
              </div>
            ) : (
              <div className="space-y-2">
                {[...openTasks, ...doneTasks].map((t) => (
                  <div key={t.id} className={`flex items-start gap-3 rounded-lg border border-border p-3 ${t.status === "done" ? "opacity-50" : ""}`}>
                    <button onClick={() => updateTask(t.id, { status: t.status === "done" ? "open" : "done" })} className={`mt-0.5 ${t.status === "done" ? "text-success" : "text-surface-300 hover:text-success"}`}>
                      <CheckCircle2 className="size-4" />
                    </button>
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm font-medium ${t.status === "done" ? "line-through" : ""}`}>{t.title}</p>
                      {t.description && <p className="mt-0.5 text-xs text-surface-600">{t.description}</p>}
                      <p className="mt-1 text-[10px] text-surface-400">{t.taskType} · {t.priority}{t.dueDate ? ` · due ${t.dueDate}` : ""}{t.assignee ? ` · ${t.assignee}` : ""}</p>
                    </div>
                    <button onClick={() => deleteTask(t.id)} className="text-surface-300 hover:text-danger"><Trash2 className="size-3.5" /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "opportunities" && (
          <div className="rounded-2xl border border-border bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold">Opportunities</h3>
              <button onClick={() => setOppOpen(true)} className="inline-flex items-center gap-1 rounded-full bg-surface-950 px-3 py-1.5 text-xs font-medium text-white">
                <Plus className="size-3" /> Add Opportunity
              </button>
            </div>
            {opportunities.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border p-8 text-center">
                <p className="text-xs text-surface-500">No opportunities linked.</p>
                <button onClick={() => setOppOpen(true)} className="mt-2 text-xs font-medium text-brand">Create one →</button>
              </div>
            ) : (
              <div className="space-y-3">
                {opportunities.map((o) => (
                  <div key={o.id} className="rounded-lg border border-border p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[10px] font-bold uppercase text-surface-400">{o.type}</p>
                        <p className="text-sm font-semibold">{o.title}</p>
                      </div>
                      <span className="rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-medium text-brand">{o.status}</span>
                    </div>
                    {o.notes && <p className="mt-2 text-xs text-surface-600">{o.notes}</p>}
                    {o.nextAction && <p className="mt-2 text-[11px] text-surface-500"><span className="font-medium">Next:</span> {o.nextAction}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <CreatorForm open={editOpen} onOpenChange={setEditOpen} existing={c} />
      <CommunicationForm open={logOpen} onOpenChange={setLogOpen} creatorId={c.id} />
      <NoteForm open={noteOpen} onOpenChange={setNoteOpen} creatorId={c.id} />
      <TaskForm open={taskOpen} onOpenChange={setTaskOpen} creatorId={c.id} />
      <OpportunityForm open={oppOpen} onOpenChange={setOppOpen} creatorId={c.id} />
    </div>
  );
}
