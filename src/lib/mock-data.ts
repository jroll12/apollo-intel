export type Tag =
  | "Apologetics" | "Evangelism" | "Gen Z" | "Muslim Outreach" | "Missions"
  | "AI-Friendly" | "Podcast" | "Shorts Creator" | "Debate Content" | "Theology"
  | "Church Leadership" | "Digital Missionary" | "Emerging Creator"
  | "High Trust Audience" | "Strategic Partner" | "Livestreamer";

export type PipelineStage =
  | "Identified" | "Researching" | "Warm Path Available" | "Initial Contact"
  | "In Conversation" | "Collaboration Planning" | "Active Partnership"
  | "Strategic Ally" | "Dormant" | "Archive";

export const PIPELINE_STAGES: PipelineStage[] = [
  "Identified", "Researching", "Warm Path Available", "Initial Contact",
  "In Conversation", "Collaboration Planning", "Active Partnership",
  "Strategic Ally", "Dormant", "Archive",
];

export interface Creator {
  id: string;
  name: string;
  handle: string;
  title: string;
  organization: string;
  country: string;
  denomination: string;
  ministryFocus: string;
  audienceType: string;
  avatarHue: number; // 0-360 for deterministic gradient avatar
  socials: {
    youtube?: string;
    instagram?: string;
    tiktok?: string;
    x?: string;
    podcast?: string;
    website?: string;
    newsletter?: string;
    discord?: string;
    email?: string;
  };
  audienceSize: number;
  shortsEffectiveness: number; // 0-100
  engagementQuality: number;
  livestreamFrequency: string;
  primaryFormats: string[];
  viralThemes: string[];
  demographics: string;
  tone: string;
  scores: {
    apologeticsDepth: number;
    evangelismOrientation: number;
    aiOpenness: number;
    genZRelevance: number;
    missionsAlignment: number;
    muslimOutreach: number;
    crossCultural: number;
    partnershipPotential: number;
  };
  reputation: string;
  strengths: string[];
  risks: string[];
  outreachAngle: string;
  knownCollaborators: string[];
  conferencesAttended: string[];
  organizations: string[];
  warmPath: string | null;
  stage: PipelineStage;
  tags: Tag[];
  priority: "High" | "Medium" | "Low";
  internalNotes: string;
  alignment: number; // AI alignment %
  trend: "rising" | "stable" | "declining";
  lastTouch: string;
}

export interface Organization {
  id: string;
  name: string;
  type: string;
  region: string;
  creatorCount: number;
  focus: string;
  partnership: "Active" | "Exploring" | "Aware";
}

export interface Opportunity {
  id: string;
  title: string;
  type: "Podcast" | "Livestream" | "Shorts" | "Conference" | "Education" | "Translation" | "AI Demo" | "Debate" | "Campaign" | "Missions";
  creatorIds: string[];
  status: "Idea" | "Proposed" | "Confirmed" | "In Production" | "Live" | "Completed";
  strategicValue: number; // 0-100
  estimatedImpact: string;
  nextAction: string;
  platform: string;
  notes: string;
}

export interface ConferenceEvent {
  id: string;
  name: string;
  date: string; // ISO
  location: string;
  type: string;
  targetCreatorIds: string[];
  attendeeIds: string[];
  notes: string;
}

export interface ActivityItem {
  id: string;
  ts: string; // relative label
  actor: string;
  kind: "note" | "signal" | "stage" | "tag" | "outreach" | "ai" | "event";
  creatorId?: string;
  message: string;
}

export interface TimelineEvent {
  id: string;
  date: string;
  creatorId: string;
  kind: "outreach" | "meeting" | "email" | "collab" | "conference" | "podcast" | "milestone" | "ai";
  title: string;
  detail: string;
}

export interface AIInsight {
  id: string;
  kind: "Partnership" | "Audience Overlap" | "Trend" | "Similarity" | "Content Opportunity";
  title: string;
  body: string;
  confidence: number;
  creatorIds: string[];
}

// ---------- Seed ----------

