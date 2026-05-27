'use client';

import { useEffect, useState } from 'react';
import AiInsight from '@/components/AiInsight';

interface Perf {
  id: string;
  score: number;
  quarter: string;
  year: number;
  employee: { name: string; department: string };
}

export default function PerformancePage() {
  const [records, setRecords] = useState<Perf[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/performance').then(r => r.json()).then(res => {
      if (res.success) setRecords(res.data);
    }).finally(() => setLoading(false));
  }, []);

  const avg = records.length ? Math.round(records.reduce((s, p) => s + p.score, 0) / records.length) : 76;
  const high = records.filter(p => p.score >= 85).length;
  const atRisk = records.filter(p => p.score < 50).length;

  const deptScores: Record<string, number[]> = {};
  records.forEach(p => {
    const d = p.employee.department || 'General';
    if (!deptScores[d]) deptScores[d] = [];
    deptScores[d].push(p.score);
  });
  const deptAvg = Object.entries(deptScores).map(([d, scores]) => [d, Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)] as const);

  if (loading) return <div className="loading-dots"><div /><div /><div /></div>;

  return (
    <>
      <div style={{ marginBottom: 16 }}><AiInsight title="Performance Insights" prompt="Analyse employee performance data. Look at ratings, scores, trends. Provide recommendations for performance improvement." icon="chart-arrows" /></div>
      <div className="g5 mb14">
        <div className="metric"><div className="metric-lbl">Org avg score</div><div className="metric-val">{avg}<span style={{ fontSize: 14, color: 'var(--muted)' }}>/100</span></div><div className="metric-sub up">↑ +4 vs Q1</div></div>
        <div className="metric"><div className="metric-lbl">KPI attainment</div><div className="metric-val">82<span style={{ fontSize: 14, color: 'var(--muted)' }}>%</span></div><div className="metric-sub up">↑ +6% vs Q1</div></div>
        <div className="metric"><div className="metric-lbl">High performers</div><div className="metric-val">{high}</div><div className="metric-sub">{records.length ? Math.round(high/records.length*100) : 0}% of workforce</div></div>
        <div className="metric"><div className="metric-lbl">At-risk staff</div><div className="metric-val" style={{ color: 'var(--red)' }}>{atRisk}</div><div className="metric-sub">PIP candidates</div></div>
        <div className="metric"><div className="metric-lbl">Attrition rate</div><div className="metric-val">6.2<span style={{ fontSize: 14, color: 'var(--muted)' }}>%</span></div><div className="metric-sub dn">↑ +1.1%</div></div>
      </div>
      <div className="g2 mb14">
        <div className="card">
          <div className="card-hdr"><span className="card-title"><i className="ti ti-building" aria-hidden="true"></i> Department scores</span></div>
          {deptAvg.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 20, color: 'var(--muted)' }}>No performance data yet.</div>
          ) : (
            deptAvg.map(([d, s]) => (
              <div className="kpi-row" key={d}>
                <span className="kpi-lbl">{d}</span>
                <div className="kpi-track"><div className="kpi-fill" style={{ width: s + '%', background: s >= 80 ? 'var(--blue)' : s >= 60 ? 'var(--amber)' : 'var(--red)' }}></div></div>
                <span className="kpi-val" style={{ color: s >= 80 ? 'var(--blue)' : s >= 60 ? 'var(--amber)' : 'var(--red)' }}>{s}</span>
              </div>
            ))
          )}
        </div>
        <div className="card">
          <div className="card-hdr"><span className="card-title"><i className="ti ti-medal" aria-hidden="true"></i> Top performers</span></div>
          {records.filter(p => p.score >= 85).slice(0, 5).map(p => (
            <div className="row" key={p.id}>
              <div className="row-av" style={{ background: 'var(--green-lt)', color: 'var(--green)' }}>{p.employee.name.split(' ').map(s=>s[0]).join('')}</div>
              <div style={{ flex: 1 }}><div className="row-name">{p.employee.name}</div><div className="row-sub">{p.employee.department}</div></div>
              <div className="score-ring score-great" style={{ width: 38, height: 38, fontSize: 13 }}>{p.score}</div>
            </div>
          ))}
          {records.filter(p => p.score >= 85).length === 0 && <div style={{ textAlign: 'center', padding: 20, color: 'var(--muted)' }}>No top performers yet.</div>}
        </div>
      </div>
    </>
  );
}
