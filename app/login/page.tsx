'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (d.success) {
        window.location.href = d.data.role === 'Employee' ? '/employee' : '/';
      }
    }).catch(() => {}).finally(() => setChecking(false));
  }, []);

  const login = async () => {
    if (!username || !password) { setError('Enter username and password'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (data.success) {
        window.location.href = data.data.role === 'Employee' ? '/employee' : '/';
      } else {
        setError(data.error || 'Login failed');
      }
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="login-page">
        <span className="spinner" style={{ width: 28, height: 28 }}></span>
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <div className="login-icon">
            <i className="ti ti-building-skyscraper"></i>
          </div>
          <h1 className="login-title">MyHRM</h1>
          <p className="login-sub">Employee Self-Service Portal</p>
        </div>

        {error && (
          <div className="login-error">
            <i className="ti ti-alert-circle"></i> {error}
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Username</label>
          <input className="form-input" placeholder="Enter your username" value={username}
            autoComplete="username" autoFocus
            onChange={e => setUsername(e.target.value)} onKeyDown={e => e.key === 'Enter' && login()} />
        </div>

        <div className="form-group">
          <label className="form-label">Password</label>
          <input className="form-input" type="password" placeholder="Enter your password" value={password}
            autoComplete="current-password"
            onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && login()} />
        </div>

        <button className="btn btn-primary login-btn" onClick={login} disabled={loading}>
          {loading ? <span className="spinner" style={{ width: 16, height: 16 }}></span> : 'Sign in'}
        </button>
      </div>
    </div>
  );
}
