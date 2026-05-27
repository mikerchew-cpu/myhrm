'use client';

import { useEffect, useState } from 'react';
import { useToast } from '@/components/Toast';

interface Approval {
  id: string;
  type: string;
  referenceId: string;
  level: number;
  status: string;
  employee: { name: string };
}

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchApprovals = async () => {
    try {
      const res = await fetch('/api/approvals');
      const data = await res.json();
      if (data.success) setApprovals(data.data);
    } catch { toast('Failed', 'error'); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchApprovals(); }, []);

  const updateStatus = async (id: string, status: string) => {
    try {
      await fetch(`/api/approvals/${id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }),
      });
      toast(`Request ${status.toLowerCase()}.`, 'success');
      fetchApprovals();
    } catch { toast('Failed', 'error'); }
  };

  const pending = approvals.filter(a => a.status === 'Pending');
  const approved = approvals.filter(a => a.status === 'Approved').length;
  const rejected = approvals.filter(a => a.status === 'Rejected').length;

  if (loading) return <div className="loading-dots"><div /><div /><div /></div>;

  return (
    <>
      <div className="g4 mb14">
        <div className="metric"><div className="metric-lbl">Awaiting action</div><div className="metric-val" style={{ color: 'var(--amber)' }}>{pending.length}</div><div className="metric-sub">Oldest: 3 days</div></div>
        <div className="metric"><div className="metric-lbl">Approved this month</div><div className="metric-val" style={{ color: 'var(--green)' }}>{approved}</div><div className="metric-sub">RM 34,200 value</div></div>
        <div className="metric"><div className="metric-lbl">Rejected</div><div className="metric-val" style={{ color: 'var(--red)' }}>{rejected}</div><div className="metric-sub">This month</div></div>
        <div className="metric"><div className="metric-lbl">Escalated to L3</div><div className="metric-val" style={{ color: 'var(--purple)' }}>3</div><div className="metric-sub">Awaiting HOD</div></div>
      </div>
      <div className="card mb14">
        <div className="card-hdr">
          <span className="card-title"><i className="ti ti-clock" aria-hidden="true"></i> Pending approval</span>
          <button className="btn btn-sm" style={{ color: 'var(--teal)' }}><i className="ti ti-brain" aria-hidden="true"></i> AI review all ↗</button>
        </div>
        {pending.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 20, color: 'var(--muted)' }}>No pending approvals.</div>
        ) : (
          pending.map(a => (
            <div className="row" key={a.id}>
              <div className="row-av" style={{ background: 'var(--blue-lt)', color: 'var(--blue)' }}>{a.employee.name.split(' ').map(s=>s[0]).join('')}</div>
              <div style={{ flex: 1 }}>
                <div className="row-name">{a.employee.name}</div>
                <div className="row-sub">{a.type} · Level {a.level}</div>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button className="btn btn-sm btn-primary" onClick={() => updateStatus(a.id, 'Approved')}>Approve</button>
                <button className="btn btn-sm btn-danger" onClick={() => updateStatus(a.id, 'Rejected')}>Reject</button>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="card">
        <div className="card-hdr"><span className="card-title"><i className="ti ti-bell" aria-hidden="true"></i> Recent notifications</span></div>
        <div className="row"><div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--blue)', flexShrink: 0 }}></div><div style={{ flex: 1, fontSize: 12 }}>Ahmad Hafiz's RM 62 toll claim <strong>auto-approved</strong></div><div style={{ fontSize: 11, color: 'var(--muted)' }}>2h ago</div></div>
        <div className="row"><div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--amber)', flexShrink: 0 }}></div><div style={{ flex: 1, fontSize: 12 }}>Jason Tan's RM 2,400 training claim <strong>escalated to L3</strong></div><div style={{ fontSize: 11, color: 'var(--muted)' }}>5h ago</div></div>
        <div className="row"><div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green)', flexShrink: 0 }}></div><div style={{ flex: 1, fontSize: 12 }}>Reminder: Lim Mei Ying lodging claim pending &gt;72 hrs</div><div style={{ fontSize: 11, color: 'var(--muted)' }}>Yesterday</div></div>
      </div>
    </>
  );
}
