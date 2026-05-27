'use client';

import { useEffect, useState, useCallback } from 'react';
import AiInsight from '@/components/AiInsight';

interface Announcement {
  id: string; title: string; content: string; category: string;
  priority: string; author: string;
  publishDate: string; expiryDate: string | null;
  status: string; createdAt: string;
}

const CATEGORIES = ['General','HR Policy','Events','Payroll','Compliance','IT','Training'];
const PRIORITIES = ['High','Normal','Low'];
const CAT_COLORS: Record<string, string> = {
  'HR Policy': '#2E7D32', 'Events': '#6A1B9A', 'Payroll': '#B76E1E',
  'Compliance': '#00897B', 'IT': '#0ABAB5', 'Training': '#0ABAB5', 'General': '#757575',
};

export default function AnnouncementsPage() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Announcement | null>(null);
  const [filter, setFilter] = useState('');

  const fetchAll = useCallback(async () => {
    const res = await fetch('/api/announcements').then(r => r.json());
    if (res.success) setItems(res.data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const save = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = Object.fromEntries(fd) as Record<string, string>;
    const url = editing ? `/api/announcements/${editing.id}` : '/api/announcements';
    const res = await fetch(url, {
      method: editing ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if ((await res.json()).success) {
      setShowModal(false); setEditing(null); fetchAll();
    }
  };

  const del = async (id: string) => {
    if (!confirm('Delete this announcement?')) return;
    await fetch(`/api/announcements/${id}`, { method: 'DELETE' });
    fetchAll();
  };

  const filtered = filter ? items.filter(a => a.category === filter) : items;
  const active = items.filter(a => a.status === 'Active');
  const expired = items.filter(a => a.status === 'Expired' || (a.expiryDate && new Date(a.expiryDate) < new Date()));

  if (loading) return (
    <div style={{ minHeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span className="spinner" style={{ width: 28, height: 28 }}></span>
    </div>
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>
            Announcements
          </h1>
          <p style={{ fontSize: 13, color: 'var(--muted)' }}>{active.length} active &middot; {expired.length} expired</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditing(null); setShowModal(true); }}>
          <i className="ti ti-plus"></i> New Announcement
        </button>
      </div>

      <div style={{ marginBottom: 16 }}><AiInsight title="Announcement Analytics" prompt="Analyse HR announcements - categories, priorities, active vs expired. Provide engagement insights." icon="speakerphone" /></div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        <button onClick={() => setFilter('')}
          style={{
            padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 500, cursor: 'pointer',
            border: `1px solid ${!filter ? 'var(--tiffany)' : 'var(--border)'}`,
            background: !filter ? 'var(--tiffany-lt)' : 'transparent',
            color: !filter ? 'var(--tiffany-dark)' : 'var(--muted)',
          }}>All ({items.length})</button>
        {CATEGORIES.map(c => {
          const count = items.filter(a => a.category === c).length;
          return count > 0 ? (
            <button key={c} onClick={() => setFilter(c)}
              style={{
                padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 500, cursor: 'pointer',
                border: `1px solid ${filter === c ? (CAT_COLORS[c] || 'var(--tiffany)') : 'var(--border)'}`,
                background: filter === c ? `${CAT_COLORS[c] || 'var(--tiffany)'}15` : 'transparent',
                color: filter === c ? (CAT_COLORS[c] || 'var(--tiffany)') : 'var(--muted)',
              }}>{c} ({count})</button>
          ) : null;
        })}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filtered.length === 0 ? (
          <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
            No announcements yet.
          </div>
        ) : filtered.map(a => {
          const catColor = CAT_COLORS[a.category] || '#757575';
          const isExpired = a.expiryDate && new Date(a.expiryDate) < new Date();
          return (
            <div key={a.id} className="card" style={{
              borderLeft: `3px solid ${a.priority === 'High' ? 'var(--red)' : a.priority === 'Normal' ? catColor : 'var(--border)'}`,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>{a.title}</h3>
                  <span style={{
                    padding: '1px 8px', borderRadius: 4, fontSize: 10, fontWeight: 500,
                    background: `${catColor}15`, color: catColor,
                  }}>{a.category}</span>
                  {a.priority === 'High' && (
                    <span style={{
                      padding: '1px 8px', borderRadius: 4, fontSize: 10, fontWeight: 600,
                      background: 'var(--red-lt)', color: 'var(--red)',
                    }}>HIGH</span>
                  )}
                  {isExpired && (
                    <span style={{
                      padding: '1px 8px', borderRadius: 4, fontSize: 10, fontWeight: 500,
                      background: 'var(--gray-50)', color: 'var(--muted)',
                    }}>Expired</span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                  <button className="btn btn-ghost btn-xs" onClick={() => { setEditing(a); setShowModal(true); }}>Edit</button>
                  <button className="btn btn-ghost btn-xs" style={{ color: 'var(--red)' }} onClick={() => del(a.id)}>Del</button>
                </div>
              </div>
              <div style={{
                fontSize: 13, color: 'var(--text)', lineHeight: 1.6, whiteSpace: 'pre-wrap', marginBottom: 8,
              }}>{a.content}</div>
              <div style={{ fontSize: 11, color: 'var(--muted)', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <span><i className="ti ti-user"></i> {a.author || '—'}</span>
                <span><i className="ti ti-calendar"></i> {new Date(a.publishDate).toLocaleDateString()}</span>
                {a.expiryDate && <span><i className="ti ti-clock-off"></i> Expires {new Date(a.expiryDate).toLocaleDateString()}</span>}
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => { setShowModal(false); setEditing(null); }}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 540 }}>
            <div className="modal-header">
              <h3>{editing ? 'Edit Announcement' : 'New Announcement'}</h3>
              <button className="modal-close" onClick={() => { setShowModal(false); setEditing(null); }}>×</button>
            </div>
            <form onSubmit={save}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Title *</label>
                  <input className="form-input" name="title" defaultValue={editing?.title || ''} required />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select className="form-input" name="category" defaultValue={editing?.category || 'General'}>
                      {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Priority</label>
                    <select className="form-input" name="priority" defaultValue={editing?.priority || 'Normal'}>
                      {PRIORITIES.map(p => <option key={p}>{p}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select className="form-input" name="status" defaultValue={editing?.status || 'Active'}>
                      {['Active','Expired','Draft'].map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Author</label>
                    <input className="form-input" name="author" defaultValue={editing?.author || ''} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Expiry Date</label>
                    <input className="form-input" name="expiryDate" type="date" defaultValue={editing?.expiryDate?.split('T')[0] || ''} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Content</label>
                  <textarea className="form-input" name="content" rows={4} defaultValue={editing?.content || ''} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => { setShowModal(false); setEditing(null); }}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editing ? 'Update' : 'Publish'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
