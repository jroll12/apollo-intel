import { useEffect, useState } from "react";
import { Overview } from "@/pages/Overview";
import { CalendarPage } from "@/pages/Calendar";
import { ListingKit } from "@/pages/ListingKit";
import { MarketPulse } from "@/pages/MarketPulse";
import { PodcastPage } from "@/pages/Podcast";
import { OpsPlaybook } from "@/pages/Ops";
import { Designs } from "@/pages/Designs";
import { Method } from "@/pages/Method";
import { About } from "@/pages/About";
import { cn } from "@/lib/utils";

export const ROUTES = [
  { id: "overview", label: "Overview", el: Overview },
  { id: "calendar", label: "30-Day Calendar", el: CalendarPage },
  { id: "listing", label: "Listing Launch Kit", el: ListingKit },
  { id: "market", label: "Market Pulse", el: MarketPulse },
  { id: "podcast", label: "Podcast Reboot", el: PodcastPage },
  { id: "ops", label: "Ops Playbook", el: OpsPlaybook },
  { id: "designs", label: "Designs", el: Designs },
  { id: "method", label: "How It Was Built", el: Method },
  { id: "about", label: "About Jarret", el: About },
] as const;

const current = () => {
  const h = window.location.hash.replace(/^#\/?/, "");
  return ROUTES.some((r) => r.id === h) ? h : "overview";
};

export function go(id: string) {
  window.location.hash = `/${id}`;
}

export default function App() {
  const [route, setRoute] = useState(current);
  useEffect(() => {
    const on = () => {
      setRoute(current());
      window.scrollTo({ top: 0 });
    };
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);
  const Page = ROUTES.find((r) => r.id === route)!.el;

  return (
    <div className="min-h-screen">
      <div className="bg-[var(--sand-soft)] px-4 py-2 text-center text-[12px] leading-snug text-foreground/80">
        Spec work sample by Jarret Roloff. Not affiliated with or published by Evelo Team or Keller Williams. All content is draft.
      </div>
      <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 pt-3">
          <a href="#/overview" className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-lg bg-[#0b1f3a] text-[13px] font-bold text-[#d4b483]">EC</span>
            <span className="leading-tight">
              <span className="font-display block text-[15px] font-semibold">Evelo Content Engine</span>
              <span className="block text-[11px] text-muted-foreground">December 2026 plan, prepared for Hannah Perkey</span>
            </span>
          </a>
        </div>
        <nav className="mx-auto max-w-6xl overflow-x-auto px-2 [scrollbar-width:none]">
          <ul className="flex min-w-max gap-1 py-2">
            {ROUTES.map((r) => (
              <li key={r.id}>
                <a
                  href={`#/${r.id}`}
                  className={cn(
                    "block rounded-full px-3 py-1.5 text-[13px] whitespace-nowrap transition-colors",
                    route === r.id ? "bg-primary font-medium text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  {r.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-4 pb-16">
        <Page />
      </main>
      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-6 text-[12px] text-muted-foreground sm:flex-row sm:justify-between">
          <span>Jarret Roloff · 630-669-8697 · jroloff1@gmail.com</span>
          <span>Market data: Realtor.com and Freddie Mac via FRED. Brand facts: eveloteam.com (Nov 2026).</span>
        </div>
      </footer>
    </div>
  );
}
