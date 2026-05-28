import { create } from "zustand";
import { persist } from "zustand/middleware";
import { nanoid } from "nanoid";
import {
  creators as seedCreators,
  opportunities as seedOpps,
  activity as seedActivity,
  timeline as seedTimeline,
  events as seedEvents,
  organizations as seedOrgs,
  insights as seedInsights,
  type Creator,
  type PipelineStage,
  type Tag,
} from "./mock-data";

export type CommunicationType =
  | "Email" | "Instagram DM" | "TikTok Comment" | "YouTube Comment"
  | "X DM" | "Phone Call" | "Zoom Call" | "In-Person Meeting"
  | "Conference Interaction" | "Podcast Inquiry" | "Other";

export type ResponseStatus =
  | "No response" | "Responded" | "Positive" | "Neutral" | "Declined" | "Follow-up needed";

export interface Communication {
  id: string;
  creatorId: string;
  date: string; // ISO date
  type: CommunicationType;
  direction: "outbound" | "inbound";
  contactedBy: string;
  summary: string;
  responseStatus: ResponseStatus;
  followUpNeeded: boolean;
  followUpDate?: string;
  linkOrAttachment?: string;
  internalNotes?: string;
  createdAt: string;
}

export type NoteCategory =
  | "General" | "Outreach" | "Theology" | "Relationship"
  | "Risk" | "Opportunity" | "Research" | "Conference";

export interface Note {
  id: string;
  creatorId: string;
  author: string;
  date: string;
  category: NoteCategory;
  text: string;
  pinned: boolean;
}

export type TaskPriority = "low" | "medium" | "high";
export type TaskStatus = "open" | "in progress" | "done" | "canceled";
export type TaskType =
  | "Follow up" | "Research" | "Prepare message" | "Ask for warm intro"
  | "Invite to podcast" | "Propose collaboration" | "Conference follow-up" | "Other";

export interface Task {
  id: string;
  creatorId?: string;
  title: string;
  description?: string;
  assignee?: string;
  dueDate?: string;
  priority: TaskPriority;
  status: TaskStatus;
  taskType: TaskType;
  createdAt: string;
}

export type OpportunityType =
  | "Podcast" | "Livestream" | "Shorts" | "Conference" | "Education"
  | "Translation" | "AI Demo" | "Debate" | "Campaign" | "Missions";

export type OpportunityStatus =
  | "Idea" | "Proposed" | "Confirmed" | "In Production" | "Live" | "Completed" | "Paused" | "Rejected";

export interface Opportunity {
  id: string;
  title: string;
  type: OpportunityType;
  creatorIds: string[];
  status: OpportunityStatus;
  strategicValue: number;
  estimatedImpact: string;
  nextAction: string;
  platform: string;
  notes: string;
}

export interface Activity {
  id: string;
  entityType: "creator" | "communication" | "note" | "task" | "opportunity";
  entityId: string;
  creatorId?: string;
  action: string;
  description: string;
  actor: string;
  createdAt: string; // ISO
}

export interface StoredCreator extends Omit<Creator, "stage" | "tags"> {
  stage: PipelineStage;
  tags: Tag[];
  archived?: boolean;
  createdAt: string;
  updatedAt: string;
}

interface State {
  creators: StoredCreator[];
  communications: Communication[];
  notes: Note[];
  tasks: Task[];
  opportunities: Opportunity[];
  activities: Activity[];
  events: typeof seedEvents;
  organizations: typeof seedOrgs;
  insights: typeof seedInsights;
  currentUser: string;

  addCreator: (c: Partial<StoredCreator> & Pick<StoredCreator, "name">) => StoredCreator;
  updateCreator: (id: string, patch: Partial<StoredCreator>) => void;
  archiveCreator: (id: string) => void;
  unarchiveCreator: (id: string) => void;
  deleteCreator: (id: string) => void;
  setStage: (id: string, stage: PipelineStage) => void;

  addCommunication: (c: Omit<Communication, "id" | "createdAt">) => void;
  addNote: (n: Omit<Note, "id">) => void;
  togglePinNote: (id: string) => void;
  deleteNote: (id: string) => void;

  addTask: (t: Omit<Task, "id" | "createdAt">) => void;
  updateTask: (id: string, patch: Partial<Task>) => void;
  deleteTask: (id: string) => void;

