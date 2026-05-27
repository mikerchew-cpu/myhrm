'use client';

export default function TalentPage() {
  return (
    <>
      <div className="card mb14">
        <div className="card-hdr">
          <span className="card-title"><i className="ti ti-grid-4x4" aria-hidden="true"></i> 9-box talent matrix — Q2 2026</span>
          <button className="btn btn-sm" style={{ color: 'var(--teal)' }}><i className="ti ti-brain" aria-hidden="true"></i> Succession plan ↗</button>
        </div>
        <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 10 }}>Y-axis: potential · X-axis: performance score</div>
        <div className="talent-grid">
          {[
            ['High pot · Low perf', 'var(--amber-lt)', 'var(--amber)', 'Nurul Zahira<br>Rashid Abdullah', '→ Coach & develop'],
            ['High pot · Med perf', 'var(--green-lt)', 'var(--green)', 'Priya Rajendran<br>Kumari Selvam', '→ Stretch & accelerate'],
            ['High pot · High perf ⭐', 'var(--green-lt)', 'var(--green)', 'Faizal Hashim<br>Jason Tan', '→ Retain & promote'],
            ['Med pot · Low perf', 'var(--gray-50)', 'var(--gray-600)', 'Lee Kah Wai<br>Salmah Razak', '→ Reassess fit', ''],
            ['Med pot · Med perf', 'var(--blue-lt)', 'var(--blue)', '12 core staff', '→ Sustain & recognise', ''],
            ['Med pot · High perf', 'var(--blue-lt)', 'var(--blue)', '8 staff', '→ Deepen expertise', ''],
            ['Low pot · Low perf', 'var(--red-lt)', 'var(--red)', 'Aminah Kadir<br>Rajan Gopal', '→ PIP / exit manage'],
            ['Low pot · Med perf', 'var(--gray-50)', 'var(--gray-600)', '6 staff', '→ Maintain role', ''],
            ['Low pot · High perf', 'var(--gray-50)', 'var(--gray-600)', '3 specialist staff', '→ Expert track', ''],
          ].map(([lbl, bg, color, names, action, _star]: any, i) => (
            <div key={i} className={'talent-cell' + (i === 2 ? ' star' : '')} style={{ background: bg }}>
              <div className="talent-cell-lbl" style={{ color }}>{lbl}</div>
              <div className="talent-cell-names" dangerouslySetInnerHTML={{ __html: names }} />
              <div className="talent-cell-action" style={{ color }}>{action}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="ai-chips">
        <span className="ai-chip">Generate succession plan ↗</span>
        <span className="ai-chip">Promotion nominees ↗</span>
        <span className="ai-chip">Draft PIP for low performers ↗</span>
        <span className="ai-chip">Retention plan for high fliers ↗</span>
      </div>
    </>
  );
}
