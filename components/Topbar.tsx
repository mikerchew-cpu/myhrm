'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from './ThemeProvider';
import { useToast } from './Toast';

export default function Topbar({ title }: { title: string }) {
  const [user, setUser] = useState<{ givenName: string; surname: string; role: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (d.success) setUser(d.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    toast('Signed out successfully', '');
    router.push('/login');
  };

  const handleLogout = () => {
    setMenuOpen(false);
    setConfirming(true);
  };

  return (
    <div className="topbar">
      <button
        className="mobile-toggle"
        onClick={() => {
          const sb = document.getElementById('sidebar');
          const overlay = document.getElementById('sidebar-overlay');
          if (sb) sb.classList.toggle('open');
          if (overlay) overlay.classList.toggle('show');
        }}
        aria-label="Toggle sidebar"
      >
        <i className="ti ti-menu-2"></i>
      </button>
      <span className="tb-title">{title}</span>
      <div className="tb-pill"><i className="ti ti-calendar" aria-hidden="true"></i> <span>May 2026</span></div>
      <div className="tb-pill success"><i className="ti ti-shield-check" aria-hidden="true"></i> <span>EA 1955 Compliant</span></div>
      <ThemeToggle />
      <div className="tb-sep"></div>
      <div className="tb-pill"><i className="ti ti-bell" aria-hidden="true"></i> 3</div>
      {loading ? (
        <div className="tb-pill" style={{ opacity: 0.5 }}><i className="ti ti-user"></i> Loading...</div>
      ) : user ? (
        <div className="tb-user-wrap" ref={menuRef}>
          <div className="tb-av" onClick={() => setMenuOpen(!menuOpen)} style={{ cursor: 'pointer' }}>
            {user.givenName[0]}{user.surname[0]}
          </div>
          {menuOpen && (
            <div className="tb-dropdown">
              <div className="tb-dropdown-header">
                <div className="tb-dropdown-av">{user.givenName[0]}{user.surname[0]}</div>
                <div>
                  <div className="tb-dropdown-name">{user.givenName} {user.surname}</div>
                  <div className="tb-dropdown-role">{user.role}</div>
                </div>
              </div>
              <div className="tb-dropdown-divider"></div>
              <div className="tb-dropdown-item" onClick={() => { setMenuOpen(false); router.push('/employee/profile'); }}>
                <i className="ti ti-user-circle"></i> My Profile
              </div>
              <div className="tb-dropdown-item" onClick={() => { setMenuOpen(false); router.push('/employee/payslips'); }}>
                <i className="ti ti-file-invoice"></i> Payslips
              </div>
              <div className="tb-dropdown-divider"></div>
              <div className="tb-dropdown-item tb-dropdown-danger" onClick={handleLogout}>
                <i className="ti ti-logout"></i> Sign Out
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="tb-pill" style={{ cursor: 'pointer' }} onClick={() => router.push('/login')}>
          <i className="ti ti-login"></i> Log in
        </div>
      )}

      {confirming && (
        <div className="modal-overlay" onClick={() => setConfirming(false)}>
          <div className="modal confirm-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Sign Out</h3>
            </div>
            <div className="modal-body" style={{ textAlign: 'center', padding: '24px 20px' }}>
              <i className="ti ti-logout" style={{ fontSize: 36, color: 'var(--tiffany)', marginBottom: 12 }}></i>
              <p style={{ fontSize: 14, color: 'var(--text)', marginBottom: 4 }}>Are you sure you want to sign out?</p>
              <p style={{ fontSize: 12, color: 'var(--muted)' }}>You will need to sign in again to access the portal.</p>
            </div>
            <div className="modal-footer" style={{ justifyContent: 'center', gap: 10 }}>
              <button className="btn btn-ghost" onClick={() => setConfirming(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={logout}>
                <i className="ti ti-logout"></i> Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <div className="tb-pill" onClick={toggle} style={{ cursor: 'pointer' }} title="Toggle theme">
      <i className={`ti ti-${theme === 'dark' ? 'sun' : 'moon'}`}></i>
    </div>
  );
}
