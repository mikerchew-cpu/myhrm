'use client';

import { useState } from 'react';

interface Props {
  title: string;
  prompt: string;
  context?: Record<string, unknown>;
  icon?: string;
  variant?: 'card' | 'inline';
}

export default function AiInsight({ title, prompt, context, icon = 'brain', variant = 'card' }: Props) {
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const generate = async () => {
    if (loading) return;
    setLoading(true);
    setInsight(null);
    try {
      const res = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: prompt,
          context: JSON.stringify(context || {}),
        }),
      });
      const data = await res.json();
      setInsight(data.success ? data.data.answer : 'Failed to generate insight.');
    } catch {
      setInsight('Network error.');
    } finally {
      setLoading(false);
    }
  };

  if (variant === 'inline') {
    return (
      <button className="btn btn-sm" onClick={generate} disabled={loading} style={{ whiteSpace: 'nowrap' }}>
        <i className={`ti ti-${icon}`}></i>
        {loading ? 'Analysing...' : 'AI Insight'}
      </button>
    );
  }

  return (
    <div className="card" style={{ background: 'var(--tiffany-lt)', borderColor: 'var(--tiffany-mid)', position: 'relative' }}>
      <div className="card-hdr" style={{ marginBottom: insight ? 10 : 0 }}>
        <span className="card-title">
          <i className={`ti ti-${icon}`} style={{ color: 'var(--tiffany)' }}></i>
          {title}
        </span>
        <button className="btn btn-sm btn-primary" onClick={generate} disabled={loading}>
          {loading ? (
            <><span className="spinner" style={{ width: 12, height: 12, borderWidth: 1.5 }}></span> Analysing...</>
          ) : (
            <><i className="ti ti-sparkles"></i> Generate Insight</>
          )}
        </button>
      </div>
      {loading && (
        <div style={{ padding: '8px 0', display: 'flex', gap: 6, alignItems: 'center', fontSize: 13, color: 'var(--muted)' }}>
          <span className="spinner" style={{ width: 14, height: 14, borderWidth: 1.5 }}></span>
          DeepSeek AI is analysing your data...
        </div>
      )}
      {insight && (
        <div style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--text)' }}>
          <div style={{ maxHeight: expanded ? 'none' : 120, overflow: 'hidden', position: 'relative', whiteSpace: 'pre-wrap' }}>
            {insight}
            {!expanded && insight.length > 300 && (
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 40, background: 'linear-gradient(transparent, var(--tiffany-lt))' }} />
            )}
          </div>
          {insight.length > 300 && (
            <button className="btn btn-ghost btn-xs" onClick={() => setExpanded(!expanded)} style={{ marginTop: 4 }}>
              {expanded ? 'Show less' : 'Read more'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
