import { ArrowRight, CalendarDays, Home, LineChart, Mic, Workflow, Palette, Cpu } from "lucide-react";
import { Section, Stat } from "@/components/shared";
import { assets, grid, passStats, podcast, S, fmtUSD } from "@/data";

const LINKS = [
  { id: "calendar", icon: CalendarDays, title: "30-Day Calendar", text: "Every post, video, email and blog for December, click any day to read the draft." },
  { id: "listing", icon: Home, title: "Listing Launch Kit", text: "MLS remarks to follow-up texts for one listing, on a 12-day timeline." },
  { id: "market", icon: LineChart, title: "Market Pulse", text: "October data for the metro and Hamilton County, ready for content." },
  { id: "podcast", icon: Mic, title: "Podcast Reboot", text: "A pilot script and a 6-episode season to restart the 2016 show." },
  { id: "ops", icon: Workflow, title: "Ops Playbook", text: "Weekly rhythm, RACI, compliance checks, KPIs and a 30-60-90 plan." },
  { id: "designs", icon: Palette, title: "Designs", text: "Canva templates plus a mockup for every asset." },
  { id: "method", icon: Cpu, title: "How It Was Built", text: "The AI-assisted pipeline, its checks, and every source." },
];

export function Overview() {
  const p = passStats();
  const channels = new Set(assets.map((a) => a.channel)).size;
  const h = S.MEDLISPRI18057;
  const inv = S.ACTLISCOU26900;
  return (
    <>
      <section className="pt-10 pb-6 sm:pt-16">
        <div className="text-[12px] font-semibold tracking-[0.16em] text-[var(--sand)] uppercase">For Hannah Perkey · Evelo Team</div>
        <h1 className="font-display mt-2 max-w-4xl text-[2.1rem] leading-[1.1] font-semibold text-balance sm:text-5xl">
          A December marketing plan, and the weekly system to run it.
        </h1>
        <p className="mt-4 max-w-2xl text-[16px] leading-relaxed text-muted-foreground">
          Instead of telling you I can do marketing and operations, I did a month of it. Using only public data and the team's own blog, I planned 30 days across
          7 channels, wrote every piece, checked it for fair housing and brokerage rules, and built the playbook a coordinator would use to run it every week.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          <a href="#calendar" className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-[14px] font-medium text-primary-foreground">
            Open the calendar <ArrowRight className="size-4" />
          </a>
          <a href="#ops" className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[14px] font-medium">
            See the ops playbook
          </a>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat value={assets.length} label="Draft assets" sub={`${grid.slots.length} calendar slots, ${channels} formats`} />
        <Stat value={`${p.compliancePass}/${p.total}`} label="Passed blind compliance review" sub="Fair housing, licensing, NAR Art. 12" />
        <Stat value="0" label="Untraceable numbers" sub="Every stat checked against public data" />
        <Stat value="15 min" label="CEO time per week" sub="One approval queue, Wednesdays" />
      </div>

      <Section eyebrow="What I noticed" title="Three opportunities, all built from what the team already has">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-xl border bg-card p-5">
            <div className="font-display text-lg font-semibold">The blog already works. Let it travel.</div>
            <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">
              A weekly question post plus a monthly market update is a great habit. Right now each post lives in one place. This plan turns every post into 4 to 6
              assets across social, video, Google and email.
            </p>
          </div>
          <div className="rounded-xl border bg-card p-5">
            <div className="font-display text-lg font-semibold">The proof is already earned. Show it weekly.</div>
            <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">
              419 Google reviews at 5.0, and a giving plan that funds clean water through Filter of Hope from every closing, are rare. Both get a recurring slot
              instead of an occasional mention.
            </p>
          </div>
          <div className="rounded-xl border bg-card p-5">
            <div className="font-display text-lg font-semibold">The podcast has a head start. Restart it.</div>
            <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">
              The archive is still live on Apple Podcasts, last published {new Date(podcast.lastEpisode + "T12:00:00Z").toLocaleDateString("en-US", { month: "long", year: "numeric" })}. A pilot
              script, clips and a season plan are ready to record in one afternoon.
            </p>
          </div>
        </div>
      </Section>

      <Section eyebrow="The month in one glance" title="December 2026 story: more choices, steadier prices">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border bg-card p-5">
            <div className="text-[13px] text-muted-foreground">Hamilton County median list price, October</div>
            <div className="font-display mt-1 text-3xl font-semibold">{fmtUSD(h.latest.value)}</div>
            <div className="mt-1 text-[13px]">{h.yoyPct}% vs a year ago · Realtor.com via FRED</div>
          </div>
          <div className="rounded-xl border bg-card p-5">
            <div className="text-[13px] text-muted-foreground">Indy metro active listings, October</div>
            <div className="font-display mt-1 text-3xl font-semibold">{inv.latest.value.toLocaleString()}</div>
            <div className="mt-1 text-[13px]">+{inv.yoyPct}% vs a year ago · Realtor.com via FRED</div>
          </div>
        </div>
      </Section>

      <Section eyebrow="Inside" title="Where to look">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {LINKS.map((l) => (
            <a key={l.id} href={`#${l.id}`} className="group rounded-xl border bg-card p-5 transition-colors hover:border-[var(--sand)]">
              <l.icon className="size-5 text-[var(--sand)]" />
              <div className="mt-3 flex items-center gap-1 font-semibold">
                {l.title} <ArrowRight className="size-4 opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
              <p className="mt-1 text-[14px] text-muted-foreground">{l.text}</p>
            </a>
          ))}
        </div>
      </Section>
    </>
  );
}
