import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${process.env.SEED_SECRET || "myhrm-seed-local"}`) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const hash = await bcrypt.hash("admin123", 10);

    let users = 0, employees = 0, claims = 0, leaves = 0, overtime = 0;
    let attendance = 0, perf = 0, mileage = 0, approvals = 0;
    let foreign = 0, payroll = 0;

    for (const u of [
      { username: "admin", email: "admin@myhrm.com", givenName: "System", surname: "Admin", role: "Admin", department: "Admin", hierarchyLevel: 5, approvalLevel: 5 },
      { username: "ahmad.hr", email: "ahmad@myhrm.com", givenName: "Ahmad", surname: "Hafiz", role: "HR Manager", department: "HR", hierarchyLevel: 3, approvalLevel: 3 },
    ]) {
      await prisma.user.upsert({
        where: { username: u.username },
        update: { passwordHash: hash },
        create: { ...u, status: "Active", passwordHash: hash },
      });
      users++;
    }

    const existing = await prisma.employee.count();
    if (existing === 0) {
      const empData = [
        { employeeId: "E138", name: "Faizal Hashim", role: "Field Tech", department: "Field Services", employmentType: "Permanent", status: "Active" },
        { employeeId: "E139", name: "Jason Tan", role: "Service Engineer", department: "Tech Support", employmentType: "Permanent", status: "Active" },
        { employeeId: "E140", name: "Nurul Zahira", role: "CS Specialist", department: "Sales", employmentType: "Permanent", status: "Active" },
        { employeeId: "E141", name: "Rashid Abdullah", role: "Field Tech", department: "Field Services", employmentType: "Contract", status: "Active" },
        { employeeId: "E142", name: "Ramu a/l Krishnan", role: "Support Exec", department: "Tech Support", employmentType: "EP Cat III", status: "Probation" },
        { employeeId: "E143", name: "Lim Mei Ying", role: "Field Tech", department: "Field Services", employmentType: "Permanent", status: "Active" },
        { employeeId: "E144", name: "Kumari Selvam", role: "Support", department: "Tech Support", employmentType: "Permanent", status: "Active" },
        { employeeId: "E145", name: "Priya Rajendran", role: "CS Specialist", department: "Sales", employmentType: "Permanent", status: "Active" },
        { employeeId: "E146", name: "Ahmad Hafiz", role: "HR Manager", department: "HR", employmentType: "Permanent", status: "Active" },
        { employeeId: "E147", name: "Aisyah Rahman", role: "HR Executive", department: "HR", employmentType: "Permanent", status: "Active" },
      ];
      for (const e of empData) {
        await prisma.employee.create({ data: e });
        employees++;
      }

      const empIds = (await prisma.employee.findMany({ take: 10 })).map(e => e.id);

      const cData = [
        { employeeId: empIds[3], type: "Mileage", date: new Date("2026-05-13"), fromLocation: "KL", toLocation: "JB", distance: 320, rate: 0.6, amount: 192, status: "Pending" },
        { employeeId: empIds[5], type: "Lodging", date: new Date("2026-05-11"), fromLocation: "Penang", toLocation: "Penang", distance: 0, rate: 0, amount: 560, status: "Pending" },
        { employeeId: empIds[6], type: "Meals", date: new Date("2026-05-14"), fromLocation: "Klang Valley", toLocation: "Klang Valley", distance: 0, rate: 0, amount: 145, status: "Pending" },
        { employeeId: empIds[7], type: "Mileage", date: new Date("2026-05-12"), fromLocation: "KL", toLocation: "Melaka", distance: 160, rate: 0.6, amount: 96, status: "Approved" },
        { employeeId: empIds[7], type: "Mileage", date: new Date("2026-05-02"), fromLocation: "KL", toLocation: "Seremban", distance: 80, rate: 0.6, amount: 48, status: "Rejected" },
      ];
      for (const c of cData) { await prisma.claim.create({ data: c }); claims++; }

      const lData = [
        { employeeId: empIds[2], type: "Annual Leave", halfDay: "Full day", startDate: new Date("2026-05-22"), endDate: new Date("2026-05-24"), reason: "Family event", status: "Pending" },
        { employeeId: empIds[1], type: "Medical Leave (MC)", halfDay: "Full day", startDate: new Date("2026-05-16"), endDate: new Date("2026-05-16"), reason: "Sick", status: "Approved" },
        { employeeId: empIds[0], type: "Emergency Leave", halfDay: "Full day", startDate: new Date("2026-05-17"), endDate: new Date("2026-05-17"), reason: "Emergency", status: "Pending" },
        { employeeId: empIds[7], type: "Unpaid Leave", halfDay: "Full day", startDate: new Date("2026-05-19"), endDate: new Date("2026-05-20"), reason: "Personal matters", status: "Pending" },
      ];
      for (const l of lData) { await prisma.leaveRequest.create({ data: l }); leaves++; }

      const oData = [
        { employeeId: empIds[0], date: new Date("2026-05-10"), hours: 30, dayType: "Normal workday", multiplier: 1.5, rate: 28.5, amount: 855, status: "Approved" },
        { employeeId: empIds[1], date: new Date("2026-05-10"), hours: 18, dayType: "Weekend", multiplier: 2.0, rate: 42, amount: 756, status: "Approved" },
        { employeeId: empIds[3], date: new Date("2026-05-11"), hours: 24, dayType: "Normal workday", multiplier: 1.5, rate: 25.17, amount: 604, status: "Pending" },
        { employeeId: empIds[6], date: new Date("2026-05-12"), hours: 12, dayType: "Normal workday", multiplier: 1.5, rate: 31.5, amount: 378, status: "Pending" },
      ];
      for (const o of oData) { await prisma.overtimeLog.create({ data: o }); overtime++; }

      const today = new Date();
      for (let i = 0; i < Math.min(empIds.length, 10); i++) {
        await prisma.attendance.create({
          data: { employeeId: empIds[i], date: today, clockIn: "08:" + String(15 + i).padStart(2, "0"), clockOut: "17:" + String(30 + i).padStart(2, "0"), status: i < 8 ? "Present" : "Late" },
        });
        attendance++;
      }

      const pData = [
        { employeeId: empIds[0], score: 94, quarter: "Q2", year: 2026 },
        { employeeId: empIds[1], score: 91, quarter: "Q2", year: 2026 },
        { employeeId: empIds[2], score: 89, quarter: "Q2", year: 2026 },
        { employeeId: empIds[3], score: 72, quarter: "Q2", year: 2026 },
        { employeeId: empIds[4], score: 45, quarter: "Q2", year: 2026 },
        { employeeId: empIds[5], score: 88, quarter: "Q2", year: 2026 },
        { employeeId: empIds[6], score: 76, quarter: "Q2", year: 2026 },
      ];
      for (const p of pData) { await prisma.performance.create({ data: p }); perf++; }

      const mData = [
        { employeeId: empIds[3], date: new Date("2026-05-13"), fromLocation: "KL", toLocation: "JB", distance: 320, amount: 192, status: "Pending" },
        { employeeId: empIds[5], date: new Date("2026-05-10"), fromLocation: "Shah Alam", toLocation: "Penang", distance: 350, amount: 210, status: "Approved" },
      ];
      for (const m of mData) { await prisma.mileageRecord.create({ data: m }); mileage++; }

      const aData = [
        { employeeId: empIds[3], type: "Claim", referenceId: "pending", level: 2, status: "Pending" },
        { employeeId: empIds[5], type: "Claim", referenceId: "pending", level: 2, status: "Pending" },
        { employeeId: empIds[2], type: "Leave", referenceId: "pending", level: 2, status: "Pending" },
        { employeeId: empIds[7], type: "Leave", referenceId: "approved", level: 1, status: "Approved" },
      ];
      for (const a of aData) { await prisma.approval.create({ data: a }); approvals++; }

      const fData = [
        { employeeId: empIds[4], nationality: "Indonesian", permitType: "VP(TE)", permitExpiry: new Date("2026-06-14"), levyPaid: true, fomemaStatus: "Due", securityBond: 1500 },
      ];
      for (const f of fData) { await prisma.foreignWorker.create({ data: f }); foreign++; }

      const payData = [
        { employeeId: empIds[0], month: 5, year: 2026, gross: 5800, epf: 696, socso: 79, eis: 24, net: 5001, status: "Approved" },
        { employeeId: empIds[1], month: 5, year: 2026, gross: 6200, epf: 744, socso: 85, eis: 25, net: 5346, status: "Approved" },
        { employeeId: empIds[2], month: 5, year: 2026, gross: 4800, epf: 576, socso: 66, eis: 20, net: 4138, status: "Approved" },
      ];
      for (const p of payData) { await prisma.payrollRecord.create({ data: p }); payroll++; }
    }

    return NextResponse.json({
      success: true,
      message: "Database seeded",
      stats: { users, employees, claims, leaves, overtime, attendance, perf, mileage, approvals, foreign, payroll },
    });
  } catch (error) {
    console.error("POST /api/seed error:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
