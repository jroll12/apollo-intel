import metrics from "../content/metrics.json";
import grid from "../content/grid.json";
import brand from "../content/brand.json";
import listing from "../content/listing.json";
import podcast from "../content/podcast.json";
import ops from "../content/ops.json";
import type { Asset } from "../scripts/schema";

// Every *.json in content/assets is picked up automatically.
const files = import.meta.glob<{ default: Asset[] }>("../content/assets/*.json", { eager: true });
export const assets: Asset[] = Object.values(files)
  .flatMap((m) => m.default)
  .sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));

type Validation = {
  reviewedAt?: string;
  deterministic?: { total: number; failingFinal: number };
  rounds?: { round: number; reviewed: number; compliancePass: number; editorPass: number; avgScore: number; topIssues: string[] }[];
  compliance: Record<string, { pass: boolean; issues: { rule: string; quote: string; note: string }[] }>;
  editor: Record<string, { scores: Record<string, number>; notes?: string[] }>;
  regenerated: string[];
  dropped: string[];
};
const vfiles = import.meta.glob<{ default: Validation }>("../content/validation-report.json", { eager: true });
export const validation: Validation = Object.values(vfiles)[0]?.default ?? { compliance: {}, editor: {}, regenerated: [], dropped: [] };

export { metrics, grid, brand, listing, podcast, ops };
export type { Asset };

export const PILLAR_META: Record<string, { name: string; color: string; why: string }> = Object.fromEntries(
  Object.entries(grid.pillars).map(([k, v]) => [k, { name: v.name, why: v.why, color: `var(--p-${k.toLowerCase()})` }]),
);

export const CHANNEL_LABEL: Record<string, string> = {
  instagram: "Instagram + Facebook",
  reel: "Short video",
  gbp: "Google Business Profile",
  email: "Email",
  blog: "Blog / SEO",
  "listing-mls": "MLS remarks",
  "listing-social": "Just listed post",
  "listing-email": "Open house email",
  "listing-flyer": "Flyer",
  sms: "Text follow-up",
  "podcast-script": "Podcast pilot",
  "podcast-notes": "Show notes",
  "podcast-clip": "Podcast clip",
  "podcast-season": "Season plan",
};

// Calendar grouping: listing and podcast sub-assets collapse into their kit.
export const channelGroup = (c: string) => (c.startsWith("listing") || c === "sms" ? "listing" : c.startsWith("podcast") ? "podcast" : c);
export const GROUP_LABEL: Record<string, string> = {
  instagram: "Social",
  reel: "Video",
  gbp: "Google",
  email: "Email",
  blog: "Blog",
  listing: "Listing kit",
  podcast: "Podcast",
};

export type Series = (typeof metrics.series)[keyof typeof metrics.series];
export const S = metrics.series as unknown as Record<string, Series & { yearAgo?: { date: string; value: number } }>;

export const fmtUSD = (n: number) => `$${n.toLocaleString("en-US")}`;
export const fmtPct = (n: number) => `${n > 0 ? "+" : ""}${n}%`;

export function passStats() {
  const ids = assets.map((a) => a.id);
  const reviewed = ids.filter((id) => validation.compliance[id] || validation.editor[id]);
  const compliancePass = ids.filter((id) => validation.compliance[id]?.pass).length;
  const editorPass = ids.filter((id) => {
    const s = validation.editor[id]?.scores;
    return s && Object.values(s).every((v) => v >= 4);
  }).length;
  return { total: ids.length, reviewed: reviewed.length, compliancePass, editorPass };
}
