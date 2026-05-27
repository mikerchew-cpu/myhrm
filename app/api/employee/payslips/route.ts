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
      return NextResponse.json({ success: true, data: [] } satisfies ApiResponse);
    }

    const payslips = await prisma.payrollRecord.findMany({
      where: { employeeId: employee.id },
      orderBy: [{ year: "desc" }, { month: "desc" }],
    });

    return NextResponse.json({ success: true, data: payslips } satisfies ApiResponse);
  } catch (error) {
    console.error("GET /api/employee/payslips error:", error);
    return NextResponse.json({ success: false, error: "Failed" }, { status: 500 });
  }
}
