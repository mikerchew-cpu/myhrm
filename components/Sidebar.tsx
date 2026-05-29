'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const sections: { label: string; items: { label: string; href: string; icon: string; badge?: { text: string; cls: string } }[] }[] = [
  {
    label: 'Self-Service',
    items: [
      { label: 'Employee Portal', href: '/employee', icon: 'user-circle' },
    ],
  },
  {
    label: 'Recruitment',
    items: [
      { label: 'ATS & Job Postings', href: '/recruitment', icon: 'users-plus' },
    ],
  },
  {
    label: 'Core',
    items: [
      { label: 'Dashboard', href: '/', icon: 'layout-dashboard' },
      { label: 'Employees', href: '/employees', icon: 'users' },
      { label: 'Payroll & EPF/SOCSO', href: '/payroll', icon: 'cash' },
      { label: 'E-Submissions', href: '/e-submissions', icon: 'file-export' },
    ],
  },
  {
    label: 'Workforce',
    items: [
      { label: 'Leave Management', href: '/leave', icon: 'calendar-off', badge: { text: '5', cls: 'b-amber' } },
      { label: 'Overtime (OT)', href: '/overtime', icon: 'clock-bolt' },
      { label: 'Attendance', href: '/attendance', icon: 'fingerprint' },
    ],
  },
  {
    label: 'Field Services',
    items: [
      { label: 'Claims', href: '/claims', icon: 'receipt', badge: { text: '8', cls: 'b-red' } },
      { label: 'Mileage Tracker', href: '/mileage', icon: 'car' },
    ],
  },
  {
    label: 'Approvals',
    items: [
      { label: 'Approval Workflow', href: '/approvals', icon: 'git-branch', badge: { text: '13', cls: 'b-red' } },
      { label: 'Approval Matrix', href: '/matrix', icon: 'table' },
    ],
  },
  {
    label: 'HR Tools',
    items: [
      { label: 'Directory', href: '/directory', icon: 'address-book' },
      { label: 'Calendar', href: '/calendar', icon: 'calendar-month' },
      { label: 'Announcements', href: '/announcements', icon: 'speakerphone' },
      { label: 'Employee History', href: '/history', icon: 'timeline' },
      { label: 'Documents', href: '/documents', icon: 'files' },
      { label: 'Reports & Analytics', href: '/reports', icon: 'file-analytics' },
      { label: 'Training', href: '/training', icon: 'book' },
      { label: 'Assets', href: '/assets', icon: 'tool' },
      { label: 'Org Chart', href: '/org-chart', icon: 'hierarchy-2' },
      { label: 'Performance', href: '/performance', icon: 'chart-arrows' },
      { label: 'Talent Matrix', href: '/talent', icon: 'star' },
      { label: 'Foreign Workers', href: '/foreign', icon: 'world' },
      { label: 'Levy Calculator', href: '/levy', icon: 'calculator' },
    ],
  },
  {
    label: 'AI Intelligence',
    items: [
      { label: 'Ask AI', href: '/ask-ai', icon: 'message-chatbot' },
      { label: 'AI Providers', href: '/ai-providers', icon: 'cloud' },
      { label: 'Fault Detection', href: '/fault-detect', icon: 'shield-search' },
    ],
  },
  {
    label: 'System',
    items: [
      { label: 'Admin', href: '/admin', icon: 'user-shield' },
      { label: 'User Manual', href: '/user-manual', icon: 'book-2' },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [aiStatus, setAiStatus] = useState<{ connected: boolean; label: string }>({ connected: false, label: '' });

  useEffect(() => {
    fetch('/api/settings/ai')
      .then(r => r.json())
      .then(res => {
        if (res.success) {
          const enabled = res.data.find((p: { enabled: boolean; apiKey: string; provider: string }) => p.enabled && p.apiKey);
          if (enabled) {
            setAiStatus({ connected: true, label: enabled.provider.charAt(0).toUpperCase() + enabled.provider.slice(1) });
          }
        }
      })
      .catch(() => {});
  }, []);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const closeSidebar = () => {
    const sb = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    if (sb) sb.classList.remove('open');
    if (overlay) overlay.classList.remove('show');
  };

  return (
    <>
      <div id="sidebar-overlay" className="sidebar-overlay" onClick={closeSidebar}></div>
      <nav className="sidebar" id="sidebar">
      <div className="sb-brand">
        <div className="sb-logo"><i className="ti ti-building-skyscraper" aria-hidden="true"></i></div>
        <div>
          <div className="sb-name">MyHRM</div>
          <div className="sb-sub">Malaysia Edition</div>
        </div>
      </div>

      {sections.map(s => (
        <div key={s.label}>
          <div className="sb-sec">{s.label}</div>
          {s.items.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={'sb-item' + (isActive(item.href) ? ' active' : '')}
              onClick={() => {
                closeSidebar();
              }}
            >
              <i className={'ti ti-' + item.icon} aria-hidden="true"></i>
              {item.label}
              {item.badge && <span className={'sb-badge ' + item.badge.cls}>{item.badge.text}</span>}
            </Link>
          ))}
        </div>
      ))}

      <div className="sb-footer">
        <Link href="/ai-providers" style={{ textDecoration: 'none' }}>
          <div className="ai-pill" style={{ cursor: 'pointer' }}>
            <div className="ai-dot" style={{ background: aiStatus.connected ? 'var(--green)' : 'var(--gray-400)' }}></div>
            <div>
              <div className="ai-lbl"><i className="ti ti-brain" aria-hidden="true"></i> {aiStatus.label || 'AI'} {aiStatus.connected ? '' : ''}</div>
              <div className="ai-sub">{aiStatus.connected ? 'Connected · Ready' : 'Not configured'}</div>
            </div>
          </div>
        </Link>
      </div>
    </nav>
    </>
  );
}
