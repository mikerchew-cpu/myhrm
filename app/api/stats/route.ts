import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { ApiResponse, DashboardStats } from "@/lib/types";

export async function GET() {
  try {
    const [
      totalEmployees,
      pendingClaims,
      claimsAll,
      pendingLeave,
      leaveAll,
      otLogs,
      approvalsAwaiting,
      approvalsApproved,
      approvalsRejected,
      payrollAll,
      mileageAll,
      performanceAll,
      fwAll,
      levyAll,
    ] = await Promise.all([
      prisma.employee.count(),
      prisma.claim.findMany({ where: { status: "Pending" } }),
      prisma.claim.findMany(),
      prisma.leaveRequest.findMany({ where: { status: "Pending" } }),
      prisma.leaveRequest.findMany(),
      prisma.overtimeLog.findMany(),
      prisma.approval.findMany({ where: { status: "Pending" } }),
      prisma.approval.findMany({ where: { status: "Approved" } }),
      prisma.approval.findMany({ where: { status: "Rejected" } }),
      prisma.payrollRecord.findMany({ where: { month: 5, year: 2026 } }),
      prisma.mileageRecord.findMany(),
      prisma.performance.findMany(),
      prisma.foreignWorker.count(),
      prisma.levyRecord.findMany(),
    ]);

    const claimsValue = claimsAll.reduce((s, c) => s + c.amount, 0);
    const annualLeave = leaveAll.filter(l => l.type === "Annual Leave").length;
    const mcLeave = leaveAll.filter(l => l.type === "Medical Leave (MC)").length;
    const otHours = otLogs.reduce((s, o) => s + o.hours, 0);
    const otAccrued = otLogs.reduce((s, o) => s + o.amount, 0);
    const gross = payrollAll.reduce((s, p) => s + p.gross, 0);
    const epf = payrollAll.reduce((s, p) => s + p.epf, 0);
    const socso = payrollAll.reduce((s, p) => s + p.socso, 0);
    const eis = payrollAll.reduce((s, p) => s + p.eis, 0);
    const net = payrollAll.reduce((s, p) => s + p.net, 0);
    const mileageKm = mileageAll.reduce((s, m) => s + m.distance, 0);
    const mileageValue = mileageAll.reduce((s, m) => s + m.amount, 0);
    const perfScores = performanceAll.filter(p => p.score > 0);
    const avgScore = perfScores.length ? Math.round(perfScores.reduce((s, p) => s + p.score, 0) / perfScores.length) : 76;
    const highPerformers = perfScores.filter(p => p.score >= 85).length;
    const atRisk = perfScores.filter(p => p.score < 50).length;
    const kpiAttain = performanceAll.length ? Math.round(perfScores.reduce((s, p) => s + p.score, 0) / Math.max(1, performanceAll.length)) : 0;
    const levyTotal = levyAll.reduce((s, l) => s + l.totalCost, 0);
    const fwCount = fwAll;

    const stats: DashboardStats = {
      totalEmployees,
      pendingClaims: pendingClaims.length,
      claimsValue,
      pendingLeave: pendingLeave.length,
      leaveTypes: { annual: annualLeave, mc: mcLeave },
      otHours: Math.round(otHours),
      otAccrued: Math.round(otAccrued),
      approvalsAwaiting: approvalsAwaiting.length,
      approvalsApproved: approvalsApproved.length,
      approvalsRejected: approvalsRejected.length,
      payrollGross: Math.round(gross * 100) / 100,
      payrollEpf: Math.round(epf * 100) / 100,
      payrollSocso: Math.round(socso * 100) / 100,
      payrollEis: Math.round(eis * 100) / 100,
      payrollNet: Math.round(net * 100) / 100,
      mileageKm: Math.round(mileageKm),
      mileageValue: Math.round(mileageValue * 100) / 100,
      orgAvgScore: avgScore,
      kpiAttainment: kpiAttain,
      highPerformers,
      atRiskStaff: atRisk,
      attritionRate: 6.2,
      levyPaid: levyTotal,
      fwHeadcount: fwCount,
    };

    return NextResponse.json({ success: true, data: stats } satisfies ApiResponse<DashboardStats>);
  } catch (error) {
    console.error("Stats error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch stats" } satisfies ApiResponse, { status: 500 });
  }
}
