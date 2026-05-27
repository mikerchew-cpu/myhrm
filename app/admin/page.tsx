'use client';

import { useEffect, useState } from 'react';
import { useToast } from '@/components/Toast';

interface User {
  id: string;
  username: string;
  email: string;
  givenName: string;
  surname: string;
  role: string;
  department: string;
  hierarchyLevel: number;
  approvalLevel: number;
  status: string;
}

interface AiProvider {
  id: string;
  provider: string;
  apiKey: string;
  endpoint: string;
  enabled: boolean;
}

const roles = ['Admin', 'HR Manager', 'Manager', 'Finance', 'Viewer'];
const departments = ['', 'HR', 'Field Services', 'Tech Support', 'Finance', 'Sales', 'Admin'];
const levelOptions = [1, 2, 3, 4, 5];
const levelLabels = ['Staff', 'Supervisor', 'Manager', 'Director', 'CEO'];

const AI_PROVIDERS = ['deepseek', 'gemini', 'claude'];
const AI_LABELS: Record<string, string> = { deepseek: 'DeepSeek', gemini: 'Gemini', claude: 'Claude' };
const AI_ICONS: Record<string, string> = { deepseek: 'brain', gemini: 'sparkles', claude: 'flame' };
const AI_ENDPOINTS: Record<string, string> = {
  deepseek: 'https://api.deepseek.com/v1/chat/completions',
  gemini: 'https://generativelanguage.googleapis.com/v1beta/models',
  claude: 'https://api.anthropic.com/v1/messages',
};

