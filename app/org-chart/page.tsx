'use client';

import { useEffect, useState } from 'react';

interface Employee {
  id: string; employeeId: string; name: string; role: string;
  department: string; employmentType: string; status: string;
}

const DEPT_COLORS: Record<string, string> = {
  'Field Services': '#0ABAB5',
  'Tech Support': '#6A1B9A',
  'Sales': '#B76E1E',
  'HR': '#2E7D32',
  'Finance': '#00897B',
  'Admin': '#424242',
};

export default function OrgChartPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/employees').then(r => r.json()).then(d => {
      if (d.success) setEmployees(d.data);
    }).finally(() => setLoading(false));
  }, []);

  const grouped = employees.reduce((acc, e) => {
    if (!acc[e.department]) acc[e.department] = [];
    acc[e.department].push(e);
    return acc;
  }, {} as Record<string, Employee[]>);

  if (loading) return (
    <div style={{ minHeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span className="spinner" style={{ width: 28, height: 28 }}></span>
    </div>
  );

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>
        Organization Chart
      </h1>
      <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 24 }}>
        {employees.length} employees across {Object.keys(grouped).length} departments
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
        {Object.entries(grouped).map(([dept, emps]) => {
          const color = DEPT_COLORS[dept] || 'var(--tiffany)';
          const mgr = emps.find(e => e.role.toLowerCase().includes('manager') || e.role.toLowerCase().includes('head'));
          const rest = mgr ? emps.filter(e => e.id !== mgr.id) : emps;
          return (
            <div key={dept}>
              <div style={{
                padding: '10px 18px', borderRadius: 8, marginBottom: 16,
                background: `${color}12`, borderLeft: `3px solid ${color}`,
                fontSize: 14, fontWeight: 600, color: 'var(--text)',
              }}>
                <i className="ti ti-building" style={{ marginRight: 8, color }}></i>
                {dept}
                <span style={{ color: 'var(--muted)', fontWeight: 400, marginLeft: 8 }}>
                  {emps.length} {emps.length === 1 ? 'person' : 'people'}
                </span>
              </div>

              <div style={{
                display: 'flex', justifyContent: 'center', gap: 16,
                flexWrap: 'wrap', position: 'relative',
              }}>
                {mgr && (
                  <div style={{
                    textAlign: 'center', padding: '16px 24px',
                    border: `2px solid ${color}`, borderRadius: 12,
                    background: `${color}08`, minWidth: 180,
                  }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: '50%',
                      background: `${color}20`, display: 'flex', alignItems: 'center',
                      justifyContent: 'center', margin: '0 auto 8px',
                      fontSize: 16, fontWeight: 700, color,
                    }}>
                      {mgr.name.split(' ').map(s => s[0]).join('')}
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{mgr.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)' }}>{mgr.role}</div>
                    <div style={{ fontSize: 10, color, marginTop: 4 }}>
                      <i className="ti ti-badge"></i> {mgr.employeeId}
                    </div>
                  </div>
                )}

                {rest.length > 0 && (
                  <div style={{
                    display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center',
                  }}>
                    {mgr && (
                      <div style={{
                        display: 'flex', alignItems: 'center', color: 'var(--muted)',
                        fontSize: 20, padding: '0 4px',
                      }}>
                        <i className="ti ti-arrow-bear-right"></i>
                      </div>
                    )}
                    {rest.map(e => (
                      <div key={e.id} style={{
                        textAlign: 'center', padding: '12px 16px',
                        border: `1px solid var(--border)`, borderRadius: 10,
                        background: 'var(--surface)', minWidth: 150,
                        boxShadow: 'var(--shadow-sm)',
                      }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: '50%',
                          background: `${color}15`, display: 'flex', alignItems: 'center',
                          justifyContent: 'center', margin: '0 auto 6px',
                          fontSize: 13, fontWeight: 600, color,
                        }}>
                          {e.name.split(' ').map(s => s[0]).join('')}
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{e.name}</div>
                        <div style={{ fontSize: 10, color: 'var(--muted)' }}>{e.role}</div>
                        <div style={{
                          marginTop: 4, fontSize: 9, padding: '1px 6px', borderRadius: 3,
                          display: 'inline-block',
                          background: e.status === 'Active' ? 'rgba(10,186,181,0.1)' : 'var(--amber-lt)',
                          color: e.status === 'Active' ? 'var(--tiffany)' : 'var(--amber)',
                        }}>{e.status}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
