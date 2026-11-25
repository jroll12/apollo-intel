import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Preview } from "@/components/Preview";
import { Markdown } from "@/components/Markdown";
import { PillarDot, ReviewChip } from "@/components/shared";
import { CHANNEL_LABEL, validation, type Asset } from "@/data";
import { format } from "./date";

const LONG = new Set(["email", "blog", "listing-email", "podcast-script", "podcast-notes", "podcast-season", "listing-mls", "listing-flyer"]);

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border-t pt-3">
      <div className="mb-1 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">{label}</div>
      <div className="text-[14px] leading-relaxed">{children}</div>
    </div>
  );
}

export function AssetBody({ a }: { a: Asset }) {
  const c = validation.compliance[a.id];
  const e = validation.editor[a.id];
  return (
    <div className="space-y-4">
      <Preview a={a} />
      {a.subject && <Field label="Subject / preview">{a.subject}<div className="text-muted-foreground">{a.preview}</div></Field>}
      {a.metaTitle && <Field label="SEO">{a.metaTitle}<div className="text-muted-foreground">{a.metaDescription}</div></Field>}
      <Field label={a.channel === "reel" || a.channel === "podcast-clip" ? "Hook (first 3 seconds)" : "Hook"}>{a.hook}</Field>
      <Field label={a.channel === "reel" || a.channel === "podcast-clip" ? "Voiceover" : a.channel === "sms" ? "Texts" : "Copy"}>
        {LONG.has(a.channel) ? <Markdown source={a.body} /> : <p className="whitespace-pre-line">{a.body}</p>}
      </Field>
      {a.shotList && (
        <Field label="Shot list">
          <ol className="list-decimal space-y-1 pl-5">{a.shotList.map((s) => <li key={s}>{s}</li>)}</ol>
        </Field>
      )}
      {a.onScreenText && <Field label="On-screen text">{a.onScreenText.join(" · ")}</Field>}
      <Field label="Call to action">{a.cta}</Field>
      {a.hashtags && <Field label="Hashtags">{a.hashtags.join(" ")}</Field>}
      <Field label="Disclosure">{a.disclosure}</Field>
      <Field label="Sources">
        <ul className="space-y-0.5 text-[13px] break-all text-muted-foreground">
          {a.sources.map((s) => (
            <li key={s}>{s.startsWith("http") ? <a className="underline" href={s} target="_blank" rel="noreferrer">{s}</a> : s}</li>
          ))}
        </ul>
      </Field>
      <Field label="Blind review">
        <ReviewChip id={a.id} />
        {c && c.issues.length > 0 && (
          <ul className="mt-2 space-y-1 text-[13px]">
            {c.issues.map((i, k) => (
              <li key={k}><b>{i.rule}</b>: "{i.quote}". {i.note}</li>
            ))}
          </ul>
        )}
        {e && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {Object.entries(e.scores).map(([k, v]) => (
              <Badge key={k} variant="outline" className="font-mono text-[11px]">{k} {v}/5</Badge>
            ))}
          </div>
        )}
        {validation.regenerated.includes(a.id) && <div className="mt-2 text-[12px] text-muted-foreground">Revised once after review feedback.</div>}
      </Field>
    </div>
  );
}

export function AssetDrawer({ asset, onClose }: { asset: Asset | null; onClose: () => void }) {
  return (
    <Sheet open={!!asset} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-full overflow-y-auto p-5 sm:max-w-lg">
        {asset && (
          <>
            <SheetHeader className="pr-8 text-left">
              <div className="flex flex-wrap items-center gap-2 text-[12px] text-muted-foreground">
                <span className="font-mono">{asset.id}</span>
                <span>{CHANNEL_LABEL[asset.channel]}</span>
                <span>{format(asset.date)}</span>
                <PillarDot pillar={asset.pillar} label />
              </div>
              <SheetTitle className="font-display text-xl leading-tight">{asset.title}</SheetTitle>
              <SheetDescription className="sr-only">Draft asset details</SheetDescription>
            </SheetHeader>
            <div className="mt-4">
              <AssetBody a={asset} />
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
