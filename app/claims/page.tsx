'use client';

import { useEffect, useState } from 'react';
import { useToast } from '@/components/Toast';

interface Claim {
  id: string;
  type: string;
  date: string;
  fromLocation: string;
  toLocation: string;
  distance: number;
  rate: number;
  amount: number;
  remarks: string;
  status: string;
  employee: { name: string };
}

export default function ClaimsPage() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const [form, setForm] = useState({ employeeId: 'E138', type: 'Mileage', date: '2026-05-16', fromLocation: '', toLocation: '', distance: 0, rate: 0.6, remarks: '' });

  const fetchClaims = async () => {
    try {
      const res = await fetch('/api/claims');
      const data = await res.json();
      if (data.success) setClaims(data.data);
    } catch { toast('Failed to load claims', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchClaims(); }, []);

  const calcAmount = () => form.distance * form.rate;

  const submitClaim = async () => {
    if (!form.fromLocation || !form.toLocation || form.distance <= 0) {
      toast('Please fill locations and a valid distance.', 'error'); return;
    }
    try {
      const res = await fetch('/api/claims', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, amount: calcAmount() }),
      });
      const data = await res.json();
      if (data.success) {
        toast('Claim submitted.', 'success');
        setForm(f => ({ ...f, fromLocation: '', toLocation: '', distance: 0, remarks: '' }));
        fetchClaims();
      } else { toast(data.error || 'Failed', 'error'); }
    } catch { toast('Failed to submit claim', 'error'); }
  };

  if (loading) return <div className="loading-dots"><div /><div /><div /></div>;

  return (
    <div className="g2">
      <div className="card">
        <div className="card-hdr"><span className="card-title"><i className="ti ti-plus" aria-hidden="true"></i> New field claim</span></div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Claim type</label>
            <select className="form-input" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
              <option>Mileage</option><option>Lodging</option><option>Meals</option><option>Toll / Parking</option><option>Miscellaneous</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Date</label>
            <input type="date" className="form-input" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">From location</label><input className="form-input" placeholder="e.g. Shah Alam HQ" value={form.fromLocation} onChange={e => setForm(f => ({ ...f, fromLocation: e.target.value }))} /></div>
          <div className="form-group"><label className="form-label">To location</label><input className="form-input" placeholder="e.g. Johor Bahru client" value={form.toLocation} onChange={e => setForm(f => ({ ...f, toLocation: e.target.value }))} /></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Distance (km)</label><input className="form-input" type="number" placeholder="0" value={form.distance || ''} onChange={e => setForm(f => ({ ...f, distance: parseFloat(e.target.value) || 0 }))} /></div>
          <div className="form-group"><label className="form-label">Rate (RM/km)</label><input className="form-input" type="number" value={form.rate} step="0.05" onChange={e => setForm(f => ({ ...f, rate: parseFloat(e.target.value) || 0.6 }))} /></div>
        </div>
        <div style={{ background: 'var(--blue-lt)', borderRadius: 9, padding: '11px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <span style={{ fontSize: 12, color: 'var(--navy)' }}>Calculated amount</span>
          <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--blue)' }}>RM {calcAmount().toFixed(2)}</span>
        </div>
        <div className="form-group" style={{ marginBottom: 12 }}>
          <label className="form-label">Remarks</label>
          <textarea className="form-input" rows={2} placeholder="Purpose of visit, client name..." value={form.remarks} onChange={e => setForm(f => ({ ...f, remarks: e.target.value }))} />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-primary" onClick={submitClaim}>Submit claim</button>
          <button className="btn" onClick={() => toast('Draft saved.', '')}>Save draft</button>
          <button className="btn" style={{ marginLeft: 'auto', color: 'var(--teal)' }}><i className="ti ti-brain" aria-hidden="true"></i> AI review ↗</button>
        </div>
      </div>
      <div className="card">
        <div className="card-hdr"><span className="card-title"><i className="ti ti-list" aria-hidden="true"></i> Claims history</span></div>
        {claims.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--muted)' }}>No claims yet. Submit one above.</div>
        ) : (
          claims.slice(0, 10).map(c => (
            <div className="row" key={c.id}>
              <div style={{ flex: 1 }}>
                <div className="row-name">{c.type} · {c.fromLocation} → {c.toLocation}</div>
                <div className="row-sub">{new Date(c.date).toLocaleDateString()} · {c.distance} km</div>
              </div>
              <div className="row-right">
                <div className="row-amt">RM {c.amount.toFixed(2)}</div>
                <span className={'badge badge-' + (c.status === 'Approved' ? 'appr' : c.status === 'Rejected' ? 'reje' : 'pend')}>{c.status}</span>
              </div>
            </div>
          ))
        )}
        {claims.length > 0 && (
          <div style={{ marginTop: 12, background: 'var(--bg)', borderRadius: 9, padding: '12px 14px', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 3 }}>Total claims value</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--blue)' }}>RM {claims.reduce((s, c) => s + c.amount, 0).toFixed(2)}</div>
          </div>
        )}
      </div>
    </div>
  );
}
