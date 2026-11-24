import type { Answers, Part, Scenario, StoryDraft } from './types';

const esc = (s: string) => s.replace(/\|/g, '\\|').replace(/\n/g, ' ');

export function partToMarkdown(part: Part, raw: unknown): string {
  switch (part.kind) {
    case 'text':
      return typeof raw === 'string' && raw.trim() ? raw.trim() : '_Not answered._';
    case 'number':
      return raw === undefined || raw === '' ? '_Not answered._' : `${raw}${part.unit ? ' ' + part.unit : ''}`;
    case 'choice': {
      const sel = Array.isArray(raw) ? (raw as string[]) : [];
      const picked = part.options.filter((o) => sel.includes(o.id));
      return picked.length ? picked.map((o) => `- ${o.label}`).join('\n') : '_Nothing selected._';
    }
    case 'rank': {
      const order = Array.isArray(raw) && raw.length ? (raw as string[]) : part.items.map((i) => i.id);
      return order.map((id, i) => `${i + 1}. ${part.items.find((x) => x.id === id)?.label ?? id}`).join('\n');
    }
    case 'select': {
      const sel = Array.isArray(raw) ? (raw as string[]) : [];
      const items = part.items.filter((i) => sel.includes(i.id));
      if (!items.length) return '_Nothing selected._';
      const total = items.reduce((s, i) => s + i.points, 0);
      return items.map((i) => `- ${i.label} (${i.points} pts)`).join('\n') + `\n\n**Total: ${total} pts**`;
    }
    case 'match': {
      const ans = (raw && typeof raw === 'object' ? raw : {}) as Record<string, string>;
      return `| Question | Choice |\n|---|---|\n` +
        part.rows.map((r) => `| ${esc(r.label)} | ${part.options.find((o) => o.id === ans[r.id])?.label ?? '—'} |`).join('\n');
    }
    case 'stories': {
      const stories = Array.isArray(raw) ? (raw as StoryDraft[]) : [];
      if (!stories.length) return '_No stories yet._';
      return stories
        .map((s, i) => {
          const head = `**${i + 1}. ${s.title || 'Untitled'}**${s.points != null ? ` (${s.points} pts)` : ''}\n\nAs ${s.asA || '…'}, I want ${s.iWant || '…'}, so that ${s.soThat || '…'}.`;
          const acs = s.acs.map((a, j) => `- AC ${j + 1}: **Given** ${a.given} **When** ${a.when} **Then** ${a.then}`).join('\n');
          return acs ? `${head}\n\n${acs}` : head;
        })
        .join('\n\n');
    }
  }
}

export function answerToMarkdown(s: Scenario, answers: Answers): string {
  return s.parts.map((p) => `### ${p.label}\n\n${partToMarkdown(p, answers[p.id])}`).join('\n\n');
}
