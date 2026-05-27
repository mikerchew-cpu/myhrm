'use client';

import { useEffect, useState } from 'react';
import AiInsight from '@/components/AiInsight';

interface MileageRec {
  id: string;
  date: string;
  fromLocation: string;
  toLocation: string;
  distance: number;
  amount: number;
  status: string;
  employee: { name: string };
}

export default function MileagePage() {
  const [records, setRecords] = useState<MileageRec[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/mileage').then(r => r.json()).then(res => {
      if (res.success) setRecords(res.data);
    }).finally(() => setLoading(false));
  }, []);

  const totalKm = records.reduce((s, r) => s + r.distance, 0);
  const totalAmount = records.reduce((s, r) => s + r.amount, 0);

  if (loading) return <div className="loading-dots"><div /><div /><div /></div>;

  return (
    <>
      <div className="callout callout-teal mb14">
        <i className="ti ti-car" aria-hidden="true"></i> Mileage tracker — GPS-verified routes, auto-calculated claims at RM 0.60/km.
      </div>
      <div style={{ marginBottom: 16 }}>
        <AiInsight title="Mileage Insights" prompt="Analyse mileage claims - total km claimed, amounts, patterns. Flag any unusual usage." icon="car" />
      </div>
      <div className="g3 mb14">
        <div className="metric"><div className="metric-lbl">Total distance</div><div className="metric-val">{Math.round(totalKm).toLocaleString()} km</div></div>
        <div className="metric"><div className="metric-lbl">RM value</div><div className="metric-val" style={{ color: 'var(--blue)' }}>RM {totalAmount.toLocaleString()}</div></div>
        <div className="metric"><div className="metric-lbl">Active field staff</div><div className="metric-val">24</div></div>
      </div>
      <div className="card">
        <div className="card-hdr"><span className="card-title"><i className="ti ti-list" aria-hidden="true"></i> Mileage records</span></div>
        {records.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--muted)' }}>No mileage records yet.</div>
        ) : (
          records.slice(0, 10).map(r => (
            <div className="row" key={r.id}>
              <div style={{ flex: 1 }}>
                <div className="row-name">{r.fromLocation} → {r.toLocation}</div>
                <div className="row-sub">{new Date(r.date).toLocaleDateString()} · {r.distance} km</div>
              </div>
              <div className="row-right">
                <div className="row-amt">RM {r.amount.toFixed(2)}</div>
                <span className={'badge badge-' + (r.status === 'Approved' ? 'appr' : 'pend')}>{r.status}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
