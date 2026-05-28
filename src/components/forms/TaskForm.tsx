import { useState, type FormEvent } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useStore, type TaskPriority, type TaskType } from "@/lib/store";
import { toast } from "sonner";

const TYPES: TaskType[] = [
  "Follow up", "Research", "Prepare message", "Ask for warm intro",
  "Invite to podcast", "Propose collaboration", "Conference follow-up", "Other",
];

const inputCls = "w-full rounded-md border border-border bg-white px-3 py-2 text-sm outline-none ring-brand/20 focus:ring-2";

export function TaskForm({ open, onOpenChange, creatorId }: { open: boolean; onOpenChange: (v: boolean) => void; creatorId?: string }) {
  const addTask = useStore((s) => s.addTask);
  const user = useStore((s) => s.currentUser);
  const creators = useStore((s) => s.creators);
  const [form, setForm] = useState({
    creatorId: creatorId ?? "",
    title: "", description: "", assignee: user,
    dueDate: "", priority: "medium" as TaskPriority,
    taskType: "Follow up" as TaskType,
  });
  const set = <K extends keyof typeof form>(k: K, v: typeof form[K]) => setForm((f) => ({ ...f, [k]: v }));

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error("Title required"); return; }
    addTask({
      creatorId: form.creatorId || undefined,
      title: form.title, description: form.description,
      assignee: form.assignee, dueDate: form.dueDate || undefined,
      priority: form.priority, status: "open", taskType: form.taskType,
    });
    toast.success("Task created");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Add Task</DialogTitle></DialogHeader>
        <form onSubmit={onSubmit} className="space-y-3">
          <label className="block text-xs"><span className="mb-1 block font-medium text-surface-500">Title *</span>
            <input className={inputCls} value={form.title} onChange={(e) => set("title", e.target.value)} required /></label>
          <label className="block text-xs"><span className="mb-1 block font-medium text-surface-500">Description</span>
            <textarea rows={2} className={inputCls} value={form.description} onChange={(e) => set("description", e.target.value)} /></label>
          <div className="grid grid-cols-2 gap-3">
            {!creatorId && (
              <label className="text-xs col-span-2"><span className="mb-1 block font-medium text-surface-500">Related creator</span>
                <select className={inputCls} value={form.creatorId} onChange={(e) => set("creatorId", e.target.value)}>
                  <option value="">— None —</option>
                  {creators.filter((c) => !c.archived).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select></label>
            )}
            <label className="text-xs"><span className="mb-1 block font-medium text-surface-500">Type</span>
              <select className={inputCls} value={form.taskType} onChange={(e) => set("taskType", e.target.value as TaskType)}>
                {TYPES.map((t) => <option key={t}>{t}</option>)}
              </select></label>
            <label className="text-xs"><span className="mb-1 block font-medium text-surface-500">Priority</span>
              <select className={inputCls} value={form.priority} onChange={(e) => set("priority", e.target.value as TaskPriority)}>
                <option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option>
              </select></label>
            <label className="text-xs"><span className="mb-1 block font-medium text-surface-500">Assignee</span>
              <input className={inputCls} value={form.assignee} onChange={(e) => set("assignee", e.target.value)} /></label>
            <label className="text-xs"><span className="mb-1 block font-medium text-surface-500">Due date</span>
              <input type="date" className={inputCls} value={form.dueDate} onChange={(e) => set("dueDate", e.target.value)} /></label>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => onOpenChange(false)} className="rounded-full border border-border bg-white px-4 py-2 text-sm font-medium">Cancel</button>
            <button type="submit" className="rounded-full bg-surface-950 px-5 py-2 text-sm font-medium text-white">Create</button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
