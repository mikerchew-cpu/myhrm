import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { callAi } from "@/lib/ai";
import type { ApiResponse } from "@/lib/types";

const reportConfigs: Record<string, {
  label: string; description: string; icon: string;
  dataQuery: () => Promise<Record<string, unknown>>;
  systemPrompt: string;
}> = {
  'payroll-summary': {
    label: 'Payroll Summary', description: 'Total payroll, EPF, SOCSO, EIS contributions',
    icon: 'cash',
    dataQuery: async () => {
      const records = await prisma.payrollRecord.findMany({ orderBy: { month: 'desc' }, take: 12 });
      const totalGross = records.reduce((s, r) => s + r.gross, 0);
      const totalEpf = records.reduce((s, r) => s + r.epf, 0);
      const totalSocso = records.reduce((s, r) => s + r.socso, 0);
      const totalEis = records.reduce((s, r) => s + r.eis, 0);
      return { totalGross, totalEpf, totalSocso, totalEis, recordCount: records.length, months: records.map(r => ({ month: r.month, year: r.year, gross: r.gross, net: r.net })) };
    },
    systemPrompt: 'You are a payroll analyst. Summarise the payroll data and highlight trends, anomalies, or cost-saving observations.',
  },
  'leave-analysis': {
    label: 'Leave Analysis', description: 'Leave balances, usage patterns, and trends',
    icon: 'calendar-off',
    dataQuery: async () => {
      const leaves = await prisma.leaveRequest.findMany({ orderBy: { startDate: 'desc' }, take: 100 });
      const pending = leaves.filter(l => l.status === 'Pending').length;
      const approved = leaves.filter(l => l.status === 'Approved').length;
      const rejected = leaves.filter(l => l.status === 'Rejected').length;
      const types: Record<string, number> = {};
      for (const l of leaves) { types[l.type] = (types[l.type] || 0) + 1; }
      return { total: leaves.length, pending, approved, rejected, types, recent: leaves.slice(0, 10) };
    },
    systemPrompt: 'You are an HR analyst. Analyse leave patterns and provide recommendations for leave management.',
  },
  'employee-demographics': {
    label: 'Employee Demographics', description: 'Headcount, department distribution, roles',
    icon: 'users',
    dataQuery: async () => {
      const employees = await prisma.employee.findMany();
      const depts: Record<string, number> = {};
      const statuses: Record<string, number> = {};
      for (const e of employees) { depts[e.department] = (depts[e.department] || 0) + 1; statuses[e.status] = (statuses[e.status] || 0) + 1; }
      return { total: employees.length, departments: depts, statuses };
    },
    systemPrompt: 'You are an HR strategist. Analyse workforce demographics and provide insights on headcount distribution.',
  },
  'claims-summary': {
    label: 'Claims Summary', description: 'Claim amounts, categories, and approval rates',
    icon: 'receipt',
    dataQuery: async () => {
      const claims = await prisma.claim.findMany({ orderBy: { createdAt: 'desc' }, take: 100 });
      const total = claims.reduce((s, c) => s + c.amount, 0);
      const pending = claims.filter(c => c.status === 'Pending').length;
      const approved = claims.filter(c => c.status === 'Approved').length;
      const types: Record<string, number> = {};
      for (const c of claims) { types[c.type] = (types[c.type] || 0) + c.amount; }
      return { totalAmount: total, count: claims.length, pending, approved, types };
    },
    systemPrompt: 'You are a finance analyst. Analyse claim patterns, approve rates, and identify cost trends.',
  },
  'training-roi': {
    label: 'Training ROI', description: 'Training programmes, costs, completion rates',
    icon: 'book',
    dataQuery: async () => {
      const trainings = await prisma.training.findMany({ orderBy: { startDate: 'desc' }, take: 50 });
      const total = trainings.length;
      const completed = trainings.filter(t => t.status === 'Completed').length;
      const inProgress = trainings.filter(t => t.status === 'In Progress').length;
      const types: Record<string, number> = {};
      for (const t of trainings) { types[t.type] = (types[t.type] || 0) + 1; }
      const totalCost = trainings.reduce((s, t) => s + (t.cost || 0), 0);
      return { total, completed, inProgress, types, totalCost, trainings: trainings.slice(0, 20) };
    },
    systemPrompt: 'You are a learning & development analyst. Evaluate training effectiveness, costs, and completion trends.',
  },
  'overtime-analysis': {
    label: 'Overtime Analysis', description: 'OT hours, costs, department breakdown',
    icon: 'clock-bolt',
    dataQuery: async () => {
      const ots = await prisma.overtimeLog.findMany({ orderBy: { date: 'desc' }, take: 100 });
      const totalHours = ots.reduce((s, o) => s + o.hours, 0);
      const dayTypes: Record<string, number> = {};
      for (const o of ots) { dayTypes[o.dayType] = (dayTypes[o.dayType] || 0) + o.hours; }
      return { totalEntries: ots.length, totalHours, dayTypes, recent: ots.slice(0, 10) };
    },
    systemPrompt: 'You are a workforce analyst. Analyse overtime patterns and identify departments with high OT usage.',
  },
  'attendance-summary': {
    label: 'Attendance Summary', description: 'Check-ins, check-outs, punctuality',
    icon: 'fingerprint',
    dataQuery: async () => {
      const attendance = await prisma.attendance.findMany({ orderBy: { date: 'desc' }, take: 200 });
      const total = attendance.length;
      const statuses: Record<string, number> = {};
      for (const a of attendance) { statuses[a.status] = (statuses[a.status] || 0) + 1; }
      return { total, statuses, recent: attendance.slice(0, 20) };
    },
    systemPrompt: 'You are an attendance analyst. Identify attendance patterns and punctuality trends.',
  },
  'assets-summary': {
    label: 'Assets Summary', description: 'Asset inventory, value, assignment status',
    icon: 'tool',
    dataQuery: async () => {
      const assets = await prisma.asset.findMany();
      const totalValue = assets.reduce((s, a) => s + (a.purchasePrice || 0), 0);
      const assigned = assets.filter(a => a.employeeName).length;
      const available = assets.filter(a => !a.employeeName).length;
      const types: Record<string, number> = {};
      for (const a of assets) { types[a.type] = (types[a.type] || 0) + 1; }
      return { total: assets.length, totalValue, assigned, available, types };
    },
    systemPrompt: 'You are an asset management analyst. Provide insights on asset utilisation and inventory value.',
  },
  'recruitment-funnel': {
    label: 'Recruitment Funnel', description: 'Applicants, interviews, hiring pipeline',
    icon: 'users-plus',
    dataQuery: async () => {
      const applicants = await prisma.applicant.findMany({ orderBy: { createdAt: 'desc' }, take: 100 });
      const stageCounts: Record<string, number> = {};
      for (const a of applicants) { stageCounts[a.stage] = (stageCounts[a.stage] || 0) + 1; }
      const jobs = await prisma.jobPosting.findMany();
      const activeJobs = jobs.filter(j => j.status === 'Open').length;
      return { totalApplicants: applicants.length, stageCounts, activeJobs, totalJobs: jobs.length };
    },
    systemPrompt: 'You are a recruitment analyst. Analyse the hiring pipeline and provide recommendations to improve hiring efficiency.',
  },
  'foreign-worker': {
    label: 'Foreign Worker Summary', description: 'Foreign worker levies, quotas, expiries',
    icon: 'world',
    dataQuery: async () => {
      const workers = await prisma.foreignWorker.findMany();
      const expiringSoon = workers.filter(w => {
        if (!w.permitExpiry) return false;
        const days = (new Date(w.permitExpiry).getTime() - Date.now()) / 86400000;
        return days > 0 && days < 90;
      }).length;
      const levyPaid = workers.filter(w => w.levyPaid).length;
      const fomemaDone = workers.filter(w => w.fomemaStatus === 'Done').length;
      const totalBond = workers.reduce((s, w) => s + w.securityBond, 0);
      return { total: workers.length, expiringSoon, levyPaid, fomemaDone, totalBond };
    },
    systemPrompt: 'You are a foreign worker compliance analyst. Provide insights on workforce composition and visa expiry risks.',
  },
};

