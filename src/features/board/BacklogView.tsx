import { useState } from 'react';
import {
  DndContext, PointerSensor, KeyboardSensor, closestCenter, useDroppable, useSensor, useSensors, type DragEndEvent,
} from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useBoardData } from './useBoardData';
import { useUi } from '../../app/uiStore';
import { createSprint, saveOrder, updateSprint } from '../../db/actions';
import { moveBetween, sumPoints } from '../../lib/rank';
import { EpicChip, Points, PriorityIcon, StatusPill, TypeIcon, formatDate } from '../../components/ui';
import type { Issue, Sprint } from '../../db/types';

const BACKLOG = 'backlog';
const containerKey = (sprintId: string | null) => sprintId ?? BACKLOG;

export default function BacklogView() {
  const data = useBoardData();
  const [epicFilter, setEpicFilter] = useState<string>('all');
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  if (!data) return null;
  const { issues, sprints, epicOf, epics } = data;

  const openSprints = sprints
    .filter((s) => s.state !== 'closed')
    .sort((a, b) => (a.state === 'active' ? -1 : b.state === 'active' ? 1 : a.startDate.localeCompare(b.startDate)));

  const matchesFilter = (i: Issue) =>
    epicFilter === 'all' || (epicFilter === 'none' ? !epicOf.has(i.id) : epicOf.get(i.id)?.id === epicFilter);

  const listFor = (sprintId: string | null) =>
    issues.filter((i) => i.type !== 'epic' && i.sprintId === sprintId).sort((a, b) => a.rank - b.rank);

  const containers: { key: string; sprintId: string | null }[] = [
    ...openSprints.map((s) => ({ key: s.id, sprintId: s.id })),
    { key: BACKLOG, sprintId: null },
  ];
  const filtering = epicFilter !== 'all';

  function onDragEnd(e: DragEndEvent) {
    if (!e.over || filtering) return;
    const activeId = String(e.active.id);
    const overId = String(e.over.id);
    const active = data!.byId.get(activeId);
    if (!active) return;
    const fromKey = containerKey(active.sprintId);
    const overIssue = data!.byId.get(overId);
    const toKey = overId.startsWith('container:') ? overId.slice(10) : overIssue ? containerKey(overIssue.sprintId) : null;
    if (!toKey) return;
    const toSprintId = toKey === BACKLOG ? null : toKey;
    const source = listFor(active.sprintId).map((i) => i.id);
    const target = listFor(toSprintId).map((i) => i.id);
    const overIndex = overIssue ? target.indexOf(overIssue.id) : -1;
    if (overId === activeId) return;
    const result = moveBetween(source, target, activeId, overIndex, fromKey === toKey);
    saveOrder(toSprintId, result.target);
    if (fromKey !== toKey) saveOrder(active.sprintId, result.source);
  }

  return (
    <div className="p-6">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <h1 className="mr-4 text-2xl font-semibold">Backlog</h1>
        <label className="text-sm text-ink-700">
          Epic{' '}
          <select className="input inline-block w-auto" value={epicFilter} onChange={(e) => setEpicFilter(e.target.value)}>
            <option value="all">All epics</option>
            {epics.map((e) => <option key={e.id} value={e.id}>{e.key} {e.title}</option>)}
            <option value="none">No epic</option>
          </select>
        </label>
        {filtering && <span className="text-xs text-ink-500">Clear the filter to drag and reorder.</span>}
        <button className="btn-subtle ml-auto" onClick={() => createSprint()}>+ Create sprint</button>
      </div>

      <EpicStrip epics={epics} issues={issues} epicOf={epicOf} />

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        {containers.map((c) => {
          const sprint = openSprints.find((s) => s.id === c.sprintId);
          const all = listFor(c.sprintId);
          const visible = all.filter(matchesFilter);
          return (
            <Section key={c.key} id={c.key} sprint={sprint} all={all} visible={visible} epicOf={epicOf} disabled={filtering} />
          );
        })}
      </DndContext>
    </div>
  );
}

