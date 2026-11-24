import { useState } from 'react';
import { useUi, type CreateDefaults } from '../../app/uiStore';
import { useBoardData } from './useBoardData';
import { createIssue } from '../../db/actions';
import { BRANDS, ISSUE_TYPES, PRIORITIES, STORY_POINTS } from '../../db/constants';
import { Modal } from '../../components/ui';
import type { BrandId, IssueType, Priority } from '../../db/types';

export default function CreateIssueModal() {
  const { createDefaults, closeCreate } = useUi();
  if (!createDefaults) return null;
  return <Form defaults={createDefaults} onClose={closeCreate} />;
}

function Form({ defaults, onClose }: { defaults: CreateDefaults; onClose: () => void }) {
  const data = useBoardData();
  const { openIssue } = useUi();
  const [type, setType] = useState<IssueType>(defaults.type ?? 'story');
  const [title, setTitle] = useState('');
  const [brand, setBrand] = useState<BrandId>(defaults.brand ?? 'group');
  const [priority, setPriority] = useState<Priority>('medium');
  const [points, setPoints] = useState<string>('');
  const [parentId, setParentId] = useState(defaults.parentId ?? '');
  const [sprintId, setSprintId] = useState(defaults.sprintId ?? '');

  const canHaveParent = type === 'story' || type === 'task' || type === 'bug';

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    const issue = await createIssue(
      { type, title: title.trim(), brand, priority, storyPoints: points ? Number(points) : null, sprintId: sprintId || null },
      canHaveParent && parentId ? parentId : undefined,
    );
    onClose();
    openIssue(issue.id);
  }

  return (
    <Modal title="Create issue" onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Type</label>
            <select className="input" value={type} onChange={(e) => setType(e.target.value as IssueType)}>
              {Object.entries(ISSUE_TYPES).map(([id, t]) => <option key={id} value={id}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Brand</label>
            <select className="input" value={brand} onChange={(e) => setBrand(e.target.value as BrandId)}>
              {Object.entries(BRANDS).map(([id, b]) => <option key={id} value={id}>{b.name}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="label">Summary</label>
          <input autoFocus className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Short, specific title" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Priority</label>
            <select className="input" value={priority} onChange={(e) => setPriority(e.target.value as Priority)}>
              {PRIORITIES.map((p) => <option key={p.id} value={p.id}>{p.arrow} {p.label}</option>)}
            </select>
          </div>
          {type !== 'epic' && (
            <div>
              <label className="label">Story points</label>
              <select className="input" value={points} onChange={(e) => setPoints(e.target.value)}>
                <option value="">Not estimated</option>
                {STORY_POINTS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          )}
        </div>
        {canHaveParent && (
          <div>
            <label className="label">Epic</label>
            <select className="input" value={parentId} onChange={(e) => setParentId(e.target.value)}>
              <option value="">None</option>
              {data?.epics.map((e) => <option key={e.id} value={e.id}>{e.key} {e.title}</option>)}
            </select>
          </div>
        )}
        {type !== 'epic' && (
          <div>
            <label className="label">Sprint</label>
            <select className="input" value={sprintId} onChange={(e) => setSprintId(e.target.value)}>
              <option value="">Backlog</option>
              {data?.sprints.filter((s) => s.state !== 'closed').map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        )}
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className="btn-subtle" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={!title.trim()}>Create</button>
        </div>
      </form>
    </Modal>
  );
}
