import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { ApiResponse, DashboardStats } from "@/lib/types";

export async function GET() {
  try {
    const now = new Date();
    const [employees, pendingClaims, claimsAll, pendingLeave, leaveAll, otLogs, approvalsAll,
      payrollMonths, mileageAll, performanceAll, fwAll, levyAll, jobs, applicants, interviews,
      documents, trainingAll, assetsAll, announcements,
    ] = await Promise.all([
      prisma.employee.findMany(),
      prisma.claim.findMany({ where: { status: "Pending" }, orderBy: { createdAt: "desc" }, take: 5, include: { employee: { select: { name: true } } } }),
      prisma.claim.findMany({ orderBy: { createdAt: "desc" }, take: 5, include: { employee: { select: { name: true } } } }),
      prisma.leaveRequest.findMany({ where: { status: "Pending" }, orderBy: { startDate: "desc" }, take: 5, include: { employee: { select: { name: true } } } }),
      prisma.leaveRequest.findMany({ include: { employee: { select: { name: true } } } }),
      prisma.overtimeLog.findMany(),
      prisma.approval.findMany(),
      prisma.payrollRecord.groupBy({ by: ["month", "year"], _sum: { gross: true, net: true }, orderBy: [{ year: "desc" }, { month: "desc" }], take: 6 }),
      prisma.mileageRecord.findMany(),
      prisma.performance.findMany({ where: { score: { gt: 0 } } }),
      prisma.foreignWorker.findMany(),
      prisma.levyRecord.findMany(),
      prisma.jobPosting.findMany(),
      prisma.applicant.findMany(),
      prisma.interview.findMany({ where: { status: "Scheduled" } }),
      prisma.document.count({ where: { expiryDate: { lte: new Date(now.getTime() + 90 * 86400000), gte: now }, status: "Active" } }),
      prisma.training.findMany(),
      prisma.asset.findMany(),
      prisma.announcement.findMany({ orderBy: { createdAt: "desc" }, take: 3, where: { status: { not: "Expired" } } }),
    ]);

    const totalEmployees = employees.length;
    const activeEmployees = employees.filter(e => e.status === "Active").length;
    const deptMap: Record<string, number> = {};
    const statusMap: Record<string, number> = {};
    for (const e of employees) {
      deptMap[e.department] = (deptMap[e.department] || 0) + 1;
      statusMap[e.status] = (statusMap[e.status] || 0) + 1;
    }
    const departmentBreakdown = Object.entries(deptMap).map(([department, count]) => ({ department, count }));
    const employeeStatuses = Object.entries(statusMap).map(([status, count]) => ({ status, count }));

    const claimsValue = claimsAll.reduce((s, c) => s + c.amount, 0);
    const annualLeave = leaveAll.filter(l => l.type === "Annual Leave").length;
    const mcLeave = leaveAll.filter(l => l.type === "Medical Leave (MC)").length;
    const otherLeave = leaveAll.filter(l => l.type !== "Annual Leave" && l.type !== "Medical Leave (MC)").length;

    const otHours = otLogs.reduce((s, o) => s + o.hours, 0);
    const otAccrued = otLogs.reduce((s, o) => s + o.amount, 0);
    const otDayTypes: Record<string, number> = {};
    for (const o of otLogs) { otDayTypes[o.dayType] = (otDayTypes[o.dayType] || 0) + o.hours; }

    const approvalsAwaiting = approvalsAll.filter(a => a.status === "Pending").length;
    const approvalsApproved = approvalsAll.filter(a => a.status === "Approved").length;
    const approvalsRejected = approvalsAll.filter(a => a.status === "Rejected").length;

    const currentPayroll = payrollMonths.length > 0 ? payrollMonths[0]._sum : { gross: 0, net: 0 };
    const gross = currentPayroll.gross ?? 0;
    const net = currentPayroll.net ?? 0;
    const epf = await prisma.payrollRecord.aggregate({ _sum: { epf: true }, where: { month: payrollMonths[0]?.month ?? 5, year: payrollMonths[0]?.year ?? 2026 } });
    const socso = await prisma.payrollRecord.aggregate({ _sum: { socso: true }, where: { month: payrollMonths[0]?.month ?? 5, year: payrollMonths[0]?.year ?? 2026 } });
    const eis = await prisma.payrollRecord.aggregate({ _sum: { eis: true }, where: { month: payrollMonths[0]?.month ?? 5, year: payrollMonths[0]?.year ?? 2026 } });

    const payrollTrend = payrollMonths.map(p => ({ month: p.month, year: p.year, gross: p._sum.gross ?? 0, net: p._sum.net ?? 0 }));

    const mileageKm = mileageAll.reduce((s, m) => s + m.distance, 0);
    const mileageValue = mileageAll.reduce((s, m) => s + m.amount, 0);

    const avgScore = performanceAll.length ? Math.round(performanceAll.reduce((s, p) => s + p.score, 0) / performanceAll.length) : 76;
    const highPerformers = performanceAll.filter(p => p.score >= 85).length;
    const atRisk = performanceAll.filter(p => p.score < 50).length;
    const kpiAttain = performanceAll.length ? Math.round(performanceAll.reduce((s, p) => s + p.score, 0) / Math.max(1, performanceAll.length)) : 0;

    const levyTotal = levyAll.reduce((s, l) => s + l.totalCost, 0);
    const fwCount = fwAll.length;
    const fwExpiringSoon = fwAll.filter(w => w.permitExpiry && new Date(w.permitExpiry).getTime() - now.getTime() < 90 * 86400000 && new Date(w.permitExpiry) > now).length;

    const activeJobs = jobs.filter(j => j.status === "Open").length;
    const totalApplicants = applicants.length;
    const upcomingInterviews = interviews.length;

    const trainingCompleted = trainingAll.filter(t => t.status === "Completed").length;
    const trainingInProgress = trainingAll.filter(t => t.status === "In Progress").length;
    const upcomingTraining = trainingAll.filter(t => t.status === "Planned" || t.status === "In Progress").length;

    const totalAssets = assetsAll.length;
    const totalAssetValue = assetsAll.reduce((s, a) => s + (a.purchasePrice || 0), 0);

    const recentAnnouncements = announcements.map(a => ({ id: a.id, title: a.title, priority: a.priority || "Normal", createdAt: a.createdAt.toISOString() }));

    const stats: DashboardStats = {
      totalEmployees, activeEmployees, departmentBreakdown, employeeStatuses,
      pendingClaims: pendingClaims.length, claimsValue,
      recentClaims: claimsAll.map(c => ({ id: c.id, type: c.type, amount: c.amount, date: c.date.toISOString(), status: c.status, employee: { name: c.employee?.name || "—" } })),
      pendingLeave: pendingLeave.length, leaveTypes: { annual: annualLeave, mc: mcLeave, other: otherLeave },
      pendingLeaveRequests: pendingLeave.map(l => ({ id: l.id, type: l.type, startDate: l.startDate.toISOString(), endDate: l.endDate.toISOString(), employee: { name: l.employee?.name || "—" } })),
      otHours: Math.round(otHours), otAccrued: Math.round(otAccrued),
      otDayTypes: Object.entries(otDayTypes).map(([dayType, hours]) => ({ dayType, hours: Math.round(hours) })),
      approvalsAwaiting, approvalsApproved, approvalsRejected,
      payrollGross: gross, payrollEpf: epf._sum.epf ?? 0, payrollSocso: socso._sum.socso ?? 0, payrollEis: eis._sum.eis ?? 0, payrollNet: net,
      payrollTrend,
      mileageKm: Math.round(mileageKm), mileageValue: Math.round(mileageValue * 100) / 100,
      orgAvgScore: avgScore, kpiAttainment: kpiAttain, highPerformers, atRiskStaff: atRisk, attritionRate: 6.2,
      levyPaid: levyTotal, fwHeadcount: fwCount, fwExpiringSoon,
      activeJobs, totalApplicants, upcomingInterviews,
      documentsExpiringSoon: 0, upcomingTraining, totalAssets, totalAssetValue,
      trainingCompleted, trainingInProgress,
      recentAnnouncements,
    };

    // Fix documents expiring (need separate query due to Date filter)
    const docsExpiring = await prisma.document.count({
      where: { expiryDate: { lte: new Date(now.getTime() + 90 * 86400000), gte: now }, status: "Active" },
    });
    stats.documentsExpiringSoon = docsExpiring;

    return NextResponse.json({ success: true, data: stats } satisfies ApiResponse<DashboardStats>);
  } catch (error) {
    console.error("Stats error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch stats" } satisfies ApiResponse, { status: 500 });
  }
}
