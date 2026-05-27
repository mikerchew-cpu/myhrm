'use client';

import { useEffect, useState } from 'react';
import AiInsight from '@/components/AiInsight';

interface Employee {
  id: string; employeeId: string; name: string; role: string;
  department: string; employmentType: string; status: string;
}

const DEPTS = ['All','Field Services','Tech Support','Sales','HR','Finance','Admin'];

export default function DirectoryPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dept, setDept] = useState('All');

  useEffect(() => {
    fetch('/api/employees').then(r => r.json()).then(d => {
      if (d.success) setEmployees(d.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ minHeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span className="spinner" style={{ width: 28, height: 28 }}></span>
    </div>
  );

  const filtered = employees.filter(e => {
    if (dept !== 'All' && e.department !== dept) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!e.name.toLowerCase().includes(q) && !e.employeeId.toLowerCase().includes(q) && !e.role.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const statusColors: Record<string, string> = { Active: 'var(--tiffany)', Probation: 'var(--amber)', Inactive: 'var(--red)' };

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>
        Employee Directory
      </h1>
      <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 20 }}>
        {employees.length} employees &middot; {filtered.length} shown
      </p>

      <div style={{ marginBottom: 16 }}><AiInsight title="Workforce Composition" prompt="Analyse the employee directory - department sizes, role distribution. Provide workforce planning insights." icon="address-book" /></div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <div className="form-group" style={{ flex: 1, minWidth: 240 }}>
          <input className="form-input" placeholder="Search name, ID, role..." value={search}
            onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 32 } as React.CSSProperties} />
          <i className="ti ti-search" style={{
            position: 'absolute', marginTop: -28, marginLeft: 10, color: 'var(--muted)', fontSize: 14,
          }}></i>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {DEPTS.map(d => (
            <button key={d} onClick={() => setDept(d)}
              style={{
                padding: '5px 12px', borderRadius: 20, fontSize: 11, fontWeight: 500, cursor: 'pointer',
                border: `1px solid ${dept === d ? 'var(--tiffany)' : 'var(--border)'}`,
                background: dept === d ? 'var(--tiffany-lt)' : 'transparent',
                color: dept === d ? 'var(--tiffany-dark)' : 'var(--muted)',
              }}>{d}</button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
        {filtered.map(e => (
          <div key={e.id} className="card" style={{ padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 42, height: 42, borderRadius: '50%',
              background: 'var(--tiffany-lt)', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 15, fontWeight: 700, color: 'var(--tiffany-dark)',
              flexShrink: 0,
            }}>
              {e.name.split(' ').map(s => s[0]).join('').slice(0, 2)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)' }}>{e.name}</div>
              <div style={{ fontSize: 11, color: 'var(--muted)' }}>{e.role}</div>
              <div style={{ fontSize: 11, marginTop: 3, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <span><i className="ti ti-building" style={{ fontSize: 10 }}></i> {e.department}</span>
                <span><i className="ti ti-badge" style={{ fontSize: 10 }}></i> {e.employeeId}</span>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{
                padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 500,
                color: statusColors[e.status] || 'var(--muted)',
                background: `${statusColors[e.status]}15` || 'var(--bg)',
              }}>{e.status}</span>
              <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 4 }}>{e.employmentType}</div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 40, color: 'var(--muted)', fontSize: 13 }}>
            No employees match your search.
          </div>
        )}
      </div>
    </div>
  );
}
