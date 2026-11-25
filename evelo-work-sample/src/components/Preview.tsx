// Code-rendered mockups of each asset type. Every mock carries a DRAFT / SPEC tag.
import { Heart, MessageCircle, Send, Bookmark, Play, MapPin, Phone, Mail, ChevronRight } from "lucide-react";
import type { Asset } from "@/data";
import { PILLAR_META } from "@/data";
import { cn } from "@/lib/utils";

const Tag = ({ className }: { className?: string }) => (
  <span className={cn("rounded bg-black/55 px-1.5 py-0.5 text-[10px] font-semibold tracking-wider text-white uppercase", className)}>Draft / Spec</span>
);

function Card({ a, square }: { a: Asset; square?: boolean }) {
  const color = PILLAR_META[a.pillar]?.color;
  return (
    <div
      className={cn("relative flex flex-col justify-between overflow-hidden p-5 text-white", square ? "aspect-[4/5]" : "aspect-[9/16]")}
      style={{ background: `linear-gradient(155deg, #0b1f3a 0%, #0b1f3a 55%, ${color} 140%)` }}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-[11px] font-medium tracking-widest text-[#d4b483] uppercase">{PILLAR_META[a.pillar]?.name}</span>
        <Tag />
      </div>
      <div>
        {a.visual.stat && <div className="font-display text-[clamp(2rem,9vw,3.2rem)] leading-none font-bold text-[#d4b483]">{a.visual.stat}</div>}
        <div className="font-display mt-2 text-[clamp(1.1rem,4.6vw,1.55rem)] leading-tight font-semibold">{a.visual.headline}</div>
        {a.visual.sub && <div className="mt-2 text-[13px] leading-snug text-white/80">{a.visual.sub}</div>}
      </div>
      <div className="text-[10px] text-white/70">Evelo Team | Keller Williams Indy Metro NE</div>
    </div>
  );
}

function Feed({ a }: { a: Asset }) {
  return (
    <div className="mx-auto w-full max-w-[340px] overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm">
      <div className="flex items-center gap-2 px-3 py-2">
        <div className="size-7 rounded-full bg-gradient-to-br from-[#0b1f3a] to-[#c9a46a]" />
        <div className="text-[13px] font-semibold">eveloteamrealestate</div>
      </div>
      <Card a={a} square />
      <div className="flex items-center gap-3 px-3 pt-2">
        <Heart className="size-5" /> <MessageCircle className="size-5" /> <Send className="size-5" />
        <Bookmark className="ml-auto size-5" />
      </div>
      <p className="line-clamp-3 px-3 pt-1 pb-3 text-[13px]">
        <b>eveloteamrealestate</b> {a.hook}
      </p>
    </div>
  );
}

function Story({ a }: { a: Asset }) {
  return (
    <div className="mx-auto w-full max-w-[240px] overflow-hidden rounded-2xl border shadow-sm">
      <Card a={a} />
    </div>
  );
}

function Reel({ a }: { a: Asset }) {
  return (
    <div className="relative mx-auto w-full max-w-[240px] overflow-hidden rounded-2xl border shadow-sm">
      <Card a={a} />
      <div className="pointer-events-none absolute inset-0 grid place-items-center">
        <div className="grid size-14 place-items-center rounded-full bg-white/20 backdrop-blur">
          <Play className="size-7 fill-white text-white" />
        </div>
      </div>
      {a.onScreenText?.[0] && (
        <div className="absolute inset-x-3 bottom-10 rounded bg-white px-2 py-1 text-center text-[12px] font-semibold text-black">{a.onScreenText[0]}</div>
      )}
    </div>
  );
}

function Gbp({ a }: { a: Asset }) {
  return (
    <div className="mx-auto w-full max-w-[360px] rounded-xl border bg-card p-4 text-card-foreground shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[13px] font-semibold">
          <MapPin className="size-4 text-[#ea4335]" /> Evelo Team | Keller Williams Realty
        </div>
        <Tag className="bg-muted text-muted-foreground" />
      </div>
      <div className="mt-3 aspect-[16/9] overflow-hidden rounded-lg">
        <div className="flex h-full flex-col justify-end bg-[#0b1f3a] p-3 text-white">
          {a.visual.stat && <div className="font-display text-2xl font-bold text-[#d4b483]">{a.visual.stat}</div>}
          <div className="font-display text-base leading-tight font-semibold">{a.visual.headline}</div>
        </div>
      </div>
      <p className="mt-3 line-clamp-4 text-[13px] text-muted-foreground">{a.body}</p>
      <div className="mt-3 inline-flex rounded-full border px-3 py-1 text-[12px] font-medium text-[#1a73e8]">{a.cta.split(":")[0]}</div>
    </div>
  );
}

function Email({ a }: { a: Asset }) {
  return (
    <div className="mx-auto w-full max-w-[380px] overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm">
      <div className="border-b px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          <div className="text-[12px] text-muted-foreground">The Evelo Team</div>
          <Tag className="bg-muted text-muted-foreground" />
        </div>
        <div className="mt-1 text-[14px] font-semibold">{a.subject}</div>
        <div className="text-[12px] text-muted-foreground">{a.preview}</div>
      </div>
      <div className="bg-[#0b1f3a] px-4 py-5 text-white">
        <div className="font-display text-lg leading-tight font-semibold">{a.visual.headline}</div>
        {a.visual.sub && <div className="mt-1 text-[12px] text-white/75">{a.visual.sub}</div>}
      </div>
      <p className="line-clamp-4 px-4 py-3 text-[13px] text-muted-foreground">{a.hook}</p>
    </div>
  );
}

function Flyer({ a }: { a: Asset }) {
  const bullets = a.body
    .split("\n")
    .filter((l) => /^\s*[-•]\s/.test(l) || /^\s*\*\s/.test(l))
    .map((l) => l.replace(/^\s*[-*•]\s*/, "").replace(/\*\*|__/g, "").trim())
    .filter((l) => l && !/sample listing/i.test(l))
    .slice(0, 5);
  return (
    <div className="mx-auto aspect-[8.5/11] w-full max-w-[320px] overflow-hidden rounded-md border bg-white text-[#16202e] shadow-md">
      <div className="bg-[#c9a46a] px-3 py-1 text-center text-[10px] font-semibold tracking-widest text-[#0b1f3a] uppercase">Sample listing (illustrative)</div>
      <div className="bg-[#0b1f3a] p-4 text-white">
        <div className="text-[11px] tracking-widest text-[#d4b483] uppercase">Just listed</div>
        <div className="font-display text-xl leading-tight font-semibold">{a.visual.headline}</div>
        {a.visual.stat && <div className="font-display mt-1 text-2xl font-bold text-[#d4b483]">{a.visual.stat}</div>}
      </div>
      <ul className="space-y-1 p-4 text-[11.5px]">
        {bullets.map((b) => (
          <li key={b} className="flex gap-1.5">
            <ChevronRight className="mt-0.5 size-3 shrink-0 text-[#c9a46a]" /> {b}
          </li>
        ))}
      </ul>
      <div className="mx-4 rounded border border-[#c9a46a] p-2 text-center text-[11px] font-medium">{a.visual.sub}</div>
      <div className="mt-3 px-4 text-[9.5px] text-[#5b6472]">Evelo Team | Keller Williams Indy Metro NE. Each office is independently owned and operated.</div>
    </div>
  );
}

function Sms({ a }: { a: Asset }) {
  const texts = a.body.split(/\n---\n/);
  return (
    <div className="mx-auto w-full max-w-[320px] rounded-2xl border bg-card p-3 shadow-sm">
      <div className="mb-2 flex items-center justify-between text-[12px] text-muted-foreground">
        <span>Text follow-up drip</span>
        <Tag className="bg-muted text-muted-foreground" />
      </div>
      <div className="space-y-2">
        {texts.map((t, i) => (
          <div key={i}>
            <div className="mb-0.5 text-[10px] text-muted-foreground">Text {i + 1}</div>
            <div className="max-w-[90%] rounded-2xl rounded-bl-sm bg-[#e9e9eb] px-3 py-2 text-[13px] text-black">{t}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Doc({ a }: { a: Asset }) {
  return (
    <div className="mx-auto w-full max-w-[380px] rounded-xl border bg-card p-5 text-card-foreground shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] tracking-widest text-muted-foreground uppercase">{a.channel.replace("-", " ")}</span>
        <Tag className="bg-muted text-muted-foreground" />
      </div>
      <div className="font-display mt-2 text-lg leading-tight font-semibold">{a.metaTitle ?? a.visual.headline}</div>
      {a.slug && <div className="mt-1 truncate text-[12px] text-[#2f7d4f]">eveloteam.com/blog/{a.slug}</div>}
      <p className="mt-2 line-clamp-4 text-[13px] text-muted-foreground">{a.metaDescription ?? a.hook}</p>
    </div>
  );
}

export function Preview({ a }: { a: Asset }) {
  switch (a.visual.kind) {
    case "feed":
      return <Feed a={a} />;
    case "story":
      return <Story a={a} />;
    case "reel":
      return <Reel a={a} />;
    case "gbp":
      return <Gbp a={a} />;
    case "email":
      return <Email a={a} />;
    case "flyer":
      return <Flyer a={a} />;
    case "sms":
      return <Sms a={a} />;
    default:
      return <Doc a={a} />;
  }
}

export const ContactIcons = { Phone, Mail };
