'use client';

import { useEffect, useState, useCallback } from 'react';

interface Fault {
  id: string;
  severity: "critical" | "warning" | "info";
  module: string;
  title: string;
  description: string;
  recommendation: string;
  affectedEntity: string;
  value: string;
}

interface FaultSummary {
  healthScore: number;
  totalFaults: number;
  critical: number;
  warnings: number;
  infos: number;
  modulesAffected: string[];
  faults: Fault[];
  aiAnalysis?: string;
}

const severityConfig = {
  critical: { color: 'var(--red)', bg: 'var(--red-lt)', icon: 'alert-triangle', label: 'Critical' },
  warning: { color: 'var(--amber)', bg: 'var(--amber-lt)', icon: 'alert-circle', label: 'Warning' },
  info: { color: 'var(--tiffany)', bg: 'var(--tiffany-lt)', icon: 'info-circle', label: 'Info' },
};

export default function FaultDetectPage() {
  const [summary, setSummary] = useState<FaultSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [filterSeverity, setFilterSeverity] = useState<string | null>(null);
  const [filterModule, setFilterModule] = useState<string | null>(null);

  const fetchFaults = useCallback(() => {
    setLoading(true);
    fetch('/api/ai/fault-detect')
      .then(r => r.json())
      .then(res => { if (res.success) setSummary(res.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchFaults(); }, [fetchFaults]);

  const runAiAnalysis = async () => {
    setAiLoading(true);
    try {
      const res = await fetch('/api/ai/fault-detect', { method: 'POST' });
      const data = await res.json();
      if (data.success) setSummary(data.data);
    } catch (err) { console.error(err); }
    finally { setAiLoading(false); }
  };

  if (loading) return <div className="loading-dots"><div /><div /><div /></div>;
  if (!summary) return <div className="callout callout-amber">Failed to load fault analysis.</div>;

  const filteredFaults = summary.faults.filter(f => {
    if (filterSeverity && f.severity !== filterSeverity) return false;
    if (filterModule && f.module !== filterModule) return false;
    return true;
  });

  const getHealthColor = (score: number) => {
    if (score >= 85) return 'var(--green)';
    if (score >= 60) return 'var(--amber)';
    return 'var(--red)';
  };

  const getHealthLabel = (score: number) => {
    if (score >= 85) return 'Healthy';
    if (score >= 60) return 'Needs Attention';
    return 'At Risk';
  };

  return (
    <div className="view" style={{ maxWidth: 960, margin: '0 auto' }}>
      {/* Header */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-hdr">
          <div>
            <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <i className="ti ti-shield-search" style={{ color: 'var(--tiffany)' }}></i>
              AI Fault Detection & Analysis
            </h2>
            <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
              Automated anomaly detection across {summary.modulesAffected.length} modules
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-ghost btn-sm" onClick={fetchFaults} disabled={loading}>
              <i className="ti ti-refresh"></i> Refresh
            </button>
            <button className="btn btn-primary btn-sm" onClick={runAiAnalysis} disabled={aiLoading}>
              {aiLoading ? <span className="spinner" style={{ width: 14, height: 14 }}></span> : <i className="ti ti-brain"></i>}
              AI Analysis
            </button>
          </div>
        </div>

        {/* Health Score */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginTop: 12, flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: 100, height: 100, borderRadius: '50%',
              border: `6px solid ${getHealthColor(summary.healthScore)}`,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto',
            }}>
              <span style={{ fontSize: 28, fontWeight: 700, color: getHealthColor(summary.healthScore) }}>{summary.healthScore}</span>
              <span style={{ fontSize: 10, color: 'var(--muted)' }}>/100</span>
            </div>
            <span style={{
              fontSize: 13, fontWeight: 600, color: getHealthColor(summary.healthScore),
              display: 'block', marginTop: 6,
            }}>
              {getHealthLabel(summary.healthScore)}
            </span>
          </div>

          <div style={{ display: 'flex', gap: 16, flex: 1, flexWrap: 'wrap' }}>
            <div className="metric" style={{ flex: 1, minWidth: 120 }}>
              <div className="metric-lbl"><i className="ti ti-alert-triangle" style={{ color: 'var(--red)' }}></i> Critical</div>
              <div className="metric-val" style={{ color: 'var(--red)', fontSize: 24 }}>{summary.critical}</div>
            </div>
            <div className="metric" style={{ flex: 1, minWidth: 120 }}>
              <div className="metric-lbl"><i className="ti ti-alert-circle" style={{ color: 'var(--amber)' }}></i> Warnings</div>
              <div className="metric-val" style={{ color: 'var(--amber)', fontSize: 24 }}>{summary.warnings}</div>
            </div>
            <div className="metric" style={{ flex: 1, minWidth: 120 }}>
              <div className="metric-lbl"><i className="ti ti-info-circle" style={{ color: 'var(--tiffany)' }}></i> Info</div>
              <div className="metric-val" style={{ color: 'var(--tiffany)', fontSize: 24 }}>{summary.infos}</div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Analysis */}
      {summary.aiAnalysis && (
        <div className="card" style={{ marginBottom: 16, borderLeft: '4px solid var(--tiffany)' }}>
          <div className="card-hdr">
            <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <i className="ti ti-brain" style={{ color: 'var(--tiffany)' }}></i> AI Executive Analysis
            </h3>
          </div>
          <div style={{ whiteSpace: 'pre-wrap', fontSize: 13, lineHeight: 1.7, color: 'var(--text)' }}>
            {summary.aiAnalysis}
          </div>
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        <button className={'btn btn-xs ' + (!filterSeverity ? 'btn-primary' : 'btn-ghost')}
          onClick={() => setFilterSeverity(null)}>All Severities</button>
        {Object.entries(severityConfig).map(([key, cfg]) => (
          <button key={key} className={'btn btn-xs ' + (filterSeverity === key ? 'btn-primary' : 'btn-ghost')}
            onClick={() => setFilterSeverity(filterSeverity === key ? null : key)}>
            <i className={'ti ti-' + cfg.icon}></i> {cfg.label}
          </button>
        ))}
        <span style={{ color: 'var(--border)', fontSize: 18, lineHeight: 1 }}>|</span>
        <button className={'btn btn-xs ' + (!filterModule ? 'btn-primary' : 'btn-ghost')}
          onClick={() => setFilterModule(null)}>All Modules</button>
        {summary.modulesAffected.map(m => (
          <button key={m} className={'btn btn-xs ' + (filterModule === m ? 'btn-primary' : 'btn-ghost')}
            onClick={() => setFilterModule(filterModule === m ? null : m)}>{m}</button>
        ))}
      </div>

      {/* Faults List */}
      {filteredFaults.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 40 }}>
          <i className="ti ti-check" style={{ fontSize: 32, color: 'var(--green)', marginBottom: 8 }}></i>
          <p style={{ fontSize: 14, color: 'var(--green)', fontWeight: 500 }}>No issues match the current filters</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filteredFaults.map(fault => {
            const cfg = severityConfig[fault.severity];
            return (
              <div key={fault.id} className="card" style={{
                borderLeft: `4px solid ${cfg.color}`,
                padding: '14px 18px',
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 9, background: cfg.bg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <i className={'ti ti-' + cfg.icon} style={{ fontSize: 18, color: cfg.color }}></i>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                      <span style={{
                        fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px',
                        padding: '2px 8px', borderRadius: 4, background: cfg.bg, color: cfg.color,
                      }}>
                        {cfg.label}
                      </span>
                      <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 500 }}>{fault.module}</span>
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>
                      {fault.title}
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5, marginBottom: 8 }}>
                      {fault.description}
                    </p>
                    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                      <div style={{ fontSize: 12 }}>
                        <span style={{ color: 'var(--muted)' }}>Affected: </span>
                        <span style={{ fontWeight: 500, color: 'var(--text)' }}>{fault.affectedEntity}</span>
                      </div>
                      <div style={{ fontSize: 12 }}>
                        <span style={{ color: 'var(--muted)' }}>Value: </span>
                        <span style={{ fontWeight: 600, color: cfg.color }}>{fault.value}</span>
                      </div>
                    </div>
                    <div style={{
                      marginTop: 8, padding: '8px 12px', borderRadius: 6,
                      background: cfg.bg, fontSize: 12, color: 'var(--text)',
                    }}>
                      <i className="ti ti-bulb" style={{ color: cfg.color, marginRight: 4 }}></i>
                      <strong>Recommendation:</strong> {fault.recommendation}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div style={{ marginTop: 20, padding: '12px 16px', borderRadius: 8, background: 'var(--gray-50)', fontSize: 11, color: 'var(--muted)', textAlign: 'center' }}>
        Scanning {summary.modulesAffected.length} modules • {summary.totalFaults} issues detected • Click "AI Analysis" for DeepSeek-powered actionable insights
      </div>
    </div>
  );
}