export const creators: Creator[] = [
  {
    id: "c_thorne",
    name: "Marcus Thorne",
    handle: "@ThorneRefined",
    title: "Apologist & Shorts Producer",
    organization: "Refined Apologetics",
    country: "United Kingdom",
    denomination: "Reformed Evangelical",
    ministryFocus: "Cultural apologetics for Gen Z",
    audienceType: "18–28, university-leaning",
    avatarHue: 248,
    socials: {
      youtube: "youtube.com/@thornerefined",
      tiktok: "tiktok.com/@thornerefined",
      x: "x.com/thornerefined",
      podcast: "Refined",
      website: "thorne.media",
      email: "marcus@thorne.media",
    },
    audienceSize: 412000,
    shortsEffectiveness: 92,
    engagementQuality: 88,
    livestreamFrequency: "Weekly",
    primaryFormats: ["Shorts", "Long-form essays", "Livestream Q&A"],
    viralThemes: ["AI & the soul", "Existential drift", "New Atheism revisited"],
    demographics: "62% male · 18–28 · UK/US/AU",
    tone: "Calm, surgical, slightly literary",
    scores: {
      apologeticsDepth: 87,
      evangelismOrientation: 74,
      aiOpenness: 90,
      genZRelevance: 94,
      missionsAlignment: 81,
      muslimOutreach: 65,
      crossCultural: 70,
      partnershipPotential: 92,
    },
    reputation: "Respected across reformed + classical apologetics circles.",
    strengths: ["Production quality", "Calm under hostile DMs", "Bridges academic + viral"],
    risks: ["Occasional debate-bro audience overlap", "Limited Muslim-context fluency"],
    outreachAngle: "Co-produce a Shorts series on AI consciousness; offer access to our researchers.",
    knownCollaborators: ["Sana Khan", "Elena Vance", "Daniel Okoro"],
    conferencesAttended: ["Dallas Digital Summit 2024", "ETS Annual"],
    organizations: ["Refined Apologetics", "The Logos Network"],
    warmPath: "Met our team at Dallas Digital Summit — Dave L. has his cell.",
    stage: "Warm Path Available",
    tags: ["Apologetics", "Gen Z", "Shorts Creator", "AI-Friendly", "Strategic Partner"],
    priority: "High",
    internalNotes: "Wants research collab more than money. Don't pitch sponsorship first.",
    alignment: 92,
    trend: "rising",
    lastTouch: "3 days ago",
  },
  {
    id: "c_vance",
    name: "Dr. Elena Vance",
    handle: "The Daily Logos",
    title: "Podcast Host · NT Scholar",
    organization: "Daily Logos Media",
    country: "United States",
    denomination: "Anglican",
    ministryFocus: "Textual reliability + early church",
    audienceType: "Pastors, seminarians, curious skeptics",
    avatarHue: 12,
    socials: {
      podcast: "The Daily Logos",
      youtube: "youtube.com/@dailylogos",
      website: "dailylogos.fm",
      newsletter: "logosweekly.substack.com",
      email: "elena@dailylogos.fm",
    },
    audienceSize: 186000,
    shortsEffectiveness: 41,
    engagementQuality: 95,
    livestreamFrequency: "Monthly",
    primaryFormats: ["Long-form podcast", "Newsletter"],
    viralThemes: ["Manuscript evidence", "Patristics"],
    demographics: "55% male · 28–55 · US/UK",
    tone: "Warm, scholarly, generous",
    scores: {
      apologeticsDepth: 96,
      evangelismOrientation: 62,
      aiOpenness: 70,
      genZRelevance: 48,
      missionsAlignment: 78,
      muslimOutreach: 70,
      crossCultural: 75,
      partnershipPotential: 84,
    },
    reputation: "High-trust voice; quoted by both popular + academic apologists.",
    strengths: ["Scholarly credibility", "Generous platforming of guests"],
    risks: ["Slow to respond to DMs", "Not focused on Gen Z"],
    outreachAngle: "Pitch a 4-part series on Digital Missions with our field researchers.",
    knownCollaborators: ["Marcus Thorne", "Daniel Okoro"],
    conferencesAttended: ["ETS Annual", "Apologetics UK"],
    organizations: ["Daily Logos Media"],
    warmPath: "Mutual friend at Tyndale House.",
    stage: "Researching",
    tags: ["Podcast", "Theology", "Apologetics", "High Trust Audience"],
    priority: "High",
    internalNotes: "Mentions 'Digital Missions' increasing across last 6 episodes.",
    alignment: 84,
    trend: "stable",
    lastTouch: "9 days ago",
  },
  {
    id: "c_khan",
    name: "Sana Khan",
    handle: "@sanakhan",
    title: "Ex-Muslim · Dialogue Creator",
    organization: "Open Table",
    country: "Canada",
    denomination: "Non-denominational",
    ministryFocus: "Muslim–Christian dialogue",
    audienceType: "Diaspora South Asians, seekers",
    avatarHue: 320,
    socials: {
      youtube: "youtube.com/@sanakhan",
      instagram: "instagram.com/sanakhan",
      tiktok: "tiktok.com/@sanakhan",
      podcast: "Open Table",
      email: "sana@opentable.fm",
    },
    audienceSize: 268000,
    shortsEffectiveness: 81,
    engagementQuality: 90,
    livestreamFrequency: "Bi-weekly",
    primaryFormats: ["Dialogue livestreams", "Shorts", "Long-form podcast"],
    viralThemes: ["Hijab & freedom", "Trinity for Muslims", "Family cost of conversion"],
    demographics: "48% female · 22–40 · CA/UK/Gulf",
    tone: "Tender, candid, courageous",
    scores: {
      apologeticsDepth: 78,
      evangelismOrientation: 92,
      aiOpenness: 60,
      genZRelevance: 80,
      missionsAlignment: 95,
      muslimOutreach: 98,
      crossCultural: 96,
      partnershipPotential: 95,
    },
    reputation: "Trusted across CMC, Frontiers, and several diaspora networks.",
    strengths: ["Unmatched credibility on Muslim outreach", "Lived experience"],
    risks: ["Targeted by harassment campaigns; protect contact info"],
    outreachAngle: "Co-host a Q4 debate series; offer security + production support.",
    knownCollaborators: ["Marcus Thorne", "Daniel Okoro"],
    conferencesAttended: ["Dallas Digital Summit 2024", "Frontiers Gathering"],
    organizations: ["Open Table", "Frontiers"],
    warmPath: "Sarah J. has been corresponding for 4 months.",
    stage: "In Conversation",
    tags: ["Muslim Outreach", "Evangelism", "Missions", "Strategic Partner", "Digital Missionary"],
    priority: "High",
    internalNotes: "Security is real. Use signal channel. Avoid public tagging.",
    alignment: 96,
    trend: "rising",
    lastTouch: "today",
  },
  {
    id: "c_okoro",
    name: "Daniel Okoro",
    handle: "@danielokoro",
    title: "Pastor · Apologist",
    organization: "Lagos Logos Collective",
    country: "Nigeria",
    denomination: "Pentecostal",
    ministryFocus: "African apologetics + diaspora",
    audienceType: "African Gen Z + Black diaspora",
    avatarHue: 145,
    socials: {
      youtube: "youtube.com/@danielokoro",
      instagram: "instagram.com/danielokoro",
      podcast: "Lagos Logos",
      email: "daniel@lagoslogos.org",
    },
    audienceSize: 312000,
    shortsEffectiveness: 76,
    engagementQuality: 84,
    livestreamFrequency: "Weekly",
    primaryFormats: ["Livestream", "Shorts", "Long-form sermon clips"],
    viralThemes: ["African church renewal", "Decolonizing apologetics"],
    demographics: "50/50 · 20–35 · NG/UK/US",
    tone: "Bold, pastoral, hopeful",
    scores: {
      apologeticsDepth: 80,
      evangelismOrientation: 90,
      aiOpenness: 68,
      genZRelevance: 85,
      missionsAlignment: 92,
      muslimOutreach: 82,
      crossCultural: 94,
      partnershipPotential: 90,
    },
    reputation: "Rapidly rising; respected across continents.",
    strengths: ["Cross-cultural bridge", "Pastoral warmth on hard topics"],
    risks: ["Time zones", "Already over-asked"],
    outreachAngle: "Sponsor production upgrade for his Lagos studio in exchange for content rights.",
    knownCollaborators: ["Sana Khan", "Marcus Thorne"],
    conferencesAttended: ["Lagos Apologetics 2025"],
    organizations: ["Lagos Logos Collective"],
    warmPath: null,
    stage: "Initial Contact",
    tags: ["Apologetics", "Evangelism", "Missions", "Gen Z", "Livestreamer"],
    priority: "High",
    internalNotes: "First email sent — no response yet. Try voice memo.",
    alignment: 89,
    trend: "rising",
    lastTouch: "5 days ago",
  },
  {
    id: "c_rivera",
    name: "Camila Rivera",
    handle: "@camrivera",
    title: "Gen Z Creator",
    organization: "Independent",
    country: "Mexico",
    denomination: "Catholic",
    ministryFocus: "Faith + mental health for Gen Z",
    audienceType: "Latina Gen Z + young moms",
    avatarHue: 28,
    socials: {
      tiktok: "tiktok.com/@camrivera",
      instagram: "instagram.com/camrivera",
      youtube: "youtube.com/@camrivera",
    },
    audienceSize: 540000,
    shortsEffectiveness: 96,
    engagementQuality: 86,
    livestreamFrequency: "Sporadic",
    primaryFormats: ["Shorts", "Reels"],
    viralThemes: ["Anxiety & prayer", "Latina identity"],
    demographics: "78% female · 16–26 · MX/US/AR",
    tone: "Soft, vulnerable, sharp humor",
    scores: {
      apologeticsDepth: 42,
      evangelismOrientation: 78,
      aiOpenness: 55,
      genZRelevance: 98,
      missionsAlignment: 70,
      muslimOutreach: 25,
      crossCultural: 72,
      partnershipPotential: 75,
    },
    reputation: "Beloved by audience; not yet networked with apologetics world.",
    strengths: ["Massive Gen Z trust", "Authentic"],
    risks: ["Light on doctrine — needs careful partnership framing"],
    outreachAngle: "Offer apologetics writers' room support; do not push branding.",
    knownCollaborators: [],
    conferencesAttended: [],
    organizations: [],
    warmPath: null,
    stage: "Identified",
    tags: ["Gen Z", "Shorts Creator", "Emerging Creator", "Evangelism"],
    priority: "Medium",
    internalNotes: "Strategic for Latin American expansion.",
    alignment: 76,
    trend: "rising",
    lastTouch: "—",
  },
  {
    id: "c_park",
    name: "Joon Park",
    handle: "@joonpark",
    title: "Debate Creator",
    organization: "Sola Forum",
    country: "South Korea",
    denomination: "Presbyterian",
    ministryFocus: "Public debate · East Asia",
    avatarHue: 200,
    audienceType: "Skeptics + Korean diaspora",
    socials: {
      youtube: "youtube.com/@joonpark",
      x: "x.com/joonpark",
      podcast: "Sola Forum",
    },
    audienceSize: 224000,
    shortsEffectiveness: 70,
    engagementQuality: 81,
    livestreamFrequency: "Weekly",
    primaryFormats: ["Debate", "Long-form"],
    viralThemes: ["Confucian ethics vs. Christ", "K-deconstruction"],
    demographics: "70% male · 18–35 · KR/US",
    tone: "Sharp, fast, respectful",
    scores: {
      apologeticsDepth: 84,
      evangelismOrientation: 72,
      aiOpenness: 88,
      genZRelevance: 80,
      missionsAlignment: 75,
      muslimOutreach: 30,
      crossCultural: 78,
      partnershipPotential: 82,
    },
    reputation: "Respected in East Asian academic Christian circles.",
    strengths: ["Bilingual reach", "Debate rigor"],
    risks: ["Can come across as combative to Western audiences"],
    outreachAngle: "Invite to moderate AI-ethics debate series.",
    knownCollaborators: ["Marcus Thorne"],
    conferencesAttended: ["Seoul Apologetics 2024"],
    organizations: ["Sola Forum"],
    warmPath: null,
    stage: "Collaboration Planning",
    tags: ["Debate Content", "Apologetics", "AI-Friendly", "Strategic Partner"],
    priority: "Medium",
    internalNotes: "Signed letter of intent for Q1 debate co-production.",
    alignment: 82,
    trend: "stable",
    lastTouch: "2 days ago",
  },
  {
    id: "c_brooks",
    name: "Maya Brooks",
    handle: "@mayabrooks",
    title: "Worship + Liturgy Creator",
    organization: "Common Hours",
    country: "United States",
    denomination: "Anglican",
    ministryFocus: "Liturgical formation",
    audienceType: "Millennial deconstructing returners",
    avatarHue: 280,
    socials: {
      instagram: "instagram.com/mayabrooks",
      newsletter: "commonhours.substack.com",
      podcast: "Common Hours",
    },
    audienceSize: 92000,
    shortsEffectiveness: 38,
    engagementQuality: 92,
    livestreamFrequency: "Never",
    primaryFormats: ["Essay", "Liturgy audio"],
    viralThemes: ["Quitting hustle Christianity", "Sabbath"],
    demographics: "65% female · 27–40 · US",
    tone: "Quiet, gentle, literary",
    scores: {
      apologeticsDepth: 60,
      evangelismOrientation: 55,
      aiOpenness: 35,
      genZRelevance: 50,
      missionsAlignment: 60,
      muslimOutreach: 10,
      crossCultural: 50,
      partnershipPotential: 60,
    },
    reputation: "Small but deeply trusted reader base.",
    strengths: ["Literary credibility", "Niche depth"],
    risks: ["Wary of partnerships that smell transactional"],
    outreachAngle: "Long letter, not a pitch deck. Offer editorial support.",
    knownCollaborators: [],
    conferencesAttended: [],
    organizations: ["Common Hours"],
    warmPath: null,
    stage: "Dormant",
    tags: ["Theology", "Church Leadership", "High Trust Audience"],
    priority: "Low",
    internalNotes: "Re-engage in Q1 with literary angle only.",
    alignment: 58,
    trend: "stable",
    lastTouch: "2 months ago",
  },
  {
    id: "c_mensah",
    name: "Kojo Mensah",
    handle: "@kojomensah",
    title: "AI Researcher · Lay Apologist",
    organization: "Imago AI",
    country: "Ghana / UK",
    denomination: "Methodist",
    ministryFocus: "AI ethics from a Christian frame",
    audienceType: "Tech workers, students",
    avatarHue: 175,
    socials: {
      x: "x.com/kojomensah",
      newsletter: "imagoai.substack.com",
      youtube: "youtube.com/@kojomensah",
      website: "imagoai.org",
    },
    audienceSize: 71000,
    shortsEffectiveness: 60,
    engagementQuality: 89,
    livestreamFrequency: "Monthly",
    primaryFormats: ["Essay", "Talks", "Threads"],
    viralThemes: ["Alignment as theology", "Image of God in machines"],
    demographics: "70% male · 24–40 · UK/US/GH",
    tone: "Crisp, intellectually playful",
    scores: {
      apologeticsDepth: 78,
      evangelismOrientation: 50,
      aiOpenness: 99,
      genZRelevance: 72,
      missionsAlignment: 70,
      muslimOutreach: 45,
      crossCultural: 80,
      partnershipPotential: 86,
    },
    reputation: "Bridge between alignment researchers and the church.",
    strengths: ["AI fluency", "Calm intellect"],
    risks: ["Limited reach today — invest now while early"],
    outreachAngle: "Invite to lead our AI Insights advisory circle.",
    knownCollaborators: ["Marcus Thorne", "Joon Park"],
    conferencesAttended: ["EAG London", "Dallas Digital Summit 2024"],
    organizations: ["Imago AI"],
    warmPath: "Met at EAG London — Dave L.",
    stage: "Active Partnership",
    tags: ["AI-Friendly", "Apologetics", "Theology", "Strategic Partner"],
    priority: "High",
    internalNotes: "Already advising informally. Formalize Q4.",
    alignment: 94,
    trend: "rising",
    lastTouch: "yesterday",
  },
  {
    id: "c_alvarez",
    name: "Pedro Alvarez",
    handle: "@pedroalvarez",
    title: "Missionary · Storyteller",
    organization: "Frontiers Latam",
    country: "Spain",
    denomination: "Evangelical",
    ministryFocus: "North Africa field stories",
    audienceType: "Sending churches, supporters",
    avatarHue: 50,
    socials: {
      youtube: "youtube.com/@pedroalvarez",
      newsletter: "fieldnotes.substack.com",
      podcast: "Field Notes",
    },
    audienceSize: 38000,
    shortsEffectiveness: 55,
    engagementQuality: 80,
    livestreamFrequency: "Quarterly",
    primaryFormats: ["Documentary shorts", "Long-form podcast"],
    viralThemes: ["Underground house churches", "Cost of discipleship"],
    demographics: "60% male · 30–60 · ES/US",
    tone: "Measured, weighty",
    scores: {
      apologeticsDepth: 55,
      evangelismOrientation: 95,
      aiOpenness: 40,
      genZRelevance: 35,
      missionsAlignment: 98,
      muslimOutreach: 92,
      crossCultural: 95,
      partnershipPotential: 80,
    },
    reputation: "Quiet credibility; speaks truth field workers trust.",
    strengths: ["Field credibility", "Operational security awareness"],
    risks: ["Cannot publicly tag certain regions"],
    outreachAngle: "Offer secure distribution + animation budget for field stories.",
    knownCollaborators: ["Sana Khan"],
    conferencesAttended: ["Frontiers Gathering"],
    organizations: ["Frontiers", "Frontiers Latam"],
    warmPath: "Through Sana Khan.",
    stage: "Strategic Ally",
    tags: ["Missions", "Muslim Outreach", "Digital Missionary", "Strategic Partner"],
    priority: "High",
    internalNotes: "Never mention specific cities publicly.",
    alignment: 90,
    trend: "stable",
    lastTouch: "1 week ago",
  },
  {
    id: "c_huang",
    name: "Grace Huang",
    handle: "@gracehuang",
    title: "Bible Teacher · TikTok",
    organization: "Independent",
    country: "Taiwan / US",
    denomination: "Baptist",
    ministryFocus: "Bible literacy for Gen Z",
    audienceType: "Asian-American Gen Z",
    avatarHue: 350,
    socials: {
      tiktok: "tiktok.com/@gracehuang",
      instagram: "instagram.com/gracehuang",
      youtube: "youtube.com/@gracehuang",
    },
    audienceSize: 480000,
    shortsEffectiveness: 94,
    engagementQuality: 83,
    livestreamFrequency: "Monthly",
    primaryFormats: ["Shorts", "Live Q&A"],
    viralThemes: ["Bible-in-60s", "OT misreadings"],
    demographics: "62% female · 16–24 · US/TW/SG",
    tone: "Bright, generous, kid-sister energy",
    scores: {
      apologeticsDepth: 65,
      evangelismOrientation: 80,
      aiOpenness: 70,
      genZRelevance: 96,
      missionsAlignment: 78,
      muslimOutreach: 30,
      crossCultural: 80,
      partnershipPotential: 88,
    },
    reputation: "One of the most-watched Christian Gen Z creators worldwide.",
    strengths: ["Discoverability machine", "Wins skeptical scrollers"],
    risks: ["Brand-saturated; needs respectful, low-touch approach"],
    outreachAngle: "Offer research desk + scripting collaboration, no brand asks.",
    knownCollaborators: ["Camila Rivera"],
    conferencesAttended: ["Asbury Awakening Recap 2024"],
    organizations: [],
    warmPath: null,
    stage: "Identified",
    tags: ["Gen Z", "Shorts Creator", "Evangelism", "Emerging Creator"],
    priority: "High",
    internalNotes: "Saved view: 'Gen Z reach > 400k'.",
    alignment: 87,
    trend: "rising",
    lastTouch: "—",
  },
];

