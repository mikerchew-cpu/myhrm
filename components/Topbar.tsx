'use client';

export default function Topbar({ title }: { title: string }) {
  return (
    <div className="topbar">
      <button
        className="mobile-toggle"
        onClick={() => document.getElementById('sidebar')?.classList.toggle('open')}
        aria-label="Toggle sidebar"
      >
        <i className="ti ti-menu-2"></i>
      </button>
      <span className="tb-title">{title}</span>
      <div className="tb-pill"><i className="ti ti-calendar" aria-hidden="true"></i> <span>May 2026</span></div>
      <div className="tb-pill success"><i className="ti ti-shield-check" aria-hidden="true"></i> <span>EA 1955 Compliant</span></div>
      <div className="tb-sep"></div>
      <div className="tb-pill"><i className="ti ti-bell" aria-hidden="true"></i> 3</div>
      <div className="tb-av" title="Ahmad Hafiz — HR Manager">AH</div>
    </div>
  );
}
