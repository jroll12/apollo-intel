import { z } from "zod";

export const CHANNELS = [
  "instagram",
  "reel",
  "gbp",
  "email",
  "blog",
  "listing-mls",
  "listing-social",
  "listing-email",
  "listing-flyer",
  "sms",
  "podcast-script",
  "podcast-notes",
  "podcast-clip",
  "podcast-season",
] as const;

export const AssetSchema = z.object({
  id: z.string().regex(/^S\d{2}(-[a-z0-9-]+)?$/),
  slot: z.string().regex(/^S\d{2}$/),
  channel: z.enum(CHANNELS),
  pillar: z.enum(["MP", "AQ", "LL", "PR", "CG"]),
  date: z.string().regex(/^2026-12-\d{2}$|^2027-\d{2}-\d{2}$/),
  title: z.string().min(3).max(90),
  hook: z.string().min(3),
  body: z.string().min(20),
  cta: z.string().min(3),
  hashtags: z.array(z.string().regex(/^#[A-Za-z0-9]+$/)).optional(),
  subject: z.string().optional(),
  preview: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  slug: z.string().optional(),
  shotList: z.array(z.string()).optional(),
  onScreenText: z.array(z.string()).optional(),
  visual: z.object({
    kind: z.enum(["feed", "story", "gbp", "email", "reel", "flyer", "doc", "sms"]),
    headline: z.string().max(70),
    sub: z.string().max(120).optional(),
    stat: z.string().max(24).optional(),
  }),
  sources: z.array(z.string()).min(1),
  disclosure: z.string(),
  adType: z.boolean(),
});

export type Asset = z.infer<typeof AssetSchema>;
export const AssetFileSchema = z.array(AssetSchema);

export const textOf = (a: Asset) =>
  [a.title, a.hook, a.body, a.cta, a.subject, a.preview, a.metaTitle, a.metaDescription, ...(a.shotList ?? []), ...(a.onScreenText ?? []), a.visual.headline, a.visual.sub, a.visual.stat]
    .filter(Boolean)
    .join("\n");
