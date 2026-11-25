import { useState } from "react";
import { Section } from "@/components/shared";
import { Markdown } from "@/components/Markdown";
import { Preview } from "@/components/Preview";
import { AssetDrawer } from "@/components/AssetDrawer";
import { assets, podcast, type Asset } from "@/data";
import { cn } from "@/lib/utils";

export function PodcastPage() {
  const get = (id: string) => assets.find((a) => a.id === id);
  const script = get("S33-script");
  const notes = get("S33-notes");
  const season = get("S33-season");
  const clips = assets.filter((a) => a.channel === "podcast-clip");
  const [tab, setTab] = useState<"script" | "notes" | "season">("script");
  const [open, setOpen] = useState<Asset | null>(null);
  const doc = tab === "script" ? script : tab === "notes" ? notes : season;
  return (
    <>
      <Section
        eyebrow="Podcast Reboot"
        title="Indianapolis Real Estate Podcast, season two"
        intro={
          <>
            The team's podcast published regularly in 2015 and 2016, then went quiet. The archive is still live on Apple Podcasts. Here is everything needed to restart it with one
            afternoon of recording: a pilot script, show notes, 4 vertical clips and a 6-episode season.
          </>
        }
      >
        <div className="grid gap-4 md:grid-cols-[1fr_2fr]">
          <div className="rounded-xl border bg-card p-5">
            <div className="text-[12px] font-semibold tracking-wider text-muted-foreground uppercase">Then</div>
            <div className="font-display mt-1 text-2xl font-semibold">Last episode: Sep 2016</div>
            <ul className="mt-3 space-y-1.5 text-[13px] text-muted-foreground">
              {podcast.episodes.slice(0, 5).map((e) => (
                <li key={e.title}>
                  <span className="font-mono text-[11px]">{e.date}</span> · {e.title}
                </li>
              ))}
            </ul>
            <a className="mt-3 inline-block text-[12px] underline" href={podcast.source} target="_blank" rel="noreferrer">Archive on Apple Podcasts</a>
            <div className="mt-5 text-[12px] font-semibold tracking-wider text-muted-foreground uppercase">Now</div>
            <div className="font-display mt-1 text-2xl font-semibold">Pilot launches Jan 6, 2027</div>
            <p className="mt-2 text-[13px] text-muted-foreground">Record Dec 9. Edit, clip and publish in 3 weeks. Every episode is repurposed into a blog post and 4 clips.</p>
          </div>
          <div className="rounded-xl border bg-card">
            <div className="flex gap-1 border-b p-2">
              {(["script", "notes", "season"] as const).map((t) => (
                <button key={t} onClick={() => setTab(t)} className={cn("rounded-full px-3 py-1 text-[13px]", tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted")}>
                  {t === "script" ? "Pilot script" : t === "notes" ? "Show notes" : "Season plan"}
                </button>
              ))}
            </div>
            <div className="max-h-[560px] overflow-y-auto p-5">{doc && <Markdown source={doc.body} />}</div>
          </div>
        </div>
      </Section>
      <Section eyebrow="Clips" title="4 vertical clips cut from the pilot">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {clips.map((c) => (
            <button key={c.id} onClick={() => setOpen(c)} className="text-left">
              <Preview a={c} />
              <div className="mt-2 text-[13px] font-medium">{c.title}</div>
            </button>
          ))}
        </div>
      </Section>
      <AssetDrawer asset={open} onClose={() => setOpen(null)} />
    </>
  );
}
