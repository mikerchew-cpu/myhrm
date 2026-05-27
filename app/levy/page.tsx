'use client';

import { useState } from 'react';

const LEVY_RATES: Record<string, number> = {
  Services: 1850, Manufacturing: 1850, Construction: 1850, Plantation: 640, Agriculture: 640, 'Domestic helper': 410,
};

export default function LevyPage() {
  const [sector, setSector] = useState('Services');
  const [count, setCount] = useState(5);

  const levyRate = LEVY_RATES[sector] || 1850;
  const perWorker = levyRate + 180 + 120 + 840;
  const total = perWorker * count;

  return (
    <>
      <div className="callout callout-amber mb14">
        <i className="ti ti-alert-triangle" aria-hidden="true"></i>
        <strong>2026:</strong> Levy must be paid before VDR issuance. Multi-Tier Levy Mechanism (MTLM) expected later 2026.
      </div>
      <div className="g2">
        <div className="card">
          <div className="card-hdr"><span className="card-title"><i className="ti ti-calculator" aria-hidden="true"></i> Annual cost calculator</span></div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Sector</label><select className="form-input" value={sector} onChange={e => setSector(e.target.value)}>{Object.keys(LEVY_RATES).map(s => <option key={s}>{s}</option>)}</select></div>
            <div className="form-group"><label className="form-label">Nationality</label><select className="form-input"><option>Indonesia / Bangladesh</option><option>Nepal / Myanmar / Vietnam</option><option>Philippines</option></select></div>
          </div>
          <div className="form-group" style={{ marginBottom: 12 }}><label className="form-label">Number of workers</label><input className="form-input" type="number" value={count} min={1} onChange={e => setCount(Math.max(1, parseInt(e.target.value) || 1))} /></div>
          <div className="ot-result">
            <div className="ot-row"><span style={{ color: 'var(--muted)' }}>Annual levy per worker</span><span style={{ fontWeight: 600 }}>RM {levyRate.toLocaleString()}</span></div>
            <div className="ot-row"><span style={{ color: 'var(--muted)' }}>FOMEMA medical (est.)</span><span style={{ fontWeight: 600 }}>RM 180</span></div>
            <div className="ot-row"><span style={{ color: 'var(--muted)' }}>SKHPPA insurance</span><span style={{ fontWeight: 600 }}>RM 120</span></div>
            <div className="ot-row"><span style={{ color: 'var(--muted)' }}>SOCSO (employer)</span><span style={{ fontWeight: 600 }}>RM 840/yr</span></div>
            <div style={{ borderTop: '1px solid var(--border)', marginTop: 6, paddingTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 600 }}>Total annual cost</span>
              <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--teal)' }}>RM {total.toLocaleString()}</span>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-hdr"><span className="card-title"><i className="ti ti-table" aria-hidden="true"></i> Levy rates by sector</span></div>
          {Object.entries(LEVY_RATES).map(([s, r]) => (
            <div className="ot-row" key={s}>
              <span style={{ color: 'var(--muted)' }}>{s}</span>
              <span style={{ fontWeight: 600 }}>RM {r.toLocaleString()} / yr</span>
            </div>
          ))}
          <div className="divider"></div>
          <div className="callout callout-blue" style={{ marginBottom: 0 }}>
            <i className="ti ti-info-circle" aria-hidden="true"></i>
            Rates subject to change under MTLM 2026. Verify at <strong>mohr.gov.my</strong>
          </div>
          <div style={{ marginTop: 12 }}>
            <div className="card-title" style={{ marginBottom: 8 }}><i className="ti ti-link" aria-hidden="true"></i> Official portals</div>
            {[['Immigration Dept (JIM)', 'imi.gov.my'], ['Ministry Home Affairs', 'moha.gov.my'], ['Labour Dept (JTKSM)', 'jtksm.gov.my'], ['Expat Services (ESD)', 'esd.gov.my'], ['FOMEMA', 'fomema.com.my'], ['MYEG renewals', 'myeg.com.my']].map(([l, u]) => (
              <div key={u} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid var(--border)', fontSize: 12 }}>
                <span style={{ color: 'var(--muted)' }}>{l}</span>
                <a href={`https://www.${u}`} style={{ color: 'var(--blue)' }} target="_blank" rel="noopener noreferrer">{u}</a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
