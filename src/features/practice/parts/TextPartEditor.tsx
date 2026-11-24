import { lintText } from '../../../engine/checks';
import type { TextPart } from '../../../engine/types';
import Findings from '../../../components/Findings';

export default function TextPartEditor({ part, value, onChange }: { part: TextPart; value: unknown; onChange: (v: string) => void }) {
  const text = typeof value === 'string' ? value : '';
  const findings = text.trim() ? lintText(part, text) : [];
  return (
    <div>
      <textarea className="input" rows={part.rows ?? 4} placeholder={part.placeholder ?? 'Type your answer…'} value={text} onChange={(e) => onChange(e.target.value)} />
      <div className="mt-1"><Findings items={findings} compact /></div>
    </div>
  );
}
