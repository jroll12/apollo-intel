import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { Avatar } from "@/components/Avatar";
import { events, creators } from "@/lib/mock-data";
import { MapPin, Users } from "lucide-react";

export const Route = createFileRoute("/events")({
  head: () => ({
    meta: [
      { title: "Events & Conferences — Signal" },
      { name: "description", content: "Conferences, creator meetups, and ministry gatherings for partnership opportunities." },
    ],
  }),
  component: EventsPage,
});

function EventsPage() {
  const sorted = [...events].sort((a, b) => a.date.localeCompare(b.date));
  return (
    <div className="fade-in">
      <PageHeader title="Events & Conferences" subtitle={`${events.length} upcoming gatherings`} />

      <div className="space-y-4">
        {sorted.map((e) => {
          const d = new Date(e.date);
          const targets = e.targetCreatorIds.map((id) => creators.find((c) => c.id === id)).filter(Boolean);
          const attending = e.attendeeIds.map((id) => creators.find((c) => c.id === id)).filter(Boolean);
          return (
            <div key={e.id} className="flex flex-col gap-5 rounded-2xl border border-border bg-white p-6 sm:flex-row">
              <div className="flex w-20 shrink-0 flex-col items-center justify-center rounded-2xl bg-surface-100 p-3">
                <span className="text-[10px] font-bold uppercase text-surface-500">
                  {d.toLocaleString("en", { month: "short" })}
                </span>
                <span className="text-3xl font-semibold tabular-nums">{d.getDate()}</span>
                <span className="text-[10px] text-surface-400">{d.getFullYear()}</span>
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-semibold">{e.name}</h3>
                  <span className="rounded-full bg-surface-100 px-2 py-0.5 text-[10px] font-medium text-surface-600">{e.type}</span>
                </div>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-surface-500">
                  <MapPin className="size-3" /> {e.location}
                </p>
                <p className="mt-3 text-xs text-surface-700">{e.notes}</p>

                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <p className="mb-2 flex items-center gap-1 text-[10px] font-bold uppercase text-surface-400">
                      <Users className="size-3" /> Target creators
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {targets.map((c) => c && (
                        <Link key={c.id} to="/creators/$id" params={{ id: c.id }} className="flex items-center gap-1.5 rounded-full border border-border bg-surface-50 px-2 py-0.5 text-[11px] hover:border-brand">
                          <Avatar name={c.name} hue={c.avatarHue} size={16} />
                          {c.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="mb-2 text-[10px] font-bold uppercase text-surface-400">Confirmed attendees</p>
                    <div className="flex flex-wrap gap-2">
                      {attending.length === 0 && (
                        <span className="text-[11px] text-surface-400">No team attending</span>
                      )}
                      {attending.map((c) => c && (
                        <Link key={c.id} to="/creators/$id" params={{ id: c.id }} className="flex items-center gap-1.5 rounded-full bg-success/10 px-2 py-0.5 text-[11px] text-success">
                          <Avatar name={c.name} hue={c.avatarHue} size={16} />
                          {c.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
