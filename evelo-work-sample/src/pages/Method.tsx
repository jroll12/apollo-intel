import { ArrowDown, ArrowRight } from "lucide-react";
import { Section } from "@/components/shared";
import { assets, grid, validation, brand, S, podcast } from "@/data";

const STAGES = [
  { n: "0", name: "Ingest", detail: "5 independent pulls: team website and blog, 11 FRED market series, podcast archive, a sample listing, and the compliance rules." },
  { n: "1", name: "Strategy", detail: `5 content pillars and ${grid.slots.length} calendar slots, each assigned a channel, a pillar, a source and an angle.` },
  { n: "2", name: "Generate", detail: "5 specialist writers working in parallel: social, video, Google and email, blog, listing and podcast." },
  { n: "3", name: "Check", detail: "Scripts check format limits, brokerage disclosure, fair housing terms, duplicate hooks, and trace every number back to its source." },
  { n: "4", name: "Blind review", detail: "Separate compliance and editor reviewers see only the finished copy and the rules. They never see the prompts, sources or plan." },
  { n: "5", name: "Revise", detail: "Anything flagged is reworked with the reviewers' notes, then reviewed again by fresh, blind reviewers. Anything that still fails is dropped." },
];

export function Method() {
  const r = validation.rounds ?? [];
  return (
    <>
      <Section
        eyebrow="How it was built"
        title="AI-assisted, rule-checked, human-directed"
        intro="I designed this as a repeatable pipeline, not a one-off. The same steps could produce next month's plan in a day. Steps that don't depend on each other ran in parallel; the checks were kept blind to how the copy was made, so they can't grade their own homework."
      >
        <ol className="grid gap-2 md:grid-cols-6">
          {STAGES.map((s, i) => (
            <li key={s.n} className="relative rounded-xl border bg-card p-4">
              <div className="font-mono text-[11px] text-muted-foreground">Stage {s.n}</div>
              <div className="font-display text-lg font-semibold">{s.name}</div>
              <p className="mt-1 text-[13px] leading-snug text-muted-foreground">{s.detail}</p>
              {i < STAGES.length - 1 && (
                <>
                  <ArrowRight className="absolute top-1/2 -right-2.5 z-10 hidden size-4 -translate-y-1/2 rounded-full bg-background text-[var(--sand)] md:block" />
                  <ArrowDown className="mx-auto mt-2 size-4 text-[var(--sand)] md:hidden" />
                </>
              )}
            </li>
          ))}
        </ol>
      </Section>

      <Section eyebrow="Results" title="What the reviewers found, and what changed" intro="The first round was strict on purpose: an asset passes the editor only if it scores 4 or 5 on all five criteria.">
        <div className="overflow-x-auto rounded-xl border bg-card">
          <table className="w-full min-w-[560px] text-[14px]">
            <thead className="bg-muted text-left text-[13px]">
              <tr>
                <th className="px-4 py-2 font-medium">Round</th>
                <th className="px-4 py-2 font-medium">Assets reviewed</th>
                <th className="px-4 py-2 font-medium">Compliance pass</th>
                <th className="px-4 py-2 font-medium">Editor pass (all 4+)</th>
                <th className="px-4 py-2 font-medium">Avg editor score</th>
              </tr>
            </thead>
            <tbody>
              {r.map((x) => (
                <tr key={x.round} className="border-t">
                  <td className="px-4 py-2 font-medium">{x.round === 1 ? "First draft" : x.round === 2 ? "Revision 1 (all assets)" : x.round === 3 ? "Revision 2 (flagged only)" : "Final, as shown on this site"}</td>
                  <td className="px-4 py-2">{x.reviewed}</td>
                  <td className="px-4 py-2">{x.compliancePass}/{x.reviewed}</td>
                  <td className="px-4 py-2">{x.editorPass}/{x.reviewed}</td>
                  <td className="px-4 py-2">{x.avgScore.toFixed(2)} / 5</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {r[0] && (
          <div className="mt-4 rounded-xl border bg-card p-4 text-[14px]">
            <div className="font-semibold">Most useful catches in round one</div>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
              {r[0].topIssues.map((t) => <li key={t}>{t}</li>)}
            </ul>
          </div>
        )}
        {validation.dropped.length > 0 && (
          <p className="mt-3 text-[13px] text-muted-foreground">Dropped after failing twice: {validation.dropped.join(", ")}.</p>
        )}
      </Section>

      <Section eyebrow="Honesty notes" title="What this is and isn't">
        <ul className="list-disc space-y-1.5 pl-5 text-[14px]">
          <li>All {assets.length} assets are drafts. Nothing was posted, emailed or published anywhere.</li>
          <li>The listing is fictional ("1234 Sample Lane"). Spec work should never market a real seller's home.</li>
          <li>Market numbers are Realtor.com listing data and Freddie Mac rates via FRED, latest month October 2026. They are asking prices, not sold prices.</li>
          <li>Team facts (reviews, giving plan, history) come from eveloteam.com as of November 2026. Giving amounts are left out of the copy on purpose until the team confirms how they are calculated.</li>
          <li>Compliance rules marked "verify" should be confirmed with the managing broker. This is a first line of defense, not legal review.</li>
        </ul>
      </Section>

      <Section eyebrow="Sources" title="Everything this was built from">
        <ul className="grid gap-x-6 gap-y-1 text-[13px] break-all text-muted-foreground sm:grid-cols-2">
          {brand.facts.map((f) => (
            <li key={f.claim}>{f.claim.split(".")[0]}: <span className="text-foreground/70">{f.source}</span></li>
          ))}
          <li>Podcast archive: <a className="underline" href={podcast.source} target="_blank" rel="noreferrer">Apple Podcasts</a></li>
          {Object.values(S).map((s) => (
            <li key={s.id}>{s.label}, {s.geoName}: <a className="underline" href={s.url} target="_blank" rel="noreferrer">{s.id}</a></li>
          ))}
        </ul>
      </Section>
    </>
  );
}
