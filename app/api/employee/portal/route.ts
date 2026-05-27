import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { ApiResponse } from "@/lib/types";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
    }

    const employee = await prisma.employee.findFirst({
      where: { name: `${session.givenName} ${session.surname}` },
    });

    if (!employee) {
      return NextResponse.json({
        success: true,
        data: { employee: null, leaveBalance: { annual: 0, mc: 0, other: 0 }, pendingLeaves: [], pendingClaims: [], recentPayslips: [] },
      } satisfies ApiResponse);
    }

    const pendingLeaves = await prisma.leaveRequest.findMany({
      where: { employeeId: employee.id },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    const pendingClaims = await prisma.claim.findMany({
      where: { employeeId: employee.id },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    const recentPayslips = await prisma.payrollRecord.findMany({
      where: { employeeId: employee.id },
      orderBy: [{ year: "desc" }, { month: "desc" }],
      take: 6,
    });

    const approvedLeaves = await prisma.leaveRequest.findMany({
      where: { employeeId: employee.id, status: "Approved" },
    });

    const annualDays = approvedLeaves
      .filter(l => l.type === "Annual Leave")
      .reduce((sum, l) => {
        const diff = Math.ceil((l.endDate.getTime() - l.startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        return sum + diff;
      }, 0);

    const mcDays = approvedLeaves
      .filter(l => l.type === "Medical Leave (MC)")
      .reduce((sum, l) => {
        const diff = Math.ceil((l.endDate.getTime() - l.startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        return sum + diff;
      }, 0);

    const otherDays = approvedLeaves
      .filter(l => l.type !== "Annual Leave" && l.type !== "Medical Leave (MC)")
      .reduce((sum, l) => {
        const diff = Math.ceil((l.endDate.getTime() - l.startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        return sum + diff;
      }, 0);

    const leaveBalance = {
      annual: Math.max(0, 14 - annualDays),
      mc: Math.max(0, 14 - mcDays),
      other: Math.max(0, 10 - otherDays),
    };

    return NextResponse.json({
      success: true,
      data: { employee, leaveBalance, pendingLeaves, pendingClaims, recentPayslips },
    } satisfies ApiResponse);
  } catch (error) {
    console.error("GET /api/employee/portal error:", error);
    return NextResponse.json({ success: false, error: "Failed" }, { status: 500 });
  }
}
