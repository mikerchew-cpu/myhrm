'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface JobDetail {
  id: string; title: string; department: string; location: string;
  type: string; salaryMin: number; salaryMax: number;
  description: string; requirements: string; status: string;
  closingDate: string | null; createdAt: string;
  applicants: {
    id: string; name: string; email: string; phone: string;
    source: string; stage: string; rating: number; appliedDate: string;
  }[];
  interviews: {
    id: string; applicantId: string; type: string; mode: string;
    date: string | null; interviewer: string; status: string;
    applicant: { name: string };
  }[];
}

const STAGES = ['New', 'Screened', 'Shortlisted', 'Interviewed', 'Offered', 'Hired', 'Rejected'];

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [job, setJob] = useState<JobDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showInterviewModal, setShowInterviewModal] = useState(false);

  useEffect(() => {
    fetch(`/api/recruitment/jobs/${params.id}`).then(r => r.json()).then(d => {
      if (d.success) setJob(d.data);
      else router.push('/recruitment');
    }).finally(() => setLoading(false));
  }, [params.id, router]);

  const updateStage = async (id: string, stage: string) => {
    await fetch(`/api/recruitment/applicants/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stage }),
    });
    const res = await fetch(`/api/recruitment/jobs/${params.id}`).then(r => r.json());
    if (res.success) setJob(res.data);
  };

  const saveInterview = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = Object.fromEntries(fd) as Record<string, string>;
    await fetch('/api/recruitment/interviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, jobPostingId: params.id, duration: Number(data.duration) }),
    });
    setShowInterviewModal(false);
    const res = await fetch(`/api/recruitment/jobs/${params.id}`).then(r => r.json());
    if (res.success) setJob(res.data);
  };

  if (loading) return (
    <div style={{ minHeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span className="spinner" style={{ width: 28, height: 28 }}></span>
    </div>
  );

  if (!job) return null;

  const pipeline = STAGES.reduce((acc, stage) => {
    acc[stage] = job.applicants.filter(a => a.stage === stage);
    return acc;
  }, {} as Record<string, typeof job.applicants>);

  return (
    <div>
      {/* Breadcrumb */}
      <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 16 }}>
        <Link href="/recruitment" style={{ color: 'var(--tiffany)', textDecoration: 'none' }}>Recruitment</Link>
        <span style={{ margin: '0 6px' }}>/</span>
        {job.title}
      </div>

      {/* Job Header */}
      <div className="card" style={{ padding: 24, marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>
              {job.title}
            </h1>
            <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--muted)', flexWrap: 'wrap' }}>
              <span><i className="ti ti-building" style={{ marginRight: 4 }}></i>{job.department}</span>
              <span><i className="ti ti-map-pin" style={{ marginRight: 4 }}></i>{job.location}</span>
              <span><i className="ti ti-tag" style={{ marginRight: 4 }}></i>{job.type}</span>
              <span><i className="ti ti-moneybag" style={{ marginRight: 4 }}></i>RM {job.salaryMin.toLocaleString()} - RM {job.salaryMax.toLocaleString()}</span>
              <span>{job.closingDate && <><i className="ti ti-calendar" style={{ marginRight: 4 }}></i>Closes: {new Date(job.closingDate).toLocaleDateString()}</>}</span>
            </div>
          </div>
          <span style={{
            padding: '4px 14px', borderRadius: 6, fontSize: 12, fontWeight: 600,
            color: job.status === 'Open' ? 'var(--tiffany)' : job.status === 'Closed' ? 'var(--red)' : 'var(--muted)',
            background: job.status === 'Open' ? 'rgba(10,186,181,0.1)' : job.status === 'Closed' ? 'rgba(207,75,75,0.1)' : 'var(--bg)',
          }}>{job.status}</span>
        </div>
        {job.description && (
          <div style={{ marginTop: 16, padding: '12px 16px', background: 'var(--bg)', borderRadius: 8, fontSize: 13, lineHeight: 1.6 }}>
            <strong style={{ fontSize: 12, color: 'var(--muted)' }}>Description</strong>
            <div style={{ marginTop: 4, whiteSpace: 'pre-wrap' }}>{job.description}</div>
          </div>
        )}
      </div>

      {/* Pipeline Kanban */}
      <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8, marginBottom: 24 }}>
        {STAGES.map(stage => {
          const items = pipeline[stage] || [];
          return (
            <div key={stage} style={{ minWidth: 220, flex: 1 }}>
              <div style={{
                padding: '8px 14px', borderRadius: '8px 8px 0 0', fontSize: 12, fontWeight: 600,
                background: stage === 'Hired' ? 'rgba(10,186,181,0.1)' : stage === 'Rejected' ? 'rgba(207,75,75,0.1)' : 'var(--surface)',
                borderBottom: `2px solid ${stage === 'Hired' ? 'var(--tiffany)' : stage === 'Rejected' ? 'var(--red)' : 'var(--border)'}`,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <span>{stage}</span>
                <span style={{ background: 'var(--bg)', borderRadius: 10, padding: '1px 8px', fontSize: 11 }}>{items.length}</span>
              </div>
              <div style={{
                background: 'var(--surface)', borderRadius: '0 0 8px 8px', padding: 8,
                minHeight: 100, display: 'flex', flexDirection: 'column', gap: 6,
                border: '1px solid var(--border)', borderTop: 'none',
              }}>
                {items.map(a => (
                  <div key={a.id} style={{
                    padding: '8px 10px', borderRadius: 6, background: 'var(--bg)',
                    border: '1px solid var(--border)', fontSize: 12,
                  }}>
                    <div style={{ fontWeight: 500, color: 'var(--text)', marginBottom: 2 }}>{a.name}</div>
                    <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 4 }}>
                      {a.email} · {a.source}
                    </div>
                    {a.rating > 0 && (
                      <div style={{ fontSize: 10, marginBottom: 4 }}>
                        {'★'.repeat(a.rating)}{'☆'.repeat(5 - a.rating)}
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                      {STAGES.filter(s => s !== a.stage).slice(0, 2).map(s => (
                        <button key={s} onClick={() => updateStage(a.id, s)}
                          style={{
                            padding: '1px 6px', fontSize: 9, borderRadius: 3, border: 'none',
                            background: s === 'Hired' ? 'rgba(10,186,181,0.1)' : s === 'Rejected' ? 'rgba(207,75,75,0.1)' : 'rgba(150,150,150,0.08)',
                            color: s === 'Hired' ? 'var(--tiffany)' : s === 'Rejected' ? 'var(--red)' : 'var(--muted)',
                            cursor: 'pointer',
                          }}>→ {s}</button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Interviews Section */}
      <div className="card" style={{ padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <i className="ti ti-calendar-event" style={{ color: 'var(--tiffany)' }}></i>
            Interviews
          </h3>
          <button className="btn btn-primary btn-sm" onClick={() => setShowInterviewModal(true)}>
            <i className="ti ti-plus"></i> Schedule
          </button>
        </div>
        {job.interviews.length === 0 ? (
          <p style={{ fontSize: 13, color: 'var(--muted)', textAlign: 'center', padding: 20 }}>No interviews scheduled yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {job.interviews.map(iv => (
              <div key={iv.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 14px', borderRadius: 8, background: 'var(--bg)',
                border: '1px solid var(--border)', fontSize: 12,
              }}>
                <div>
                  <div style={{ fontWeight: 500, color: 'var(--text)' }}>{iv.applicant.name}</div>
                  <div style={{ color: 'var(--muted)' }}>{iv.type} · {iv.mode} · {iv.interviewer || 'No interviewer'}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: 'var(--muted)' }}>{iv.date ? new Date(iv.date).toLocaleDateString() : 'TBD'}</div>
                  <span style={{
                    padding: '1px 6px', borderRadius: 3, fontSize: 10, fontWeight: 500,
                    color: iv.status === 'Completed' ? 'var(--tiffany)' : iv.status === 'Cancelled' ? 'var(--red)' : 'var(--amber)',
                    background: iv.status === 'Completed' ? 'rgba(10,186,181,0.1)' : iv.status === 'Cancelled' ? 'rgba(207,75,75,0.1)' : 'rgba(221,170,68,0.1)',
                  }}>{iv.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Interview Modal */}
      {showInterviewModal && (
        <div className="modal-overlay" onClick={() => setShowInterviewModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 460 }}>
            <div className="modal-header">
              <h3>Schedule Interview</h3>
              <button className="modal-close" onClick={() => setShowInterviewModal(false)}>×</button>
            </div>
            <form onSubmit={saveInterview}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Applicant</label>
                  <select className="form-input" name="applicantId" required>
                    <option value="">Select applicant...</option>
                    {job.applicants.filter(a => a.stage !== 'Hired' && a.stage !== 'Rejected').map(a => (
                      <option key={a.id} value={a.id}>{a.name} ({a.stage})</option>
                    ))}
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Interview Type</label>
                    <select className="form-input" name="type">
                      {['HR','Technical','Final','Case Study','Group'].map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Mode</label>
                    <select className="form-input" name="mode">
                      {['Video','In-person','Phone'].map(m => <option key={m}>{m}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Interviewer</label>
                  <input className="form-input" name="interviewer" />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Date</label>
                    <input className="form-input" name="date" type="datetime-local" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Duration (min)</label>
                    <input className="form-input" name="duration" type="number" defaultValue={60} />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowInterviewModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Schedule</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
