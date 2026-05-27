'use client';

import { useEffect, useState, useCallback } from 'react';
import AiInsight from '@/components/AiInsight';

interface JobChange {
  id: string; employeeId: string; employeeName: string;
  changeType: string; previousValue: string; newValue: string;
  effectiveDate: string | null; reason: string;
  approvedBy: string; notes: string; createdAt: string;
}

const CHANGE_TYPES = ['Promotion','Transfer','Salary Adjustment','Title Change','Department Change','Termination','Rehire','Other'];

const TYPE_ICONS: Record<string, string> = {
  'Promotion': 'arrow-up', 'Transfer': 'arrows-exchange',
  'Salary Adjustment': 'moneybag', 'Title Change': 'badge',
  'Department Change': 'building', 'Termination': 'user-off',
  'Rehire': 'user-plus', 'Other': 'file-info',
};

const TYPE_COLORS: Record<string, string> = {
  'Promotion': 'var(--tiffany)', 'Transfer': 'var(--purple)',
  'Salary Adjustment': 'var(--green)', 'Title Change': 'var(--amber)',
  'Department Change': 'var(--blue)', 'Termination': 'var(--red)',
  'Rehire': 'var(--teal)', 'Other': 'var(--muted)',
};

export default function HistoryPage() {
  const [items, setItems] = useState<JobChange[]>([]);
  const [employees, setEmployees] = useState<{ id: string; employeeId: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('');

  const fetchAll = useCallback(async () => {
    const [hr, er] = await Promise.all([
      fetch('/api/history').then(r => r.json()),
      fetch('/api/employees').then(r => r.json()),
    ]);
    if (hr.success) setItems(hr.data);
    if (er.success) setEmployees(er.data.map((e: any) => ({ id: e.id, employeeId: e.employeeId, name: e.name })));
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const save = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = Object.fromEntries(fd) as Record<string, string>;
    const res = await fetch('/api/history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if ((await res.json()).success) {
      setShowModal(false); fetchAll();
    }
  };

  const filtered = filter ? items.filter(i => i.changeType === filter) : items;

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
            Employee History
          </h1>
          <p style={{ fontSize: 13, color: 'var(--muted)' }}>Track promotions, transfers, salary changes and more</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <i className="ti ti-plus"></i> Record Change
        </button>
      </div>

      <div style={{ marginBottom: 16 }}><AiInsight title="Employee Movement" prompt="Analyse employee job changes - promotions, transfers, salary adjustments, terminations. Identify retention trends." icon="timeline" /></div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        <button onClick={() => setFilter('')}
          style={{
            padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 500, cursor: 'pointer',
            border: `1px solid ${!filter ? 'var(--tiffany)' : 'var(--border)'}`,
            background: !filter ? 'var(--tiffany-lt)' : 'transparent',
            color: !filter ? 'var(--tiffany-dark)' : 'var(--muted)',
          }}>All ({items.length})</button>
        {CHANGE_TYPES.map(t => {
          const count = items.filter(i => i.changeType === t).length;
          return count > 0 ? (
            <button key={t} onClick={() => setFilter(t)}
              style={{
                padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 500, cursor: 'pointer',
                border: `1px solid ${filter === t ? TYPE_COLORS[t] : 'var(--border)'}`,
                background: filter === t ? `${TYPE_COLORS[t]}15` : 'transparent',
                color: filter === t ? TYPE_COLORS[t] : 'var(--muted)',
              }}>{t} ({count})</button>
          ) : null;
        })}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.length === 0 ? (
          <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
            No history records yet.
          </div>
        ) : filtered.map(item => {
          const color = TYPE_COLORS[item.changeType] || 'var(--muted)';
          const icon = TYPE_ICONS[item.changeType] || 'file-info';
          return (
            <div key={item.id} className="card" style={{
              borderLeft: `3px solid ${color}`,
              display: 'flex', gap: 16, alignItems: 'flex-start',
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 8, background: `${color}15`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <i className={`ti ti-${icon}`} style={{ color, fontSize: 16 }}></i>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'baseline', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>{item.employeeName}</span>
                  <span style={{
                    padding: '1px 8px', borderRadius: 4, fontSize: 10, fontWeight: 500,
                    background: `${color}15`, color,
                  }}>{item.changeType}</span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                  {item.previousValue && item.newValue && (
                    <span>
                      <span style={{ textDecoration: 'line-through', opacity: 0.6 }}>{item.previousValue}</span>
                      <i className="ti ti-arrow-right" style={{ margin: '0 6px', fontSize: 10 }}></i>
                      <span style={{ fontWeight: 500, color: 'var(--text)' }}>{item.newValue}</span>
                    </span>
                  )}
                  {item.effectiveDate && <span><i className="ti ti-calendar"></i> {new Date(item.effectiveDate).toLocaleDateString()}</span>}
                  {item.approvedBy && <span><i className="ti ti-user-check"></i> {item.approvedBy}</span>}
                  {item.employeeId && <span style={{ fontFamily: 'var(--mono)', fontSize: 10 }}>{item.employeeId}</span>}
                </div>
                {item.reason && <div style={{ fontSize: 12, color: 'var(--text)', marginTop: 4, fontStyle: 'italic' }}>"{item.reason}"</div>}
              </div>
              <div style={{ fontSize: 11, color: 'var(--muted)', whiteSpace: 'nowrap', flexShrink: 0 }}>
                {new Date(item.createdAt).toLocaleDateString()}
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <div className="modal-header">
              <h3>Record Change</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={save}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Employee</label>
                  <select className="form-input" name="employeeId" required
                    onChange={e => {
                      const emp = employees.find(ep => ep.employeeId === e.target.value || ep.id === e.target.value);
                      if (emp) {
                        const nameInput = document.querySelector('input[name="employeeName"]') as HTMLInputElement;
                        if (nameInput) nameInput.value = emp.name;
                      }
                    }}>
                    <option value="">Select employee...</option>
                    {employees.map(e => (
                      <option key={e.id} value={e.employeeId}>{e.name} ({e.employeeId})</option>
                    ))}
                  </select>
                </div>
                <input type="hidden" name="employeeName" />
                <div className="form-group">
                  <label className="form-label">Change Type *</label>
                  <select className="form-input" name="changeType" required>
                    {CHANGE_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Previous Value</label>
                    <input className="form-input" name="previousValue" placeholder="Previous role/salary/dept" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">New Value</label>
                    <input className="form-input" name="newValue" placeholder="New role/salary/dept" />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Effective Date</label>
                    <input className="form-input" name="effectiveDate" type="date" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Approved By</label>
                    <input className="form-input" name="approvedBy" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Reason</label>
                  <textarea className="form-input" name="reason" rows={2} />
                </div>
                <div className="form-group">
                  <label className="form-label">Notes</label>
                  <textarea className="form-input" name="notes" rows={2} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Record</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
