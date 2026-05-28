import { Search } from "lucide-react";
import type { ReactNode } from "react";

interface Props {
  title: string;
  subtitle?: string;
  search?: { value: string; onChange: (v: string) => void; placeholder?: string };
  action?: ReactNode;
}

export function PageHeader({ title, subtitle, search, action }: Props) {
  return (
    <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-surface-500">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        {search && (
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-surface-400" />
            <input
              type="text"
              value={search.value}
              onChange={(e) => search.onChange(e.target.value)}
              placeholder={search.placeholder ?? "Search…"}
              className="h-9 w-72 rounded-full border border-border bg-white pl-9 pr-4 text-sm outline-none ring-brand/20 transition focus:ring-2"
            />
          </div>
        )}
        {action}
      </div>
    </header>
  );
}
