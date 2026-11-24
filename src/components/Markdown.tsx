import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export const PROSE =
  'prose prose-sm max-w-none prose-headings:text-ink-900 prose-table:text-sm prose-th:bg-ink-100 prose-th:px-2 prose-td:px-2 prose-td:border prose-th:border prose-td:border-ink-300 prose-th:border-ink-300 prose-blockquote:font-normal prose-blockquote:not-italic prose-blockquote:text-ink-700';

export default function Markdown({ children, className = '' }: { children: string; className?: string }) {
  return (
    <div className={`${PROSE} ${className}`}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown>
    </div>
  );
}
