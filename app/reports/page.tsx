'use client';

import { useEffect, useState } from 'react';

interface ReportType {
  key: string; label: string; description: string; icon: string;
}

interface ReportData {
  aiSummary: string;
  reportLabel: string;
  reportType: string;
  [key: string]: unknown;
}

export default function ReportsPage() {
  const [reportTypes, setReportTypes] = useState<ReportType[]>([]);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetch('/api/reports/generate').then(r => r.json()).then(d => {
      if (d.success) setReportTypes(d.data);
    }).catch(() => {});
  }, []);

  const generateReport = async (type: string) => {
    setSelectedType(type);
    setGenerating(true);
    setReportData(null);
    try {
      const res = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      });
      const d = await res.json();
      if (d.success) setReportData(d.data);
    } catch { /* ignore */ }
    finally { setGenerating(false); setLoading(false); }
  };

  const exportCsv = () => {
    if (!reportData) return;
    const rows: string[][] = [];
    const headers: string[] = [];
    const values: string[] = [];
    for (const [k, v] of Object.entries(reportData)) {
      if (k === 'aiSummary' || k === 'reportLabel' || k === 'reportType') continue;
      headers.push(k);
      values.push(typeof v === 'object' ? JSON.stringify(v) : String(v));
    }
    const csv = [headers.join(','), values.join(',')].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportData.reportType}-report.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const printReport = () => window.print();

  return (
    <div style={{ maxWidth: 960, margin: '0 auto' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600, marginBottom: 4, letterSpacing: '-0.3px' }}>
        Reports & Analytics
      </h1>
      <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 20 }}>
        Generate AI-powered reports with DeepSeek insights
      </p>

      <div className="g3" style={{ marginBottom: 20 }}>
        {reportTypes.map(rt => (
          <div key={rt.key} className="card" style={{
            cursor: 'pointer', padding: 18,
            borderColor: selectedType === rt.key ? 'var(--tiffany)' : 'var(--border)',
            transition: 'border-color .15s',
          }} onClick={() => generateReport(rt.key)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: 'var(--tiffany-lt)', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                color: 'var(--tiffany-dark)', fontSize: 18,
              }}>
                <i className={`ti ti-${rt.icon}`}></i>
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{rt.label}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>{rt.description}</div>
              </div>
            </div>
            <button className="btn btn-sm btn-primary" style={{ width: '100%' }}
              onClick={(e) => { e.stopPropagation(); generateReport(rt.key); }}>
              <i className="ti ti-sparkles"></i> Generate
            </button>
          </div>
        ))}
      </div>

      {generating && (
        <div className="card" style={{ textAlign: 'center', padding: 40 }}>
          <span className="spinner" style={{ width: 24, height: 24 }}></span>
          <p style={{ marginTop: 12, color: 'var(--muted)' }}>DeepSeek AI is generating your report...</p>
        </div>
      )}

      {reportData && (
        <div className="card" style={{ marginTop: 8 }}>
          <div className="card-hdr">
            <span className="card-title">
              <i className="ti ti-file-analytics"></i> {reportData.reportLabel}
            </span>
            <div style={{ display: 'flex', gap: 6 }}>
              <button className="btn btn-sm" onClick={exportCsv}>
                <i className="ti ti-file-export"></i> CSV
              </button>
              <button className="btn btn-sm" onClick={printReport}>
                <i className="ti ti-printer"></i> Print
              </button>
            </div>
          </div>

          {reportData.aiSummary && (
            <div style={{
              background: 'var(--tiffany-lt)', borderRadius: 8, padding: 16, marginBottom: 16,
              borderLeft: '3px solid var(--tiffany)',
            }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--tiffany-dark)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.5px' }}>
                <i className="ti ti-brain"></i> DeepSeek AI Analysis
              </div>
              <div style={{ fontSize: 13, lineHeight: 1.7, whiteSpace: 'pre-wrap', color: 'var(--text)' }}>
                {reportData.aiSummary}
              </div>
            </div>
          )}

          <div style={{ overflowX: 'auto' }}>
            <table className="tbl">
              <thead>
                <tr>
                  {Object.entries(reportData).filter(([k]) => !['aiSummary','reportLabel','reportType'].includes(k)).map(([k]) => (
                    <th key={k}>{k.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  {Object.entries(reportData).filter(([k]) => !['aiSummary','reportLabel','reportType'].includes(k)).map(([k, v]) => (
                    <td key={k}>
                      {typeof v === 'object' ? (
                        <div style={{ fontSize: 11, whiteSpace: 'pre-wrap', maxHeight: 120, overflowY: 'auto' }}>
                          {JSON.stringify(v, null, 1)}
                        </div>
                      ) : typeof v === 'number' ? (
                        <strong>{v.toLocaleString()}</strong>
                      ) : (
                        String(v)
                      )}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      <style jsx global>{`
        @media print {
          .sidebar, .topbar, footer, .btn { display: none !important; }
          .content { padding: 0 !important; }
        }
      `}</style>
    </div>
  );
}