export const organizations: Organization[] = [
  { id: "o_logos", name: "Daily Logos Media", type: "Podcast Network", region: "US/UK", creatorCount: 4, focus: "Scholarly apologetics", partnership: "Exploring" },
  { id: "o_open", name: "Open Table", type: "Dialogue Ministry", region: "Global", creatorCount: 3, focus: "Muslim outreach", partnership: "Active" },
  { id: "o_frontiers", name: "Frontiers", type: "Missions Agency", region: "MENA", creatorCount: 8, focus: "Field missions", partnership: "Active" },
  { id: "o_logosnet", name: "The Logos Network", type: "Creator Collective", region: "UK", creatorCount: 12, focus: "Apologetics shorts", partnership: "Exploring" },
  { id: "o_imago", name: "Imago AI", type: "Research Lab", region: "UK/Ghana", creatorCount: 2, focus: "AI ethics", partnership: "Active" },
  { id: "o_lagos", name: "Lagos Logos Collective", type: "Creator Collective", region: "Nigeria", creatorCount: 5, focus: "African apologetics", partnership: "Aware" },
  { id: "o_sola", name: "Sola Forum", type: "Debate Platform", region: "South Korea", creatorCount: 3, focus: "Public debate", partnership: "Exploring" },
  { id: "o_common", name: "Common Hours", type: "Publication", region: "US", creatorCount: 1, focus: "Liturgical formation", partnership: "Aware" },
];

