export type IssueType = 'epic' | 'story' | 'bug' | 'task' | 'test';
export type Status = 'todo' | 'inprogress' | 'inreview' | 'done';
export type Priority = 'highest' | 'high' | 'medium' | 'low' | 'lowest';
export type BrandId = 'group' | 'cc' | 'dp' | 'mp';
export type LinkType = 'parent' | 'tests' | 'blocks' | 'relates';
export type PageTemplate = 'prd' | 'decision-log' | 'release-notes' | 'meeting-notes' | 'blank';

export interface AcceptanceCriterion {
  id: string;
  given: string;
  when: string;
  then: string;
}

export interface Issue {
  id: string;
  key: string;
  type: IssueType;
  title: string;
  description: string;
  acceptanceCriteria: AcceptanceCriterion[];
  priority: Priority;
  storyPoints: number | null;
  status: Status;
  brand: BrandId;
  /** null = product backlog */
  sprintId: string | null;
  /** order within its container (sprint or backlog); lower = higher up */
  rank: number;
  labels: string[];
  createdAt: number;
  updatedAt: number;
}

/** Directional link. parent: epic -> child. tests: test case -> story/bug. blocks: from blocks to. */
export interface IssueLink {
  id: string;
  fromId: string;
  toId: string;
  type: LinkType;
  createdAt: number;
}

export interface Comment {
  id: string;
  issueId: string;
  author: string;
  body: string;
  createdAt: number;
}

export interface Sprint {
  id: string;
  name: string;
  goal: string;
  startDate: string; // ISO date
  endDate: string;
  capacityPoints: number;
  state: 'planned' | 'active' | 'closed';
}

export interface Page {
  id: string;
  title: string;
  template: PageTemplate;
  body: string; // markdown
  createdAt: number;
  updatedAt: number;
}

export interface InboxMessage {
  id: string;
  fromName: string;
  fromRole: string;
  subject: string;
  body: string;
  receivedAt: number;
  read: boolean;
  /** Filled in Phase 2 when messages trigger scenarios */
  linkedScenarioId: string | null;
}

export interface AppSettings {
  currency: 'EUR';
  dailyBudget: number;
  offlineMode: boolean;
}

export interface MetaRow {
  key: string;
  value: unknown;
}

export type AttemptStep = 'brief' | 'answer' | 'check' | 'compare';

export interface ScoreRecord {
  at: number;
  autoScore: number;
  selfScore: number;
  hintsUsed: number;
  /** rubric score from Claude's pasted review, if any */
  claudeScore?: number;
}

export interface ClaudeReview {
  at: number;
  scores: Record<string, number>;
  score: number;
}

/** One working attempt per scenario (id = scenario id), plus the history of completed runs. */
export interface Attempt {
  id: string;
  scenarioId: string;
  step: AttemptStep;
  answers: Record<string, unknown>;
  hintsUsed: number;
  selfRubric: Record<string, number>;
  checkedAt: number | null;
  startedAt: number;
  updatedAt: number;
  history: ScoreRecord[];
  claudeReview?: ClaudeReview | null;
}
