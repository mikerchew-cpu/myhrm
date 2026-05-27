'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useToast } from '@/components/Toast';

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<{ givenName: string; surname: string; role: string } | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (d.success) setSession(d.data);
      else router.push('/login');
    }).catch(() => router.push('/login')).finally(() => setLoaded(true));
  }, [router]);

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    toast('Signed out successfully', '');
    router.push('/login');
  };

  if (!loaded) {
    return (
      <div className="loading-screen">
        <span className="spinner" style={{ width: 28, height: 28 }}></span>
      </div>
    );
  }

  const tabs = [
    { label: 'Dashboard', href: '/employee', icon: 'layout-dashboard' },
    { label: 'My Profile', href: '/employee/profile', icon: 'user-circle' },
    { label: 'Payslips', href: '/employee/payslips', icon: 'file-invoice' },
  ];

  return (
    <div className="employee-layout">
      <header className="emp-header">
        <Link href="/employee" className="emp-brand">
          <i className="ti ti-building-skyscraper"></i>
          MyHRM Portal
        </Link>

        <nav className="emp-nav">
          {tabs.map(t => (
            <Link key={t.href} href={t.href} className={'emp-tab' + (pathname === t.href ? ' active' : '')}>
              <i className={'ti ti-' + t.icon}></i>
              {t.label}
            </Link>
          ))}
        </nav>

        <div className="emp-user">
          <span className="emp-user-name">
            <i className="ti ti-user"></i>
            {session?.givenName} {session?.surname}
            <span className="emp-user-role">({session?.role})</span>
          </span>
          <button className="btn btn-ghost btn-sm" onClick={() => setConfirming(true)}>
            <i className="ti ti-logout"></i> Logout
          </button>
        </div>
      </header>

      <main className="emp-main">
        {children}
      </main>

      <footer className="emp-footer">
        MyHRM Employee Self-Service &copy; {new Date().getFullYear()}
      </footer>

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
