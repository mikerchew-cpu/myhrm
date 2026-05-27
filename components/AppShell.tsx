'use client';

import { usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const hideShell = pathname === '/login' || pathname.startsWith('/employee');
  if (hideShell) return <>{children}</>;

  return (
    <div className="shell">
      <Sidebar />
      <div className="main">
        <Topbar title="MyHRM Pro" />
        <div className="content view">{children}</div>
      </div>
    </div>
  );
}
