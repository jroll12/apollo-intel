import { useState, type FormEvent } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useStore, type OpportunityType, type OpportunityStatus } from "@/lib/store";
import { toast } from "sonner";

const TYPES: OpportunityType[] = [
  "Podcast", "Livestream", "Shorts", "Conference", "Education",
  "Translation", "AI Demo", "Debate", "Campaign", "Missions",
];
const STATUSES: OpportunityStatus[] = [
  "Idea", "Proposed", "Confirmed", "In Production", "Live", "Completed", "Paused", "Rejected",
];

const inputCls = "w-full rounded-md border border-border bg-white px-3 py-2 text-sm outline-none ring-brand/20 focus:ring-2";

export function OpportunityForm({ open, onOpenChange, creatorId }: { open: boolean; onOpenChange: (v: boolean) => void; creatorId?: string }) {
  const addOpportunity = useStore((s) => s.addOpportunity);
  const creators = useStore((s) => s.creators);
  const [form, setForm] = useState({
    title: "", type: "Podcast" as OpportunityType,
    creatorIds: creatorId ? [creatorId] : [] as string[],
    status: "Idea" as OpportunityStatus,
    strategicValue: 70,
    estimatedImpact: "",
    nextAction: "",
    platform: "",
    notes: "",
  });
  const set = <K extends keyof typeof form>(k: K, v: typeof form[K]) => setForm((f) => ({ ...f, [k]: v }));

  const toggleCreator = (id: string) => setForm((f) => ({
    ...f,
    creatorIds: f.creatorIds.includes(id) ? f.creatorIds.filter((x) => x !== id) : [...f.creatorIds, id],
  }));

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error("Title required"); return; }
    addOpportunity({ ...form });
    toast.success("Opportunity created");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto">
        <DialogHeader><DialogTitle>Add Opportunity</DialogTitle></DialogHeader>
        <form onSubmit={onSubmit} className="space-y-3">
          <label className="block text-xs"><span className="mb-1 block font-medium text-surface-500">Title *</span>
            <input className={inputCls} value={form.title} onChange={(e) => set("title", e.target.value)} required /></label>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-xs"><span className="mb-1 block font-medium text-surface-500">Type</span>
              <select className={inputCls} value={form.type} onChange={(e) => set("type", e.target.value as OpportunityType)}>
                {TYPES.map((t) => <option key={t}>{t}</option>)}
              </select></label>
            <label className="text-xs"><span className="mb-1 block font-medium text-surface-500">Status</span>
              <select className={inputCls} value={form.status} onChange={(e) => set("status", e.target.value as OpportunityStatus)}>
                {STATUSES.map((s) => <option key={s}>{s}</option>)}
              </select></label>
            <label className="text-xs"><span className="mb-1 block font-medium text-surface-500">Platform Focus</span>
              <input className={inputCls} value={form.platform} onChange={(e) => set("platform", e.target.value)} /></label>
            <label className="text-xs"><span className="mb-1 block font-medium text-surface-500">Strategic Value ({form.strategicValue})</span>
              <input type="range" min={0} max={100} value={form.strategicValue} onChange={(e) => set("strategicValue", Number(e.target.value))} className="w-full" /></label>
          </div>
          <label className="block text-xs"><span className="mb-1 block font-medium text-surface-500">Creators involved</span>
            <div className="max-h-32 overflow-y-auto rounded-md border border-border p-2">
              {creators.filter((c) => !c.archived).map((c) => (
                <label key={c.id} className="flex items-center gap-2 py-1">
                  <input type="checkbox" checked={form.creatorIds.includes(c.id)} onChange={() => toggleCreator(c.id)} />
                  <span className="text-xs">{c.name}</span>
                </label>
              ))}
            </div></label>
          <label className="block text-xs"><span className="mb-1 block font-medium text-surface-500">Estimated Impact</span>
            <input className={inputCls} value={form.estimatedImpact} onChange={(e) => set("estimatedImpact", e.target.value)} placeholder="e.g. 1M impressions" /></label>
          <label className="block text-xs"><span className="mb-1 block font-medium text-surface-500">Recommended next action</span>
            <input className={inputCls} value={form.nextAction} onChange={(e) => set("nextAction", e.target.value)} /></label>
          <label className="block text-xs"><span className="mb-1 block font-medium text-surface-500">Notes</span>
            <textarea rows={2} className={inputCls} value={form.notes} onChange={(e) => set("notes", e.target.value)} /></label>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => onOpenChange(false)} className="rounded-full border border-border bg-white px-4 py-2 text-sm font-medium">Cancel</button>
            <button type="submit" className="rounded-full bg-surface-950 px-5 py-2 text-sm font-medium text-white">Create</button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
