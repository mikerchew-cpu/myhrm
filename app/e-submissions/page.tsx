'use client';

import { useEffect, useState, useCallback } from 'react';

interface ESubmission {
  id: string; type: string; title: string;
  periodMonth: number; periodYear: number;
  content: string; recordCount: number; totalAmount: number;
  status: string; createdAt: string;
}

const REPORT_TYPES = [
  { value: 'BANK_FILE', label: 'Bank File (IBG)', icon: 'building-bank', color: 'var(--tiffany)' },
  { value: 'EPF', label: 'EPF / KWSP', icon: 'piggy-bank', color: '#2E7D32' },
  { value: 'SOCSO', label: 'SOCSO / PERKESO', icon: 'shield-check', color: '#6A1B9A' },
  { value: 'EIS', label: 'EIS / SIP', icon: 'lifebuoy', color: '#00897B' },
  { value: 'CP39', label: 'PCB / CP39', icon: 'receipt-tax', color: '#B76E1E' },
  { value: 'BORANG_E', label: 'Borang E (Annual)', icon: 'file-spreadsheet', color: '#424242' },
];

export default function ESubmissionsPage() {
  const [submissions, setSubmissions] = useState<ESubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [genType, setGenType] = useState('BANK_FILE');
  const [genMonth, setGenMonth] = useState(new Date().getMonth() + 1);
  const [genYear, setGenYear] = useState(new Date().getFullYear());
  const [generating, setGenerating] = useState(false);
  const [genMsg, setGenMsg] = useState('');

  const fetchSubs = useCallback(async () => {
    const res = await fetch('/api/e-submissions').then(r => r.json());
    if (res.success) setSubmissions(res.data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchSubs(); }, [fetchSubs]);

  const generate = async () => {
    setGenerating(true);
    setGenMsg('');
    try {
      const res = await fetch('/api/e-submissions/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: genType, periodMonth: genMonth, periodYear: genYear }),
      });
      const d = await res.json();
      if (d.success) {
        setGenMsg(`${REPORT_TYPES.find(r => r.value === genType)?.label} generated successfully`);
        fetchSubs();
      } else {
        setGenMsg(d.error || 'Generation failed');
      }
    } catch {
      setGenMsg('Network error');
    } finally {
      setGenerating(false);
    }
  };

  const download = (sub: ESubmission) => {
    const ext = sub.type === 'BANK_FILE' ? '.csv' : '.csv';
    const blob = new Blob([sub.content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${sub.title.replace(/\s+/g, '_')}${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  if (loading) return (
    <div style={{ minHeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span className="spinner" style={{ width: 28, height: 28 }}></span>
    </div>
  );

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>
        E-Submissions
      </h1>
      <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 24 }}>
        Generate Malaysia statutory reports and bank files
      </p>

      {/* Generator */}
      <div className="card" style={{ padding: 24, marginBottom: 24 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <i className="ti ti-file-export" style={{ color: 'var(--tiffany)' }}></i>
          Generate Report
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
          {REPORT_TYPES.map(rt => (
            <button key={rt.value} onClick={() => setGenType(rt.value)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '14px 16px', borderRadius: 10, cursor: 'pointer',
                border: genType === rt.value ? `2px solid ${rt.color}` : '1px solid var(--border)',
                background: genType === rt.value ? `${rt.color}10` : 'var(--surface)',
                transition: 'all .15s', textAlign: 'left',
              }}>
              <div style={{
                width: 36, height: 36, borderRadius: 8,
                background: `${rt.color}15`, display: 'flex',
                alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <i className={`ti ti-${rt.icon}`} style={{ color: rt.color, fontSize: 16 }}></i>
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{rt.label}</div>
                <div style={{ fontSize: 10, color: 'var(--muted)' }}>Monthly report</div>
              </div>
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
          <div className="form-group" style={{ width: 140 }}>
            <label className="form-label">Month</label>
            <select className="form-input" value={genMonth} onChange={e => setGenMonth(Number(e.target.value))}>
              {months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ width: 120 }}>
            <label className="form-label">Year</label>
            <input className="form-input" type="number" value={genYear} onChange={e => setGenYear(Number(e.target.value))} />
          </div>
          <button className="btn btn-primary" onClick={generate} disabled={generating}
            style={{ padding: '8px 20px' }}>
            {generating ? <span className="spinner" style={{ width: 14, height: 14 }}></span> : <><i className="ti ti-file-export"></i> Generate</>}
          </button>
        </div>

        {genMsg && (
          <div style={{
            marginTop: 12, padding: '8px 14px', borderRadius: 8, fontSize: 12,
            background: genMsg.includes('successfully') ? 'rgba(10,186,181,0.1)' : 'var(--red-lt)',
            color: genMsg.includes('successfully') ? 'var(--tiffany)' : 'var(--red)',
          }}>
            <i className={`ti ti-${genMsg.includes('successfully') ? 'circle-check' : 'alert-circle'}`}></i> {genMsg}
          </div>
        )}
      </div>

      {/* History */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div className="card-hdr">
          <span className="card-title"><i className="ti ti-history"></i> Report History</span>
        </div>
        {submissions.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', fontSize: 13, color: 'var(--muted)' }}>
            No reports generated yet.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="tbl">
              <thead>
                <tr>
                  <th>Report</th>
                  <th>Period</th>
                  <th>Records</th>
                  <th>Amount</th>
                  <th>Generated</th>
                  <th style={{ width: 80 }}>Download</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map(s => {
                  const rt = REPORT_TYPES.find(r => r.value === s.type);
                  return (
                    <tr key={s.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <i className={`ti ti-${rt?.icon || 'file'}`} style={{ color: rt?.color || 'var(--muted)' }}></i>
                          <span style={{ fontWeight: 500 }}>{s.title}</span>
                        </div>
                      </td>
                      <td style={{ fontSize: 12 }}>{months[s.periodMonth - 1]} {s.periodYear}</td>
                      <td style={{ fontSize: 12 }}>{s.recordCount}</td>
                      <td style={{ fontSize: 12 }}>RM {s.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td style={{ fontSize: 12, color: 'var(--muted)' }}>{new Date(s.createdAt).toLocaleDateString()}</td>
                      <td>
                        <button className="btn btn-sm btn-primary" onClick={() => download(s)}>
                          <i className="ti ti-download"></i> CSV
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
