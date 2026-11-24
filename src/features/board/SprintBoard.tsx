import { DndContext, PointerSensor, useDraggable, useDroppable, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Link } from 'react-router-dom';
import { useBoardData } from './useBoardData';
import { useUi } from '../../app/uiStore';
import { updateIssue } from '../../db/actions';
import { STATUSES, BRANDS } from '../../db/constants';
import { sumPoints } from '../../lib/rank';
import { EpicChip, Points, PriorityIcon, TypeIcon, formatDate } from '../../components/ui';
import type { Issue, Status } from '../../db/types';

export default function SprintBoard() {
  const data = useBoardData();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  if (!data) return null;
  const sprint = data.sprints.find((s) => s.state === 'active');
  if (!sprint)
    return <div className="p-6">No active sprint. Plan one in the <Link className="text-brand-600 underline" to="/backlog">backlog</Link>.</div>;

  const items = data.issues.filter((i) => i.sprintId === sprint.id && i.type !== 'epic').sort((a, b) => a.rank - b.rank);
  const done = sumPoints(items.filter((i) => i.status === 'done'));
  const total = sumPoints(items);
  const daysLeft = Math.ceil((new Date(sprint.endDate + 'T23:59:59').getTime() - Date.now()) / 86_400_000);

  function onDragEnd(e: DragEndEvent) {
    if (!e.over) return;
    const status = String(e.over.id) as Status;
    const issue = data!.byId.get(String(e.active.id));
    if (issue && issue.status !== status) updateIssue(issue.id, { status });
  }

  return (
    <div className="flex h-full flex-col p-6">
      <div className="mb-4">
        <div className="flex flex-wrap items-baseline gap-3">
          <h1 className="text-2xl font-semibold">{sprint.name}</h1>
          <span className="text-sm text-ink-500">{formatDate(sprint.startDate)} – {formatDate(sprint.endDate)} · {daysLeft >= 0 ? `${daysLeft} days left` : 'ended'}</span>
          <span className="text-sm text-ink-500">{done} / {total} pts done · capacity {sprint.capacityPoints}</span>
        </div>
        {sprint.goal && <p className="mt-1 text-sm text-ink-700"><span className="font-semibold">Goal:</span> {sprint.goal}</p>}
      </div>
      <DndContext sensors={sensors} onDragEnd={onDragEnd}>
        <div className="grid min-h-0 flex-1 grid-cols-4 gap-3">
          {STATUSES.map((s) => (
            <Column key={s.id} id={s.id} label={s.label} items={items.filter((i) => i.status === s.id)} epicOf={data.epicOf} />
          ))}
        </div>
      </DndContext>
    </div>
  );
}

function Column({ id, label, items, epicOf }: { id: Status; label: string; items: Issue[]; epicOf: Map<string, Issue> }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div ref={setNodeRef} className={`flex flex-col rounded p-2 ${isOver ? 'bg-brand-50' : 'bg-ink-100'}`}>
      <h3 className="mb-2 px-1 text-xs font-semibold uppercase text-ink-500">{label} <span className="ml-1">{items.length}</span></h3>
      <div className="flex flex-1 flex-col gap-2 overflow-auto">
        {items.map((i) => <Card key={i.id} issue={i} epic={epicOf.get(i.id)} />)}
      </div>
    </div>
  );
}

function Card({ issue, epic }: { issue: Issue; epic?: Issue }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: issue.id });
  const { openIssue } = useUi();
  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onClick={() => openIssue(issue.id)}
      style={{ transform: CSS.Translate.toString(transform) }}
      className={`card cursor-grab p-2 text-sm hover:bg-ink-100/40 ${isDragging ? 'z-10 opacity-80 shadow-lg' : ''}`}
    >
      <p className="mb-2">{issue.title}</p>
      {epic && <div className="mb-2 flex min-w-0"><EpicChip title={epic.title} /></div>}
      <div className="flex items-center gap-1.5 text-xs text-ink-500">
        <TypeIcon type={issue.type} />
        <span className="whitespace-nowrap">{issue.key}</span>
        <span className="min-w-0 truncate">· {BRANDS[issue.brand].name}</span>
        <span className="ml-auto flex shrink-0 items-center gap-1"><PriorityIcon priority={issue.priority} /><Points value={issue.storyPoints} /></span>
      </div>
    </div>
  );
}