function EpicStrip({ epics, issues, epicOf }: { epics: Issue[]; issues: Issue[]; epicOf: Map<string, Issue> }) {
  const { openIssue, openCreate } = useUi();
  return (
    <div className="mb-6 flex flex-wrap gap-2">
      {epics.map((e) => {
        const children = issues.filter((i) => epicOf.get(i.id)?.id === e.id);
        const done = children.filter((i) => i.status === 'done').length;
        return (
          <button key={e.id} onClick={() => openIssue(e.id)} className="card w-56 p-2 text-left hover:border-purple-400">
            <div className="flex items-center gap-1.5 text-xs text-ink-500"><TypeIcon type="epic" />{e.key}</div>
            <div className="truncate text-sm font-medium">{e.title}</div>
            <div className="mt-1 h-1.5 rounded bg-ink-100">
              <div className="h-1.5 rounded bg-green-500" style={{ width: `${children.length ? (done / children.length) * 100 : 0}%` }} />
            </div>
            <div className="mt-0.5 text-[11px] text-ink-500">{done}/{children.length} done</div>
          </button>
        );
      })}
      <button className="btn-subtle h-auto border border-dashed border-ink-300" onClick={() => openCreate({ type: 'epic' })}>+ Epic</button>
    </div>
  );
}

function Section(props: { id: string; sprint?: Sprint; all: Issue[]; visible: Issue[]; epicOf: Map<string, Issue>; disabled: boolean }) {
  const { id, sprint, all, visible, epicOf, disabled } = props;
  const { setNodeRef, isOver } = useDroppable({ id: `container:${id}` });
  const { openCreate } = useUi();
  const points = sumPoints(all);
  const over = sprint && points > sprint.capacityPoints;

  return (
    <section className="mb-6">
      <div className="mb-1 flex flex-wrap items-center gap-3">
        <h2 className="font-semibold">{sprint ? sprint.name : 'Product backlog'}</h2>
        {sprint && (
          <>
            <span className="text-xs text-ink-500">{formatDate(sprint.startDate)} – {formatDate(sprint.endDate)}</span>
            {sprint.state === 'active' && <span className="rounded bg-green-100 px-1.5 text-[11px] font-semibold uppercase text-green-800">Active</span>}
            <span className={`text-xs ${over ? 'font-semibold text-red-700' : 'text-ink-500'}`}>
              {points} / {sprint.capacityPoints} pts{over ? ' – over capacity' : ''}
            </span>
            <label className="text-xs text-ink-500">
              Capacity{' '}
              <input type="number" min={0} className="input inline-block w-16 py-0.5" value={sprint.capacityPoints}
                onChange={(e) => updateSprint(sprint.id, { capacityPoints: Number(e.target.value) || 0 })} />
            </label>
          </>
        )}
        {!sprint && <span className="text-xs text-ink-500">{all.length} issues · {points} pts</span>}
      </div>
      {sprint && (
        <input className="input mb-2 border-transparent bg-transparent px-0 text-sm text-ink-700 hover:border-ink-300"
          placeholder="Add a sprint goal…" defaultValue={sprint.goal} key={sprint.id + sprint.goal}
          onBlur={(e) => e.target.value !== sprint.goal && updateSprint(sprint.id, { goal: e.target.value })} />
      )}
      <div ref={setNodeRef} className={`min-h-[3rem] rounded border ${isOver ? 'border-brand-500 bg-brand-50/50' : 'border-ink-300/60'} bg-ink-100/40`}>
        <SortableContext items={visible.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          {visible.map((i) => <Row key={i.id} issue={i} epic={epicOf.get(i.id)} disabled={disabled} />)}
        </SortableContext>
        {visible.length === 0 && <p className="p-3 text-sm text-ink-500">Drag issues here.</p>}
      </div>
      <button className="btn-subtle mt-1 text-xs" onClick={() => openCreate({ type: 'story', sprintId: sprint?.id ?? null })}>+ Create issue</button>
    </section>
  );
}

function Row({ issue, epic, disabled }: { issue: Issue; epic?: Issue; disabled: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: issue.id, disabled });
  const { openIssue } = useUi();
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex items-center gap-2 border-b border-ink-300/40 bg-white px-2 py-1.5 text-sm last:border-b-0 ${isDragging ? 'relative z-10 opacity-70 shadow-lg' : ''}`}
    >
      <span {...attributes} {...listeners} className={`select-none px-1 text-ink-300 ${disabled ? 'cursor-not-allowed' : 'cursor-grab'}`} title="Drag to reorder">⠿</span>
      <TypeIcon type={issue.type} />
      <button className="min-w-0 flex-1 truncate text-left hover:text-brand-600" onClick={() => openIssue(issue.id)}>
        <span className="mr-2 text-ink-500">{issue.key}</span>{issue.title}
      </button>
      {epic && <EpicChip title={epic.title} />}
      <StatusPill status={issue.status} />
      <Points value={issue.storyPoints} />
      <PriorityIcon priority={issue.priority} />
    </div>
  );
}
