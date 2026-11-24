import { useState } from 'react';
import { lintStories, lintStory } from '../../../engine/checks';
import type { StoriesPart, StoryDraft } from '../../../engine/types';
import { newId } from '../../../lib/id';
import { createIssue } from '../../../db/actions';
import { STORY_POINTS } from '../../../db/constants';
import Findings from '../../../components/Findings';

const emptyStory = (): StoryDraft => ({ id: newId(), title: '', asA: '', iWant: '', soThat: '', points: null, acs: [{ id: newId(), given: '', when: '', then: '' }] });

export default function StoriesPartEditor({ part, value, onChange }: { part: StoriesPart; value: unknown; onChange: (v: StoryDraft[]) => void }) {
  const stories = Array.isArray(value) && value.length ? (value as StoryDraft[]) : [emptyStory()];
  const [sent, setSent] = useState<string | null>(null);
  const update = (id: string, patch: Partial<StoryDraft>) => onChange(stories.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  const listFindings = lintStories(part, stories);

  async function addToBacklog() {
    const ready = stories.filter((s) => s.title.trim());
    for (const s of ready) {
      await createIssue({
        type: 'story', title: s.title.trim(), storyPoints: s.points, labels: ['practice'],
        description: `As ${s.asA}, I want ${s.iWant}, so that ${s.soThat}.`,
        acceptanceCriteria: s.acs.map((a) => ({ ...a, id: newId() })),
      });
    }
    setSent(`${ready.length} stories added to the product backlog with the label "practice".`);
  }

  return (
    <div className="space-y-3">
      {stories.map((s, i) => (
        <StoryCard key={s.id} n={i + 1} story={s} part={part} onChange={(p) => update(s.id, p)}
          onRemove={stories.length > 1 ? () => onChange(stories.filter((x) => x.id !== s.id)) : undefined} />
      ))}
      <Findings items={listFindings} compact />
      <div className="flex flex-wrap items-center gap-2">
        <button className="btn-subtle border border-dashed border-ink-300" onClick={() => onChange([...stories, emptyStory()])}>+ Add story</button>
        <button className="btn-subtle ml-auto text-xs" onClick={addToBacklog} title="Creates real issues on your board">Copy stories to the backlog</button>
      </div>
      {sent && <p className="text-xs text-green-700">{sent}</p>}
    </div>
  );
}

function StoryCard({ n, story, part, onChange, onRemove }: { n: number; story: StoryDraft; part: StoriesPart; onChange: (p: Partial<StoryDraft>) => void; onRemove?: () => void }) {
  const touched = story.title || story.asA || story.iWant || story.soThat;
  const findings = touched ? lintStory(story, part) : [];
  const setAc = (id: string, k: 'given' | 'when' | 'then', v: string) => onChange({ acs: story.acs.map((a) => (a.id === id ? { ...a, [k]: v } : a)) });
  return (
    <div className="card space-y-2 p-3">
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-ink-500">Story {n}</span>
        <input className="input flex-1 font-medium" placeholder="Short title" value={story.title} onChange={(e) => onChange({ title: e.target.value })} />
        <select className="input w-32" value={story.points ?? ''} onChange={(e) => onChange({ points: e.target.value ? Number(e.target.value) : null })}>
          <option value="">Points…</option>
          {STORY_POINTS.map((p) => <option key={p} value={p}>{p} pts</option>)}
        </select>
        {onRemove && <button className="btn-danger px-2 text-xs" onClick={onRemove}>Remove</button>}
      </div>
      {([['asA', 'As'], ['iWant', 'I want'], ['soThat', 'so that']] as const).map(([k, label]) => (
        <div key={k} className="flex items-center gap-2">
          <span className="w-16 text-right text-xs font-bold uppercase text-ink-500">{label}</span>
          <input className="input" value={story[k]} onChange={(e) => onChange({ [k]: e.target.value })}
            placeholder={k === 'asA' ? 'a guest shopper on mobile' : k === 'iWant' ? 'the need, not the button' : 'the benefit'} />
        </div>
      ))}
      <div className="space-y-1.5 pl-2">
        {story.acs.map((a, i) => (
          <div key={a.id} className="rounded bg-ink-100/60 p-2">
            <div className="mb-1 flex text-xs font-semibold text-ink-500">
              AC {i + 1}
              <button className="ml-auto text-red-700 hover:underline" onClick={() => onChange({ acs: story.acs.filter((x) => x.id !== a.id) })}>remove</button>
            </div>
            {(['given', 'when', 'then'] as const).map((k) => (
              <div key={k} className="mb-1 flex items-center gap-2">
                <span className="w-12 text-xs font-bold uppercase text-ink-500">{k}</span>
                <input className="input py-1" value={a[k]} onChange={(e) => setAc(a.id, k, e.target.value)} />
              </div>
            ))}
          </div>
        ))}
        <button className="btn-subtle text-xs" onClick={() => onChange({ acs: [...story.acs, { id: newId(), given: '', when: '', then: '' }] })}>+ Given / When / Then</button>
      </div>
      <Findings items={findings} compact />
    </div>
  );
}
