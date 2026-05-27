'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface PortalData {
  employee: { employeeId: string; name: string; role: string; department: string; employmentType: string } | null;
  leaveBalance: { annual: number; mc: number; other: number };
  pendingLeaves: { id: string; type: string; startDate: string; endDate: string; status: string }[];
  pendingClaims: { id: string; type: string; amount: number; status: string }[];
  recentPayslips: { id: string; month: number; year: number; gross: number; net: number; status: string }[];
}

export default function EmployeeDashboard() {
  const [data, setData] = useState<PortalData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/employee/portal').then(r => r.json()).then(d => {
      if (d.success) setData(d.data);
      else router.push('/login');
    }).catch(() => {}).finally(() => setLoading(false));
  }, [router]);

  if (loading) return (
    <div style={{ minHeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span className="spinner" style={{ width: 28, height: 28 }}></span>
    </div>
  );

  if (!data?.employee) return (
    <div style={{ maxWidth: 800, margin: '60px auto', padding: '0 24px', textAlign: 'center' }}>
      <i className="ti ti-user-off" style={{ fontSize: 40, color: 'var(--muted)', marginBottom: 12 }}></i>
      <p style={{ color: 'var(--muted)', fontSize: 14 }}>No employee profile linked to your account. Contact HR.</p>
    </div>
  );

  const emp = data.employee;
  const { leaveBalance } = data;

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 24px' }}>
      {/* Welcome Header */}
      <div style={{
        background: 'var(--surface)', borderRadius: 12, border: '1px solid var(--border)',
        padding: '28px 32px', marginBottom: 24,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600,
            color: 'var(--text)', marginBottom: 4, letterSpacing: '-0.3px',
          }}>
            Welcome, {emp.name}
          </h1>
          <p style={{ fontSize: 13, color: 'var(--muted)' }}>
            {emp.role} &middot; {emp.department} &middot; {emp.employmentType}
          </p>
        </div>
        <div style={{
          padding: '8px 14px', borderRadius: 8, background: 'rgba(10,186,181,0.08)',
          border: '1px solid rgba(10,186,181,0.2)', textAlign: 'center',
        }}>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 2 }}>Employee ID</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--tiffany)' }}>{emp.employeeId}</div>
        </div>
      </div>

      {/* Leave Balance Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        <StatCard icon="calendar-check" label="Annual Leave" value={leaveBalance.annual.toString()} sub="remaining" color="var(--tiffany)" />
        <StatCard icon="stethoscope" label="Medical Leave" value={leaveBalance.mc.toString()} sub="remaining" color="var(--purple)" />
        <StatCard icon="calendar-plus" label="Other Leave" value={leaveBalance.other.toString()} sub="remaining" color="var(--amber)" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Recent Leaves */}
        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <i className="ti ti-calendar-off" style={{ color: 'var(--tiffany)' }}></i>
            Recent Leave Requests
          </h3>
          {data.pendingLeaves.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--muted)' }}>No leave requests yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {data.pendingLeaves.slice(0, 5).map(l => (
                <div key={l.id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '8px 12px', borderRadius: 8, background: 'var(--bg)',
                  fontSize: 12,
                }}>
                  <div>
                    <span style={{ fontWeight: 500, color: 'var(--text)' }}>{l.type}</span>
                    <span style={{ color: 'var(--muted)', marginLeft: 8 }}>
                      {new Date(l.startDate).toLocaleDateString()} - {new Date(l.endDate).toLocaleDateString()}
                    </span>
                  </div>
                  <Badge status={l.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Claims */}
        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <i className="ti ti-receipt" style={{ color: 'var(--tiffany)' }}></i>
            Recent Claims
          </h3>
          {data.pendingClaims.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--muted)' }}>No claims submitted yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {data.pendingClaims.slice(0, 5).map(c => (
                <div key={c.id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '8px 12px', borderRadius: 8, background: 'var(--bg)',
                  fontSize: 12,
                }}>
                  <div>
                    <span style={{ fontWeight: 500, color: 'var(--text)' }}>{c.type}</span>
                    <span style={{ color: 'var(--muted)', marginLeft: 8 }}>
                      RM {c.amount.toFixed(2)}
                    </span>
                  </div>
                  <Badge status={c.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Payslips */}
      {data.recentPayslips.length > 0 && (
        <div className="card" style={{ marginTop: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <i className="ti ti-file-invoice" style={{ color: 'var(--tiffany)' }}></i>
            Latest Payslips
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
            {data.recentPayslips.slice(0, 3).map(p => {
              const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
              return (
                <div key={p.id} style={{
                  padding: '12px 16px', borderRadius: 8, border: '1px solid var(--border)',
                  background: 'var(--bg)',
                }}>
                  <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}>
                    {months[p.month - 1]} {p.year}
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>
                    RM {p.net.toFixed(2)}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>
                    Gross: RM {p.gross.toFixed(2)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, sub, color }: { icon: string; label: string; value: string; sub: string; color: string }) {
  return (
    <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '20px 24px' }}>
      <div style={{
        width: 44, height: 44, borderRadius: 10, background: `${color}15`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <i className={`ti ti-${icon}`} style={{ fontSize: 20, color }}></i>
      </div>
      <div>
        <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)', lineHeight: 1.1 }}>{value}</div>
        <div style={{ fontSize: 12, color: 'var(--muted)' }}>{label}</div>
        <div style={{ fontSize: 10, color: 'var(--tiffany)' }}>{sub}</div>
      </div>
    </div>
  );
}

function Badge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    Approved: 'var(--tiffany)', Rejected: 'var(--red)',
    Pending: 'var(--amber)', Draft: 'var(--muted)',
  };
  const bgColors: Record<string, string> = {
    Approved: 'rgba(10,186,181,0.1)', Rejected: 'rgba(207,75,75,0.1)',
    Pending: 'rgba(221,170,68,0.1)', Draft: 'rgba(150,150,150,0.1)',
  };
  return (
    <span style={{
      padding: '2px 10px', borderRadius: 4, fontSize: 11, fontWeight: 500,
      color: colors[status] || 'var(--muted)',
      background: bgColors[status] || 'var(--bg)',
    }}>
      {status}
    </span>
  );
}
