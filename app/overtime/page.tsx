'use client';

import { useState } from 'react';
import AiInsight from '@/components/AiInsight';

export default function OvertimePage() {
  const [sal, setSal] = useState(3500);
  const [hrs, setHrs] = useState(10);
  const [mult, setMult] = useState(1.5);
  const [days, setDays] = useState(26);

  const hr = sal / days / 8;
  const otHr = hr * mult;
  const total = otHr * hrs;

  return (
    <>
      <div className="callout callout-blue">
        <i className="ti ti-info-circle" aria-hidden="true"></i>
        EA 1955 s60A:         OT rate = Monthly Salary ÷ 26 ÷ 8 × multiplier. Cap: 104 hrs/month.
      </div>
      <div style={{ marginBottom: 16 }}>
        <AiInsight title="Overtime Analysis" prompt="Analyse overtime data. Look at total hours, department breakdown, and accrual amounts. Identify departments with high OT and suggest improvements." icon="clock-bolt" />
      </div>
      <div className="g2">
        <div className="card">
          <div className="card-hdr"><span className="card-title"><i className="ti ti-calculator" aria-hidden="true"></i> OT calculator — EA 1955 s60A</span></div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Basic monthly salary (RM)</label><input className="form-input" type="number" value={sal} onChange={e => setSal(parseFloat(e.target.value) || 0)} /></div>
            <div className="form-group"><label className="form-label">OT hours</label><input className="form-input" type="number" value={hrs} onChange={e => setHrs(parseFloat(e.target.value) || 0)} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Day type</label><select className="form-input" value={mult} onChange={e => setMult(parseFloat(e.target.value))}><option value={1.5}>Normal workday (×1.5)</option><option value={2.0}>Rest day (×2.0)</option><option value={3.0}>Public holiday (×3.0)</option></select></div>
            <div className="form-group"><label className="form-label">Working days/month</label><input className="form-input" type="number" value={days} onChange={e => setDays(parseFloat(e.target.value) || 26)} /></div>
          </div>
          <div className="ot-result">
            <div className="ot-row"><span style={{ color: 'var(--muted)' }}>Hourly rate (÷26÷8)</span><span style={{ fontWeight: 600 }}>RM {hr.toFixed(2)}</span></div>
            <div className="ot-row"><span style={{ color: 'var(--muted)' }}>OT multiplier</span><span style={{ fontWeight: 600 }}>×{mult.toFixed(1)}</span></div>
            <div className="ot-row"><span style={{ color: 'var(--muted)' }}>OT rate per hour</span><span style={{ fontWeight: 600 }}>RM {otHr.toFixed(2)}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, marginTop: 6, borderTop: '1px solid var(--border)' }}>
              <span style={{ fontWeight: 600 }}>Total OT pay</span>
              <span style={{ fontSize: 22, fontWeight: 700, color: 'var(--blue)' }}>RM {total.toFixed(2)}</span>
            </div>
          </div>
          <div className="callout callout-amber" style={{ marginTop: 12, marginBottom: 0 }}>
            <i className="ti ti-alert-triangle" aria-hidden="true"></i>
            EA 1955: Maximum 104 hours OT per month.
          </div>
        </div>
        <div className="card">
          <div className="card-hdr"><span className="card-title"><i className="ti ti-clock-bolt" aria-hidden="true"></i> Team OT log — May 2026</span></div>
          {([['Faizal Hashim','Field Tech',30,'RM 855'],['Jason Tan','Service Eng.',18,'RM 756'],['Rashid Abdullah','Field Tech',24,'RM 604'],['Kumari Selvam','Support',12,'RM 378']] as [string, string, number, string][]).map(([n,r,h,a]) => (
            <div className="row" key={n}>
              <div className="row-av" style={{ background: '#EEEDFE', color: '#3C3489' }}>{n.split(' ').map(s=>s[0]).join('')}</div>
              <div style={{ flex: 1 }}><div className="row-name">{n}</div><div className="row-sub">{r}</div></div>
              <div style={{ textAlign: 'right' }}><div className="row-amt">{h} hrs</div><span className="badge badge-ot">{a}</span></div>
            </div>
          ))}
          <div style={{ marginTop: 12, background: 'var(--bg)', borderRadius: 9, padding: '12px 14px', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>Team OT payable</span>
            <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--blue)' }}>RM 18,960</span>
          </div>
        </div>
      </div>
    </>
  );
}
