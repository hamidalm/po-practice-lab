import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { moveItem } from '../../../lib/rank';
import type { RankPart } from '../../../engine/types';

export default function RankPartEditor({ part, value, onChange }: { part: RankPart; value: unknown; onChange: (v: string[]) => void }) {
  const order = Array.isArray(value) && value.length ? (value as string[]) : part.items.map((i) => i.id);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
  const move = (from: number, to: number) => onChange(moveItem(order, from, to));
  function onDragEnd(e: DragEndEvent) {
    if (!e.over || e.active.id === e.over.id) return;
    move(order.indexOf(String(e.active.id)), order.indexOf(String(e.over.id)));
  }
  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={order} strategy={verticalListSortingStrategy}>
        <ol className="space-y-1">
          {order.map((id, i) => (
            <Row key={id} id={id} index={i} label={part.items.find((x) => x.id === id)?.label ?? id} detail={part.items.find((x) => x.id === id)?.detail}
              onUp={() => move(i, i - 1)} onDown={() => move(i, i + 1)} first={i === 0} last={i === order.length - 1} />
          ))}
        </ol>
      </SortableContext>
    </DndContext>
  );
}

function Row(p: { id: string; index: number; label: string; detail?: string; onUp: () => void; onDown: () => void; first: boolean; last: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: p.id });
  return (
    <li ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex items-center gap-2 rounded border border-ink-300/60 bg-white px-2 py-1.5 text-sm ${isDragging ? 'relative z-10 shadow-lg' : ''}`}>
      <span {...attributes} {...listeners} className="cursor-grab select-none px-1 text-ink-300" title="Drag to reorder">⠿</span>
      <span className="w-6 font-semibold text-ink-500">{p.index + 1}.</span>
      <span className="flex-1">{p.label}{p.detail && <span className="ml-2 text-xs text-ink-500">{p.detail}</span>}</span>
      <button className="btn-subtle px-1.5 py-0" disabled={p.first} onClick={p.onUp} aria-label="Move up">↑</button>
      <button className="btn-subtle px-1.5 py-0" disabled={p.last} onClick={p.onDown} aria-label="Move down">↓</button>
    </li>
  );
}
