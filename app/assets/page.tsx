'use client';

import { useEffect, useState, useCallback } from 'react';
import AiInsight from '@/components/AiInsight';

interface Asset {
  id: string; name: string; type: string; serialNo: string;
  employeeId: string; employeeName: string;
  purchaseDate: string | null; purchasePrice: number;
  status: string; notes: string;
}

const ASSET_TYPES = ['Laptop','Phone','Tablet','Monitor','Vehicle','Tool','Furniture','Other'];
const STATUSES = ['Assigned','Available','Maintenance','Retired'];

export default function AssetsPage() {
  const [items, setItems] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Asset | null>(null);
  const [filterType, setFilterType] = useState('');

  const fetchAll = useCallback(async () => {
    const res = await fetch('/api/assets').then(r => r.json());
    if (res.success) setItems(res.data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const save = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = Object.fromEntries(fd) as Record<string, string>;
    const url = editing ? `/api/assets/${editing.id}` : '/api/assets';
    const res = await fetch(url, {
      method: editing ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, purchasePrice: Number(data.purchasePrice) }),
    });
    if ((await res.json()).success) {
      setShowModal(false); setEditing(null); fetchAll();
    }
  };

  const del = async (id: string) => {
    if (!confirm('Delete this asset?')) return;
    await fetch(`/api/assets/${id}`, { method: 'DELETE' });
    fetchAll();
  };

  const filtered = filterType ? items.filter(a => a.type === filterType) : items;

  const totalValue = items.reduce((s, a) => s + a.purchasePrice, 0);
  const assigned = items.filter(a => a.status === 'Assigned').length;
  const available = items.filter(a => a.status === 'Available').length;

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
            Asset Management
          </h1>
          <p style={{ fontSize: 13, color: 'var(--muted)' }}>Track company assets and equipment</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditing(null); setShowModal(true); }}>
          <i className="ti ti-plus"></i> Add Asset
        </button>
      </div>

      <div style={{ marginBottom: 16 }}>
        <AiInsight title="Asset Insights" prompt="Analyse asset inventory - total value, assignment rates, types. Provide utilisation insights." icon="tool" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <div className="card" style={{ padding: '14px 18px', textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)' }}>{items.length}</div>
          <div style={{ fontSize: 11, color: 'var(--muted)' }}>Total Assets</div>
        </div>
        <div className="card" style={{ padding: '14px 18px', textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--tiffany)' }}>{assigned}</div>
          <div style={{ fontSize: 11, color: 'var(--muted)' }}>Assigned</div>
        </div>
        <div className="card" style={{ padding: '14px 18px', textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--amber)' }}>{available}</div>
          <div style={{ fontSize: 11, color: 'var(--muted)' }}>Available</div>
        </div>
        <div className="card" style={{ padding: '14px 18px', textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--tiffany)' }}>RM {totalValue.toLocaleString()}</div>
          <div style={{ fontSize: 11, color: 'var(--muted)' }}>Total Value</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        <button onClick={() => setFilterType('')}
          style={{
            padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 500, cursor: 'pointer',
            border: `1px solid ${!filterType ? 'var(--tiffany)' : 'var(--border)'}`,
            background: !filterType ? 'var(--tiffany-lt)' : 'transparent',
            color: !filterType ? 'var(--tiffany-dark)' : 'var(--muted)',
          }}>All ({items.length})</button>
        {ASSET_TYPES.map(t => {
          const count = items.filter(a => a.type === t).length;
          return count > 0 ? (
            <button key={t} onClick={() => setFilterType(t)}
              style={{
                padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 500, cursor: 'pointer',
                border: `1px solid ${filterType === t ? 'var(--tiffany)' : 'var(--border)'}`,
                background: filterType === t ? 'var(--tiffany-lt)' : 'transparent',
                color: filterType === t ? 'var(--tiffany-dark)' : 'var(--muted)',
              }}>{t} ({count})</button>
          ) : null;
        })}
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        {filtered.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>No assets found.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="tbl">
              <thead>
                <tr>
                  <th>Asset</th>
                  <th>Type</th>
                  <th>Serial No</th>
                  <th>Assigned To</th>
                  <th>Status</th>
                  <th>Value</th>
                  <th style={{ width: 100 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(a => (
                  <tr key={a.id}>
                    <td>
                      <div style={{ fontWeight: 500, fontSize: 13 }}>{a.name}</div>
                      {a.notes && <div style={{ fontSize: 11, color: 'var(--muted)' }}>{a.notes}</div>}
                    </td>
                    <td><span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, background: 'var(--gray-50)' }}>{a.type}</span></td>
                    <td style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--mono)' }}>{a.serialNo || '—'}</td>
                    <td style={{ fontSize: 12 }}>
                      {a.employeeName ? <>{a.employeeName}<br /><span style={{ fontSize: 10, color: 'var(--muted)' }}>{a.employeeId}</span></> : <span style={{ color: 'var(--muted)' }}>—</span>}
                    </td>
                    <td>
                      <span style={{
                        padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 500,
                        color: a.status === 'Assigned' ? 'var(--tiffany)' : a.status === 'Available' ? 'var(--green)' : a.status === 'Maintenance' ? 'var(--amber)' : 'var(--red)',
                        background: a.status === 'Assigned' ? 'rgba(10,186,181,0.1)' : a.status === 'Available' ? 'rgba(46,125,50,0.1)' : a.status === 'Maintenance' ? 'var(--amber-lt)' : 'var(--red-lt)',
                      }}>{a.status}</span>
                    </td>
                    <td style={{ fontSize: 12 }}>RM {a.purchasePrice.toLocaleString()}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button className="btn btn-ghost btn-xs" onClick={() => { setEditing(a); setShowModal(true); }}>Edit</button>
                        <button className="btn btn-ghost btn-xs" style={{ color: 'var(--red)' }} onClick={() => del(a.id)}>Del</button>
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
              <h3>{editing ? 'Edit Asset' : 'Add Asset'}</h3>
              <button className="modal-close" onClick={() => { setShowModal(false); setEditing(null); }}>×</button>
            </div>
            <form onSubmit={save}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Asset Name *</label>
                  <input className="form-input" name="name" defaultValue={editing?.name || ''} required />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Type</label>
                    <select className="form-input" name="type" defaultValue={editing?.type || 'Laptop'}>
                      {ASSET_TYPES.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select className="form-input" name="status" defaultValue={editing?.status || 'Assigned'}>
                      {STATUSES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Serial Number</label>
                  <input className="form-input" name="serialNo" defaultValue={editing?.serialNo || ''} />
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
                    <label className="form-label">Purchase Date</label>
                    <input className="form-input" name="purchaseDate" type="date" defaultValue={editing?.purchaseDate?.split('T')[0] || ''} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Purchase Price (RM)</label>
                    <input className="form-input" name="purchasePrice" type="number" defaultValue={editing?.purchasePrice || 0} />
                  </div>
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