type Tab = 'users' | 'ai';

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [aiProviders, setAiProviders] = useState<AiProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [aiTesting, setAiTesting] = useState<string | null>(null);
  const [aiResults, setAiResults] = useState<Record<string, string>>({});
  const [aiConnected, setAiConnected] = useState<Record<string, boolean | null>>({});
  const { toast } = useToast();

  const [form, setForm] = useState({
    username: '', email: '', givenName: '', surname: '',
    role: 'Viewer', department: '', hierarchyLevel: 1, approvalLevel: 1, status: 'Active',
  });

  const [aiForm, setAiForm] = useState<Record<string, { apiKey: string; endpoint: string; enabled: boolean }>>({});
  const [showKey, setShowKey] = useState<Record<string, boolean>>({});

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      if (data.success) setUsers(data.data);
    } catch { toast('Failed to load users', 'error'); }
    finally { setLoading(false); }
  };

  const fetchAi = async () => {
    try {
      const res = await fetch('/api/settings/ai');
      const data = await res.json();
      if (data.success) {
        setAiProviders(data.data);
        const map: Record<string, { apiKey: string; endpoint: string; enabled: boolean }> = {};
        for (const p of data.data) {
          map[p.provider] = { apiKey: p.apiKey || '', endpoint: p.endpoint, enabled: p.enabled };
        }
        for (const p of AI_PROVIDERS) {
          if (!map[p]) map[p] = { apiKey: '', endpoint: AI_ENDPOINTS[p], enabled: false };
        }
        setAiForm(map);
        // auto-test providers that have a key
        for (const p of data.data) {
          if (p.apiKey) testAi(p.provider, true);
        }
      }
    } catch { toast('Failed to load AI settings', 'error'); }
  };

  useEffect(() => { fetchUsers(); fetchAi(); }, []);

  const resetForm = () => {
    setForm({ username: '', email: '', givenName: '', surname: '', role: 'Viewer', department: '', hierarchyLevel: 1, approvalLevel: 1, status: 'Active' });
    setEditingId(null);
  };

  const saveUser = async () => {
    if (!form.username || !form.email || !form.givenName || !form.surname) {
      toast('Username, email, given name, and surname are required.', 'error'); return;
    }
    try {
      const url = editingId ? `/api/users/${editingId}` : '/api/users';
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        toast(`${form.givenName} ${form.surname} ${editingId ? 'updated' : 'created'}.`, 'success');
        resetForm();
        fetchUsers();
      } else {
        toast(data.error || 'Failed', 'error');
      }
    } catch { toast('Failed to save user', 'error'); }
  };

  const editUser = (u: User) => {
    setForm({
      username: u.username, email: u.email, givenName: u.givenName, surname: u.surname,
      role: u.role, department: u.department, hierarchyLevel: u.hierarchyLevel, approvalLevel: u.approvalLevel, status: u.status,
    });
    setEditingId(u.id);
  };

  const removeUser = async (id: string) => {
    if (!confirm('Remove this user?')) return;
    try {
      await fetch(`/api/users/${id}`, { method: 'DELETE' });
      toast('User removed.', '');
      fetchUsers();
    } catch { toast('Failed to remove', 'error'); }
  };

  const saveAi = async (provider: string) => {
    try {
      const res = await fetch('/api/settings/ai', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, config: aiForm[provider] }),
      });
      const data = await res.json();
      if (data.success) {
        toast(`${AI_LABELS[provider]} settings saved.`, 'success');
        fetchAi();
      } else {
        toast(data.error || 'Failed', 'error');
      }
    } catch { toast('Failed to save AI settings', 'error'); }
  };

  const testAi = async (provider: string, silent = false) => {
    if (!silent) setAiTesting(provider);
    if (!silent) setAiResults(r => ({ ...r, [provider]: 'Testing...' }));
    try {
      const res = await fetch('/api/ai/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, apiKey: aiForm[provider]?.apiKey || '', endpoint: aiForm[provider]?.endpoint || '' }),
      });
      const data = await res.json();
      const msg = data.data || 'Failed';
      if (!silent) setAiResults(r => ({ ...r, [provider]: msg }));
      setAiConnected(c => ({ ...c, [provider]: msg.startsWith('Connected') }));
    } catch {
      if (!silent) setAiResults(r => ({ ...r, [provider]: 'Request failed' }));
      setAiConnected(c => ({ ...c, [provider]: false }));
    } finally {
      if (!silent) setAiTesting(null);
    }
  };

  const initials = (givenName: string, surname: string) => ((givenName[0] || '') + (surname[0] || '')).toUpperCase();

  const displayName = (u: User) => `${u.givenName} ${u.surname}`;

  if (loading) return <div className="loading-dots"><div /><div /><div /></div>;

  return (
    <>
      <div className="callout callout-purple mb14">
        <i className="ti ti-shield-lock" aria-hidden="true"></i> System administration — manage users and AI provider connections.
      </div>

      <div className="tab-row">
        <div className={'tab' + (tab === 'users' ? ' tab-active' : '')} onClick={() => setTab('users')}>
          <i className="ti ti-user-shield"></i> Users
        </div>
        <div className={'tab' + (tab === 'ai' ? ' tab-active' : '')} onClick={() => setTab('ai')}>
          <i className="ti ti-brain"></i> AI Connectors
        </div>
      </div>

      {tab === 'users' && (
        <>
          <div className="g2">
            <div className="card">
              <div className="card-hdr">
                <span className="card-title">
                  <i className={'ti ' + (editingId ? 'ti-edit' : 'ti-plus')} aria-hidden="true"></i>
                  {editingId ? ' Edit user' : ' New user'}
                </span>
                {editingId && (
                  <button className="btn btn-sm" onClick={resetForm}><i className="ti ti-x"></i> Cancel</button>
                )}
              </div>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Username</label><input className="form-input" placeholder="ahmad.hafiz" value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} /></div>
                <div className="form-group"><label className="form-label">Email</label><input className="form-input" placeholder="ahmad@company.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Given name</label><input className="form-input" placeholder="Ahmad" value={form.givenName} onChange={e => setForm(f => ({ ...f, givenName: e.target.value }))} /></div>
                <div className="form-group"><label className="form-label">Surname</label><input className="form-input" placeholder="Hafiz" value={form.surname} onChange={e => setForm(f => ({ ...f, surname: e.target.value }))} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Role</label><select className="form-input" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>{roles.map(r => <option key={r}>{r}</option>)}</select></div>
                <div className="form-group"><label className="form-label">Department</label><select className="form-input" value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))}>{departments.map(d => <option key={d} value={d}>{d || '(none)'}</option>)}</select></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Hierarchy level</label><select className="form-input" value={form.hierarchyLevel} onChange={e => setForm(f => ({ ...f, hierarchyLevel: Number(e.target.value) }))}>{levelOptions.map(l => <option key={l} value={l}>{l} — {levelLabels[l - 1]}</option>)}</select></div>
                <div className="form-group"><label className="form-label">Approval level</label><select className="form-input" value={form.approvalLevel} onChange={e => setForm(f => ({ ...f, approvalLevel: Number(e.target.value) }))}>{levelOptions.map(l => <option key={l} value={l}>{l} — {levelLabels[l - 1]}</option>)}</select></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Status</label><select className="form-input" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}><option>Active</option><option>Inactive</option></select></div>
                <div className="form-group"></div>
              </div>
              <button className="btn btn-primary" onClick={saveUser} style={{ width: '100%' }}>
                <i className="ti ti-device-floppy"></i> {editingId ? 'Update user' : 'Save user'}
              </button>
            </div>
            <div className="card">
              <div className="card-hdr"><span className="card-title"><i className="ti ti-info-circle" aria-hidden="true"></i> Quick info</span></div>
              <div className="callout callout-teal" style={{ margin: 12 }}>
                <i className="ti ti-users" aria-hidden="true"></i> <strong>{users.length}</strong> system user{users.length !== 1 ? 's' : ''} registered
              </div>
              <div className="callout callout-purple" style={{ margin: '0 12px 12px' }}>
                <i className="ti ti-shield-check" aria-hidden="true"></i> Admins have full system access
              </div>
              <div className="callout callout-blue" style={{ margin: '0 12px 12px' }}>
                <i className="ti ti-hierarchy" aria-hidden="true"></i> Approval level determines claim/leave authorization limit
              </div>
            </div>
          </div>
          <div className="card" style={{ marginTop: 14 }}>
            <div className="card-hdr">
              <span className="card-title"><i className="ti ti-user-shield" aria-hidden="true"></i> System users</span>
              <span className="badge badge-info">{users.length} user{users.length !== 1 ? 's' : ''}</span>
            </div>
            {users.length === 0 ? (
              <div className="callout callout-amber">No users yet. Add the first system user above.</div>
            ) : (
              users.map(u => (
                <div className="row" key={u.id}>
                  <div className="row-av" style={{ background: 'var(--purple-lt)', color: 'var(--purple)' }}>{initials(u.givenName, u.surname)}</div>
                  <div style={{ flex: 1 }}>
                    <div className="row-name">{displayName(u)}</div>
                    <div className="row-sub">{u.role} · {u.email} · Lvl {u.hierarchyLevel}/{u.approvalLevel}</div>
                  </div>
                  <span className="badge badge-info">{u.username}</span>
                  <span className={'badge ' + (u.status === 'Active' ? 'badge-appr' : 'badge-pend')} style={{ marginLeft: 6 }}>{u.status}</span>
                  <div style={{ display: 'flex', gap: 6, marginLeft: 10 }}>
                    <button className="btn btn-sm" onClick={() => editUser(u)}><i className="ti ti-edit"></i></button>
                    <button className="btn btn-sm btn-danger" onClick={() => removeUser(u.id)}><i className="ti ti-trash"></i></button>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {tab === 'ai' && (
        <div className="card">
          <div className="card-hdr">
            <span className="card-title"><i className="ti ti-brain" aria-hidden="true"></i> AI Provider Connectors</span>
            <span className="badge badge-warning">Admin only</span>
          </div>
          <div className="callout callout-purple" style={{ margin: 12 }}>
            <i className="ti ti-shield-lock" aria-hidden="true"></i> Configure API keys for AI providers. Keys are stored in the database and used by the HR system.
          </div>
          {AI_PROVIDERS.map(provider => (
            <div key={provider} style={{ borderTop: '1px solid var(--border)', padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <i className={'ti ti-' + AI_ICONS[provider]} style={{ fontSize: 24, color: 'var(--purple)' }}></i>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontWeight: 600, fontSize: 15 }}>{AI_LABELS[provider]}</span>
                    {aiConnected[provider] === true && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--green)' }}>
                        <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--green)', display: 'inline-block' }}></span>
                        Connected
                      </span>
                    )}
                    {aiConnected[provider] === false && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--muted)' }}>
                        <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--gray-400)', display: 'inline-block' }}></span>
                        Not connected
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>{AI_ENDPOINTS[provider]}</div>
                </div>
                <label className="switch" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <input type="checkbox" checked={aiForm[provider]?.enabled || false} onChange={e => setAiForm(f => ({ ...f, [provider]: { ...f[provider], enabled: e.target.checked } }))} />
                  <span style={{ fontSize: 12 }}>Enabled</span>
                </label>
              </div>
              <div className="form-row">
                <div className="form-group" style={{ flex: 3 }}>
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    API key
                    {aiForm[provider]?.apiKey && <span className="badge badge-appr" style={{ fontSize: 9 }}>Saved</span>}
                  </label>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <input className="form-input" type={showKey[provider] ? 'text' : 'password'} placeholder="Enter API key..." value={aiForm[provider]?.apiKey || ''} onChange={e => setAiForm(f => ({ ...f, [provider]: { ...f[provider], apiKey: e.target.value } }))} style={{ flex: 1 }} />
                    <button className="btn btn-sm" onClick={() => setShowKey(s => ({ ...s, [provider]: !s[provider] }))} title={showKey[provider] ? 'Hide' : 'Show'} style={{ flexShrink: 0 }}>
                      <i className={'ti ti-' + (showKey[provider] ? 'eye-off' : 'eye')}></i>
                    </button>
                  </div>
                </div>
                <div className="form-group" style={{ flex: 2 }}>
                  <label className="form-label">Custom endpoint (optional)</label>
                  <input className="form-input" placeholder={AI_ENDPOINTS[provider]} value={aiForm[provider]?.endpoint || ''} onChange={e => setAiForm(f => ({ ...f, [provider]: { ...f[provider], endpoint: e.target.value } }))} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-primary btn-sm" onClick={() => saveAi(provider)}><i className="ti ti-device-floppy"></i> Save</button>
                <button className="btn btn-sm" onClick={() => testAi(provider)} disabled={aiTesting === provider}>
                  <i className="ti ti-player-play"></i> {aiTesting === provider ? 'Testing...' : 'Test connection'}
                </button>
                {aiResults[provider] && (
                  <span style={{
                    fontSize: 12, padding: '4px 10px', borderRadius: 6, alignSelf: 'center',
                    background: aiResults[provider].startsWith('Connected') ? 'var(--green-lt)' : 'var(--red-lt)',
                    color: aiResults[provider].startsWith('Connected') ? 'var(--green)' : 'var(--red)',
                  }}>
                    {aiResults[provider]}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
