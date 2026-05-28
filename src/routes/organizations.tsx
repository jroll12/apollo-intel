import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { organizations } from "@/lib/mock-data";

export const Route = createFileRoute("/organizations")({
  head: () => ({
    meta: [
      { title: "Organizations — Signal" },
      { name: "description", content: "Ministry organizations, networks, and creator collectives connected to Signal." },
    ],
  }),
  component: OrgsPage,
});

const tone: Record<string, string> = {
  Active: "bg-success/10 text-success",
  Exploring: "bg-brand/10 text-brand",
  Aware: "bg-surface-100 text-surface-500",
};

function OrgsPage() {
  return (
    <div className="fade-in">
      <PageHeader title="Organization Directory" subtitle={`${organizations.length} ministry organizations tracked`} />

      <div className="overflow-hidden rounded-2xl border border-border bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-50 text-[10px] font-bold uppercase tracking-wider text-surface-500">
              <th className="px-5 py-3 text-left">Organization</th>
              <th className="px-5 py-3 text-left">Type</th>
              <th className="px-5 py-3 text-left">Region</th>
              <th className="px-5 py-3 text-left">Focus</th>
              <th className="px-5 py-3 text-right">Creators</th>
              <th className="px-5 py-3 text-right">Partnership</th>
            </tr>
          </thead>
          <tbody>
            {organizations.map((o) => (
              <tr key={o.id} className="border-b border-border last:border-0 hover:bg-surface-50/50">
                <td className="px-5 py-4 font-medium">{o.name}</td>
                <td className="px-5 py-4 text-surface-600">{o.type}</td>
                <td className="px-5 py-4 text-surface-600">{o.region}</td>
                <td className="px-5 py-4 text-surface-600">{o.focus}</td>
                <td className="px-5 py-4 text-right tabular-nums">{o.creatorCount}</td>
                <td className="px-5 py-4 text-right">
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium ${tone[o.partnership]}`}>
                    {o.partnership}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
