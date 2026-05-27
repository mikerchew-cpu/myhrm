'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { DashboardStats } from '@/lib/types';
import AiInsight from '@/components/AiInsight';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

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

  const maxDept = Math.max(...stats.departmentBreakdown.map(d => d.count), 1);
  const maxPayroll = Math.max(...stats.payrollTrend.map(p => p.gross), 1);

  return (
    <>
      {/* Alert bar */}
      {stats.fwExpiringSoon > 0 || stats.pendingClaims > 0 || stats.documentsExpiringSoon > 0 ? (
        <div className="callout callout-amber" style={{ marginBottom: 16 }}>
          <i className="ti ti-alert-triangle" aria-hidden="true"></i>
          <strong>Action needed:</strong>
          {stats.fwExpiringSoon > 0 && <> {stats.fwExpiringSoon} permit{stats.fwExpiringSoon > 1 ? 's' : ''} expiring soon ·</>}
          {stats.pendingClaims > 0 && <> {stats.pendingClaims} claim{stats.pendingClaims > 1 ? 's' : ''} pending approval ·</>}
          {stats.documentsExpiringSoon > 0 && <> {stats.documentsExpiringSoon} document{stats.documentsExpiringSoon > 1 ? 's' : ''} expiring ·</>}
          {stats.pendingLeave > 0 && <> {stats.pendingLeave} leave request{stats.pendingLeave > 1 ? 's' : ''} awaiting approval</>}
        </div>
      ) : null}

      {/* Row 1: Key metric tiles */}
      <div className="g5" style={{ marginBottom: 16 }}>
        <div className="metric">
          <div className="metric-lbl"><i className="ti ti-users"></i> Total employees</div>
          <div className="metric-val">{stats.totalEmployees}</div>
          <div className="metric-sub">{stats.activeEmployees} active · {stats.totalEmployees - stats.activeEmployees} inactive</div>
        </div>
        <div className="metric">
          <div className="metric-lbl"><i className="ti ti-receipt"></i> Pending claims</div>
          <div className="metric-val" style={{ color: 'var(--amber)' }}>{stats.pendingClaims}</div>
          <div className="metric-sub">RM {stats.claimsValue.toLocaleString()} total value</div>
        </div>
        <div className="metric">
          <div className="metric-lbl"><i className="ti ti-calendar-off"></i> Leave requests</div>
          <div className="metric-val" style={{ color: 'var(--tiffany)' }}>{stats.pendingLeave}</div>
          <div className="metric-sub">{stats.leaveTypes.annual} annual · {stats.leaveTypes.mc} MC · {stats.leaveTypes.other} other</div>
        </div>
        <div className="metric">
          <div className="metric-lbl"><i className="ti ti-clock-bolt"></i> OT this month</div>
          <div className="metric-val">{stats.otHours} hrs</div>
          <div className="metric-sub">RM {stats.otAccrued.toLocaleString()} accrued</div>
        </div>
        <div className="metric">
          <div className="metric-lbl"><i className="ti ti-user-shield"></i> Approvals</div>
          <div className="metric-val">{stats.approvalsAwaiting}</div>
          <div className="metric-sub">{stats.approvalsApproved} approved · {stats.approvalsRejected} rejected</div>
        </div>
      </div>

      {/* Row 2: Performance + FW + Recruitment + Assets metrics */}
      <div className="g4" style={{ marginBottom: 16 }}>
        <div className="metric">
          <div className="metric-lbl"><i className="ti ti-chart-arrows"></i> Avg performance</div>
          <div className="metric-val">{stats.orgAvgScore}%</div>
          <div className="metric-sub">{stats.highPerformers} high · {stats.atRiskStaff} at-risk</div>
        </div>
        <div className="metric">
          <div className="metric-lbl"><i className="ti ti-world"></i> Foreign workers</div>
          <div className="metric-val">{stats.fwHeadcount}</div>
          <div className="metric-sub">{stats.fwExpiringSoon} permits expiring soon</div>
        </div>
        <div className="metric">
          <div className="metric-lbl"><i className="ti ti-users-plus"></i> Recruitment</div>
          <div className="metric-val">{stats.activeJobs}</div>
          <div className="metric-sub">{stats.totalApplicants} applicants · {stats.upcomingInterviews} interviews</div>
        </div>
        <div className="metric">
          <div className="metric-lbl"><i className="ti ti-tool"></i> Assets</div>
          <div className="metric-val">{stats.totalAssets}</div>
          <div className="metric-sub">RM {stats.totalAssetValue.toLocaleString()} total value</div>
        </div>
      </div>

      {/* Row 3: Recent claims + Leave queue + Dept breakdown */}
      <div className="g3" style={{ marginBottom: 16 }}>
        <div className="card">
          <div className="card-hdr">
            <span className="card-title"><i className="ti ti-receipt"></i> Recent claims</span>
            <Link href="/claims" className="card-link">View all <i className="ti ti-arrow-right"></i></Link>
          </div>
          {stats.recentClaims.length === 0 ? (
            <p style={{ color: 'var(--muted)', fontSize: 13, textAlign: 'center', padding: 20 }}>No claims yet.</p>
          ) : (
            stats.recentClaims.slice(0, 4).map(c => (
              <div className="row" key={c.id}>
                <div style={{ flex: 1 }}>
                  <div className="row-name">{c.type} · {c.employee.name}</div>
                  <div className="row-sub">{new Date(c.date).toLocaleDateString()}</div>
                </div>
                <div className="row-right">
                  <div className="row-amt">RM {c.amount.toFixed(2)}</div>
                  <span className={`badge badge-${c.status === 'Approved' ? 'appr' : c.status === 'Rejected' ? 'reje' : 'pend'}`}>{c.status}</span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="card">
          <div className="card-hdr">
            <span className="card-title"><i className="ti ti-calendar-off"></i> Leave queue</span>
            <Link href="/leave" className="card-link">Manage <i className="ti ti-arrow-right"></i></Link>
          </div>
          {stats.pendingLeaveRequests.length === 0 ? (
            <p style={{ color: 'var(--muted)', fontSize: 13, textAlign: 'center', padding: 20 }}>No pending leave.</p>
          ) : (
            stats.pendingLeaveRequests.slice(0, 4).map(l => (
              <div className="row" key={l.id}>
                <div style={{ flex: 1 }}>
                  <div className="row-name">{l.type} · {l.employee.name}</div>
                  <div className="row-sub">{new Date(l.startDate).toLocaleDateString()} — {new Date(l.endDate).toLocaleDateString()}</div>
                </div>
                <span className="badge badge-pend">Pending</span>
              </div>
            ))
          )}
        </div>

        <div className="card">
          <div className="card-hdr">
            <span className="card-title"><i className="ti ti-building"></i> Department breakdown</span>
          </div>
          {stats.departmentBreakdown.map(d => (
            <div className="kpi-row" key={d.department}>
              <span className="kpi-lbl">{d.department}</span>
              <div className="kpi-track">
                <div className="kpi-fill" style={{ width: `${(d.count / maxDept) * 100}%`, background: d.department === 'HR' ? 'var(--tiffany)' : 'var(--teal)' }}></div>
              </div>
              <span className="kpi-val">{d.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Row 4: OT summary + Payroll + Employee status distribution */}
      <div className="g3" style={{ marginBottom: 16 }}>
        <div className="card">
          <div className="card-hdr"><span className="card-title"><i className="ti ti-clock-bolt"></i> OT by day type</span></div>
          {stats.otDayTypes.length === 0 ? (
            <p style={{ color: 'var(--muted)', fontSize: 13, textAlign: 'center', padding: 20 }}>No OT logged.</p>
          ) : (
            stats.otDayTypes.map(ot => (
              <div className="ot-row" key={ot.dayType}>
                <span>{ot.dayType}</span>
                <span style={{ fontWeight: 600 }}>{ot.hours} hrs</span>
              </div>
            ))
          )}
          <div className="ot-row" style={{ borderTop: '1px solid var(--border)', marginTop: 4, paddingTop: 8 }}>
            <span style={{ fontWeight: 600 }}>Total payable</span>
            <span style={{ fontWeight: 700, color: 'var(--tiffany)' }}>RM {stats.otAccrued.toLocaleString()}</span>
          </div>
        </div>

        <div className="card">
          <div className="card-hdr"><span className="card-title"><i className="ti ti-cash"></i> Payroll snapshot</span></div>
          <div className="ot-row"><span style={{ color: 'var(--muted)' }}>Gross salaries</span><span style={{ fontWeight: 600 }}>RM {stats.payrollGross.toLocaleString()}</span></div>
          <div className="ot-row"><span style={{ color: 'var(--muted)' }}>EPF</span><span style={{ fontWeight: 600 }}>RM {stats.payrollEpf.toLocaleString()}</span></div>
          <div className="ot-row"><span style={{ color: 'var(--muted)' }}>SOCSO</span><span style={{ fontWeight: 600 }}>RM {stats.payrollSocso.toLocaleString()}</span></div>
          <div className="ot-row"><span style={{ color: 'var(--muted)' }}>EIS</span><span style={{ fontWeight: 600 }}>RM {stats.payrollEis.toLocaleString()}</span></div>
          <div className="ot-row" style={{ borderTop: '1px solid var(--border)', marginTop: 4, paddingTop: 8 }}>
            <span style={{ fontWeight: 600 }}>Net payroll</span>
            <span style={{ fontWeight: 700, color: 'var(--teal)' }}>RM {stats.payrollNet.toLocaleString()}</span>
          </div>

          {stats.payrollTrend.length > 0 && (
            <>
              <div className="divider"></div>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.4px' }}>Trend (gross)</div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 50 }}>
                {stats.payrollTrend.slice().reverse().map(p => (
                  <div key={`${p.month}-${p.year}`} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <div style={{
                      width: '100%', height: `${(p.gross / maxPayroll) * 40}px`,
                      background: 'var(--tiffany)', borderRadius: '4px 4px 0 0', minHeight: 4,
                      opacity: p.month === new Date().getMonth() + 1 ? 1 : 0.6,
                    }}></div>
                    <span style={{ fontSize: 8, color: 'var(--muted)', whiteSpace: 'nowrap' }}>{MONTHS[p.month - 1]}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="card">
          <div className="card-hdr"><span className="card-title"><i className="ti ti-adjustments"></i> Employee status</span></div>
          {stats.employeeStatuses.map(s => (
            <div className="ot-row" key={s.status}>
              <span>{s.status}</span>
              <span style={{ fontWeight: 600, color: s.status === 'Active' ? 'var(--green)' : s.status === 'Inactive' ? 'var(--red)' : 'var(--amber)' }}>{s.count}</span>
            </div>
          ))}
          <div style={{ marginTop: 10, display: 'flex', gap: 3 }}>
            {stats.employeeStatuses.map(s => {
              const pct = (s.count / stats.totalEmployees) * 100;
              return (
                <div key={s.status} style={{
                  flex: pct, height: 6, borderRadius: 3,
                  background: s.status === 'Active' ? 'var(--green)' : s.status === 'Inactive' ? 'var(--red)' : 'var(--amber)',
                }}></div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Row 5: Mileage + Training + Recruitment quick view */}
      <div className="g3" style={{ marginBottom: 16 }}>
        <div className="card">
          <div className="card-hdr"><span className="card-title"><i className="ti ti-car"></i> Mileage</span></div>
          <div style={{ marginBottom: 9 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
              <span style={{ color: 'var(--muted)' }}>{stats.mileageKm.toLocaleString()} km claimed</span>
              <span style={{ fontWeight: 600 }}>RM {stats.mileageValue.toLocaleString()}</span>
            </div>
            <div className="prog-bar"><div className="prog-fill" style={{ width: `${Math.min(100, (stats.mileageKm / 5000) * 100)}%`, background: 'var(--tiffany)' }}></div></div>
          </div>
          <div className="ot-row">
            <span style={{ fontWeight: 600 }}>Total</span>
            <span style={{ fontWeight: 700, color: 'var(--tiffany)' }}>RM {stats.mileageValue.toLocaleString()}</span>
          </div>
        </div>

        <div className="card">
          <div className="card-hdr"><span className="card-title"><i className="ti ti-book"></i> Training</span></div>
          <div className="ot-row"><span>Completed</span><span style={{ fontWeight: 600, color: 'var(--green)' }}>{stats.trainingCompleted}</span></div>
          <div className="ot-row"><span>In progress</span><span style={{ fontWeight: 600, color: 'var(--tiffany)' }}>{stats.trainingInProgress}</span></div>
          <div className="ot-row"><span>Upcoming / planned</span><span style={{ fontWeight: 600 }}>{stats.upcomingTraining}</span></div>
          <Link href="/training" className="card-link" style={{ marginTop: 8 }}>
            Manage training <i className="ti ti-arrow-right"></i>
          </Link>
        </div>

        <div className="card">
          <div className="card-hdr">
            <span className="card-title"><i className="ti ti-megaphone"></i> Announcements</span>
            <Link href="/announcements" className="card-link">View all</Link>
          </div>
          {stats.recentAnnouncements.length === 0 ? (
            <p style={{ color: 'var(--muted)', fontSize: 13, textAlign: 'center', padding: 20 }}>No active announcements.</p>
          ) : (
            stats.recentAnnouncements.map(a => (
              <div className="row" key={a.id}>
                <div style={{
                  width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
                  background: a.priority === 'High' ? 'var(--red)' : a.priority === 'Medium' ? 'var(--amber)' : 'var(--gray-400)',
                }}></div>
                <div style={{ flex: 1 }}>
                  <div className="row-name">{a.title}</div>
                  <div className="row-sub">{new Date(a.createdAt).toLocaleDateString()}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* AI Insights */}
      <div style={{ marginBottom: 16 }}>
        <AiInsight title="Executive Dashboard Insights" prompt="Analyse the overall HR dashboard metrics: employee count, pending claims, leave requests, overtime hours, mileage, payroll snapshot, performance scores, foreign worker compliance, recruitment pipeline, training status, asset inventory, and announcements. Provide a concise executive summary of the key findings and recommendations." icon="layout-dashboard" />
      </div>
    </>
  );
}
