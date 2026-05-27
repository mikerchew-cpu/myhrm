'use client';

import AiInsight from '@/components/AiInsight';

export default function PayrollPage() {
  return (
    <>
      <div className="callout callout-green mb14">
        <i className="ti ti-check" aria-hidden="true"></i> May 2026 payroll ready for review. EPF, SOCSO, EIS, and PCB computed.
      </div>
      <div style={{ marginBottom: 16 }}>
        <AiInsight title="Payroll Analysis" prompt="Analyse the payroll data. Look at gross salaries, EPF, SOCSO, EIS contributions. Identify trends, anomalies, or cost-saving observations." icon="cash" />
      </div>
      <div className="g4 mb14">
        <div className="metric"><div className="metric-lbl">Gross payroll</div><div className="metric-val">RM 248,500</div></div>
        <div className="metric"><div className="metric-lbl">EPF (employer 12%)</div><div className="metric-val" style={{ color: 'var(--amber)' }}>RM 29,820</div></div>
        <div className="metric"><div className="metric-lbl">SOCSO</div><div className="metric-val" style={{ color: 'var(--amber)' }}>RM 3,240</div></div>
        <div className="metric"><div className="metric-lbl">Net payroll</div><div className="metric-val" style={{ color: 'var(--teal)' }}>RM 214,448</div></div>
      </div>
      <div className="card">
        <div className="card-hdr">
          <span className="card-title"><i className="ti ti-cash" aria-hidden="true"></i> May 2026 payroll summary</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-sm">Export EPF Form A</button>
            <button className="btn btn-sm">Export SOCSO 8A</button>
            <button className="btn btn-primary btn-sm">Submit for approval</button>
          </div>
        </div>
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--muted)', fontSize: 13 }}>
          <i className="ti ti-file-analytics" style={{ fontSize: 32, display: 'block', marginBottom: 8 }} aria-hidden="true"></i>
          Payroll detail table — 142 employee payslips ready
          <br /><button className="btn" style={{ marginTop: 10 }}>Generate all payslips (PDF)</button>
        </div>
      </div>
    </>
  );
}