export const opportunities: Opportunity[] = [
  { id: "op1", title: "AI Consciousness — Shorts Series (6 eps)", type: "Shorts", creatorIds: ["c_thorne", "c_mensah"], status: "Proposed", strategicValue: 92, estimatedImpact: "2–4M impressions", nextAction: "Send treatment by Friday", platform: "YouTube Shorts + TikTok", notes: "Thorne wants research access; Mensah will co-write." },
  { id: "op2", title: "Open Table × Lagos Logos Live Debate", type: "Debate", creatorIds: ["c_khan", "c_okoro"], status: "Confirmed", strategicValue: 95, estimatedImpact: "500k live viewers", nextAction: "Confirm security protocol", platform: "YouTube Live", notes: "Date: Nov 14. Topic: Trinity for Muslims & Africans." },
  { id: "op3", title: "Daily Logos × Digital Missions 4-parter", type: "Podcast", creatorIds: ["c_vance"], status: "Idea", strategicValue: 78, estimatedImpact: "200k listens", nextAction: "Draft pitch one-pager", platform: "Podcast", notes: "Use Tyndale connection for warm intro." },
  { id: "op4", title: "Latam Gen Z Anxiety Campaign", type: "Campaign", creatorIds: ["c_rivera", "c_huang"], status: "Idea", strategicValue: 70, estimatedImpact: "Brand lift in Latam", nextAction: "Identify lead producer", platform: "TikTok / Reels", notes: "Coordinate with Latam team." },
  { id: "op5", title: "AI Ethics Debate · Seoul → London", type: "Debate", creatorIds: ["c_park", "c_mensah", "c_thorne"], status: "In Production", strategicValue: 88, estimatedImpact: "1M long-tail", nextAction: "Lock venue", platform: "Hybrid", notes: "Park to moderate." },
  { id: "op6", title: "Frontiers Field Notes — Animated Series", type: "Missions", creatorIds: ["c_alvarez"], status: "Confirmed", strategicValue: 86, estimatedImpact: "Sending-church mobilization", nextAction: "Animation studio onboarded", platform: "YouTube + private channels", notes: "Region-redaction protocol applies." },
  { id: "op7", title: "Quiet Hours — Sabbath Essay Collaboration", type: "Education", creatorIds: ["c_brooks"], status: "Idea", strategicValue: 45, estimatedImpact: "Niche trust building", nextAction: "Hand-written letter draft", platform: "Substack", notes: "Q1 only." },
];

