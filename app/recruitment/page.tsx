'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import AiInsight from '@/components/AiInsight';

interface JobPosting {
  id: string; title: string; department: string; location: string;
  type: string; salaryMin: number; salaryMax: number; status: string;
  description: string; requirements: string;
  closingDate: string | null; createdAt: string;
  _count?: { applicants: number };
}

interface Applicant {
  id: string; jobPostingId: string; name: string; email: string;
  phone: string; source: string; stage: string; status: string;
  rating: number; appliedDate: string;
  jobPosting?: { title: string; department: string };
}

interface Interview {
  id: string; applicantId: string; jobPostingId: string;
  interviewer: string; type: string; mode: string;
  date: string | null; duration: number; feedback: string;
  rating: number; status: string;
  applicant?: { name: string };
  jobPosting?: { title: string };
}

const STAGES = ['New', 'Screened', 'Shortlisted', 'Interviewed', 'Offered', 'Hired', 'Rejected'];
const STATUS_OPTIONS = ['Draft', 'Open', 'Closed', 'Filled'];

export default function RecruitmentPage() {
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [tab, setTab] = useState<'jobs' | 'pipeline' | 'interviews'>('jobs');
  const [showJobModal, setShowJobModal] = useState(false);
  const [showApplicantModal, setShowApplicantModal] = useState(false);
  const [editingJob, setEditingJob] = useState<JobPosting | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    const [jr, ar, ir] = await Promise.all([
      fetch('/api/recruitment/jobs').then(r => r.json()),
      fetch('/api/recruitment/applicants').then(r => r.json()),
      fetch('/api/recruitment/interviews').then(r => r.json()),
    ]);
    if (jr.success) setJobs(jr.data);
    if (ar.success) setApplicants(ar.data);
    if (ir.success) setInterviews(ir.data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const saveJob = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = Object.fromEntries(fd) as Record<string, string>;
    const url = editingJob ? `/api/recruitment/jobs/${editingJob.id}` : '/api/recruitment/jobs';
    const res = await fetch(url, {
      method: editingJob ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, salaryMin: Number(data.salaryMin), salaryMax: Number(data.salaryMax) }),
    });
    if ((await res.json()).success) {
      setShowJobModal(false); setEditingJob(null); fetchAll();
    }
  };

  const saveApplicant = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = Object.fromEntries(fd) as Record<string, string>;
    const res = await fetch('/api/recruitment/applicants', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if ((await res.json()).success) {
      setShowApplicantModal(false); fetchAll();
    }
  };

  const updateStage = async (id: string, stage: string) => {
    await fetch(`/api/recruitment/applicants/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stage }),
    });
    fetchAll();
  };

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/recruitment/jobs/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    fetchAll();
  };

  const delJob = async (id: string) => {
    if (!confirm('Delete this job posting?')) return;
    await fetch(`/api/recruitment/jobs/${id}`, { method: 'DELETE' });
    fetchAll();
  };

  const activeJobs = jobs.filter(j => j.status === 'Open');
  const hires = applicants.filter(a => a.stage === 'Hired');
  const todayInterviews = interviews.filter(i => {
    if (!i.date) return false;
    const d = new Date(i.date).toDateString();
    return d === new Date().toDateString() && i.status === 'Scheduled';
  });

  if (loading) return (
    <div style={{ minHeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span className="spinner" style={{ width: 28, height: 28 }}></span>
    </div>
  );

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <AiInsight title="Recruitment Funnel" prompt="Analyse the recruitment pipeline - jobs, applicants by stage, interviews. Provide recommendations to improve hiring efficiency." icon="users-plus" />
      </div>
      {/* Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <div className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(10,186,181,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <i className="ti ti-briefcase" style={{ color: 'var(--tiffany)', fontSize: 18 }}></i>
          </div>
          <div><div style={{ fontSize: 22, fontWeight: 700 }}>{activeJobs.length}</div><div style={{ fontSize: 11, color: 'var(--muted)' }}>Active Jobs</div></div>
        </div>
        <div className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(138,43,226,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <i className="ti ti-users" style={{ color: '#8a2be2', fontSize: 18 }}></i>
          </div>
          <div><div style={{ fontSize: 22, fontWeight: 700 }}>{applicants.length}</div><div style={{ fontSize: 11, color: 'var(--muted)' }}>Applicants</div></div>
        </div>
        <div className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(221,170,68,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <i className="ti ti-calendar-event" style={{ color: '#ddaa44', fontSize: 18 }}></i>
          </div>
          <div><div style={{ fontSize: 22, fontWeight: 700 }}>{todayInterviews.length}</div><div style={{ fontSize: 11, color: 'var(--muted)' }}>Today's Interviews</div></div>
        </div>
        <div className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(10,186,181,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <i className="ti ti-user-check" style={{ color: 'var(--tiffany)', fontSize: 18 }}></i>
          </div>
          <div><div style={{ fontSize: 22, fontWeight: 700 }}>{hires.length}</div><div style={{ fontSize: 11, color: 'var(--muted)' }}>Hired</div></div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '1px solid var(--border)' }}>
        {(['jobs', 'pipeline', 'interviews'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{
              padding: '8px 18px', fontSize: 13, fontWeight: 500, cursor: 'pointer',
              border: 'none', borderBottom: tab === t ? '2px solid var(--tiffany)' : '2px solid transparent',
              background: 'transparent', color: tab === t ? 'var(--tiffany)' : 'var(--muted)',
              marginBottom: -1, textTransform: 'capitalize',
            }}>
            {t === 'jobs' && <i className="ti ti-briefcase" style={{ marginRight: 6 }}></i>}
            {t === 'pipeline' && <i className="ti ti-git-branch" style={{ marginRight: 6 }}></i>}
            {t === 'interviews' && <i className="ti ti-calendar-event" style={{ marginRight: 6 }}></i>}
            {t}
          </button>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          {tab === 'jobs' && (
            <button className="btn btn-primary btn-sm" onClick={() => { setEditingJob(null); setShowJobModal(true); }}>
              <i className="ti ti-plus"></i> New Job
            </button>
          )}
          {tab === 'pipeline' && (
            <button className="btn btn-primary btn-sm" onClick={() => setShowApplicantModal(true)}>
              <i className="ti ti-plus"></i> Add Applicant
            </button>
          )}
        </div>
      </div>

      {/* Jobs Tab */}
      {tab === 'jobs' && (
        <div className="card" style={{ overflow: 'hidden' }}>
          {jobs.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
              No job postings yet. Create your first one.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Department</th>
                    <th>Type</th>
                    <th>Salary Range</th>
                    <th>Applicants</th>
                    <th>Status</th>
                    <th style={{ width: 140 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map(job => (
                    <tr key={job.id}>
                      <td>
                        <Link href={`/recruitment/jobs/${job.id}`}
                          style={{ color: 'var(--tiffany)', textDecoration: 'none', fontWeight: 500, fontSize: 13 }}>
                          {job.title}
                        </Link>
                        <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{job.location}</div>
                      </td>
                      <td style={{ fontSize: 13 }}>{job.department}</td>
                      <td><span className={`badge-${job.type === 'Contract' ? 'amber' : job.type === 'Intern' ? 'purple' : 'tiffany'}`} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4 }}>{job.type}</span></td>
                      <td style={{ fontSize: 13 }}>RM {job.salaryMin.toLocaleString()} - RM {job.salaryMax.toLocaleString()}</td>
                      <td style={{ fontSize: 13 }}>{job._count?.applicants || 0}</td>
                      <td>
                        <select value={job.status} onChange={e => updateStatus(job.id, e.target.value)}
                          style={{
                            padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 500, border: '1px solid var(--border)',
                            color: job.status === 'Open' ? 'var(--tiffany)' : job.status === 'Closed' ? 'var(--red)' : job.status === 'Filled' ? '#8a2be2' : 'var(--muted)',
                            background: job.status === 'Open' ? 'rgba(10,186,181,0.08)' : 'var(--bg)',
                          }}>
                          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button className="btn btn-ghost btn-xs"
                            onClick={() => { setEditingJob(job); setShowJobModal(true); }}>Edit</button>
                          <Link href={`/recruitment/jobs/${job.id}`} className="btn btn-ghost btn-xs">View</Link>
                          <button className="btn btn-ghost btn-xs" style={{ color: 'var(--red)' }}
                            onClick={() => delJob(job.id)}>Del</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Pipeline Tab */}
      {tab === 'pipeline' && (
        <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8 }}>
          {STAGES.map(stage => {
            const stageApplicants = applicants.filter(a => a.stage === stage);
            return (
              <div key={stage} style={{ minWidth: 240, flex: 1 }}>
                <div style={{
                  padding: '8px 14px', borderRadius: '8px 8px 0 0', fontSize: 12, fontWeight: 600,
                  background: stage === 'Hired' ? 'rgba(10,186,181,0.1)' : stage === 'Rejected' ? 'rgba(207,75,75,0.1)' : 'var(--surface)',
                  borderBottom: `2px solid ${stage === 'Hired' ? 'var(--tiffany)' : stage === 'Rejected' ? 'var(--red)' : 'var(--border)'}`,
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <span>{stage}</span>
                  <span style={{
                    background: 'var(--bg)', borderRadius: 10, padding: '1px 8px', fontSize: 11,
                  }}>{stageApplicants.length}</span>
                </div>
                <div style={{
                  background: 'var(--surface)', borderRadius: '0 0 8px 8px', padding: 8,
                  minHeight: 120, display: 'flex', flexDirection: 'column', gap: 6, border: '1px solid var(--border)', borderTop: 'none',
                }}>
                  {stageApplicants.map(a => (
                    <div key={a.id} style={{
                      padding: '8px 10px', borderRadius: 6, background: 'var(--bg)',
                      border: '1px solid var(--border)', fontSize: 12, cursor: 'pointer',
                    }}>
                      <div style={{ fontWeight: 500, color: 'var(--text)', marginBottom: 2 }}>{a.name}</div>
                      <div style={{ color: 'var(--muted)', fontSize: 11, marginBottom: 4 }}>
                        {a.jobPosting?.title || '—'}
                      </div>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {['New','Screened','Shortlisted','Interviewed','Offered','Hired','Rejected'].filter(s => s !== a.stage).slice(0, 3).map(s => (
                          <button key={s} onClick={() => updateStage(a.id, s)}
                            style={{
                              padding: '1px 6px', fontSize: 10, borderRadius: 3, border: 'none',
                              background: s === 'Hired' ? 'rgba(10,186,181,0.1)' : s === 'Rejected' ? 'rgba(207,75,75,0.1)' : 'rgba(150,150,150,0.08)',
                              color: s === 'Hired' ? 'var(--tiffany)' : s === 'Rejected' ? 'var(--red)' : 'var(--muted)',
                              cursor: 'pointer',
                            }}>
                            → {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Interviews Tab */}
      {tab === 'interviews' && (
        <div className="card">
          {interviews.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>No interviews scheduled.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {interviews.map(iv => (
                <div key={iv.id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '12px 16px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)',
                }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>
                      {iv.applicant?.name} <span style={{ color: 'var(--muted)', fontWeight: 400 }}>— {iv.jobPosting?.title}</span>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
                      {iv.interviewer && <span><i className="ti ti-user"></i> {iv.interviewer} · </span>}
                      {iv.type} ({iv.mode}) · {iv.duration}min
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 11, color: 'var(--muted)' }}>
                      {iv.date ? new Date(iv.date).toLocaleDateString() : 'TBD'}
                    </div>
                    <span style={{
                      padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 500,
                      color: iv.status === 'Completed' ? 'var(--tiffany)' : iv.status === 'Cancelled' ? 'var(--red)' : 'var(--amber)',
                      background: iv.status === 'Completed' ? 'rgba(10,186,181,0.1)' : iv.status === 'Cancelled' ? 'rgba(207,75,75,0.1)' : 'rgba(221,170,68,0.1)',
                    }}>{iv.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Job Modal */}
      {showJobModal && (
        <div className="modal-overlay" onClick={() => setShowJobModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <div className="modal-header">
              <h3>{editingJob ? 'Edit Job Posting' : 'New Job Posting'}</h3>
              <button className="modal-close" onClick={() => setShowJobModal(false)}>×</button>
            </div>
            <form onSubmit={saveJob}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Job Title *</label>
                  <input className="form-input" name="title" defaultValue={editingJob?.title || ''} required />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Department</label>
                    <input className="form-input" name="department" defaultValue={editingJob?.department || ''} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Location</label>
                    <input className="form-input" name="location" defaultValue={editingJob?.location || ''} />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Type</label>
                    <select className="form-input" name="type" defaultValue={editingJob?.type || 'Permanent'}>
                      {['Permanent','Contract','Intern','Temporary'].map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select className="form-input" name="status" defaultValue={editingJob?.status || 'Draft'}>
                      {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Salary Min (RM)</label>
                    <input className="form-input" name="salaryMin" type="number" defaultValue={editingJob?.salaryMin || 0} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Salary Max (RM)</label>
                    <input className="form-input" name="salaryMax" type="number" defaultValue={editingJob?.salaryMax || 0} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Closing Date</label>
                  <input className="form-input" name="closingDate" type="date" defaultValue={editingJob?.closingDate?.split('T')[0] || ''} />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-input" name="description" rows={3} defaultValue={editingJob?.description || ''} />
                </div>
                <div className="form-group">
                  <label className="form-label">Requirements</label>
                  <textarea className="form-input" name="requirements" rows={3} defaultValue={editingJob?.requirements || ''} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowJobModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editingJob ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Applicant Modal */}
      {showApplicantModal && (
        <div className="modal-overlay" onClick={() => setShowApplicantModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <h3>Add Applicant</h3>
              <button className="modal-close" onClick={() => setShowApplicantModal(false)}>×</button>
            </div>
            <form onSubmit={saveApplicant}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input className="form-input" name="name" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Job Posting</label>
                  <select className="form-input" name="jobPostingId" required>
                    <option value="">Select job...</option>
                    {jobs.filter(j => j.status === 'Open').map(j => (
                      <option key={j.id} value={j.id}>{j.title} — {j.department}</option>
                    ))}
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input className="form-input" name="email" type="email" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input className="form-input" name="phone" />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Source</label>
                    <select className="form-input" name="source">
                      {['LinkedIn','JobStreet','Indeed','Referral','Company Website','Agency','Other'].map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Stage</label>
                    <select className="form-input" name="stage">
                      {STAGES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowApplicantModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Add</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
