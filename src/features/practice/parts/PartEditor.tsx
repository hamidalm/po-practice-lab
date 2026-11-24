import type { Part } from '../../../engine/types';
import TextPartEditor from './TextPartEditor';
import NumberPartEditor from './NumberPartEditor';
import ChoicePartEditor from './ChoicePartEditor';
import RankPartEditor from './RankPartEditor';
import SelectPartEditor from './SelectPartEditor';
import MatchPartEditor from './MatchPartEditor';
import StoriesPartEditor from './StoriesPartEditor';

export default function PartEditor({ part, value, onChange, yourCapacity }: { part: Part; value: unknown; onChange: (v: unknown) => void; yourCapacity?: number }) {
  switch (part.kind) {
    case 'text': return <TextPartEditor part={part} value={value} onChange={onChange} />;
    case 'number': return <NumberPartEditor part={part} value={value} onChange={onChange} />;
    case 'choice': return <ChoicePartEditor part={part} value={value} onChange={onChange} />;
    case 'rank': return <RankPartEditor part={part} value={value} onChange={onChange} />;
    case 'select': return <SelectPartEditor part={part} value={value} onChange={onChange} yourCapacity={yourCapacity} />;
    case 'match': return <MatchPartEditor part={part} value={value} onChange={onChange} />;
    case 'stories': return <StoriesPartEditor part={part} value={value} onChange={onChange} />;
  }
}
