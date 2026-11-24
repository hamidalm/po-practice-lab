import type { Scenario, Track } from '../engine/types';

const scenarioModules = import.meta.glob<Scenario>('./scenarios/*.json', { eager: true, import: 'default' });
const lessonModules = import.meta.glob<string>('./lessons/*.md', { eager: true, query: '?raw', import: 'default' });

export const SCENARIOS: Scenario[] = Object.values(scenarioModules).sort((a, b) => a.id.localeCompare(b.id));
export const getScenario = (id: string) => SCENARIOS.find((s) => s.id === id);

export const TRACKS: Record<Track, { name: string; short: string }> = {
  A: { name: 'Track A · Agile, Scrum and backlog management', short: 'Agile & backlog' },
  B: { name: 'Track B · PRDs, user stories and acceptance criteria', short: 'PRDs & stories' },
};

export interface Lesson {
  id: string;
  title: string;
  group: 'Foundations' | Track;
  order: number;
  body: string;
  /** the "In one minute" section, used as the concept card */
  conceptCard: string;
}

const LESSON_META: { id: string; group: Lesson['group'] }[] = [
  { id: 'scrum-basics', group: 'Foundations' },
  { id: 'refinement', group: 'A' },
  { id: 'sprint-planning', group: 'A' },
  { id: 'prioritisation', group: 'A' },
  { id: 'interruptions', group: 'A' },
  { id: 'releases', group: 'A' },
  { id: 'problem-framing', group: 'B' },
  { id: 'prd', group: 'B' },
  { id: 'stories-ac', group: 'B' },
  { id: 'analysis-tools', group: 'B' },
  { id: 'change-traceability', group: 'B' },
];

export function parseLesson(id: string, md: string) {
  const title = md.match(/^# (.+)$/m)?.[1]?.trim() ?? id;
  const card = md.match(/## In one minute\s*\n([\s\S]*?)(?=\n## |$)/)?.[1]?.trim() ?? '';
  const body = md.replace(/^# .+\n+/, '');
  return { title, conceptCard: card, body };
}

export const LESSONS: Lesson[] = LESSON_META.map((m, order) => {
  const md = lessonModules[`./lessons/${m.id}.md`] ?? '';
  return { id: m.id, group: m.group, order, ...parseLesson(m.id, md) };
});
export const getLesson = (id: string) => LESSONS.find((l) => l.id === id);
export const scenariosForLesson = (lessonId: string) => SCENARIOS.filter((s) => s.lessonId === lessonId);
