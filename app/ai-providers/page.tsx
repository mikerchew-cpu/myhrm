'use client';

import { useEffect, useState } from 'react';
import { useToast } from '@/components/Toast';

interface AiProvider {
  id: string;
  provider: string;
  apiKey: string;
  endpoint: string;
  enabled: boolean;
}

const PROVIDERS = ['deepseek', 'gemini', 'qwen', 'claude'];
const LABELS: Record<string, string> = { deepseek: 'DeepSeek', gemini: 'Gemini', qwen: 'Qwen', claude: 'Claude' };
const ICONS: Record<string, string> = { deepseek: 'brain', gemini: 'sparkles', qwen: 'cloud', claude: 'flame' };
const COLORS: Record<string, string> = { deepseek: '#4F46E5', gemini: '#4285F4', qwen: '#FF6A00', claude: '#CC7833' };
const DESCS: Record<string, string> = {
  deepseek: 'Fast, affordable general-purpose LLM. OpenAI-compatible API.',
  gemini: 'Google\'s multimodal AI with strong reasoning capabilities.',
  qwen: 'Alibaba Cloud\'s powerful LLM with strong Chinese & English support.',
  claude: 'Anthropic\'s safety-focused model. Excellent for analysis tasks.',
};
const ENDPOINTS: Record<string, string> = {
  deepseek: 'https://api.deepseek.com/v1/chat/completions',
  gemini: 'https://generativelanguage.googleapis.com/v1beta/models',
  qwen: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
  claude: 'https://api.anthropic.com/v1/messages',
};