export const events: ConferenceEvent[] = [
  { id: "e1", name: "Global Digital Summit", date: "2025-10-12", location: "Dallas, TX", type: "Conference", targetCreatorIds: ["c_thorne", "c_khan", "c_huang", "c_mensah"], attendeeIds: ["c_thorne", "c_khan", "c_mensah"], notes: "Dave + Sarah hosting suite night 2." },
  { id: "e2", name: "Apologetics UK Meetup", date: "2025-11-04", location: "London, UK", type: "Meetup", targetCreatorIds: ["c_thorne", "c_mensah", "c_vance"], attendeeIds: ["c_thorne", "c_mensah"], notes: "Hybrid; Mensah on AI ethics panel." },
  { id: "e3", name: "Frontiers Gathering", date: "2025-12-02", location: "Madrid, ES", type: "Missions Gathering", targetCreatorIds: ["c_alvarez", "c_khan"], attendeeIds: ["c_alvarez", "c_khan"], notes: "Closed-door. Field worker briefing." },
  { id: "e4", name: "Seoul Apologetics 2026", date: "2026-03-18", location: "Seoul, KR", type: "Conference", targetCreatorIds: ["c_park", "c_mensah"], attendeeIds: ["c_park"], notes: "Joon Park keynote." },
  { id: "e5", name: "Asbury Awakening Recap", date: "2025-09-22", location: "Wilmore, KY", type: "Ministry Gathering", targetCreatorIds: ["c_huang", "c_brooks"], attendeeIds: [], notes: "Watch list — no team attending." },
];

