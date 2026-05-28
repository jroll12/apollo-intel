import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, Users, KanbanSquare, Sparkles, Calendar,
  Activity, Brain, Rss, Building2, Settings as SettingsIcon,
} from "lucide-react";

type NavItem = {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
  hint?: string;
};

const primary: NavItem[] = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/creators", label: "Creator Database", icon: Users },
  { to: "/pipeline", label: "Outreach Pipeline", icon: KanbanSquare },
  { to: "/opportunities", label: "Opportunities", icon: Sparkles },
  { to: "/events", label: "Events & Conferences", icon: Calendar },
];

const intel: NavItem[] = [
  { to: "/timeline", label: "Relationship Timeline", icon: Activity, hint: "Recent activity in Dallas" },
  { to: "/insights", label: "AI Insights", icon: Brain, hint: "6 new recommendations" },
  { to: "/feed", label: "Notes & Activity", icon: Rss, hint: "Updated 10m ago" },
  { to: "/organizations", label: "Organizations", icon: Building2, hint: "8 tracked" },
];

export function AppSidebar() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const isActive = (to: string, exact?: boolean) =>
    exact ? path === to : path === to || path.startsWith(to + "/");

  return (
    <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-border bg-white px-4 py-6 lg:flex">
      <Link to="/" className="mb-10 flex items-center gap-2 px-2">
        <div className="flex size-8 items-center justify-center rounded-lg bg-brand">
          <div className="size-3 rounded-full bg-white" />
        </div>
        <span className="text-xl font-semibold tracking-tight">Signal</span>
      </Link>

      <nav className="space-y-1">
        {primary.map(({ to, label, icon: Icon, exact }) => {
          const active = isActive(to, exact);
          return (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? "bg-surface-100 text-surface-900"
                  : "text-surface-500 hover:bg-surface-100 hover:text-surface-900"
              }`}
            >
              <Icon className="size-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-10 px-2">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-surface-400">
          Intelligence
        </h3>
        <div className="mt-4 space-y-3">
          {intel.map(({ to, label, hint, icon: Icon }) => {
            const active = isActive(to);
            return (
              <Link key={to} to={to} className="group block">
                <p
                  className={`flex items-center gap-2 text-xs font-medium transition-colors ${
                    active ? "text-brand" : "text-surface-600 group-hover:text-brand"
                  }`}
                >
                  <Icon className="size-3.5" />
                  {label}
                </p>
                <p className="ml-5 text-[10px] text-surface-400">{hint}</p>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="mt-auto">
        <Link
          to="/settings"
          className="flex items-center gap-3 rounded-md px-3 py-2 text-xs font-medium text-surface-500 hover:bg-surface-100 hover:text-surface-900"
        >
          <SettingsIcon className="size-3.5" />
          Settings
        </Link>
        <div className="mt-3 flex items-center gap-3 rounded-lg border border-border bg-surface-50/50 px-3 py-2">
          <div
            className="size-7 rounded-full"
            style={{ background: "linear-gradient(135deg,#6366f1,#10b981)" }}
          />
          <div className="min-w-0">
            <p className="truncate text-xs font-medium">Strategy Unit</p>
            <p className="truncate text-[10px] text-surface-400">3 operators online</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
