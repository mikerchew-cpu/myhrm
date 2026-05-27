'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const sections: { label: string; items: { label: string; href: string; icon: string; badge?: { text: string; cls: string } }[] }[] = [
  {
    label: 'Core',
    items: [
      { label: 'Dashboard', href: '/', icon: 'layout-dashboard' },
      { label: 'Employees', href: '/employees', icon: 'users' },
      { label: 'Payroll & EPF/SOCSO', href: '/payroll', icon: 'cash' },
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
      { label: 'Performance', href: '/performance', icon: 'chart-arrows' },
      { label: 'Talent Matrix', href: '/talent', icon: 'star' },
      { label: 'Foreign Workers', href: '/foreign', icon: 'world' },
      { label: 'Levy Calculator', href: '/levy', icon: 'calculator' },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <nav className="sidebar" id="sidebar">
      <div className="sb-brand">
        <div className="sb-logo"><i className="ti ti-building-skyscraper" aria-hidden="true"></i></div>
        <div>
          <div className="sb-name">MyHRM Pro</div>
          <div className="sb-sub">Malaysia Edition 2026</div>
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
                const sb = document.getElementById('sidebar');
                if (sb && window.innerWidth <= 768) sb.classList.remove('open');
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
        <div className="ai-pill">
          <div className="ai-dot"></div>
          <div>
            <div className="ai-lbl"><i className="ti ti-brain" aria-hidden="true"></i> DeepSeek AI</div>
            <div className="ai-sub">Connected · Ready</div>
          </div>
        </div>
      </div>
    </nav>
  );
}