  addOpportunity: (o: Omit<Opportunity, "id">) => void;
  updateOpportunity: (id: string, patch: Partial<Opportunity>) => void;
  deleteOpportunity: (id: string) => void;
}

const now = () => new Date().toISOString();

const seededCreators: StoredCreator[] = seedCreators.map((c) => ({
  ...c,
  archived: false,
  createdAt: now(),
  updatedAt: now(),
}));

const seededOpps: Opportunity[] = seedOpps.map((o) => ({
  ...o,
  status: o.status as OpportunityStatus,
}));

const seededActivities: Activity[] = seedActivity.map((a) => ({
  id: a.id,
  entityType: "creator",
  entityId: a.creatorId || "",
  creatorId: a.creatorId,
  action: a.kind,
  description: a.message,
  actor: a.actor,
  createdAt: new Date(Date.now() - Math.random() * 7 * 86400000).toISOString(),
}));

const seededNotes: Note[] = seedTimeline.map((t) => ({
  id: t.id,
  creatorId: t.creatorId,
  author: "Seed",
  date: t.date,
  category: "General" as NoteCategory,
  text: `${t.title} — ${t.detail}`,
  pinned: false,
}));

const STORAGE_KEY = "signal-store-v1";

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      creators: seededCreators,
      communications: [],
      notes: seededNotes,
      tasks: [],
      opportunities: seededOpps,
      activities: seededActivities,
      events: seedEvents,
      organizations: seedOrgs,
      insights: seedInsights,
      currentUser: "You",

      addCreator: (c) => {
        const newCreator: StoredCreator = {
          id: `c_${nanoid(6)}`,
          name: c.name,
          handle: c.handle ?? "",
          title: c.title ?? "",
          organization: c.organization ?? "Independent",
          country: c.country ?? "",
          denomination: c.denomination ?? "",
          ministryFocus: c.ministryFocus ?? "",
          audienceType: c.audienceType ?? "",
          avatarHue: c.avatarHue ?? Math.floor(Math.random() * 360),
          socials: c.socials ?? {},
          audienceSize: c.audienceSize ?? 0,
          shortsEffectiveness: c.shortsEffectiveness ?? 50,
          engagementQuality: c.engagementQuality ?? 50,
          livestreamFrequency: c.livestreamFrequency ?? "—",
          primaryFormats: c.primaryFormats ?? [],
          viralThemes: c.viralThemes ?? [],
          demographics: c.demographics ?? "",
          tone: c.tone ?? "",
          scores: c.scores ?? {
            apologeticsDepth: 50, evangelismOrientation: 50, aiOpenness: 50,
            genZRelevance: 50, missionsAlignment: 50, muslimOutreach: 50,
            crossCultural: 50, partnershipPotential: 50,
          },
          reputation: c.reputation ?? "",
          strengths: c.strengths ?? [],
          risks: c.risks ?? [],
          outreachAngle: c.outreachAngle ?? "",
          knownCollaborators: c.knownCollaborators ?? [],
          conferencesAttended: c.conferencesAttended ?? [],
          organizations: c.organizations ?? [],
          warmPath: c.warmPath ?? null,
          stage: c.stage ?? "Identified",
          tags: c.tags ?? [],
          priority: c.priority ?? "Medium",
          internalNotes: c.internalNotes ?? "",
          alignment: c.alignment ?? 70,
          trend: c.trend ?? "stable",
          lastTouch: "—",
          archived: false,
          createdAt: now(),
          updatedAt: now(),
        };
        set((s) => ({ creators: [newCreator, ...s.creators] }));
        get()._log("creator", newCreator.id, "created", `Added ${newCreator.name}`, newCreator.id);
        return newCreator;
      },

      updateCreator: (id, patch) => {
        set((s) => ({
          creators: s.creators.map((c) =>
            c.id === id ? { ...c, ...patch, updatedAt: now() } : c
          ),
        }));
        const c = get().creators.find((x) => x.id === id);
        if (c) get()._log("creator", id, "updated", `Updated ${c.name}`, id);
      },

      archiveCreator: (id) => {
        get().updateCreator(id, { archived: true, stage: "Archive" });
      },
      unarchiveCreator: (id) => {
        get().updateCreator(id, { archived: false, stage: "Identified" });
      },
      deleteCreator: (id) => {
        set((s) => ({
          creators: s.creators.filter((c) => c.id !== id),
          communications: s.communications.filter((x) => x.creatorId !== id),
          notes: s.notes.filter((x) => x.creatorId !== id),
          tasks: s.tasks.filter((x) => x.creatorId !== id),
        }));
      },
      setStage: (id, stage) => {
        const old = get().creators.find((c) => c.id === id);
        if (!old || old.stage === stage) return;
        get().updateCreator(id, { stage });
        get()._log("creator", id, "stage", `Moved ${old.name} → ${stage}`, id);
      },

      addCommunication: (c) => {
        const item: Communication = { ...c, id: `cm_${nanoid(6)}`, createdAt: now() };
        set((s) => ({ communications: [item, ...s.communications] }));
        const creator = get().creators.find((x) => x.id === c.creatorId);
        const label = new Date(c.date).toLocaleDateString();
        if (creator) {
          get().updateCreator(c.creatorId, { lastTouch: label });
          get()._log("communication", item.id, "logged",
            `${c.direction === "outbound" ? "→" : "←"} ${c.type} with ${creator.name}: ${c.summary.slice(0, 60)}`,
            c.creatorId);
        }
      },

      addNote: (n) => {
        const item: Note = { ...n, id: `n_${nanoid(6)}` };
        set((s) => ({ notes: [item, ...s.notes] }));
        const creator = get().creators.find((x) => x.id === n.creatorId);
        if (creator) {
          get()._log("note", item.id, "added",
            `Note on ${creator.name}: ${n.text.slice(0, 60)}`, n.creatorId);
        }
      },
      togglePinNote: (id) => set((s) => ({
        notes: s.notes.map((n) => n.id === id ? { ...n, pinned: !n.pinned } : n),
      })),
      deleteNote: (id) => set((s) => ({ notes: s.notes.filter((n) => n.id !== id) })),

      addTask: (t) => {
        const item: Task = { ...t, id: `t_${nanoid(6)}`, createdAt: now() };
        set((s) => ({ tasks: [item, ...s.tasks] }));
        get()._log("task", item.id, "created", `Task: ${t.title}`, t.creatorId);
      },
      updateTask: (id, patch) => {
        set((s) => ({ tasks: s.tasks.map((t) => t.id === id ? { ...t, ...patch } : t) }));
        if (patch.status === "done") {
          const t = get().tasks.find((x) => x.id === id);
          if (t) get()._log("task", id, "completed", `Completed: ${t.title}`, t.creatorId);
        }
      },
      deleteTask: (id) => set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),

      addOpportunity: (o) => {
        const item: Opportunity = { ...o, id: `op_${nanoid(6)}` };
        set((s) => ({ opportunities: [item, ...s.opportunities] }));
        get()._log("opportunity", item.id, "created",
          `Opportunity: ${o.title}`, o.creatorIds[0]);
      },
      updateOpportunity: (id, patch) => set((s) => ({
        opportunities: s.opportunities.map((o) => o.id === id ? { ...o, ...patch } : o),
      })),
      deleteOpportunity: (id) => set((s) => ({
        opportunities: s.opportunities.filter((o) => o.id !== id),
      })),

      // internal logger (typed loosely so we don't expose it on the State type)
      _log: (
        entityType: Activity["entityType"],
        entityId: string,
        action: string,
        description: string,
        creatorId?: string,
      ) => {
        const a: Activity = {
          id: `a_${nanoid(6)}`,
          entityType, entityId, action, description, creatorId,
          actor: get().currentUser,
          createdAt: now(),
        };
        set((s) => ({ activities: [a, ...s.activities].slice(0, 500) }));
      },
    } as State & { _log: (...args: unknown[]) => void }),
    {
      name: STORAGE_KEY,
      skipHydration: true,
    },
  ),
);

// helpers
export const formatRelative = (iso: string) => {
  const d = new Date(iso);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 7 * 86400) return `${Math.floor(diff / 86400)}d ago`;
  return d.toLocaleDateString();
};

export const formatDate = (iso: string) => {
  if (!iso) return "—";
  const d = new Date(iso);
  // Use UTC parts for SSR/client consistency
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${months[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
};