export const activity: ActivityItem[] = [
  { id: "a1", ts: "10m ago", actor: "Sarah J.", kind: "note", creatorId: "c_khan", message: "Added note about Q4 debate security protocol." },
  { id: "a2", ts: "2h ago", actor: "AI Signal", kind: "ai", creatorId: "c_thorne", message: "Detected viral short — 1.2M views in 18h." },
  { id: "a3", ts: "5h ago", actor: "Dave L.", kind: "stage", creatorId: "c_okoro", message: "Moved to Initial Contact." },
  { id: "a4", ts: "yesterday", actor: "Sarah J.", kind: "outreach", creatorId: "c_vance", message: "Drafted pitch one-pager for Daily Logos collab." },
  { id: "a5", ts: "yesterday", actor: "Dave L.", kind: "tag", creatorId: "c_huang", message: "Tagged with Strategic Partner watchlist." },
  { id: "a6", ts: "2 days ago", actor: "AI Signal", kind: "ai", creatorId: "c_rivera", message: "Predicts 30% audience growth next 60 days." },
  { id: "a7", ts: "3 days ago", actor: "Dave L.", kind: "event", creatorId: "c_mensah", message: "RSVP confirmed for Apologetics UK Meetup." },
  { id: "a8", ts: "4 days ago", actor: "Sarah J.", kind: "signal", creatorId: "c_alvarez", message: "Field-notes episode performing 3× baseline." },
];

