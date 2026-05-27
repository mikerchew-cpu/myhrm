'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { DashboardStats } from '@/lib/types';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/stats')
      .then(r => r.json())
      .then(res => { if (res.success) setStats(res.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-dots"><div /><div /><div /></div>;
  if (!stats) return <div className="callout callout-amber">Failed to load dashboard data.</div>;

  return (
    <>
      <div className="callout callout-amber">
        <i className="ti ti-alert-triangle" aria-hidden="true"></i>
        <strong>Action needed:</strong> 2 permits expiring in &lt;30 days · {stats.pendingClaims} claims pending approval · FOMEMA overdue for 1 worker
      </div>

      <div className="g4">
        <div className="metric">
          <div className="metric-lbl"><i className="ti ti-users" aria-hidden="true"></i> Total employees</div>
          <div className="metric-val">{stats.totalEmployees}</div>
          <div className="metric-sub up">↑ 3 this month</div>
        </div>
        <div className="metric">
          <div className="metric-lbl"><i className="ti ti-receipt" aria-hidden="true"></i> Pending claims</div>
          <div className="metric-val" style={{ color: 'var(--amber)' }}>{stats.pendingClaims}</div>
          <div className="metric-sub">RM {stats.claimsValue.toLocaleString()} total value</div>
        </div>
        <div className="metric">
          <div className="metric-lbl"><i className="ti ti-calendar-off" aria-hidden="true"></i> Leave requests</div>
          <div className="metric-val" style={{ color: 'var(--blue)' }}>{stats.pendingLeave}</div>
          <div className="metric-sub">{stats.leaveTypes.annual} annual · {stats.leaveTypes.mc} MC</div>
        </div>
        <div className="metric">
          <div className="metric-lbl"><i className="ti ti-clock-bolt" aria-hidden="true"></i> OT this month</div>
          <div className="metric-val">{stats.otHours} hrs</div>
          <div className="metric-sub">RM {stats.otAccrued.toLocaleString()} accrued</div>
        </div>
      </div>

      <div className="g2">
        <div className="card">
          <div className="card-hdr">
            <span className="card-title"><i className="ti ti-receipt" aria-hidden="true"></i> Recent claims</span>
            <Link href="/claims" className="card-link">View all <i className="ti ti-arrow-right" aria-hidden="true"></i></Link>
          </div>
          <p style={{ color: 'var(--muted)', fontSize: 13, textAlign: 'center', padding: 20 }}>
            Visit the <Link href="/claims" style={{ color: 'var(--blue)' }}>Claims page</Link> to manage claims.
          </p>
        </div>
        <div className="card">
          <div className="card-hdr">
            <span className="card-title"><i className="ti ti-calendar-off" aria-hidden="true"></i> Leave queue</span>
            <Link href="/leave" className="card-link">Manage <i className="ti ti-arrow-right" aria-hidden="true"></i></Link>
          </div>
          <p style={{ color: 'var(--muted)', fontSize: 13, textAlign: 'center', padding: 20 }}>
            Visit the <Link href="/leave" style={{ color: 'var(--blue)' }}>Leave page</Link> to manage leave requests.
          </p>
        </div>
      </div>

      <div className="g3">
        <div className="card">
          <div className="card-hdr"><span className="card-title"><i className="ti ti-clock-bolt" aria-hidden="true"></i> OT summary</span></div>
          <div className="ot-row"><span>Weekday (×1.5)</span><span style={{ fontWeight: 600 }}>186 hrs</span></div>
          <div className="ot-row"><span>Weekend (×2.0)</span><span style={{ fontWeight: 600 }}>98 hrs</span></div>
          <div className="ot-row"><span>Public holiday (×3.0)</span><span style={{ fontWeight: 600 }}>40 hrs</span></div>
          <div className="ot-row" style={{ borderTop: '1px solid var(--border)', marginTop: 4, paddingTop: 8 }}>
            <span style={{ fontWeight: 600 }}>Total payable</span>
            <span style={{ fontWeight: 700, color: 'var(--blue)' }}>RM {stats.otAccrued.toLocaleString()}</span>
          </div>
        </div>
        <div className="card">
          <div className="card-hdr"><span className="card-title"><i className="ti ti-car" aria-hidden="true"></i> Mileage this month</span></div>
          <div style={{ marginBottom: 9 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
              <span style={{ color: 'var(--muted)' }}>{stats.mileageKm.toLocaleString()} km claimed</span>
              <span style={{ fontWeight: 600 }}>RM {stats.mileageValue.toLocaleString()}</span>
            </div>
            <div className="prog-bar"><div className="prog-fill" style={{ width: '71%', background: 'var(--blue)' }}></div></div>
          </div>
          <div className="ot-row">
            <span style={{ fontWeight: 600 }}>Total mileage claim</span>
            <span style={{ fontWeight: 700, color: 'var(--blue)' }}>RM {stats.mileageValue.toLocaleString()}</span>
          </div>
        </div>
        <div className="card">
          <div className="card-hdr"><span className="card-title"><i className="ti ti-cash" aria-hidden="true"></i> Payroll snapshot</span></div>
          <div className="ot-row"><span style={{ color: 'var(--muted)' }}>Gross salaries</span><span style={{ fontWeight: 600 }}>RM {stats.payrollGross.toLocaleString()}</span></div>
          <div className="ot-row"><span style={{ color: 'var(--muted)' }}>EPF (12%)</span><span style={{ fontWeight: 600 }}>RM {stats.payrollEpf.toLocaleString()}</span></div>
          <div className="ot-row"><span style={{ color: 'var(--muted)' }}>SOCSO</span><span style={{ fontWeight: 600 }}>RM {stats.payrollSocso.toLocaleString()}</span></div>
          <div className="ot-row"><span style={{ color: 'var(--muted)' }}>EIS</span><span style={{ fontWeight: 600 }}>RM {stats.payrollEis.toLocaleString()}</span></div>
          <div className="ot-row" style={{ borderTop: '1px solid var(--border)', marginTop: 4, paddingTop: 8 }}>
            <span style={{ fontWeight: 600 }}>Net payroll</span>
            <span style={{ fontWeight: 700, color: 'var(--teal)' }}>RM {stats.payrollNet.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-hdr">
          <span className="card-title" style={{ color: 'var(--teal)' }}><i className="ti ti-brain" aria-hidden="true"></i> DeepSeek AI insights</span>
          <span className="badge badge-te">Live</span>
        </div>
        <div className="ai-chips">
          <span className="ai-chip"><i className="ti ti-chart-bar" aria-hidden="true"></i> Analyse OT trends</span>
          <span className="ai-chip"><i className="ti ti-receipt" aria-hidden="true"></i> Summarise pending claims</span>
          <span className="ai-chip"><i className="ti ti-calendar" aria-hidden="true"></i> Leave balance alert</span>
          <span className="ai-chip"><i className="ti ti-file-analytics" aria-hidden="true"></i> Payroll variance report</span>
          <span className="ai-chip"><i className="ti ti-car" aria-hidden="true"></i> Flag high mileage claims</span>
          <span className="ai-chip"><i className="ti ti-checklist" aria-hidden="true"></i> Compliance checklist</span>
        </div>
      </div>
    </>
  );
}
