'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Payslip {
  id: string; month: number; year: number;
  gross: number; epf: number; socso: number; eis: number; net: number; status: string;
}

export default function PayslipsPage() {
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Payslip | null>(null);
  const router = useRouter();
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  useEffect(() => {
    fetch('/api/employee/payslips').then(r => r.json()).then(d => {
      if (d.success) setPayslips(d.data);
      else router.push('/login');
    }).catch(() => {}).finally(() => setLoading(false));
  }, [router]);

  const printPayslip = () => {
    window.print();
  };

  if (loading) return (
    <div style={{ minHeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span className="spinner" style={{ width: 28, height: 28 }}></span>
    </div>
  );

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 24px' }}>
      <h1 style={{
        fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600,
        color: 'var(--text)', marginBottom: 4, letterSpacing: '-0.3px',
      }}>
        My Payslips
      </h1>
      <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 24 }}>
        View your payslip history
      </p>

      {payslips.length === 0 ? (
        <div className="card" style={{ padding: 40, textAlign: 'center' }}>
          <i className="ti ti-file-invoice" style={{ fontSize: 36, color: 'var(--muted)', marginBottom: 12 }}></i>
          <p style={{ fontSize: 14, color: 'var(--muted)' }}>No payslips available yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {payslips.map(p => (
            <div key={p.id} className="card" style={{
              padding: '20px 24px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer',
            }} onClick={() => setSelected(p)}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>
                  {months[p.month - 1]} {p.year}
                </div>
                <div style={{ fontSize: 12, color: 'var(--muted)', display: 'flex', gap: 16 }}>
                  <span>Gross: <strong style={{ color: 'var(--text)' }}>RM {p.gross.toFixed(2)}</strong></span>
                  <span>EPF: RM {p.epf.toFixed(2)}</span>
                  <span>SOCSO: RM {p.socso.toFixed(2)}</span>
                  <span>EIS: RM {p.eis.toFixed(2)}</span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--tiffany)', marginBottom: 2 }}>
                  RM {p.net.toFixed(2)}
                </div>
                <span style={{
                  padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 500,
                  color: p.status === 'Paid' ? 'var(--tiffany)' : 'var(--amber)',
                  background: p.status === 'Paid' ? 'rgba(10,186,181,0.1)' : 'rgba(221,170,68,0.1)',
                }}>{p.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <div className="modal-header">
              <h3>Payslip — {months[selected.month - 1]} {selected.year}</h3>
              <div style={{ display: 'flex', gap: 4 }}>
                <button className="btn btn-sm btn-primary" onClick={printPayslip}>
                  <i className="ti ti-printer"></i> Print
                </button>
                <button className="modal-close" onClick={() => setSelected(null)}>×</button>
              </div>
            </div>
            <div className="modal-body" style={{ padding: 0 }}>
              <div style={{ padding: 28, textAlign: 'center', borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, color: 'var(--tiffany)' }}>MyHRM Sdn Bhd</div>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>Payslip for {months[selected.month - 1]} {selected.year}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>EA 1955 Compliant</div>
              </div>

              <div style={{ padding: 20 }}>
                <div style={{
                  background: 'var(--bg)', borderRadius: 8, padding: 16, marginBottom: 16,
                  display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 12,
                }}>
                  <div><span style={{ color: 'var(--muted)' }}>Employee:</span> <strong>YOU</strong></div>
                  <div style={{ textAlign: 'right' }}><span style={{ color: 'var(--muted)' }}>Period:</span> {months[selected.month - 1]} {selected.year}</div>
                  <div><span style={{ color: 'var(--muted)' }}>Status:</span> {selected.status}</div>
                  <div style={{ textAlign: 'right' }}><span style={{ color: 'var(--muted)' }}>Pay Date:</span> End of month</div>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left', padding: '8px 12px', borderBottom: '2px solid var(--border)', background: 'var(--gray-50)', fontSize: 11, color: 'var(--muted)' }}>Description</th>
                      <th style={{ textAlign: 'right', padding: '8px 12px', borderBottom: '2px solid var(--border)', background: 'var(--gray-50)', fontSize: 11, color: 'var(--muted)' }}>Amount (RM)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)', fontWeight: 500 }}>Gross Salary</td>
                      <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)', textAlign: 'right', fontWeight: 500 }}>{selected.gross.toFixed(2)}</td>
                    </tr>
                    <tr style={{ background: 'var(--gray-50)' }}>
                      <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)', color: 'var(--muted)' }}>EPF (Employee 11%)</td>
                      <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)', textAlign: 'right', color: 'var(--red)' }}>-{selected.epf.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)', color: 'var(--muted)' }}>SOCSO</td>
                      <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)', textAlign: 'right', color: 'var(--red)' }}>-{selected.socso.toFixed(2)}</td>
                    </tr>
                    <tr style={{ background: 'var(--gray-50)' }}>
                      <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)', color: 'var(--muted)' }}>EIS</td>
                      <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)', textAlign: 'right', color: 'var(--red)' }}>-{selected.eis.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '8px 12px', fontWeight: 600, borderBottom: 'none', fontSize: 13 }}>Net Pay</td>
                      <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 700, fontSize: 16, color: 'var(--tiffany)' }}>{selected.net.toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>

                <div style={{ marginTop: 16, fontSize: 10, color: 'var(--muted)', textAlign: 'center', borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                  This is a computer-generated document. For inquiries, contact HR.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
