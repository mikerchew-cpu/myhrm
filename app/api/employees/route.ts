import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { ApiResponse, EmployeeInput } from "@/lib/types";

export async function GET() {
  try {
    const employees = await prisma.employee.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json({ success: true, data: employees } satisfies ApiResponse);
  } catch (error) {
    console.error("GET /api/employees error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch employees" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: EmployeeInput = await req.json();
    if (!body.employeeId || !body.name || !body.role) {
      return NextResponse.json({ success: false, error: "employeeId, name, and role are required" }, { status: 400 });
    }
    const exists = await prisma.employee.findUnique({ where: { employeeId: body.employeeId } });
    if (exists) {
      return NextResponse.json({ success: false, error: "Employee ID already exists" }, { status: 409 });
    }
    const emp = await prisma.employee.create({
      data: {
        employeeId: body.employeeId,
        name: body.name,
        role: body.role,
        department: body.department || "General",
        employmentType: body.employmentType || "Permanent",
        status: body.status || "Active",
      },
    });
    return NextResponse.json({ success: true, data: emp, message: "Employee created" } satisfies ApiResponse, { status: 201 });
  } catch (error) {
    console.error("POST /api/employees error:", error);
    return NextResponse.json({ success: false, error: "Failed to create employee" }, { status: 500 });
  }
}
