import { useState, type FormEvent } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useStore, type NoteCategory } from "@/lib/store";
import { toast } from "sonner";

const CATEGORIES: NoteCategory[] = [
  "General", "Outreach", "Theology", "Relationship", "Risk", "Opportunity", "Research", "Conference",
];

const inputCls = "w-full rounded-md border border-border bg-white px-3 py-2 text-sm outline-none ring-brand/20 focus:ring-2";

export function NoteForm({ open, onOpenChange, creatorId }: { open: boolean; onOpenChange: (v: boolean) => void; creatorId: string }) {
  const addNote = useStore((s) => s.addNote);
  const user = useStore((s) => s.currentUser);
  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({ author: user, date: today, category: "General" as NoteCategory, text: "", pinned: false });
  const set = <K extends keyof typeof form>(k: K, v: typeof form[K]) => setForm((f) => ({ ...f, [k]: v }));

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.text.trim()) { toast.error("Note can't be empty"); return; }
    addNote({ creatorId, ...form });
    toast.success("Note added");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Add Note</DialogTitle></DialogHeader>
        <form onSubmit={onSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <label className="text-xs"><span className="mb-1 block font-medium text-surface-500">Author</span>
              <input className={inputCls} value={form.author} onChange={(e) => set("author", e.target.value)} /></label>
            <label className="text-xs"><span className="mb-1 block font-medium text-surface-500">Category</span>
              <select className={inputCls} value={form.category} onChange={(e) => set("category", e.target.value as NoteCategory)}>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select></label>
          </div>
          <label className="block text-xs"><span className="mb-1 block font-medium text-surface-500">Note *</span>
            <textarea rows={4} className={inputCls} value={form.text} onChange={(e) => set("text", e.target.value)} required /></label>
          <div className="flex items-center gap-2">
            <input id="pin" type="checkbox" checked={form.pinned} onChange={(e) => set("pinned", e.target.checked)} />
            <label htmlFor="pin" className="text-xs font-medium">Pin this note</label>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => onOpenChange(false)} className="rounded-full border border-border bg-white px-4 py-2 text-sm font-medium">Cancel</button>
            <button type="submit" className="rounded-full bg-surface-950 px-5 py-2 text-sm font-medium text-white">Save</button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
