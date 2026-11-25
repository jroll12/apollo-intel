# Generator guide (for content-writing workers only)

## What this is
A spec work sample prepared by Jarret Roloff, a candidate for a marketing and operations role at the Evelo Team (Keller Williams Indy Metro NE, Fishers, IN). It shows the team a 30-day, multi-channel content plan for December 2026. All copy is a DRAFT. Nothing is published. The audience reading the finished sample is the team's CEO, so the copy must be good enough to post as is.

## Inputs (read these first; all paths relative to evelo-work-sample/)
- `content/grid.json`: your assigned slots (id, date, channel, pillar, seed, angle). Follow the angle.
- `content/brand.json`: voice traits, 5 reference quotes, cited facts, testimonials, contact details.
- `content/metrics.json`: the ONLY market numbers you may use (Realtor.com via FRED, October 2026; Freddie Mac 30-year rate, week of 2026-11-19). Use `series.<ID>.latest`, `.yearAgo`, `.yoyPct`, `.momPct` and `derived`.
- `content/listing.json`: a HYPOTHETICAL listing. Always label it "Sample listing".
- `content/seeds.json`: the team's own recent blog posts. Use them for topics, angles and voice ONLY. Do not copy sentences, and do not use any numbers from them.
- `rules/rules.md`: compliance and format rules. Every rule applies.

## Output format
A JSON array of assets that matches `scripts/schema.ts` (zod). Field notes:
- `id`: the slot id (for example "S02"), or slot plus a suffix for multi-part slots ("S10-mls", "S33-clip-1"). `slot` is the bare slot id.
- `title`: internal name, 90 characters max.
- `hook`: the first line or first 3 seconds.
- `body`: the main copy.
  - Captions: the caption without the hook and the CTA.
  - Reels and clips: the spoken voiceover only.
  - Email and blog: full copy in Markdown.
  - SMS: the texts separated by a line containing only `---`.
- `cta`: the call to action.
- `visual`: drives a code-rendered mockup.
  - `kind`: feed | story | gbp | email | reel | flyer | doc | sms.
  - `headline`: 70 characters max.
  - `sub`: 120 characters max.
  - `stat`: 24 characters max, the big number when relevant (for example "$445,000").
- `sources`: list the content files and URLs you used (for example "content/metrics.json#MEDLISPRI18057").
- `disclosure`: brokerage line, for example "Evelo Team | Keller Williams Indy Metro NE. Each office is independently owned and operated." Add the email footer for emails, and the "Sample listing (illustrative)" note for listing assets.
- `adType`: true for anything public-facing.

## Style rules
- No em dashes anywhere. Use commas, periods, colons or parentheses.
- Calm, helpful, data first. Plain English, short sentences, 9th-grade reading level.
- The first time a statistic appears in an asset, name its source and period: "(Realtor.com via FRED, October 2026)".
- Listing prices from Realtor.com are LIST prices, never "sale prices" or "home values".
- Name real Central Indiana places (Fishers, Carmel, Noblesville, Westfield, Hamilton County). Do not describe who a place is "for" (fair housing).
- Do not put invented quotes in a real person's mouth. Testimonials must be quoted exactly as they appear in brand.json, with the attribution given there.
- Phone: 317-863-9011. Email: info@eveloteam.com. Website: eveloteam.com.
- Hashtags (instagram and listing-social): 3 to 5, local plus topic (for example #FishersIN #HamiltonCountyIN #IndyRealEstate).
- Every hook must be distinct. Never start two assets the same way.

## Revision round (applies to everyone, after blind review)
Blind reviewers found the same problems across all channels. Fix them all, along with your per-asset feedback:
1. **Citations kill the flow.** Short formats (instagram, reel, gbp, sms, clips, listing-social): no inline "(Realtor.com via FRED, ...)". End with one line: "Source: Realtor.com via FRED, Oct 2026." (or "Source: Freddie Mac via FRED, week of Nov 19, 2026."). Long formats: cite once, then write naturally.
2. **One number per short post** (two at most). Let the number breathe and explain what it means for a real person.
3. **Stat ownership.** A headline stat may only lead in these slots:
   - metro inventory 7,171 (+21.3%): S01, S03, S05
   - Hamilton County $445,000 (-6.3%): S04, S14, S19
   - metro median days on market 55: S16
   - price-cut share 55.4% (vs 62.2% a year ago): S23, S03. Use the share, never "count rose 8%", which reads as a contradiction.
   - mortgage rate 7.28%: S26 only (S02 discusses waiting with no rate number, or with the rate at most once)
   - price per sq ft $164 (+5.1%): S30
   - pending listings down 12%: S29
   - Hamilton premium/share: S19
4. **Hooks.** At most one asset in the whole month may use a "3 things/3 questions/3 numbers" hook (S31 keeps it). Open with a scene, a surprising fact, a direct question someone actually asks, or a plain promise.
5. **Giving.** Always "our agents donate part of their commission from every closing" (see brand.json). Never imply the client paid for it. S08, S09, S21 and S33 may mention it. S24 and S27 are about thanks, not giving numbers.
6. **Testimonials.** Use only the testimonials now in brand.json (the outcome-based quote was removed). Frame them as one client's experience.
7. **No repeated lines.** "Market statistics provide the starting point" may appear only in S03. Each sample-listing asset has a different angle: S11 is the walkthrough, S12 is open-house logistics, S15 is one standout feature, S10-* is the launch kit.
8. **CTA.** Exactly one specific, low-pressure action per asset (for example "Call 317-863-9011 and ask for a winter pricing check"). No split asks.
9. **Timing.** The podcast pilot is recorded Dec 9 and released Jan 6. Label numbers "October data, the latest at recording", and add a producer note to refresh them to November data before release.
10. **Brokerage in SMS.** Text 1 and the last text include "Evelo Team, Keller Williams Indy Metro NE".

## Process
1. Write your JSON file to the path you were given.
2. Run `bun scripts/check.ts <your file>` from `evelo-work-sample/`. Fix every issue it reports (untraceable numbers, length, missing disclosure, banned terms, em dashes) and re-run until it prints "0 with issues, 0 schema errors".
3. Return a short summary: the file path, the asset count, and anything you were unsure about.
Do not edit any file other than your own output file.