export async function POST(req: NextRequest) {
  try {
    const { type } = await req.json();
    if (!type || !reportConfigs[type]) {
      return NextResponse.json({ success: false, error: 'Invalid report type' }, { status: 400 });
    }

    const config = reportConfigs[type];
    const data = await config.dataQuery();

    const provider = await prisma.aiProvider.findFirst({ where: { enabled: true } });
    let aiSummary = '';

    if (provider) {
      try {
        aiSummary = await callAi(provider.provider, provider.apiKey, [
          { role: 'system', content: config.systemPrompt },
          { role: 'user', content: `Analyse this ${config.label} data and provide key insights, trends, and recommendations:\n\n${JSON.stringify(data, null, 2)}` },
        ], provider.endpoint);
      } catch { aiSummary = 'AI summary unavailable.'; }
    }

    return NextResponse.json({
      success: true,
      data: { ...data, aiSummary, reportType: type, reportLabel: config.label },
    } satisfies ApiResponse);

  } catch (error) {
    console.error('POST /api/reports/generate error:', error);
    return NextResponse.json({ success: false, error: 'Failed to generate report' }, { status: 500 });
  }
}

export async function GET() {
  const types = Object.entries(reportConfigs).map(([key, cfg]) => ({
    key, label: cfg.label, description: cfg.description, icon: cfg.icon,
  }));
  return NextResponse.json({ success: true, data: types });
}
