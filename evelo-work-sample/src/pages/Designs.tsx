import { useState } from "react";
import { Section } from "@/components/shared";
import { Preview } from "@/components/Preview";
import { AssetDrawer } from "@/components/AssetDrawer";
import { assets, CHANNEL_LABEL, type Asset } from "@/data";

const CANVA = [
  { src: "designs/hamilton-stat-card.png", title: "Hamilton County stat card", note: "Market Pulse template. Swap the 4 numbers monthly." },
  { src: "designs/metro-inventory-card.png", title: "Metro inventory card", note: "Single-stat template with a soft CTA." },
];

export function Designs() {
  const [open, setOpen] = useState<Asset | null>(null);
  const visual = assets.filter((a) => ["feed", "story", "reel", "gbp", "flyer"].includes(a.visual.kind));
  return (
    <>
      <Section
        eyebrow="Canva"
        title="Editable templates, built in Canva"
        intro="Real Canva designs that any agent can duplicate and update in minutes. Text-led on purpose: no logos, and no listing photos in spec work."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {CANVA.map((c) => (
            <figure key={c.src} className="rounded-xl border bg-card p-3">
              <img src={c.src} alt={c.title} loading="lazy" className="mx-auto w-full max-w-[360px] rounded-lg" />
              <figcaption className="mt-3 text-[14px]">
                <b>{c.title}</b>
                <div className="text-[13px] text-muted-foreground">{c.note}</div>
              </figcaption>
            </figure>
          ))}
        </div>
      </Section>
      <Section eyebrow="Mockups" title="Every visual asset, previewed" intro="Code-rendered previews of each post, story, video cover, Google post and flyer in the calendar. Click one to read the full draft.">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {visual.map((a) => (
            <button key={a.id} onClick={() => setOpen(a)} className="text-left">
              <div className="pointer-events-none">
                <Preview a={a} />
              </div>
              <div className="mt-2 text-[12px] text-muted-foreground">{a.id} · {CHANNEL_LABEL[a.channel]}</div>
            </button>
          ))}
        </div>
      </Section>
      <AssetDrawer asset={open} onClose={() => setOpen(null)} />
    </>
  );
}
