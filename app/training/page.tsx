'use client';

import { useEffect, useState, useCallback } from 'react';
import AiInsight from '@/components/AiInsight';

interface Training {
  id: string; title: string; provider: string; type: string;
  cost: number; employeeId: string; employeeName: string;
  startDate: string | null; endDate: string | null;
  status: string; certification: string; notes: string;
}

const STATUSES = ['Planned','In Progress','Completed','Cancelled'];
const TYPES = ['Technical','Soft Skills','Compliance','Leadership','Onboarding','Certification'];

export default function TrainingPage() {
  const [items, setItems] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Training | null>(null);

  const fetchAll = useCallback(async () => {
    const res = await fetch('/api/training').then(r => r.json());
    if (res.success) setItems(res.data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const save = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = Object.fromEntries(fd) as Record<string, string>;
    const url = editing ? `/api/training/${editing.id}` : '/api/training';
    const res = await fetch(url, {
      method: editing ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, cost: Number(data.cost) }),
    });
    if ((await res.json()).success) {
      setShowModal(false); setEditing(null); fetchAll();
    }
  };

  const del = async (id: string) => {
    if (!confirm('Delete this training record?')) return;
    await fetch(`/api/training/${id}`, { method: 'DELETE' });
    fetchAll();
  };

  const statusColors: Record<string, string> = {
    'Completed': 'var(--tiffany)', 'In Progress': 'var(--amber)', 'Planned': 'var(--muted)', 'Cancelled': 'var(--red)',
  };

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
            Training & Development
          </h1>
          <p style={{ fontSize: 13, color: 'var(--muted)' }}>Track courses, certifications, and employee development</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditing(null); setShowModal(true); }}>
          <i className="ti ti-plus"></i> Add Training
        </button>
      </div>

      <div style={{ marginBottom: 16 }}>
        <AiInsight title="Training Analysis" prompt="Analyse training programmes - completion rates, types, costs. Evaluate training effectiveness." icon="book" />
      </div>

      {/* Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {['Total','Completed','In Progress','Planned'].map(label => {
          const count = label === 'Total' ? items.length : items.filter(i => i.status === label).length;
          return (
            <div key={label} className="card" style={{ padding: '14px 18px', textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: label === 'Completed' ? 'var(--tiffany)' : label === 'In Progress' ? 'var(--amber)' : 'var(--text)' }}>{count}</div>
              <div style={{ fontSize: 11, color: 'var(--muted)' }}>{label}</div>
            </div>
          );
        })}
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        {items.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>No training records yet.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="tbl">
              <thead>
                <tr>
                  <th>Course</th>
                  <th>Employee</th>
                  <th>Type</th>
                  <th>Provider</th>
                  <th>Cost</th>
                  <th>Status</th>
                  <th style={{ width: 100 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map(t => (
                  <tr key={t.id}>
                    <td>
                      <div style={{ fontWeight: 500, fontSize: 13 }}>{t.title}</div>
                      {t.certification && <div style={{ fontSize: 10, color: 'var(--tiffany)' }}>{t.certification}</div>}
                    </td>
                    <td style={{ fontSize: 12 }}>{t.employeeName}</td>
                    <td><span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, background: 'var(--gray-50)' }}>{t.type}</span></td>
                    <td style={{ fontSize: 12, color: 'var(--muted)' }}>{t.provider}</td>
                    <td style={{ fontSize: 12 }}>RM {t.cost.toFixed(2)}</td>
                    <td>
                      <span style={{
                        padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 500,
                        color: statusColors[t.status] || 'var(--muted)',
                        background: `${statusColors[t.status]}15` || 'var(--bg)',
                      }}>{t.status}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button className="btn btn-ghost btn-xs" onClick={() => { setEditing(t); setShowModal(true); }}>Edit</button>
                        <button className="btn btn-ghost btn-xs" style={{ color: 'var(--red)' }} onClick={() => del(t.id)}>Del</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => { setShowModal(false); setEditing(null); }}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <div className="modal-header">
              <h3>{editing ? 'Edit Training' : 'Add Training'}</h3>
              <button className="modal-close" onClick={() => { setShowModal(false); setEditing(null); }}>×</button>
            </div>
            <form onSubmit={save}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Course Title *</label>
                  <input className="form-input" name="title" defaultValue={editing?.title || ''} required />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Type</label>
                    <select className="form-input" name="type" defaultValue={editing?.type || 'Technical'}>
                      {TYPES.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select className="form-input" name="status" defaultValue={editing?.status || 'Planned'}>
                      {STATUSES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Employee Name</label>
                    <input className="form-input" name="employeeName" defaultValue={editing?.employeeName || ''} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Employee ID</label>
                    <input className="form-input" name="employeeId" defaultValue={editing?.employeeId || ''} />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Provider</label>
                    <input className="form-input" name="provider" defaultValue={editing?.provider || ''} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Cost (RM)</label>
                    <input className="form-input" name="cost" type="number" defaultValue={editing?.cost || 0} />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Start Date</label>
                    <input className="form-input" name="startDate" type="date" defaultValue={editing?.startDate?.split('T')[0] || ''} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">End Date</label>
                    <input className="form-input" name="endDate" type="date" defaultValue={editing?.endDate?.split('T')[0] || ''} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Certification</label>
                  <input className="form-input" name="certification" defaultValue={editing?.certification || ''} />
                </div>
                <div className="form-group">
                  <label className="form-label">Notes</label>
                  <textarea className="form-input" name="notes" rows={2} defaultValue={editing?.notes || ''} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => { setShowModal(false); setEditing(null); }}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editing ? 'Update' : 'Add'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
