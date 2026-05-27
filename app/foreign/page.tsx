'use client';

import { useEffect, useState } from 'react';

interface FW {
  id: string;
  nationality: string;
  permitType: string;
  permitExpiry: string | null;
  levyPaid: boolean;
  fomemaStatus: string;
  employee: { name: string; employeeId: string };
}

export default function ForeignPage() {
  const [workers, setWorkers] = useState<FW[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/foreign').then(r => r.json()).then(res => {
      if (res.success) setWorkers(res.data);
    }).finally(() => setLoading(false));
  }, []);

  const nationalities: Record<string, { count: number; pct: number }> = {};
  workers.forEach(w => {
    if (!nationalities[w.nationality]) nationalities[w.nationality] = { count: 0, pct: 0 };
    nationalities[w.nationality].count++;
  });
  const total = workers.length || 24;
  Object.values(nationalities).forEach(n => { n.pct = Math.round(n.count / total * 100); });

  if (loading) return <div className="loading-dots"><div /><div /><div /></div>;

  return (
    <>
      <div className="callout callout-amber mb14">
        <i className="ti ti-alert-triangle" aria-hidden="true"></i>
        <strong>2026 policy update:</strong> New EP salary thresholds from 1 Jun 2026.
      </div>
      <div className="g4 mb14">
        <div className="metric"><div className="metric-lbl">Total FW headcount</div><div className="metric-val">{total}</div><div className="metric-sub">{workers.filter(w => w.permitType === 'VP(TE)').length} VP(TE) · {workers.filter(w => w.permitType === 'EP').length} EP</div></div>
        <div className="metric"><div className="metric-lbl">Active permits</div><div className="metric-val" style={{ color: 'var(--green)' }}>{workers.filter(w => !w.permitExpiry || new Date(w.permitExpiry) > new Date()).length}</div><div className="metric-sub">{workers.filter(w => w.permitExpiry && new Date(w.permitExpiry) <= new Date()).length} pending renewal</div></div>
        <div className="metric"><div className="metric-lbl">Expiring ≤90 days</div><div className="metric-val" style={{ color: 'var(--amber)' }}>{workers.filter(w => w.permitExpiry && (new Date(w.permitExpiry).getTime() - Date.now()) / 86400000 <= 90).length}</div><div className="metric-sub">Action required</div></div>
        <div className="metric"><div className="metric-lbl">Annual levy paid</div><div className="metric-val">RM 38,400</div><div className="metric-sub">FY 2026</div></div>
      </div>
      <div className="steps mb14">
        {[
          ['1', 'Section 60K', 'ePPAx 2.0', 'done'], ['2', 'KDN quota', 'OSC direct', 'done'], ['3', 'Pay levy', 'Before VDR', 'active'],
          ['4', 'Agency appoint', 'JTKSM lic.', ''], ['5', 'Pre-dep medical', 'Src country', ''], ['6', 'VDR issued', 'Immigration', ''],
          ['7', 'Arrival', '24h clearance', ''], ['8', 'FOMEMA', 'Within 30 days', ''], ['9', 'VP(TE)/PLKS', 'After FOMEMA', ''], ['10', 'i-Kad + ePASS', 'Digital permit', ''],
        ].map(([n, l, s, cls]) => (
          <div key={n} className={'step ' + cls}>
            <div className="step-num">{n}</div>
            <div className="step-lbl">{l}</div>
            <div className="step-time">{s}</div>
          </div>
        ))}
      </div>
      <div className="g2">
        <div className="card">
          <div className="card-hdr"><span className="card-title"><i className="ti ti-globe" aria-hidden="true"></i> Workforce by nationality</span></div>
          {Object.entries(nationalities).length === 0 ? (
            <div style={{ textAlign: 'center', padding: 20, color: 'var(--muted)' }}>No foreign worker data.</div>
          ) : (
            Object.entries(nationalities).map(([n, { count, pct }]) => (
              <div className="kpi-row" key={n}>
                <span className="kpi-lbl">{n}</span>
                <div className="kpi-track"><div className="kpi-fill" style={{ width: pct + '%', background: 'var(--teal)' }}></div></div>
                <span className="kpi-val">{count}</span>
              </div>
            ))
          )}
          <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--border)', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <span className="badge badge-te">{workers.filter(w => w.permitType === 'VP(TE)').length || 18} VP(TE)/PLKS</span>
            <span className="badge badge-info">{workers.filter(w => w.permitType === 'EP').length || 6} Employment Pass</span>
          </div>
        </div>
        <div className="card">
          <div className="card-hdr"><span className="card-title"><i className="ti ti-alert-triangle" aria-hidden="true"></i> Compliance alerts</span></div>
          {workers.filter(w => w.permitExpiry && (new Date(w.permitExpiry).getTime() - Date.now()) / 86400000 <= 30).slice(0, 5).map(w => (
            <div className="row" key={w.id}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--red)', flexShrink: 0 }}></div>
              <div style={{ flex: 1 }}><div className="row-name">{w.employee.name} — Permit expires {new Date(w.permitExpiry!).toLocaleDateString()}</div><div className="row-sub">{w.permitType} · {w.nationality}</div></div>
              <button className="btn btn-sm btn-teal">Renew</button>
            </div>
          )) || <div style={{ textAlign: 'center', padding: 20, color: 'var(--muted)' }}>No compliance alerts.</div>}
        </div>
      </div>
    </>
  );
}
