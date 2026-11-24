import type { AcceptanceCriterion } from '../db/types';

export type Track = 'A' | 'B';

export interface DataTable {
  title: string;
  columns: string[];
  rows: (string | number)[][];
  note?: string;
}

interface PartBase {
  id: string;
  label: string;
  prompt: string;
}

export type TextCheck = 'metric' | 'vague' | 'questions';

export interface TextPart extends PartBase {
  kind: 'text';
  placeholder?: string;
  rows?: number;
  minWords?: number;
  checks?: TextCheck[];
}

export interface NumberPart extends PartBase {
  kind: 'number';
  unit?: string;
  answer: number;
  tolerance: number;
  explanation: string;
}

export interface ChoicePart extends PartBase {
  kind: 'choice';
  multi: boolean;
  options: { id: string; label: string; feedback: string }[];
  correct: string[];
}

export interface RankPart extends PartBase {
  kind: 'rank';
  items: { id: string; label: string; detail?: string }[];
  expectedOrder: string[];
  /** ids that must be in the top positions (e.g. legal must-dos) */
  mustTop?: string[];
  explanation: string;
}

export interface SelectPart extends PartBase {
  kind: 'select';
  items: { id: string; label: string; points: number; detail?: string }[];
  capacity: number;
  mustInclude: { id: string; reason: string }[];
  mustExclude: { id: string; reason: string }[];
}

export interface MatchPart extends PartBase {
  kind: 'match';
  rows: { id: string; label: string }[];
  options: { id: string; label: string }[];
  answers: Record<string, string>;
  explanations: Record<string, string>;
}

export interface StoriesPart extends PartBase {
  kind: 'stories';
  minStories: number;
  maxStories: number;
  minAcPerStory: number;
  requireEstimate?: boolean;
}

export type Part = TextPart | NumberPart | ChoicePart | RankPart | SelectPart | MatchPart | StoriesPart;

export interface Keypoint {
  id: string;
  label: string;
  part: string;
  /** covered when the answer contains any of these phrases (case-insensitive) */
  anyOf: string[];
}

export interface RubricCriterion {
  id: string;
  criterion: string;
  weight: number;
  full: string;
  partial: string;
}

export interface Scenario {
  id: string;
  track: Track;
  title: string;
  difficulty: 1 | 2 | 3;
  lessonId: string;
  skills: string[];
  from?: { name: string; role: string };
  context: string;
  data: DataTable[];
  task: string;
  constraints: string[];
  parts: Part[];
  keypoints: Keypoint[];
  rubric: RubricCriterion[];
  hints: [string, string, string];
  modelAnswer: string;
  commonMistakes: string[];
}

export interface StoryDraft {
  id: string;
  title: string;
  asA: string;
  iWant: string;
  soThat: string;
  points: number | null;
  acs: AcceptanceCriterion[];
}

export type Answers = Record<string, unknown>;

export type FindingLevel = 'ok' | 'warn' | 'error';
export interface Finding {
  level: FindingLevel;
  text: string;
}
