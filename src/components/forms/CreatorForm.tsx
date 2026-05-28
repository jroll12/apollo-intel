import { useState, type FormEvent } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useStore, type StoredCreator } from "@/lib/store";
import type { PipelineStage, Tag } from "@/lib/mock-data";
import { PIPELINE_STAGES } from "@/lib/mock-data";
import { toast } from "sonner";

const ALL_TAGS: Tag[] = [
  "Apologetics", "Evangelism", "Gen Z", "Muslim Outreach", "Missions",
  "AI-Friendly", "Podcast", "Shorts Creator", "Debate Content", "Theology",
  "Digital Missionary", "Strategic Partner", "Emerging Creator", "Livestreamer",
  "Church Leadership", "High Trust Audience",
];

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  existing?: StoredCreator;
  onSaved?: (id: string) => void;
}

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <label className="block">
    <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-surface-500">{label}</span>
    {children}
  </label>
);

const inputCls = "w-full rounded-md border border-border bg-white px-3 py-2 text-sm outline-none ring-brand/20 focus:ring-2";

export function CreatorForm({ open, onOpenChange, existing, onSaved }: Props) {
  const addCreator = useStore((s) => s.addCreator);
  const updateCreator = useStore((s) => s.updateCreator);

  const [form, setForm] = useState(() => ({
    name: existing?.name ?? "",
    title: existing?.title ?? "",
    organization: existing?.organization ?? "",
    country: existing?.country ?? "",
    denomination: existing?.denomination ?? "",
    ministryFocus: existing?.ministryFocus ?? "",
    audienceType: existing?.audienceType ?? "",
    audienceSize: existing?.audienceSize ?? 0,
    handle: existing?.handle ?? "",
    youtube: existing?.socials.youtube ?? "",
    instagram: existing?.socials.instagram ?? "",
    tiktok: existing?.socials.tiktok ?? "",
    x: existing?.socials.x ?? "",
    podcast: existing?.socials.podcast ?? "",
    website: existing?.socials.website ?? "",
    newsletter: existing?.socials.newsletter ?? "",
    email: existing?.socials.email ?? "",
    stage: (existing?.stage ?? "Identified") as PipelineStage,
    priority: existing?.priority ?? "Medium" as const,
    tags: new Set<Tag>(existing?.tags ?? []),
    outreachAngle: existing?.outreachAngle ?? "",
    internalNotes: existing?.internalNotes ?? "",
    apologeticsDepth: existing?.scores.apologeticsDepth ?? 50,
    aiOpenness: existing?.scores.aiOpenness ?? 50,
    genZRelevance: existing?.scores.genZRelevance ?? 50,
    missionsAlignment: existing?.scores.missionsAlignment ?? 50,
    muslimOutreach: existing?.scores.muslimOutreach ?? 50,
    partnershipPotential: existing?.scores.partnershipPotential ?? 50,
  }));

  const set = <K extends keyof typeof form>(k: K, v: typeof form[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const toggleTag = (t: Tag) => setForm((f) => {
    const next = new Set(f.tags);
    next.has(t) ? next.delete(t) : next.add(t);
    return { ...f, tags: next };
  });

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Name is required");
      return;
    }
    const data: Partial<StoredCreator> & { name: string } = {
      name: form.name.trim(),
      title: form.title,
      organization: form.organization || "Independent",
      country: form.country,
      denomination: form.denomination,
      ministryFocus: form.ministryFocus,
      audienceType: form.audienceType,
      audienceSize: Number(form.audienceSize) || 0,
      handle: form.handle,
      socials: {
        youtube: form.youtube || undefined,
        instagram: form.instagram || undefined,
        tiktok: form.tiktok || undefined,
        x: form.x || undefined,
        podcast: form.podcast || undefined,
        website: form.website || undefined,
        newsletter: form.newsletter || undefined,
        email: form.email || undefined,
      },
      stage: form.stage,
      priority: form.priority,
      tags: Array.from(form.tags),
      outreachAngle: form.outreachAngle,
      internalNotes: form.internalNotes,
      scores: {
        apologeticsDepth: Number(form.apologeticsDepth),
        evangelismOrientation: existing?.scores.evangelismOrientation ?? 50,
        aiOpenness: Number(form.aiOpenness),
        genZRelevance: Number(form.genZRelevance),
        missionsAlignment: Number(form.missionsAlignment),
        muslimOutreach: Number(form.muslimOutreach),
        crossCultural: existing?.scores.crossCultural ?? 50,
        partnershipPotential: Number(form.partnershipPotential),
      },
      alignment: Math.round((Number(form.missionsAlignment) + Number(form.partnershipPotential)) / 2),
    };

    if (existing) {
      updateCreator(existing.id, data);
      toast.success(`Updated ${form.name}`);
      onSaved?.(existing.id);
    } else {
      const c = addCreator(data);
      toast.success(`Added ${c.name}`);
      onSaved?.(c.id);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{existing ? "Edit Creator" : "Add Creator"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-6">
          <section className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-surface-400">Basic Info</h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Name *"><input className={inputCls} value={form.name} onChange={(e) => set("name", e.target.value)} required /></Field>
              <Field label="Role / Title"><input className={inputCls} value={form.title} onChange={(e) => set("title", e.target.value)} /></Field>
              <Field label="Organization"><input className={inputCls} value={form.organization} onChange={(e) => set("organization", e.target.value)} /></Field>
              <Field label="Country / Region"><input className={inputCls} value={form.country} onChange={(e) => set("country", e.target.value)} /></Field>
              <Field label="Theological Lane"><input className={inputCls} value={form.denomination} onChange={(e) => set("denomination", e.target.value)} /></Field>
              <Field label="Ministry Focus"><input className={inputCls} value={form.ministryFocus} onChange={(e) => set("ministryFocus", e.target.value)} /></Field>
              <Field label="Audience Type"><input className={inputCls} value={form.audienceType} onChange={(e) => set("audienceType", e.target.value)} /></Field>
              <Field label="Audience Size"><input type="number" className={inputCls} value={form.audienceSize} onChange={(e) => set("audienceSize", Number(e.target.value))} /></Field>
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-surface-400">Platforms</h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Handle"><input className={inputCls} value={form.handle} onChange={(e) => set("handle", e.target.value)} /></Field>
              <Field label="Website"><input className={inputCls} value={form.website} onChange={(e) => set("website", e.target.value)} /></Field>
              <Field label="YouTube"><input className={inputCls} value={form.youtube} onChange={(e) => set("youtube", e.target.value)} /></Field>
              <Field label="Instagram"><input className={inputCls} value={form.instagram} onChange={(e) => set("instagram", e.target.value)} /></Field>
              <Field label="TikTok"><input className={inputCls} value={form.tiktok} onChange={(e) => set("tiktok", e.target.value)} /></Field>
              <Field label="X / Twitter"><input className={inputCls} value={form.x} onChange={(e) => set("x", e.target.value)} /></Field>
              <Field label="Podcast"><input className={inputCls} value={form.podcast} onChange={(e) => set("podcast", e.target.value)} /></Field>
              <Field label="Newsletter"><input className={inputCls} value={form.newsletter} onChange={(e) => set("newsletter", e.target.value)} /></Field>
              <Field label="Contact Email"><input type="email" className={inputCls} value={form.email} onChange={(e) => set("email", e.target.value)} /></Field>
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-surface-400">Strategy</h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Field label="Pipeline Stage">
                <select className={inputCls} value={form.stage} onChange={(e) => set("stage", e.target.value as PipelineStage)}>
                  {PIPELINE_STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </Field>
              <Field label="Priority">
                <select className={inputCls} value={form.priority} onChange={(e) => set("priority", e.target.value as "High" | "Medium" | "Low")}>
                  <option>High</option><option>Medium</option><option>Low</option>
                </select>
              </Field>
            </div>
            <Field label="Tags">
              <div className="flex flex-wrap gap-1.5">
                {ALL_TAGS.map((t) => {
                  const on = form.tags.has(t);
                  return (
                    <button key={t} type="button" onClick={() => toggleTag(t)}
                      className={`rounded-full border px-3 py-1 text-[11px] font-medium ${on ? "border-brand bg-brand text-white" : "border-border bg-white text-surface-600"}`}>
                      {t}
                    </button>
                  );
                })}
              </div>
            </Field>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {([
                ["Missions Alignment", "missionsAlignment"],
                ["Apologetics Depth", "apologeticsDepth"],
                ["AI Openness", "aiOpenness"],
                ["Gen Z Relevance", "genZRelevance"],
                ["Muslim Outreach", "muslimOutreach"],
                ["Partnership Potential", "partnershipPotential"],
              ] as const).map(([label, key]) => (
                <Field key={key} label={`${label} (${form[key]})`}>
                  <input type="range" min={0} max={100} value={form[key]} onChange={(e) => set(key, Number(e.target.value))} className="w-full" />
                </Field>
              ))}
            </div>

            <Field label="Suggested Outreach Angle">
              <textarea rows={2} className={inputCls} value={form.outreachAngle} onChange={(e) => set("outreachAngle", e.target.value)} />
            </Field>
            <Field label="Internal Notes">
              <textarea rows={3} className={inputCls} value={form.internalNotes} onChange={(e) => set("internalNotes", e.target.value)} />
            </Field>
          </section>

          <div className="flex justify-end gap-2 border-t border-border pt-4">
            <button type="button" onClick={() => onOpenChange(false)} className="rounded-full border border-border bg-white px-4 py-2 text-sm font-medium">Cancel</button>
            <button type="submit" className="rounded-full bg-surface-950 px-5 py-2 text-sm font-medium text-white">
              {existing ? "Save changes" : "Add creator"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
