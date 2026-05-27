'use client';

import { useEffect, useState } from 'react';
import { useToast } from '@/components/Toast';
import AiInsight from '@/components/AiInsight';

interface Employee {
  id: string;
  employeeId: string;
  name: string;
  role: string;
  department: string;
  employmentType: string;
  status: string;
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dept, setDept] = useState('All');
  const { toast } = useToast();

  const [form, setForm] = useState({ employeeId: '', name: '', role: '', department: 'HR', employmentType: 'Permanent', status: 'Active' });

  const fetchEmployees = async () => {
    try {
      const res = await fetch('/api/employees');
      const data = await res.json();
      if (data.success) setEmployees(data.data);
    } catch { toast('Failed to load employees', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchEmployees(); }, []);

  const addEmployee = async () => {
    if (!form.employeeId || !form.name || !form.role) {
      toast('Please fill ID, name, and role.', 'error'); return;
    }
    try {
      const res = await fetch('/api/employees', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        toast(`Employee ${form.name} saved.`, 'success');
        setForm({ employeeId: '', name: '', role: '', department: 'HR', employmentType: 'Permanent', status: 'Active' });
        fetchEmployees();
      } else {
        toast(data.error || 'Failed', 'error');
      }
    } catch { toast('Failed to create employee', 'error'); }
  };

  const removeEmployee = async (id: string) => {
    if (!confirm('Remove this employee?')) return;
    try {
      await fetch(`/api/employees/${id}`, { method: 'DELETE' });
      toast('Employee removed.', '');
      fetchEmployees();
    } catch { toast('Failed to remove', 'error'); }
  };

  const filtered = employees.filter(e =>
    (dept === 'All' || e.department === dept) &&
    `${e.employeeId} ${e.name} ${e.role}`.toLowerCase().includes(search.toLowerCase())
  );

  const initials = (name: string) => name.split(/\s+/).slice(0, 2).map(v => v[0] || '').join('').toUpperCase();

  if (loading) return <div className="loading-dots"><div /><div /><div /></div>;

  return (
    <>
      <div className="callout callout-blue mb14">
        <i className="ti ti-info-circle" aria-hidden="true"></i> Employee directory — managed in PostgreSQL via Prisma ORM.
      </div>
      <div style={{ marginBottom: 16 }}>
        <AiInsight title="Workforce Demographics" prompt="Analyse these employee demographics. Total headcount, department breakdown, status distribution. Provide insights on workforce composition and suggestions." icon="users" />
      </div>
      <div className="g2">
        <div className="card">
          <div className="card-hdr"><span className="card-title"><i className="ti ti-plus" aria-hidden="true"></i> New employee</span></div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Employee ID</label><input className="form-input" placeholder="E143" value={form.employeeId} onChange={e => setForm(f => ({ ...f, employeeId: e.target.value }))} /></div>
            <div className="form-group"><label className="form-label">Full name</label><input className="form-input" placeholder="Aisyah Rahman" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Role</label><input className="form-input" placeholder="HR Executive" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} /></div>
            <div className="form-group"><label className="form-label">Department</label><select className="form-input" value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))}><option>HR</option><option>Field Services</option><option>Tech Support</option><option>Finance</option><option>Sales</option><option>Admin</option></select></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Employment type</label><select className="form-input" value={form.employmentType} onChange={e => setForm(f => ({ ...f, employmentType: e.target.value }))}><option>Permanent</option><option>Contract</option><option>EP Cat III</option><option>Intern</option></select></div>
            <div className="form-group"><label className="form-label">Status</label><select className="form-input" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}><option>Active</option><option>On Leave</option><option>Probation</option></select></div>
          </div>
          <button className="btn btn-primary" onClick={addEmployee} style={{ width: '100%' }}><i className="ti ti-device-floppy"></i> Save employee</button>
        </div>
        <div className="card">
          <div className="card-hdr"><span className="card-title"><i className="ti ti-filter" aria-hidden="true"></i> Search & filter</span></div>
          <div className="form-group" style={{ marginBottom: 10 }}><label className="form-label">Search</label><input className="form-input" placeholder="Name, ID, role..." value={search} onChange={e => setSearch(e.target.value)} /></div>
          <div className="form-group"><label className="form-label">Department</label><select className="form-input" value={dept} onChange={e => setDept(e.target.value)}><option value="All">All departments</option><option>HR</option><option>Field Services</option><option>Tech Support</option><option>Finance</option><option>Sales</option><option>Admin</option></select></div>
          <div className="callout callout-teal" style={{ marginTop: 12, marginBottom: 0 }}><i className="ti ti-database"></i> Data persisted in Supabase PostgreSQL via Prisma ORM.</div>
        </div>
      </div>
      <div className="card" style={{ marginTop: 14 }}>
        <div className="card-hdr">
          <span className="card-title"><i className="ti ti-users" aria-hidden="true"></i> Employee roster</span>
          <span className="badge badge-info">{filtered.length} employees</span>
        </div>
        {filtered.length === 0 ? (
          <div className="callout callout-amber">No employees matched your filters.</div>
        ) : (
          filtered.map(e => (
            <div className="row" key={e.id}>
              <div className="row-av" style={{ background: 'var(--blue-lt)', color: 'var(--blue)' }}>{initials(e.name)}</div>
              <div style={{ flex: 1 }}>
                <div className="row-name">{e.name} <span style={{ fontSize: 11, color: 'var(--muted)' }}>({e.employeeId})</span></div>
                <div className="row-sub">{e.role} · {e.department}</div>
              </div>
              <span className="badge badge-info">{e.employmentType}</span>
              <span className={'badge ' + (e.status === 'Active' ? 'badge-appr' : 'badge-pend')} style={{ marginLeft: 6 }}>{e.status}</span>
              <button className="btn btn-sm btn-danger" style={{ marginLeft: 10 }} onClick={() => removeEmployee(e.id)}>Remove</button>
            </div>
          ))
        )}
      </div>
    </>
  );
}
