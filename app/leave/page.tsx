'use client';

import { useEffect, useState } from 'react';
import { useToast } from '@/components/Toast';

interface LeaveReq {
  id: string;
  type: string;
  halfDay: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: string;
  employee: { name: string };
}

export default function LeavePage() {
  const [leaves, setLeaves] = useState<LeaveReq[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [form, setForm] = useState({ employeeId: 'E140', type: 'Annual Leave', halfDay: 'Full day', startDate: '', endDate: '', reason: '' });

  const fetchLeaves = async () => {
    try {
      const res = await fetch('/api/leave');
      const data = await res.json();
      if (data.success) setLeaves(data.data);
    } catch { toast('Failed', 'error'); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchLeaves(); }, []);

  const submitLeave = async () => {
    if (!form.startDate || !form.endDate) { toast('Please select start and end dates.', 'error'); return; }
    if (form.startDate > form.endDate) { toast('End date must be after start date.', 'error'); return; }
    try {
      const res = await fetch('/api/leave', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        toast('Leave submitted.', 'success');
        setForm(f => ({ ...f, startDate: '', endDate: '', reason: '' }));
        fetchLeaves();
      } else { toast(data.error || 'Failed', 'error'); }
    } catch { toast('Failed', 'error'); }
  };

  const approveLeave = async (id: string) => {
    try {
      await fetch(`/api/leave/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'Approved' }) });
      toast('Leave approved.', 'success');
      fetchLeaves();
    } catch { toast('Failed', 'error'); }
  };

  if (loading) return <div className="loading-dots"><div /><div /><div /></div>;

  return (
    <>
      <div className="g3 mb14">
        <div className="metric"><div className="metric-lbl">Annual leave</div><div className="metric-val">12 days</div><div className="metric-sub">8 remaining</div></div>
        <div className="metric"><div className="metric-lbl">Medical leave (MC)</div><div className="metric-val">14 days</div><div className="metric-sub">12 remaining</div></div>
        <div className="metric"><div className="metric-lbl">Other entitlements</div><div className="metric-val">—</div><div className="metric-sub">Maternity · Paternity · Emergency</div></div>
      </div>
      <div className="g2">
        <div className="card">
          <div className="card-hdr"><span className="card-title"><i className="ti ti-calendar-plus" aria-hidden="true"></i> Apply for leave</span></div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Leave type</label>
              <select className="form-input" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                <option>Annual Leave</option><option>Medical Leave (MC)</option><option>Emergency Leave</option>
                <option>Maternity (60 days)</option><option>Paternity (7 days)</option><option>Unpaid Leave</option><option>Hajj Leave (10 days)</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Half day?</label>
              <select className="form-input" value={form.halfDay} onChange={e => setForm(f => ({ ...f, halfDay: e.target.value }))}>
                <option>Full day</option><option>AM half day</option><option>PM half day</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Start date</label><input type="date" className="form-input" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} /></div>
            <div className="form-group"><label className="form-label">End date</label><input type="date" className="form-input" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} /></div>
          </div>
          <div className="form-group" style={{ marginBottom: 12 }}>
            <label className="form-label">Reason</label>
            <textarea className="form-input" rows={2} placeholder="Brief reason..." value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} />
          </div>
          <div style={{ display: 'flex', gap: 8 }}><button className="btn btn-primary" onClick={submitLeave}>Submit application</button><button className="btn" style={{ color: 'var(--teal)' }}><i className="ti ti-brain" aria-hidden="true"></i> Check entitlement</button></div>
        </div>
        <div className="card">
          <div className="card-hdr"><span className="card-title"><i className="ti ti-list" aria-hidden="true"></i> Leave requests</span></div>
          {leaves.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--muted)' }}>No leave requests submitted.</div>
          ) : (
            leaves.slice(0, 10).map(l => (
              <div className="row" key={l.id}>
                <div style={{ flex: 1 }}>
                  <div className="row-name">{l.type} · {l.employee.name}</div>
                  <div className="row-sub">{new Date(l.startDate).toLocaleDateString()} → {new Date(l.endDate).toLocaleDateString()}</div>
                </div>
                <span className={'badge badge-' + (l.status === 'Approved' ? 'appr' : l.status === 'Rejected' ? 'reje' : 'pend')}>{l.status}</span>
                {l.status === 'Pending' && <button className="btn btn-sm btn-success" onClick={() => approveLeave(l.id)}>Approve</button>}
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
