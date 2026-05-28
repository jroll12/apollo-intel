import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Signal" },
      { name: "description", content: "Workspace settings for Signal." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <div className="fade-in">
      <PageHeader title="Settings" subtitle="Workspace configuration" />
      <div className="rounded-2xl border border-dashed border-border bg-white p-12 text-center">
        <p className="text-sm text-surface-500">Settings panel coming soon.</p>
        <p className="mt-1 text-xs text-surface-400">Workspace, integrations, AI preferences, team roles.</p>
      </div>
    </div>
  );
}
