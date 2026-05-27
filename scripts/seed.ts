import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Employees
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

  const employees = await Promise.all(
    empData.map(e => prisma.employee.upsert({
      where: { employeeId: e.employeeId },
      update: e,
      create: e,
    }))
  );
  console.log(`  ✓ ${employees.length} employees`);

  // Claims
  const claimsData = [
    { employeeId: employees[3].id, type: "Mileage", date: new Date("2026-05-13"), fromLocation: "KL", toLocation: "JB", distance: 320, rate: 0.6, amount: 192, status: "Pending" },
    { employeeId: employees[5].id, type: "Lodging", date: new Date("2026-05-11"), fromLocation: "Penang", toLocation: "Penang", distance: 0, rate: 0, amount: 560, status: "Pending" },
    { employeeId: employees[6].id, type: "Meals", date: new Date("2026-05-14"), fromLocation: "Klang Valley", toLocation: "Klang Valley", distance: 0, rate: 0, amount: 145, status: "Pending" },
    { employeeId: employees[7].id, type: "Mileage", date: new Date("2026-05-12"), fromLocation: "KL", toLocation: "Melaka", distance: 160, rate: 0.6, amount: 96, status: "Approved" },
    { employeeId: employees[7].id, type: "Mileage", date: new Date("2026-05-02"), fromLocation: "KL", toLocation: "Seremban", distance: 80, rate: 0.6, amount: 48, status: "Rejected" },
  ];
  for (const c of claimsData) {
    await prisma.claim.create({ data: c });
  }
  console.log(`  ✓ ${claimsData.length} claims`);

  // Leave requests
  const leaveData = [
    { employeeId: employees[2].id, type: "Annual Leave", halfDay: "Full day", startDate: new Date("2026-05-22"), endDate: new Date("2026-05-24"), reason: "Family event", status: "Pending" },
    { employeeId: employees[1].id, type: "Medical Leave (MC)", halfDay: "Full day", startDate: new Date("2026-05-16"), endDate: new Date("2026-05-16"), reason: "Sick", status: "Approved" },
    { employeeId: employees[0].id, type: "Emergency Leave", halfDay: "Full day", startDate: new Date("2026-05-17"), endDate: new Date("2026-05-17"), reason: "Emergency", status: "Pending" },
    { employeeId: employees[7].id, type: "Unpaid Leave", halfDay: "Full day", startDate: new Date("2026-05-19"), endDate: new Date("2026-05-20"), reason: "Personal matters", status: "Pending" },
  ];
  for (const l of leaveData) {
    await prisma.leaveRequest.create({ data: l });
  }
  console.log(`  ✓ ${leaveData.length} leave requests`);

  // OT logs
  const otData = [
    { employeeId: employees[0].id, date: new Date("2026-05-10"), hours: 30, dayType: "Normal workday", multiplier: 1.5, rate: 28.5, amount: 855, status: "Approved" },
    { employeeId: employees[1].id, date: new Date("2026-05-10"), hours: 18, dayType: "Weekend", multiplier: 2.0, rate: 42, amount: 756, status: "Approved" },
    { employeeId: employees[3].id, date: new Date("2026-05-11"), hours: 24, dayType: "Normal workday", multiplier: 1.5, rate: 25.17, amount: 604, status: "Pending" },
    { employeeId: employees[6].id, date: new Date("2026-05-12"), hours: 12, dayType: "Normal workday", multiplier: 1.5, rate: 31.5, amount: 378, status: "Pending" },
  ];
  for (const o of otData) {
    await prisma.overtimeLog.create({ data: o });
  }
  console.log(`  ✓ ${otData.length} OT logs`);

  // Attendance
  const today = new Date();
  for (let i = 0; i < Math.min(employees.length, 10); i++) {
    await prisma.attendance.create({
      data: {
        employeeId: employees[i].id,
        date: today,
        clockIn: "08:" + String(15 + i).padStart(2, "0"),
        clockOut: "17:" + String(30 + i).padStart(2, "0"),
        status: i < 8 ? "Present" : "Late",
      },
    });
  }
  console.log(`  ✓ 10 attendance records`);

  // Performance
  const perfData = [
    { employeeId: employees[0].id, score: 94, quarter: "Q2", year: 2026 },
    { employeeId: employees[1].id, score: 91, quarter: "Q2", year: 2026 },
    { employeeId: employees[2].id, score: 89, quarter: "Q2", year: 2026 },
    { employeeId: employees[3].id, score: 72, quarter: "Q2", year: 2026 },
    { employeeId: employees[4].id, score: 45, quarter: "Q2", year: 2026 },
    { employeeId: employees[5].id, score: 88, quarter: "Q2", year: 2026 },
    { employeeId: employees[6].id, score: 76, quarter: "Q2", year: 2026 },
  ];
  for (const p of perfData) {
    await prisma.performance.upsert({
      where: { employeeId: p.employeeId },
      update: p,
      create: p,
    });
  }
  console.log(`  ✓ ${perfData.length} performance records`);

  // Mileage
  const mileData = [
    { employeeId: employees[3].id, date: new Date("2026-05-13"), fromLocation: "KL", toLocation: "JB", distance: 320, amount: 192, status: "Pending" },
    { employeeId: employees[5].id, date: new Date("2026-05-10"), fromLocation: "Shah Alam", toLocation: "Penang", distance: 350, amount: 210, status: "Approved" },
  ];
  for (const m of mileData) {
    await prisma.mileageRecord.create({ data: m });
  }
  console.log(`  ✓ ${mileData.length} mileage records`);

  // Approvals
  const apprData = [
    { employeeId: employees[3].id, type: "Claim", referenceId: "pending", level: 2, status: "Pending" },
    { employeeId: employees[5].id, type: "Claim", referenceId: "pending", level: 2, status: "Pending" },
    { employeeId: employees[2].id, type: "Leave", referenceId: "pending", level: 2, status: "Pending" },
    { employeeId: employees[7].id, type: "Leave", referenceId: "approved", level: 1, status: "Approved" },
  ];
  for (const a of apprData) {
    await prisma.approval.create({ data: a });
  }
  console.log(`  ✓ ${apprData.length} approvals`);

  // Foreign workers
  const fwData = [
    { employeeId: employees[4].id, nationality: "Indonesian", permitType: "VP(TE)", permitExpiry: new Date("2026-06-14"), levyPaid: true, fomemaStatus: "Due", securityBond: 1500 },
  ];
  for (const f of fwData) {
    await prisma.foreignWorker.upsert({
      where: { employeeId: f.employeeId },
      update: f,
      create: f,
    });
  }
  console.log(`  ✓ ${fwData.length} foreign worker records`);

  // Payroll
  const payrollData = [
    { employeeId: employees[0].id, month: 5, year: 2026, gross: 5800, epf: 696, socso: 79, eis: 24, net: 5001, status: "Approved" },
    { employeeId: employees[1].id, month: 5, year: 2026, gross: 6200, epf: 744, socso: 85, eis: 25, net: 5346, status: "Approved" },
    { employeeId: employees[2].id, month: 5, year: 2026, gross: 4800, epf: 576, socso: 66, eis: 20, net: 4138, status: "Approved" },
  ];
  for (const p of payrollData) {
    await prisma.payrollRecord.create({ data: p });
  }
  console.log(`  ✓ ${payrollData.length} payroll records`);

  console.log("\n✅ Seeding complete!");
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