export default function AiProvidersPage() {
  const [providers, setProviders] = useState<AiProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, string>>({});
  const [connected, setConnected] = useState<Record<string, boolean | null>>({});
  const [form, setForm] = useState<Record<string, { apiKey: string; endpoint: string; enabled: boolean }>>({});
  const [showKey, setShowKey] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      const res = await fetch('/api/settings/ai');
      const data = await res.json();
      if (data.success) {
        setProviders(data.data);
        const map: Record<string, { apiKey: string; endpoint: string; enabled: boolean }> = {};
        for (const p of data.data) {
          map[p.provider] = { apiKey: p.apiKey || '', endpoint: p.endpoint, enabled: p.enabled };
        }
        for (const p of PROVIDERS) {
          if (!map[p]) map[p] = { apiKey: '', endpoint: ENDPOINTS[p], enabled: false };
        }
        setForm(map);
        for (const p of data.data) {
          if (p.apiKey) testProvider(p.provider, true);
        }
      }
    } catch { toast('Failed to load AI settings', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const saveProvider = async (provider: string) => {
    try {
      const res = await fetch('/api/settings/ai', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, config: form[provider] }),
      });
      const data = await res.json();
      if (data.success) {
        toast(`${LABELS[provider]} saved.`, 'success');
        fetchData();
      } else {
        toast(data.error || 'Failed', 'error');
      }
    } catch { toast('Failed to save', 'error'); }
  };

  const testProvider = async (provider: string, silent = false) => {
    if (!silent) setTesting(provider);
    if (!silent) setResults(r => ({ ...r, [provider]: 'Testing...' }));
    try {
      const res = await fetch('/api/ai/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, apiKey: form[provider]?.apiKey || '', endpoint: form[provider]?.endpoint || '' }),
      });
      const data = await res.json();
      const msg = data.data || 'Failed';
      if (!silent) setResults(r => ({ ...r, [provider]: msg }));
      setConnected(c => ({ ...c, [provider]: msg.startsWith('Connected') }));
    } catch {
      if (!silent) setResults(r => ({ ...r, [provider]: 'Request failed' }));
      setConnected(c => ({ ...c, [provider]: false }));
    } finally {
      if (!silent) setTesting(null);
    }
  };

  if (loading) return <div className="loading-dots"><div /><div /><div /></div>;

  const enabledCount = PROVIDERS.filter(p => form[p]?.enabled).length;
  const connectedCount = PROVIDERS.filter(p => connected[p] === true).length;

  return (
    <div className="view" style={{ maxWidth: 960, margin: '0 auto' }}>
      {/* Header metrics */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <div className="metric" style={{ flex: 1, minWidth: 140 }}>
          <div className="metric-lbl"><i className="ti ti-cloud"></i> Providers</div>
          <div className="metric-val">{PROVIDERS.length}</div>
        </div>
        <div className="metric" style={{ flex: 1, minWidth: 140 }}>
          <div className="metric-lbl"><i className="ti ti-toggle-left"></i> Enabled</div>
          <div className="metric-val" style={{ color: 'var(--green)' }}>{enabledCount}</div>
        </div>
        <div className="metric" style={{ flex: 1, minWidth: 140 }}>
          <div className="metric-lbl"><i className="ti ti-plug-connected"></i> Connected</div>
          <div className="metric-val" style={{ color: 'var(--tiffany)' }}>{connectedCount}</div>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={fetchData} style={{ alignSelf: 'flex-end' }}>
          <i className="ti ti-refresh"></i> Refresh
        </button>
      </div>

      {PROVIDERS.map(p => (
        <div key={p} className="card" style={{ marginBottom: 12, borderLeft: `4px solid ${COLORS[p]}20` }}>
          {/* Header row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: COLORS[p] + '15',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <i className={'ti ti-' + ICONS[p]} style={{ fontSize: 20, color: COLORS[p] }}></i>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--text)' }}>{LABELS[p]}</span>
                <span className="badge badge-info" style={{ fontSize: 10 }}>{p}</span>
                {connected[p] === true && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--green)', fontWeight: 600 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green)', display: 'inline-block' }}></span>
                    Connected
                  </span>
                )}
                {connected[p] === false && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--muted)' }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--gray-400)', display: 'inline-block' }}></span>
                    Not connected
                  </span>
                )}
                {connected[p] === null && form[p]?.apiKey && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--amber)' }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--amber)', display: 'inline-block' }}></span>
                    Untested
                  </span>
                )}
              </div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{DESCS[p]}</div>
            </div>
            <label className="switch" style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
              <input type="checkbox" checked={form[p]?.enabled || false} onChange={e => setForm(f => ({ ...f, [p]: { ...f[p], enabled: e.target.checked } }))} />
              <span style={{ fontSize: 12 }}>Enabled</span>
            </label>
          </div>

          {/* Fields */}
          <div className="form-row" style={{ gap: 12 }}>
            <div className="form-group" style={{ flex: 3, marginBottom: 0 }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <i className="ti ti-key" style={{ fontSize: 12 }}></i> API Key
                {form[p]?.apiKey && <span className="badge badge-appr" style={{ fontSize: 9 }}>Saved</span>}
              </label>
              <div style={{ display: 'flex', gap: 4 }}>
                <input className="form-input" type={showKey[p] ? 'text' : 'password'}
                  placeholder="sk-..." value={form[p]?.apiKey || ''}
                  onChange={e => setForm(f => ({ ...f, [p]: { ...f[p], apiKey: e.target.value } }))}
                  style={{ flex: 1, fontFamily: showKey[p] ? 'var(--font)' : 'var(--mono)' }} />
                <button className="btn btn-sm" onClick={() => setShowKey(s => ({ ...s, [p]: !s[p] }))} title={showKey[p] ? 'Hide' : 'Show'}>
                  <i className={'ti ti-' + (showKey[p] ? 'eye-off' : 'eye')}></i>
                </button>
              </div>
            </div>
            <div className="form-group" style={{ flex: 2, marginBottom: 0 }}>
              <label className="form-label"><i className="ti ti-link" style={{ fontSize: 12 }}></i> API Endpoint</label>
              <input className="form-input" style={{ fontFamily: 'var(--mono)', fontSize: 11 }}
                placeholder={ENDPOINTS[p]} value={form[p]?.endpoint || ''}
                onChange={e => setForm(f => ({ ...f, [p]: { ...f[p], endpoint: e.target.value } }))} />
            </div>
          </div>

          {/* Default model info */}
          <div style={{ fontSize: 11, color: 'var(--gray-400)', margin: '4px 0 10px', fontFamily: 'var(--mono)' }}>
            Default model: {p === 'gemini' ? 'gemini-3.5-flash' : p === 'claude' ? 'claude-sonnet-4-20250514' : p === 'qwen' ? 'qwen-plus' : 'deepseek-chat'}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button className="btn btn-primary btn-sm" onClick={() => saveProvider(p)}>
              <i className="ti ti-device-floppy"></i> Save
            </button>
            <button className="btn btn-sm" onClick={() => testProvider(p)} disabled={testing === p}>
              <i className="ti ti-player-play"></i> {testing === p ? 'Testing...' : 'Test Connection'}
            </button>
            {results[p] && (
              <span style={{
                fontSize: 12, padding: '4px 10px', borderRadius: 6,
                background: results[p].startsWith('Connected') ? 'var(--green-lt)' : 'var(--red-lt)',
                color: results[p].startsWith('Connected') ? 'var(--green)' : 'var(--red)',
                fontWeight: 500,
              }}>
                <i className={'ti ti-' + (results[p].startsWith('Connected') ? 'circle-check' : 'alert-circle')}></i>
                {' '}{results[p]}
              </span>
            )}
          </div>
        </div>
      ))}

      <div style={{ marginTop: 16, padding: '12px 16px', borderRadius: 8, background: 'var(--gray-50)', fontSize: 11, color: 'var(--muted)', textAlign: 'center' }}>
        API keys are stored encrypted in the database. Only one provider needs to be enabled for AI features to work.
      </div>
    </div>
  );
}
