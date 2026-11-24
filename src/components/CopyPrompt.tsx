import { useState } from 'react';

export const CLAUDE_URL = 'https://claude.ai/new';

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for browsers that block the clipboard API
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    ta.remove();
    return ok;
  }
}

/** Copies a prompt (built on click so it includes the latest answer) and points to claude.ai. */
export default function CopyPrompt({ label, build, variant = 'subtle', hint }: { label: string; build: () => string; variant?: 'primary' | 'subtle'; hint?: string }) {
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle');
  const [preview, setPreview] = useState<string | null>(null);

  async function onCopy() {
    const ok = await copyText(build());
    setState(ok ? 'copied' : 'failed');
    if (!ok) setPreview(build());
  }

  return (
    <div className="space-y-1">
      <div className="flex flex-wrap items-center gap-2">
        <button className={variant === 'primary' ? 'btn-primary' : 'btn-subtle border border-ink-300'} onClick={onCopy}>
          ⧉ {label}
        </button>
        <button className="text-xs text-ink-500 underline hover:text-ink-900" onClick={() => setPreview((p) => (p ? null : build()))}>
          {preview ? 'Hide prompt' : 'Preview'}
        </button>
      </div>
      {hint && state === 'idle' && <p className="text-xs text-ink-500">{hint}</p>}
      {state === 'copied' && (
        <p className="text-xs text-green-700">
          ✓ Copied. Now <a className="font-semibold underline" href={CLAUDE_URL} target="_blank" rel="noreferrer">open Claude</a>, paste (⌘V) and send.
        </p>
      )}
      {state === 'failed' && <p className="text-xs text-red-700">Couldn't copy automatically. Select the text below and copy it (⌘C).</p>}
      {preview && <textarea readOnly className="input h-48 font-mono text-[11px]" value={preview} onFocus={(e) => e.target.select()} />}
    </div>
  );
}
