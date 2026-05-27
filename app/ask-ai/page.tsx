'use client';

import { useEffect, useRef, useState } from 'react';
import { useToast } from '@/components/Toast';

interface Skill {
  id: string;
  title: string;
  department: string;
  content: string;
  filename: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  source?: 'local' | 'ai' | 'none';
  skills?: { title: string; department: string }[];
}

const departments = ['All', 'HR', 'Field Services', 'Tech Support', 'Finance', 'Sales', 'Admin', 'General'];

export default function AskAiPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hi! Ask me anything about HR policies, procedures, or Malaysia employment law. I\'ll check local skill files first, then use AI if needed.', source: 'none' },
  ]);
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [showSkills, setShowSkills] = useState(false);
  const [skillDept, setSkillDept] = useState('All');
  const [skillForm, setSkillForm] = useState({ title: '', department: 'General', content: '', filename: '' });
  const { toast } = useToast();
  const chatEnd = useRef<HTMLDivElement>(null);

  useEffect(() => { chatEnd.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const fetchSkills = async () => {
    try {
      const res = await fetch('/api/skills');
      const data = await res.json();
      if (data.success) setSkills(data.data);
    } catch { /* silent */ }
  };

  useEffect(() => { fetchSkills(); }, []);

  const ask = async () => {
    if (!question.trim() || loading) return;
    const q = question.trim();
    setMessages(prev => [...prev, { role: 'user', content: q }]);
    setQuestion('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q }),
      });
      const data = await res.json();
      if (data.success) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.data.answer,
          source: data.data.source,
          skills: data.data.skills,
        }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I couldn\'t process that.', source: 'none' }]);
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Network error. Please try again.', source: 'none' }]);
    } finally {
      setLoading(false);
    }
  };

  const saveSkill = async () => {
    if (!skillForm.title || !skillForm.content) {
      toast('Title and content are required.', 'error'); return;
    }
    try {
      const res = await fetch('/api/skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(skillForm),
      });
      const data = await res.json();
      if (data.success) {
        toast('Skill saved.', 'success');
        setSkillForm({ title: '', department: 'General', content: '', filename: '' });
        fetchSkills();
      } else {
        toast(data.error || 'Failed', 'error');
      }
    } catch { toast('Failed to save skill', 'error'); }
  };

  const removeSkill = async (id: string) => {
    if (!confirm('Delete this skill?')) return;
    try {
      await fetch(`/api/skills/${id}`, { method: 'DELETE' });
      toast('Skill deleted.', '');
      fetchSkills();
    } catch { toast('Failed to delete', 'error'); }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.name.endsWith('.md')) {
      toast('Please upload a .md file.', 'error'); return;
    }
    const text = await file.text();
    const title = file.name.replace(/\.md$/i, '');
    setSkillForm(f => ({ ...f, title, content: text, filename: file.name }));
    toast(`Loaded "${file.name}" (${text.length} chars). Click Save to store.`, '');
  };

  const sourceBadge = (source?: string) => {
    if (source === 'local') return <span className="badge badge-appr">Local skills</span>;
    if (source === 'ai') return <span className="badge badge-info">AI knowledge</span>;
    return null;
  };

  const filteredSkills = skills.filter(s => skillDept === 'All' || s.department === skillDept);

  return (
    <>
      <div style={{ display: 'flex', gap: 14, height: 'calc(100vh - 140px)' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', marginBottom: 0 }}>
            <div className="card-hdr">
              <span className="card-title"><i className="ti ti-message-chatbot"></i> Ask AI</span>
              <button className="btn btn-sm" onClick={() => setShowSkills(!showSkills)}>
                <i className="ti ti-file-text"></i> Skills ({skills.length})
              </button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {messages.map((m, i) => (
                <div key={i} style={{
                  alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '75%',
                  background: m.role === 'user' ? 'var(--primary)' : 'var(--surface)',
                  color: m.role === 'user' ? '#fff' : 'var(--text)',
                  padding: '11px 16px',
                  borderRadius: '14px 14px 4px 14px',
                  border: m.role === 'user' ? 'none' : '1px solid var(--border)',
                  fontSize: 14,
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap',
                  boxShadow: m.role === 'user' ? 'none' : 'var(--shadow-sm)',
                }}>
                  <div>{m.content}</div>
                  {m.role === 'assistant' && (
                    <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                      {sourceBadge(m.source)}
                      {m.skills && m.skills.length > 0 && (
                        <span style={{ fontSize: 11, color: 'var(--muted)' }}>
                          Referenced: {m.skills.map(s => s.title).join(', ')}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
              {loading && (
                <div style={{ alignSelf: 'flex-start', background: 'var(--surface)', padding: '11px 16px', borderRadius: '14px 14px 14px 4px', border: '1px solid var(--border)', fontSize: 14, boxShadow: 'var(--shadow-sm)' }}>
                  <div className="loading-dots" style={{ display: 'inline-flex' }}><div /><div /><div /></div>
                </div>
              )}
              <div ref={chatEnd} />
            </div>
            <div style={{ borderTop: '1px solid var(--border)', padding: 10, display: 'flex', gap: 8 }}>
              <input
                className="form-input"
                placeholder="Ask about HR policies, leave, claims, EPF/SOCSO..."
                value={question}
                onChange={e => setQuestion(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && ask()}
                disabled={loading}
                style={{ flex: 1 }}
              />
              <button className="btn btn-primary" onClick={ask} disabled={loading}>
                <i className="ti ti-send"></i>
              </button>
            </div>
          </div>
        </div>

        {showSkills && (
          <div className="card" style={{ width: 380, flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
            <div className="card-hdr">
              <span className="card-title"><i className="ti ti-file-text"></i> Skill files</span>
              <button className="btn btn-sm" onClick={() => setShowSkills(false)}><i className="ti ti-x"></i></button>
            </div>
            <div style={{ padding: 12, borderBottom: '1px solid var(--border)' }}>
              <div className="form-group" style={{ marginBottom: 8 }}>
                <label className="form-label">Upload .md file</label>
                <input type="file" accept=".md" onChange={handleFileUpload} style={{ fontSize: 12 }} />
              </div>
              <div className="form-group" style={{ marginBottom: 8 }}>
                <label className="form-label">Title</label>
                <input className="form-input" placeholder="Leave Policy" value={skillForm.title} onChange={e => setSkillForm(f => ({ ...f, title: e.target.value }))} />
              </div>
              <div className="form-group" style={{ marginBottom: 8 }}>
                <label className="form-label">Department</label>
                <select className="form-input" value={skillForm.department} onChange={e => setSkillForm(f => ({ ...f, department: e.target.value }))}>
                  {departments.filter(d => d !== 'All').map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 8 }}>
                <label className="form-label">Content (markdown)</label>
                <textarea className="form-input" rows={4} placeholder="# Policy title&#10;Details here..." value={skillForm.content} onChange={e => setSkillForm(f => ({ ...f, content: e.target.value }))} style={{ fontFamily: 'var(--mono)' }} />
              </div>
              <button className="btn btn-primary btn-sm" onClick={saveSkill} style={{ width: '100%' }}>
                <i className="ti ti-device-floppy"></i> Save skill
              </button>
            </div>
            <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)' }}>
              <select className="form-input" value={skillDept} onChange={e => setSkillDept(e.target.value)}>
                {departments.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: 8 }}>
              {filteredSkills.length === 0 ? (
                <div className="callout callout-amber" style={{ margin: 8 }}>
                  No skill files found for this department.
                </div>
              ) : (
                filteredSkills.map(s => (
                  <div key={s.id} className="row" style={{ padding: '8px 10px' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="row-name" style={{ fontSize: 13 }}>{s.title}</div>
                      <div className="row-sub" style={{ fontSize: 11 }}>{s.department} · {s.content.length} chars</div>
                    </div>
                    <button className="btn btn-sm btn-danger" onClick={() => removeSkill(s.id)}><i className="ti ti-trash"></i></button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
