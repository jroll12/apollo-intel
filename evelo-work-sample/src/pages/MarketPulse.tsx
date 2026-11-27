import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Section, Stat } from "@/components/shared";
import { S, metrics, fmtUSD } from "@/data";

const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const label = (iso: string) => `${MON[Number(iso.slice(5, 7)) - 1]} '${iso.slice(2, 4)}`;

function merge(a: string, b?: string) {
  return S[a].last24.map((r, i) => ({ date: r.date, a: r.value, b: b ? S[b].last24[i]?.value : undefined }));
}

function ChartCard({
  title,
  sub,
  data,
  names,
  fmt,
}: {
  title: string;
  sub: string;
  data: { date: string; a: number; b?: number }[];
  names: [string, string?];
  fmt: (n: number) => string;
}) {
  const last = data.at(-1)!;
  return (
    <figure className="rounded-xl border bg-card p-4">
      <figcaption>
        <div className="font-semibold">{title}</div>
        <div className="text-[12px] text-muted-foreground">{sub}</div>
      </figcaption>
      <div className="mt-2 flex flex-wrap gap-3 text-[12px]">
        <span className="inline-flex items-center gap-1.5"><span className="h-0.5 w-4 rounded bg-[var(--p-mp)]" /> {names[0]}: <b>{fmt(last.a)}</b></span>
        {names[1] && last.b !== undefined && (
          <span className="inline-flex items-center gap-1.5"><span className="h-0.5 w-4 rounded bg-[var(--sand)]" /> {names[1]}: <b>{fmt(last.b)}</b></span>
        )}
      </div>
      <div className="mt-2 h-52">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid stroke="var(--border)" vertical={false} />
            <XAxis dataKey="date" tickFormatter={label} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} minTickGap={28} />
            <YAxis tickFormatter={fmt} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} width={58} domain={["auto", "auto"]} />
            <Tooltip
              labelFormatter={(l) => label(String(l))}
              formatter={(v: number, k: string) => [fmt(v), k === "a" ? names[0] : names[1]]}
              contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
            />
            <Line type="monotone" dataKey="a" stroke="var(--p-mp)" strokeWidth={2} dot={false} isAnimationActive={false} />
            {names[1] && <Line type="monotone" dataKey="b" stroke="var(--sand)" strokeWidth={2} dot={false} isAnimationActive={false} />}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </figure>
  );
}

const usdK = (n: number) => `$${Math.round(n / 1000)}K`;

export function MarketPulse() {
  const d = metrics.derived;
  return (
    <Section
      eyebrow="Market Pulse"
      title="The numbers behind every market post"
      intro={
        <>
          Pulled automatically from public Realtor.com and Freddie Mac series on FRED, so the monthly refresh takes minutes. These are <b>listing</b> figures (asking
          prices, inventory, days on market), not closed sales, so they complement the team's own MIBOR sold-data updates rather than compete with them. Latest month: October 2026.
        </>
      }
    >
      <div className="mb-6 grid items-center gap-6 rounded-xl border bg-card p-4 sm:p-6 md:grid-cols-[minmax(0,320px)_1fr]">
        <video
          className="mx-auto w-full max-w-[320px] rounded-xl bg-black"
          src="reel-s14-9x16.mp4"
          poster="reel-s14-poster.jpg"
          controls
          playsInline
          preload="metadata"
        />
        <div className="min-w-0">
          <div className="text-[12px] font-semibold tracking-[0.16em] text-[var(--sand)] uppercase">Calendar slot S14, produced</div>
          <h3 className="font-display mt-1 text-2xl leading-tight font-semibold">One market post, from data to Reel</h3>
          <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
            The Hamilton County pricing Reel from the December calendar, built from the numbers on this page: real county lines and highways, a price column, one dot per
            active listing, and an illustrated street for the comps. Script approved in blind compliance review, captions burned in for sound-off viewing, sources and
            brokerage line on screen.
          </p>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-[14px] text-muted-foreground">
            <li>9:16 for Reels and Shorts, 4:5 for the feed, and a short cut for Stories</li>
            <li>Next month: refresh the data, record 40 seconds of voice, render. About an hour, start to finish.</li>
          </ul>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat value={fmtUSD(S.MEDLISPRI18057.latest.value)} label="Hamilton County median list price" sub={`${S.MEDLISPRI18057.yoyPct}% vs Oct 2025`} />
        <Stat value={S.ACTLISCOU26900.latest.value.toLocaleString()} label="Metro active listings" sub={`+${S.ACTLISCOU26900.yoyPct}% vs Oct 2025`} />
        <Stat value={S.MEDDAYONMAR26900.latest.value} label="Metro median days on market" sub={`${S.MEDDAYONMAR26900.yearAgo?.value} a year ago`} />
        <Stat value={`${S.MORTGAGE30US.latest.value}%`} label="30-year fixed rate" sub={`Week of Nov 19 · ${S.MORTGAGE30US.yearAgo?.value}% a year ago`} />
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <ChartCard title="Median list price" sub="Hamilton County vs Indianapolis metro, monthly" data={merge("MEDLISPRI18057", "MEDLISPRI26900")} names={["Hamilton County", "Indy metro"]} fmt={usdK} />
        <ChartCard title="Active listings, Indy metro" sub="More inventory means more choice for buyers" data={merge("ACTLISCOU26900")} names={["Active listings"]} fmt={(n) => n.toLocaleString()} />
        <ChartCard title="Median days on market" sub="Hamilton County vs Indianapolis metro" data={merge("MEDDAYONMAR18057", "MEDDAYONMAR26900")} names={["Hamilton County", "Indy metro"]} fmt={(n) => `${n}d`} />
        <ChartCard title="30-year fixed mortgage rate" sub="Freddie Mac weekly average, last 2 years" data={merge("MORTGAGE30US")} names={["30-yr fixed"]} fmt={(n) => `${n.toFixed(2)}%`} />
      </div>
      <div className="mt-4 rounded-xl border bg-card p-4 text-[14px] leading-relaxed">
        <div className="font-semibold">Talking points this data supports</div>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
          <li>Buyers have more to choose from: metro inventory is up {S.ACTLISCOU26900.yoyPct}% year over year, and Hamilton County is up {S.ACTLISCOU18057.yoyPct}%.</li>
          <li>Pricing right matters more: {S.PRIREDCOU26900.latest.value.toLocaleString()} metro listings had a price reduction in October ({d.priceReducedSharePct}% of active listings, down from {d.priceReducedSharePctYearAgo}% a year earlier).</li>
          <li>Hamilton County carries a premium: its median list price is {d.hamiltonPremiumPct}% above the metro, with {d.hamiltonShareOfMetroInventoryPct}% of metro inventory.</li>
          <li>Price per square foot still rose {S.MEDLISPRIPERSQUFEE26900.yoyPct}% even as the median list price dipped, a sign of a smaller-home mix rather than falling values.</li>
        </ul>
        <div className="mt-3 text-[12px] text-muted-foreground">
          Sources:{" "}
          {Object.values(S).map((s, i) => (
            <span key={s.id}>
              {i > 0 && " · "}
              <a className="underline" href={s.url} target="_blank" rel="noreferrer">{s.id}</a>
            </span>
          ))}
        </div>
      </div>
    </Section>
  );
}
