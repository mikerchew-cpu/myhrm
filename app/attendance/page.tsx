'use client';

import { useEffect, useState } from 'react';
import AiInsight from '@/components/AiInsight';

interface AttRecord {
  id: string;
  date: string;
  clockIn: string;
  clockOut: string;
  status: string;
  employee: { name: string; employeeId: string };
}

export default function AttendancePage() {
  const [records, setRecords] = useState<AttRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/attendance').then(r => r.json()).then(res => {
      if (res.success) setRecords(res.data);
    }).finally(() => setLoading(false));
  }, []);

  const today = records.filter(r =>
    new Date(r.date).toDateString() === new Date().toDateString() && r.status === 'Present'
  );

  if (loading) return <div className="loading-dots"><div /><div /><div /></div>;

  return (
    <>
      <div className="callout callout-blue mb14">
        <i className="ti ti-fingerprint" aria-hidden="true"></i> Attendance module — biometric + GPS clock-in/out for field staff.
      </div>
      <div style={{ marginBottom: 16 }}>
        <AiInsight title="Attendance Insights" prompt="Analyse attendance patterns. Look at check-in/check-out times, status distribution. Identify punctuality trends." icon="fingerprint" />
      </div>
      <div className="card">
        <div className="card-hdr"><span className="card-title"><i className="ti ti-fingerprint" aria-hidden="true"></i> Today's attendance</span></div>
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--muted)' }}>
          <i className="ti ti-fingerprint" style={{ fontSize: 40, display: 'block', marginBottom: 8, color: 'var(--teal)' }} aria-hidden="true"></i>
          <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--green)' }}>{today.length} / 142</div>
          <div style={{ fontSize: 13 }}>Staff clocked in today · 10 on approved leave</div>
        </div>
      </div>
      <div className="card" style={{ marginTop: 14 }}>
        <div className="card-hdr"><span className="card-title"><i className="ti ti-list" aria-hidden="true"></i> Recent records</span></div>
        {records.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 20, color: 'var(--muted)' }}>No attendance records yet.</div>
        ) : (
          records.slice(0, 10).map(r => (
            <div className="row" key={r.id}>
              <div style={{ flex: 1 }}>
                <div className="row-name">{r.employee.name}</div>
                <div className="row-sub">{new Date(r.date).toLocaleDateString()}</div>
              </div>
              <span className="badge badge-info">{r.clockIn || '—'} → {r.clockOut || '—'}</span>
              <span className={'badge ' + (r.status === 'Present' ? 'badge-appr' : 'badge-pend')}>{r.status}</span>
            </div>
          ))
        )}
      </div>
    </>
  );
}