export const timeline: TimelineEvent[] = [
  { id: "t1", date: "2025-10-08", creatorId: "c_khan", kind: "meeting", title: "Zoom strategy call", detail: "Reviewed Q4 debate scope and security." },
  { id: "t2", date: "2025-10-05", creatorId: "c_thorne", kind: "milestone", title: "Viral Short", detail: "1.2M views on AI consciousness clip." },
  { id: "t3", date: "2025-10-01", creatorId: "c_mensah", kind: "collab", title: "Advisory call", detail: "Outlined AI Insights advisory circle." },
  { id: "t4", date: "2025-09-28", creatorId: "c_vance", kind: "email", title: "Outbound", detail: "Sent intro email via Tyndale contact." },
  { id: "t5", date: "2025-09-22", creatorId: "c_huang", kind: "podcast", title: "Featured on guest pod", detail: "10-min segment on Bible literacy." },
  { id: "t6", date: "2025-09-18", creatorId: "c_okoro", kind: "conference", title: "Lagos Apologetics 2025", detail: "Keynote — 4k attendees." },
  { id: "t7", date: "2025-09-10", creatorId: "c_alvarez", kind: "ai", title: "AI summary", detail: "Field-notes content engagement up 3×." },
];

export const insights: AIInsight[] = [
  { id: "i1", kind: "Partnership", title: "Pair Thorne + Mensah on AI series", body: "Audience overlap 38% with low cannibalization; both already cite each other. Window opens in November.", confidence: 92, creatorIds: ["c_thorne", "c_mensah"] },
  { id: "i2", kind: "Audience Overlap", title: "Khan ↔ Alvarez share Muslim-context donors", body: "62% follower overlap among Frontiers-aligned supporters. Co-fundraising opportunity.", confidence: 81, creatorIds: ["c_khan", "c_alvarez"] },
  { id: "i3", kind: "Trend", title: "#AIandFaith volume up 42% MoM", body: "Top voices: Thorne, Mensah, Park. Recommend Shorts series within 30 days while attention is fresh.", confidence: 88, creatorIds: ["c_thorne", "c_mensah", "c_park"] },
  { id: "i4", kind: "Similarity", title: "Huang resembles early Khan trajectory", body: "Format mix, growth slope, and engagement curve match Khan circa 2022. Begin warm relationship now.", confidence: 76, creatorIds: ["c_huang", "c_khan"] },
  { id: "i5", kind: "Content Opportunity", title: "Sabbath theme has untapped Gen Z lane", body: "Brooks owns the niche but doesn't reach Gen Z. A Brooks × Rivera essay-to-Shorts adaptation is high upside.", confidence: 68, creatorIds: ["c_brooks", "c_rivera"] },
  { id: "i6", kind: "Trend", title: "Korean deconstruction wave starting", body: "Park is positioned early. Recommend regional content sponsorship before Q1.", confidence: 72, creatorIds: ["c_park"] },
];

// helpers
export const getCreator = (id: string) => creators.find(c => c.id === id);
export const formatAudience = (n: number) =>
  n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1_000 ? `${(n / 1_000).toFixed(0)}k` : `${n}`;
