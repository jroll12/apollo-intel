import { useState, type FormEvent } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useStore, type CommunicationType, type ResponseStatus } from "@/lib/store";
import { toast } from "sonner";

const TYPES: CommunicationType[] = [
  "Email", "Instagram DM", "TikTok Comment", "YouTube Comment", "X DM",
  "Phone Call", "Zoom Call", "In-Person Meeting", "Conference Interaction",
  "Podcast Inquiry", "Other",
];

const STATUSES: ResponseStatus[] = [
  "No response", "Responded", "Positive", "Neutral", "Declined", "Follow-up needed",
];

const inputCls = "w-full rounded-md border border-border bg-white px-3 py-2 text-sm outline-none ring-brand/20 focus:ring-2";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  creatorId: string;
}

export function CommunicationForm({ open, onOpenChange, creatorId }: Props) {
  const addCommunication = useStore((s) => s.addCommunication);
  const user = useStore((s) => s.currentUser);

  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({
    date: today,
    type: "Email" as CommunicationType,
    direction: "outbound" as "outbound" | "inbound",
    contactedBy: user,
    summary: "",
    responseStatus: "No response" as ResponseStatus,
    followUpNeeded: false,
    followUpDate: "",
    linkOrAttachment: "",
    internalNotes: "",
  });
  const set = <K extends keyof typeof form>(k: K, v: typeof form[K]) => setForm((f) => ({ ...f, [k]: v }));

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.summary.trim()) { toast.error("Summary required"); return; }
    addCommunication({
      creatorId,
      date: form.date,
      type: form.type,
      direction: form.direction,
      contactedBy: form.contactedBy,
      summary: form.summary,
      responseStatus: form.responseStatus,
      followUpNeeded: form.followUpNeeded,
      followUpDate: form.followUpDate || undefined,
      linkOrAttachment: form.linkOrAttachment || undefined,
      internalNotes: form.internalNotes || undefined,
    });
    toast.success("Communication logged");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader><DialogTitle>Log Communication</DialogTitle></DialogHeader>
        <form onSubmit={onSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <label className="text-xs"><span className="mb-1 block font-medium text-surface-500">Date</span>
              <input type="date" className={inputCls} value={form.date} onChange={(e) => set("date", e.target.value)} /></label>
            <label className="text-xs"><span className="mb-1 block font-medium text-surface-500">Type</span>
              <select className={inputCls} value={form.type} onChange={(e) => set("type", e.target.value as CommunicationType)}>
                {TYPES.map((t) => <option key={t}>{t}</option>)}
              </select></label>
            <label className="text-xs"><span className="mb-1 block font-medium text-surface-500">Direction</span>
              <select className={inputCls} value={form.direction} onChange={(e) => set("direction", e.target.value as "outbound" | "inbound")}>
                <option value="outbound">Outbound</option>
                <option value="inbound">Inbound</option>
              </select></label>
            <label className="text-xs"><span className="mb-1 block font-medium text-surface-500">Contacted by</span>
              <input className={inputCls} value={form.contactedBy} onChange={(e) => set("contactedBy", e.target.value)} /></label>
          </div>
          <label className="block text-xs"><span className="mb-1 block font-medium text-surface-500">Summary *</span>
            <textarea rows={3} className={inputCls} value={form.summary} onChange={(e) => set("summary", e.target.value)} required /></label>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-xs"><span className="mb-1 block font-medium text-surface-500">Response status</span>
              <select className={inputCls} value={form.responseStatus} onChange={(e) => set("responseStatus", e.target.value as ResponseStatus)}>
                {STATUSES.map((s) => <option key={s}>{s}</option>)}
              </select></label>
            <label className="text-xs"><span className="mb-1 block font-medium text-surface-500">Link / Attachment</span>
              <input className={inputCls} value={form.linkOrAttachment} onChange={(e) => set("linkOrAttachment", e.target.value)} placeholder="https://…" /></label>
          </div>
          <div className="flex items-center gap-2">
            <input id="fu" type="checkbox" checked={form.followUpNeeded} onChange={(e) => set("followUpNeeded", e.target.checked)} />
            <label htmlFor="fu" className="text-xs font-medium">Follow-up needed</label>
            {form.followUpNeeded && (
              <input type="date" className={inputCls + " ml-2 max-w-[180px]"} value={form.followUpDate} onChange={(e) => set("followUpDate", e.target.value)} />
            )}
          </div>
          <label className="block text-xs"><span className="mb-1 block font-medium text-surface-500">Internal notes</span>
            <textarea rows={2} className={inputCls} value={form.internalNotes} onChange={(e) => set("internalNotes", e.target.value)} /></label>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => onOpenChange(false)} className="rounded-full border border-border bg-white px-4 py-2 text-sm font-medium">Cancel</button>
            <button type="submit" className="rounded-full bg-surface-950 px-5 py-2 text-sm font-medium text-white">Log</button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
