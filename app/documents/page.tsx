'use client';

import { useEffect, useState, useCallback } from 'react';
import AiInsight from '@/components/AiInsight';

interface HRDocument {
  id: string; title: string; type: string; department: string;
  employeeId: string; fileUrl: string; status: string;
  issueDate: string | null; expiryDate: string | null; notes: string;
  createdAt: string;
}

const DOC_TYPES = ['Contract','ID','License','Certification','Policy','Report','Other'];
const DEPARTMENTS = ['HR','Finance','Field Services','Tech Support','Sales','Admin'];

export default function DocumentsPage() {
  const [docs, setDocs] = useState<HRDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<HRDocument | null>(null);
  const [filterType, setFilterType] = useState('');

  const fetchDocs = useCallback(async () => {
    const res = await fetch('/api/documents').then(r => r.json());
    if (res.success) setDocs(res.data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchDocs(); }, [fetchDocs]);

  const save = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = Object.fromEntries(fd) as Record<string, string>;
    const url = editing ? `/api/documents/${editing.id}` : '/api/documents';
    const res = await fetch(url, {
      method: editing ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if ((await res.json()).success) {
      setShowModal(false); setEditing(null); fetchDocs();
    }
  };

  const del = async (id: string) => {
    if (!confirm('Delete this document?')) return;
    await fetch(`/api/documents/${id}`, { method: 'DELETE' });
    fetchDocs();
  };

  const filtered = filterType ? docs.filter(d => d.type === filterType) : docs;

  const expiring = docs.filter(d => {
    if (!d.expiryDate || d.status !== 'Active') return false;
    const days = Math.ceil((new Date(d.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return days >= 0 && days <= 30;
  });

  const expired = docs.filter(d => {
    if (!d.expiryDate || d.status !== 'Active') return false;
    return new Date(d.expiryDate).getTime() < Date.now();
  });

  if (loading) return (
    <div style={{ minHeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span className="spinner" style={{ width: 28, height: 28 }}></span>
    </div>
  );

  return (
    <div>
      {(expiring.length > 0 || expired.length > 0) && (
        <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
          {expired.length > 0 && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px',
              borderRadius: 8, background: 'var(--red-lt)', color: 'var(--red)',
              border: '1px solid rgba(207,75,75,0.2)', fontSize: 13,
            }}>
              <i className="ti ti-alert-triangle"></i>
              <strong>{expired.length}</strong> document{expired.length > 1 ? 's' : ''} expired
            </div>
          )}
          {expiring.length > 0 && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px',
              borderRadius: 8, background: 'var(--amber-lt)', color: 'var(--amber)',
              border: '1px solid rgba(221,170,68,0.2)', fontSize: 13,
            }}>
              <i className="ti ti-clock"></i>
              <strong>{expiring.length}</strong> document{expiring.length > 1 ? 's' : ''} expiring within 30 days
            </div>
          )}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>
            Document Management
          </h1>
          <p style={{ fontSize: 13, color: 'var(--muted)' }}>Manage contracts, licenses, policies and HR documents</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditing(null); setShowModal(true); }}>
          <i className="ti ti-plus"></i> Add Document
        </button>
      </div>

      <div style={{ marginBottom: 16 }}><AiInsight title="Document Expiry Analysis" prompt="Analyse document expiry dates. Identify documents expiring soon, overdue items. Provide compliance recommendations." icon="files" /></div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        <button onClick={() => setFilterType('')}
          style={{
            padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 500, cursor: 'pointer',
            border: `1px solid ${!filterType ? 'var(--tiffany)' : 'var(--border)'}`,
            background: !filterType ? 'var(--tiffany-lt)' : 'transparent',
            color: !filterType ? 'var(--tiffany-dark)' : 'var(--muted)',
          }}>All ({docs.length})</button>
        {DOC_TYPES.map(t => {
          const count = docs.filter(d => d.type === t).length;
          return (
            <button key={t} onClick={() => setFilterType(t)}
              style={{
                padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 500, cursor: 'pointer',
                border: `1px solid ${filterType === t ? 'var(--tiffany)' : 'var(--border)'}`,
                background: filterType === t ? 'var(--tiffany-lt)' : 'transparent',
                color: filterType === t ? 'var(--tiffany-dark)' : 'var(--muted)',
              }}>{t} ({count})</button>
          );
        })}
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        {filtered.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
            No documents found.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="tbl">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Department</th>
                  <th>Status</th>
                  <th>Issue Date</th>
                  <th>Expiry Date</th>
                  <th style={{ width: 100 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(d => {
                  const daysLeft = d.expiryDate
                    ? Math.ceil((new Date(d.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                    : null;
                  const isExpired = daysLeft !== null && daysLeft < 0;
                  const isExpiring = daysLeft !== null && daysLeft >= 0 && daysLeft <= 30;
                  return (
                    <tr key={d.id}>
                      <td>
                        <div style={{ fontWeight: 500, fontSize: 13 }}>{d.title}</div>
                        {d.notes && <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{d.notes}</div>}
                      </td>
                      <td><span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, background: 'var(--gray-50)', color: 'var(--muted)' }}>{d.type}</span></td>
                      <td style={{ fontSize: 12 }}>{d.department}</td>
                      <td>
                        <span style={{
                          padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 500,
                          color: isExpired ? 'var(--red)' : isExpiring ? 'var(--amber)' : 'var(--tiffany)',
                          background: isExpired ? 'var(--red-lt)' : isExpiring ? 'var(--amber-lt)' : 'rgba(10,186,181,0.1)',
                        }}>
                          {isExpired ? 'Expired' : isExpiring ? `Expires in ${daysLeft}d` : d.status}
                        </span>
                      </td>
                      <td style={{ fontSize: 12 }}>{d.issueDate ? new Date(d.issueDate).toLocaleDateString() : '—'}</td>
                      <td style={{ fontSize: 12 }}>
                        {d.expiryDate ? (
                          <span style={{ color: isExpired ? 'var(--red)' : isExpiring ? 'var(--amber)' : 'inherit' }}>
                            {new Date(d.expiryDate).toLocaleDateString()}
                          </span>
                        ) : '—'}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button className="btn btn-ghost btn-xs"
                            onClick={() => { setEditing(d); setShowModal(true); }}>Edit</button>
                          <button className="btn btn-ghost btn-xs" style={{ color: 'var(--red)' }}
                            onClick={() => del(d.id)}>Del</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => { setShowModal(false); setEditing(null); }}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <div className="modal-header">
              <h3>{editing ? 'Edit Document' : 'Add Document'}</h3>
              <button className="modal-close" onClick={() => { setShowModal(false); setEditing(null); }}>×</button>
            </div>
            <form onSubmit={save}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Title *</label>
                  <input className="form-input" name="title" defaultValue={editing?.title || ''} required />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Type</label>
                    <select className="form-input" name="type" defaultValue={editing?.type || 'Contract'}>
                      {DOC_TYPES.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Department</label>
                    <select className="form-input" name="department" defaultValue={editing?.department || ''}>
                      <option value="">All</option>
                      {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Issue Date</label>
                    <input className="form-input" name="issueDate" type="date" defaultValue={editing?.issueDate?.split('T')[0] || ''} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Expiry Date</label>
                    <input className="form-input" name="expiryDate" type="date" defaultValue={editing?.expiryDate?.split('T')[0] || ''} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select className="form-input" name="status" defaultValue={editing?.status || 'Active'}>
                    {['Active','Archived','Expired','Draft'].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">File URL</label>
                  <input className="form-input" name="fileUrl" defaultValue={editing?.fileUrl || ''} placeholder="https://..." />
                </div>
                <div className="form-group">
                  <label className="form-label">Employee ID</label>
                  <input className="form-input" name="employeeId" defaultValue={editing?.employeeId || ''} placeholder="E.g. E138" />
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
