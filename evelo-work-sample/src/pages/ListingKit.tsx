import { useState } from "react";
import { Section } from "@/components/shared";
import { AssetDrawer } from "@/components/AssetDrawer";
import { Preview } from "@/components/Preview";
import { assets, ops, listing, CHANNEL_LABEL, fmtUSD, type Asset } from "@/data";
import { ReviewChip } from "@/components/shared";

export function ListingKit() {
  const ORDER = ["listing-mls", "listing-social", "listing-flyer", "listing-email", "sms"];
  const kit = assets.filter((a) => a.slot === "S10").sort((x, y) => ORDER.indexOf(x.channel) - ORDER.indexOf(y.channel));
  const [open, setOpen] = useState<Asset | null>(null);
  return (
    <>
      <Section
        eyebrow="Listing Launch"
        title="One listing, launched the same way every time"
        intro={
          <>
            A repeatable kit any agent can trigger the day a listing agreement is signed. Shown here on a <b>sample listing</b> ({listing.beds} bed, {listing.baths} bath,{" "}
            {listing.sqft.toLocaleString()} sq ft, {fmtUSD(listing.price)} in Fishers). It's illustrative, not a real property: spec work should never market a real seller's home.
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {kit.map((a) => (
            <button key={a.id} onClick={() => setOpen(a)} className="flex flex-col gap-3 rounded-xl border bg-card p-3 text-left transition-colors hover:border-[var(--sand)]">
              <div className="flex items-center justify-between text-[12px] font-medium">
                {CHANNEL_LABEL[a.channel]} <ReviewChip id={a.id} compact />
              </div>
              <div className="pointer-events-none origin-top scale-[0.92]">
                <Preview a={a} />
              </div>
              <span className="mt-auto text-[12px] text-muted-foreground underline">Read full copy</span>
            </button>
          ))}
        </div>
      </Section>

      <Section eyebrow="Timeline" title="12 days from signature to seller report" intro="MLS first, then public marketing within 1 business day (Clear Cooperation). Every step has one owner.">
        <ol className="relative space-y-3 border-l-2 border-[var(--sand)] pl-5">
          {ops.listingLaunch.map((s, i) => (
            <li key={i} className="relative">
              <span className="absolute top-1.5 -left-[27px] size-3 rounded-full border-2 border-[var(--sand)] bg-background" />
              <div className="flex flex-wrap items-baseline gap-x-3">
                <span className="font-mono text-[13px] font-semibold">{s.t}</span>
                <span className="text-[14px]">{s.task}</span>
              </div>
              <div className="text-[12px] text-muted-foreground">Owner: {s.owner}</div>
            </li>
          ))}
        </ol>
      </Section>
      <AssetDrawer asset={open} onClose={() => setOpen(null)} />
    </>
  );
}
