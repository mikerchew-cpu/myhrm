'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const [session, setSession] = useState<any>(null);
  const [employee, setEmployee] = useState<any>(null);
  const [givenName, setGivenName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (!d.success) { router.push('/login'); return; }
      setSession(d.data);
      setGivenName(d.data.givenName);
      setSurname(d.data.surname);
      setEmail(d.data.email);
      return fetch('/api/employee/portal').then(r => r.json()).then(p => {
        if (p.success) setEmployee(p.data.employee);
      });
    }).finally(() => setLoading(false));
  }, [router]);

  const saveProfile = async () => {
    setSaving(true);
    setMsg('');
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ givenName, surname, email, password: password || undefined }),
      });
      const d = await res.json();
      setMsg(d.success ? 'Profile updated successfully' : d.error || 'Failed');
      if (d.success) setPassword('');
    } catch { setMsg('Network error'); }
    finally { setSaving(false); }
  };

  if (loading) return (
    <div style={{ minHeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span className="spinner" style={{ width: 28, height: 28 }}></span>
    </div>
  );

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '32px 24px' }}>
      <h1 style={{
        fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600,
        color: 'var(--text)', marginBottom: 4, letterSpacing: '-0.3px',
      }}>
        My Profile
      </h1>
      <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 24 }}>
        Manage your personal information and login credentials
      </p>

      {msg && (
        <div style={{
          padding: '10px 14px', borderRadius: 8, fontSize: 12, marginBottom: 16,
          background: msg.includes('success') ? 'rgba(10,186,181,0.1)' : 'var(--red-lt)',
          color: msg.includes('success') ? 'var(--tiffany)' : 'var(--red)',
          borderLeft: `3px solid ${msg.includes('success') ? 'var(--tiffany)' : 'var(--red)'}`,
        }}>
          <i className={`ti ti-${msg.includes('success') ? 'circle-check' : 'alert-circle'}`}></i> {msg}
        </div>
      )}

      <div className="card" style={{ padding: 28, marginBottom: 24 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
          <i className="ti ti-user-circle" style={{ color: 'var(--tiffany)' }}></i>
          Personal Information
        </h3>

        <div className="form-group" style={{ marginBottom: 16 }}>
          <label className="form-label">Given Name</label>
          <input className="form-input" value={givenName} onChange={e => setGivenName(e.target.value)} />
        </div>
        <div className="form-group" style={{ marginBottom: 16 }}>
          <label className="form-label">Surname</label>
          <input className="form-input" value={surname} onChange={e => setSurname(e.target.value)} />
        </div>
        <div className="form-group" style={{ marginBottom: 16 }}>
          <label className="form-label">Email</label>
          <input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} />
        </div>

        {employee && (
          <div style={{
            marginTop: 16, padding: '12px 16px', borderRadius: 8, background: 'var(--bg)',
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 13,
          }}>
            <div><span style={{ color: 'var(--muted)' }}>Employee ID:</span> <strong>{employee.employeeId}</strong></div>
            <div><span style={{ color: 'var(--muted)' }}>Department:</span> <strong>{employee.department}</strong></div>
            <div><span style={{ color: 'var(--muted)' }}>Role:</span> <strong>{employee.role}</strong></div>
            <div><span style={{ color: 'var(--muted)' }}>Type:</span> <strong>{employee.employmentType}</strong></div>
          </div>
        )}
      </div>

      <div className="card" style={{ padding: 28, marginBottom: 24 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
          <i className="ti ti-lock" style={{ color: 'var(--tiffany)' }}></i>
          Change Password
        </h3>
        <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 12 }}>
          Leave blank to keep current password
        </p>
        <div className="form-group">
          <label className="form-label">New Password</label>
          <input className="form-input" type="password" value={password}
            onChange={e => setPassword(e.target.value)} placeholder="Enter new password" />
        </div>
      </div>

      <button className="btn btn-primary" onClick={saveProfile} disabled={saving}
        style={{ width: '100%', padding: '10px 16px', justifyContent: 'center' }}>
        {saving ? <span className="spinner" style={{ width: 16, height: 16 }}></span> : 'Save Changes'}
      </button>
    </div>
  );
}
