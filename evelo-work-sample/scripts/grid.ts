// Stage 1: the strategy. Pillars plus a 30-day slot grid for December 2026.
// Hand-authored decisions; the script only validates them and adds weekday and week numbers.
import { writeFileSync } from "node:fs";
import { join } from "node:path";

export const PILLARS = {
  MP: { name: "Market Pulse", why: "Turns public data into a plain-English 'what it means for you'. Matches the monthly market update habit already on the blog." },
  AQ: { name: "Ask Evelo", why: "Repurposes the weekly question-style blog posts into social, video and local search, so one post works across 4 channels." },
  LL: { name: "Listing Launch", why: "A repeatable launch system any agent can trigger: MLS copy, social, open house, flyer and follow-up texts." },
  PR: { name: "Proof", why: "419 Google reviews (5.0) is the team's strongest asset. Put real client words in front of people every week." },
  CG: { name: "Community & Giving", why: "The giving plan (2% of every closing to Filter of Hope) is a differentiator that is barely visible on social." },
} as const;

type Channel = "instagram" | "reel" | "gbp" | "email" | "blog" | "listing" | "podcast";
type Slot = { id: string; date: string; channel: Channel; pillar: keyof typeof PILLARS; seed: string; angle: string };

// seed = file reference the generator must draw from (metrics.json, brand.json, listing.json, seeds.json#<id>)
const SLOTS: Slot[] = [
  // Week 1
  { id: "S01", date: "2026-12-01", channel: "reel", pillar: "MP", seed: "metrics.json", angle: "Metro active listings up 21.3% year over year in October: what more choices mean for winter buyers" },
  { id: "S02", date: "2026-12-02", channel: "instagram", pillar: "AQ", seed: "seeds.json#wait-for-rates + metrics.json MORTGAGE30US", angle: "Should I wait for rates to drop? Rate context (7.28% now vs 6.26% a year ago) plus the trade-off of waiting" },
  { id: "S03", date: "2026-12-02", channel: "blog", pillar: "MP", seed: "metrics.json", angle: "Long-form SEO: Indianapolis-area listing trends heading into winter (metro + Hamilton County, October 2026 data)" },
  { id: "S04", date: "2026-12-03", channel: "gbp", pillar: "MP", seed: "metrics.json", angle: "October snapshot for Hamilton County: median list price, inventory, days on market" },
  { id: "S05", date: "2026-12-03", channel: "email", pillar: "AQ", seed: "metrics.json + seeds.json#wait-for-rates", angle: "Buyer-list newsletter: winter buying means more choices and more room to negotiate" },
  { id: "S06", date: "2026-12-04", channel: "instagram", pillar: "PR", seed: "brand.json testimonials[0]", angle: "Client words: 'They never tried to upsell or pressure us' (Natalie, Fishers)" },
  { id: "S07", date: "2026-12-04", channel: "reel", pillar: "AQ", seed: "seeds.json#relocation-agent", angle: "Moving to Fishers from out of state? 3 questions to ask any relocation agent" },
  // Week 2: listing launch week
  { id: "S08", date: "2026-12-07", channel: "instagram", pillar: "CG", seed: "brand.json giving fact", angle: "Every closing funds clean water: how the 2% Filter of Hope commitment works" },
  { id: "S09", date: "2026-12-07", channel: "gbp", pillar: "CG", seed: "brand.json giving fact", angle: "Giving plan: $10 KW Cares, $10 REALTOR Foundation, 2% Filter of Hope from every closing" },
  { id: "S10", date: "2026-12-08", channel: "listing", pillar: "LL", seed: "listing.json", angle: "Full launch kit for the sample listing: MLS description, just-listed post, open-house email, flyer copy, 3-text follow-up" },
  { id: "S11", date: "2026-12-08", channel: "reel", pillar: "LL", seed: "listing.json", angle: "Just-listed walkthrough script for the sample listing (60-second tour cut to 40s)" },
  { id: "S12", date: "2026-12-09", channel: "gbp", pillar: "LL", seed: "listing.json", angle: "Open house event post for Saturday Dec 12, 1-3 PM" },
  { id: "S13", date: "2026-12-10", channel: "instagram", pillar: "AQ", seed: "seeds.json#home-worth-fishers", angle: "What is my Fishers home worth? The 4 factors that matter more than an online estimate" },
  { id: "S14", date: "2026-12-10", channel: "reel", pillar: "MP", seed: "metrics.json Hamilton", angle: "Hamilton County median list price $445,000, down 6.3% year over year: the pricing takeaway for sellers" },
  { id: "S15", date: "2026-12-11", channel: "instagram", pillar: "LL", seed: "listing.json", angle: "Open house this Saturday: 3 details worth seeing in person" },
  // Week 3
  { id: "S16", date: "2026-12-14", channel: "instagram", pillar: "MP", seed: "metrics.json", angle: "One number: 55 median days on market in the metro (up from 50 a year ago). What sellers should plan for" },
  { id: "S17", date: "2026-12-15", channel: "reel", pillar: "AQ", seed: "seeds.json#noblesville-prices", angle: "Are prices going up or down in your town? How to read local numbers without getting fooled (no town stats quoted)" },
  { id: "S18", date: "2026-12-15", channel: "instagram", pillar: "PR", seed: "brand.json review counts", angle: "By the numbers: 419 Google reviews at 5.0 and 178 Zillow reviews at 5.0, and what clients mention most" },
  { id: "S19", date: "2026-12-16", channel: "blog", pillar: "AQ", seed: "metrics.json + seeds.json#home-worth-fishers", angle: "Long-form SEO: Should you sell your Hamilton County home in winter or wait for spring?" },
  { id: "S20", date: "2026-12-16", channel: "gbp", pillar: "AQ", seed: "S19", angle: "Promote the winter-vs-spring selling post with one data point and a link" },
  { id: "S21", date: "2026-12-17", channel: "email", pillar: "CG", seed: "brand.json + metrics.json", angle: "Sphere/past-client year-end letter: thank you, giving recap, a 3-line market snapshot, and a gentle review ask" },
  { id: "S22", date: "2026-12-17", channel: "reel", pillar: "PR", seed: "brand.json testimonials", angle: "What clients say most (communication, no pressure, fast offers), read over b-roll" },
  { id: "S23", date: "2026-12-18", channel: "instagram", pillar: "MP", seed: "metrics.json PRIREDCOU26900", angle: "Buyer leverage: 3,972 metro listings had a price reduction in October. How to use that without lowballing" },
  // Week 4 (Dec 24-25 deliberately dark)
  { id: "S24", date: "2026-12-21", channel: "instagram", pillar: "CG", seed: "brand.json tagline", angle: "Happy holidays from the Evelo Team, tied to the tagline and the year of giving" },
  { id: "S25", date: "2026-12-22", channel: "reel", pillar: "AQ", seed: "brand.json Derek new construction", angle: "Building a new home in 2027? Why winter is when builder conversations start (new construction specialist angle)" },
  { id: "S26", date: "2026-12-22", channel: "instagram", pillar: "MP", seed: "metrics.json MORTGAGE30US", angle: "Rates in context: 7.28% this week. A payment-first way to think about it" },
  { id: "S27", date: "2026-12-23", channel: "gbp", pillar: "CG", seed: "brand.json", angle: "Season's thanks to Central Indiana clients and neighbors" },
  // Week 5
  { id: "S28", date: "2026-12-28", channel: "instagram", pillar: "PR", seed: "brand.json testimonials[1]", angle: "Client words: 'Communication was immediate, no matter the time of day or night' (Adam, Indy)" },
  { id: "S29", date: "2026-12-29", channel: "reel", pillar: "MP", seed: "metrics.json", angle: "2026 wrap: 3 numbers that shaped the Indy-area market (inventory, days on market, rates)" },
  { id: "S30", date: "2026-12-29", channel: "gbp", pillar: "MP", seed: "metrics.json", angle: "Year-end metro snapshot with source" },
  { id: "S31", date: "2026-12-30", channel: "instagram", pillar: "AQ", seed: "seeds.json#fishers-market-now", angle: "Planning a 2027 move? 3 steps to start in January (pre-approval, pricing conversation, timeline)" },
  { id: "S32", date: "2026-12-30", channel: "gbp", pillar: "AQ", seed: "S31", angle: "Planning a 2027 move: book a no-pressure strategy call" },
  { id: "S33", date: "2026-12-09", channel: "podcast", pillar: "AQ", seed: "podcast.json + seeds.json", angle: "Podcast reboot: pilot episode script, show notes, 4 clip scripts, 6-episode season plan (record Dec 9, launch Jan 6, 2027)" },
];

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const ids = new Set<string>();
const out = SLOTS.map((s) => {
  if (ids.has(s.id)) throw new Error(`duplicate ${s.id}`);
  ids.add(s.id);
  const d = new Date(`${s.date}T12:00:00Z`);
  if (d.getUTCMonth() !== 11) throw new Error(`${s.id} outside December`);
  if (["2026-12-24", "2026-12-25"].includes(s.date)) throw new Error(`${s.id} on a dark day`);
  return { ...s, weekday: DAYS[d.getUTCDay()], week: Math.ceil(d.getUTCDate() / 7) };
});

const count = (k: Channel) => out.filter((s) => s.channel === k).length;
const summary = Object.fromEntries((["instagram", "reel", "gbp", "email", "blog", "listing", "podcast"] as Channel[]).map((c) => [c, count(c)]));
writeFileSync(
  join(import.meta.dir, "../content/grid.json"),
  JSON.stringify({ month: "December 2026", darkDays: ["2026-12-24", "2026-12-25"], pillars: PILLARS, summary, slots: out }, null, 2),
);
console.log("grid.json", summary);
