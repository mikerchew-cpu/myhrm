'use client';

import { useState } from 'react';

export default function MatrixPage() {
  const [tab, setTab] = useState(0);
  const tabs = ['Claims', 'Leave', 'Overtime', 'Payroll'];

  return (
    <>
      <div className="tab-row">
        {tabs.map((t, i) => (
          <div key={t} className={'tab' + (i === tab ? ' on' : '')} onClick={() => setTab(i)}>{t}</div>
        ))}
      </div>
      <div className="card mb14">
        <div className="card-hdr">
          <span className="card-title"><i className="ti ti-receipt" aria-hidden="true"></i> Claims approval matrix</span>
          <button className="btn btn-sm" style={{ color: 'var(--teal)' }}><i className="ti ti-brain" aria-hidden="true"></i> AI suggest ↗</button>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="matrix-table">
            <thead><tr>
              <th style={{ width: 180 }}>Claim type / amount</th>
              <th><span className="badge badge-te">L1 — Supervisor</span></th>
              <th><span className="badge badge-info">L2 — Manager</span></th>
              <th><span className="badge badge-ot">L3 — HOD</span></th>
              <th><span className="badge badge-pend">L4 — Finance Dir.</span></th>
              <th>SLA</th>
            </tr></thead>
            <tbody>
              <tr><td>Mileage ≤ RM 100</td><td><span className="ck">✓</span> Final</td><td>—</td><td>—</td><td>—</td><td>1 day</td></tr>
              <tr><td>Mileage RM 101–500</td><td><span className="ck">✓</span> Verify</td><td><span className="ck">✓</span> Final</td><td>—</td><td>—</td><td>2 days</td></tr>
              <tr><td>Mileage &gt; RM 500</td><td><span className="ck">✓</span> Verify</td><td><span className="ck">✓</span> Recommend</td><td><span className="ck">✓</span> Final</td><td>—</td><td>3 days</td></tr>
              <tr><td>Lodging ≤ RM 300/night</td><td><span className="ck">✓</span> Verify</td><td><span className="ck">✓</span> Final</td><td>—</td><td>—</td><td>2 days</td></tr>
              <tr><td>Lodging &gt; RM 300/night</td><td><span className="ck">✓</span> Verify</td><td><span className="ck">✓</span> Recommend</td><td><span className="ck">✓</span> Final</td><td>—</td><td>3 days</td></tr>
              <tr><td>Meals ≤ RM 80/day</td><td><span className="ck">✓</span> Final</td><td>—</td><td>—</td><td>—</td><td>1 day</td></tr>
              <tr><td>Toll / Parking (any)</td><td><span className="ck">✓</span> Final</td><td>—</td><td>—</td><td>—</td><td>1 day</td></tr>
              <tr><td>Any claim &gt; RM 3,000</td><td><span className="ck">✓</span> Verify</td><td><span className="ck">✓</span> Recommend</td><td><span className="ck">✓</span> Recommend</td><td><span className="ck">✓</span> Final</td><td>5 days</td></tr>
            </tbody>
          </table>
        </div>
      </div>
      <div className="card">
        <div className="card-hdr"><span className="card-title"><i className="ti ti-settings" aria-hidden="true"></i> Level configuration</span><button className="btn btn-sm btn-primary">Save changes</button></div>
        {([
          [1, 'Direct supervisor / team lead', 'First-line · Low-value routine items'],
          [2, 'Department manager', 'Mid-value claims · Annual leave 4–7 days'],
          [3, 'Head of department (HOD)', 'High-value claims · Leave >7 days'],
          [4, 'Finance director / COO', 'Claims >RM 3,000 · Payroll changes'],
          [5, 'CEO / Board (optional)', 'Extraordinary items'],
        ] as [number, string, string][]).map(([n, role, note]) => (
          <div className="esc-rung" key={n}>
            <div className="esc-num" style={{ background: n <= 2 ? 'var(--teal-lt)' : n === 3 ? 'var(--blue-lt)' : n === 4 ? 'var(--amber-lt)' : 'var(--gray-50)', color: 'var(--teal)' }}>{n}</div>
            <div style={{ flex: 1 }}><div className="esc-role">Level {n} — {role}</div><div className="esc-note">{note}</div></div>
            <select className="form-input" style={{ width: 130, fontSize: 11 }}>
              <option>{n === 1 ? '≤ RM 100' : n === 2 ? '≤ RM 1,500' : n === 3 ? '≤ RM 5,000' : n === 4 ? '≤ RM 20,000' : 'Enabled'}</option>
            </select>
          </div>
        ))}
      </div>
    </>
  );
}
