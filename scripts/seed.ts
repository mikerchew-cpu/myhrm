import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  const hash = await bcrypt.hash("admin123", 10);

  // Default users (always run — idempotent via upsert)
  for (const u of [
    { username: "admin", email: "admin@myhrm.com", givenName: "System", surname: "Admin", role: "Admin", department: "Admin", hierarchyLevel: 5, approvalLevel: 5 },
    { username: "ahmad.hr", email: "ahmad@myhrm.com", givenName: "Ahmad", surname: "Hafiz", role: "HR Manager", department: "HR", hierarchyLevel: 3, approvalLevel: 3 },
  ]) {
    await prisma.user.upsert({
      where: { username: u.username },
      update: { passwordHash: hash },
      create: { ...u, status: "Active", passwordHash: hash },
    });
  }
  console.log("  ✓ 2 default users");

  // Skill files (always check independently)
  const skillCount = await prisma.skill.count();
  if (skillCount === 0) {
    const skillData = [
      {
        title: "Annual Leave Policy",
        department: "HR",
        content: `# Annual Leave Policy\n\n## Entitlement\n- Permanent staff: 14 days per year\n- Contract staff: 10 days per year\n- EP Cat III: 8 days per year\n\n## Carry Forward\n- Maximum 5 days can be carried forward to next year\n- Unused leave beyond 5 days will be forfeited\n\n## Application\n- Submit at least 7 days in advance\n- Emergency leave: notify within 24 hours\n- Peak periods (May-June): manager approval required\n\n## Encashment\n- Upon resignation, unused annual leave will be encashed at basic salary rate`,
      },
      {
        title: "Medical Leave & MC",
        department: "HR",
        content: `# Medical Leave & MC Policy\n\n## Hospitalization\n- 60 days per year (including outpatient treatment for serious illness)\n- Extended hospitalization: up to 120 days with specialist certification\n\n## Outpatient Sick Leave\n- 14 days per year\n- MC must be from registered medical practitioner\n- Notification within 24 hours of absence\n\n## Procedure\n1. Notify supervisor within 24 hours\n2. Submit MC upon return\n3. For extended leave (>3 days), obtain company doctor clearance\n\n## EA 1955 Compliance\n- Section 60F: Paid sick leave entitlement\n- Medical certificate required for each day of absence`,
      },
      {
        title: "EPF/SOCSO/EIS Rates",
        department: "Finance",
        content: `# Malaysia Statutory Contributions (2026)\n\n## EPF (Employees Provident Fund)\n- Employee contribution: 11% of monthly salary\n- Employer contribution: 12-13% (depending on salary band)\n- Foreign workers: EPF not mandatory (opt-in available)\n\n## SOCSO (Social Security)\n- Employee: 0.5% of monthly salary\n- Employer: 1.75% of monthly salary\n- Covers: employment injury, invalidity pension\n\n## EIS (Employment Insurance System)\n- Employee: 0.2% of monthly salary\n- Employer: 0.2% of monthly salary\n- Max covered wage: RM 5,000\n\n## PCB (Monthly Tax Deduction)\n- Calculated based on EA 1955 Schedule\n- Use LHDN's PCB calculator for exact figures`,
      },
      {
        title: "Overtime Calculation",
        department: "Finance",
        content: `# Overtime (OT) Calculation\n\n## Normal Workday\n- Rate: 1.5x hourly rate\n- Hours beyond 8 hours per day\n\n## Weekend / Rest Day\n- 2.0x hourly rate for first 8 hours\n- 3.0x hourly rate beyond 8 hours\n\n## Public Holiday\n- 3.0x hourly rate for first 8 hours\n- 4.0x hourly rate beyond 8 hours\n\n## Hourly Rate Formula\n- Monthly salary / 26 days / 8 hours = hourly rate`,
      },
    ];
    for (const s of skillData) {
      await prisma.skill.create({ data: s });
    }
    console.log(`  ✓ ${skillData.length} skill files`);
  } else {
    console.log(`  ⏭️  ${skillCount} skills already exist`);
  }

  // Check if employee data already seeded
  const existing = await prisma.employee.count();
  if (existing > 0) {
    console.log(`  ⏭️  ${existing} employees already exist, skipping sample data`);
    return;
  }

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
    empData.map(e => prisma.employee.create({ data: e }))
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
    await prisma.performance.create({ data: p });
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
    await prisma.foreignWorker.create({ data: f });
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
