import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { callAi } from "@/lib/ai";
import type { ApiResponse } from "@/lib/types";

interface Fault {
  id: string;
  severity: "critical" | "warning" | "info";
  module: string;
  title: string;
  description: string;
  recommendation: string;
  affectedEntity: string;
  value: string;
}

export async function GET() {
  try {
    const faults: Fault[] = [];
    const now = new Date();
    
    // --- PAYROLL ANOMALIES ---
    const payrollRecords = await prisma.payrollRecord.findMany({
      include: { employee: true },
      orderBy: [{ year: "desc" }, { month: "desc" }],
    });
    
    const currentMonth = payrollRecords.filter(p => p.month === 5 && p.year === 2026);
    const prevMonth = payrollRecords.filter(p => p.month === 4 && p.year === 2026);
    
    for (const curr of currentMonth) {
      const prev = prevMonth.find(p => p.employeeId === curr.employeeId);
      if (prev && prev.gross > 0) {
        const drop = ((prev.net - curr.net) / prev.net) * 100;
        if (drop > 20) {
          faults.push({
            id: `payroll-drop-${curr.id}`,
            severity: "warning",
            module: "Payroll",
            title: "Significant net pay decrease",
            description: `${curr.employee?.name || "Employee"}'s net pay dropped ${Math.round(drop)}% (RM ${prev.net.toLocaleString()} → RM ${curr.net.toLocaleString()})`,
            recommendation: "Review salary adjustments, verify EPF/SOCSO deductions are correct",
            affectedEntity: curr.employee?.name || "Unknown",
            value: `-${Math.round(drop)}%`,
          });
        }
      }
      if (curr.epf === 0 && curr.gross > 0) {
        faults.push({
          id: `payroll-noepf-${curr.id}`,
          severity: "warning",
          module: "Payroll",
          title: "Missing EPF deduction",
          description: `${curr.employee?.name || "Employee"} has gross pay RM ${curr.gross.toLocaleString()} but zero EPF deduction`,
          recommendation: "Verify employment status — foreign workers may opt out, local staff require mandatory EPF",
          affectedEntity: curr.employee?.name || "Unknown",
          value: "RM 0 EPF",
        });
      }
    }
    
    // --- LEAVE PATTERNS ---
    const allLeave = await prisma.leaveRequest.findMany({ include: { employee: true } });
    const pendingLeaves = allLeave.filter(l => l.status === "Pending");
    
    const leaveByEmp: Record<string, { count: number; pending: number; employee: string }> = {};
    for (const l of allLeave) {
      if (!leaveByEmp[l.employeeId]) leaveByEmp[l.employeeId] = { count: 0, pending: 0, employee: l.employee?.name || "Unknown" };
      leaveByEmp[l.employeeId].count++;
      if (l.status === "Pending") leaveByEmp[l.employeeId].pending++;
    }
    
    for (const [empId, data] of Object.entries(leaveByEmp)) {
      if (data.pending >= 3) {
        faults.push({
          id: `leave-pending-${empId}`,
          severity: "warning",
          module: "Leave",
          title: "Multiple pending leave requests",
          description: `${data.employee} has ${data.pending} pending leave requests awaiting approval`,
          recommendation: "Review pending requests — approve or reject with clear reasoning",
          affectedEntity: data.employee,
          value: `${data.pending} pending`,
        });
      }
      if (data.count >= 8) {
        faults.push({
          id: `leave-high-${empId}`,
          severity: "info",
          module: "Leave",
          title: "High leave utilisation",
          description: `${data.employee} has used ${data.count} leave requests this year`,
          recommendation: "Check leave balance and ensure compliance with annual allowance",
          affectedEntity: data.employee,
          value: `${data.count} requests`,
        });
      }
    }
    
    if (pendingLeaves.length > 8) {
      faults.push({
        id: "leave-backlog",
        severity: "warning",
        module: "Leave",
        title: "Leave approval backlog",
        description: `${pendingLeaves.length} leave requests are pending approval across all employees`,
        recommendation: "Assign backup approvers or escalate to department heads",
        affectedEntity: "All departments",
        value: `${pendingLeaves.length} pending`,
      });
    }
    
    // --- OVERTIME ANOMALIES ---
    const otLogs = await prisma.overtimeLog.findMany({ include: { employee: true } });
    const otByEmp: Record<string, { hours: number; employee: string; weekend: number }> = {};
    for (const o of otLogs) {
      if (!otByEmp[o.employeeId]) otByEmp[o.employeeId] = { hours: 0, employee: o.employee?.name || "Unknown", weekend: 0 };
      otByEmp[o.employeeId].hours += o.hours;
      if (o.dayType === "Weekend" || o.dayType === "Public Holiday") otByEmp[o.employeeId].weekend += o.hours;
    }
    
    for (const [empId, data] of Object.entries(otByEmp)) {
      if (data.hours > 60) {
        faults.push({
          id: `ot-excessive-${empId}`,
          severity: "critical",
          module: "Overtime",
          title: "Excessive overtime hours",
          description: `${data.employee} recorded ${Math.round(data.hours)} OT hours — well above the 40h/month norm`,
          recommendation: "Audit OT logs for accuracy, consider redistribution of workload",
          affectedEntity: data.employee,
          value: `${Math.round(data.hours)}h`,
        });
      } else if (data.hours > 40) {
        faults.push({
          id: `ot-high-${empId}`,
          severity: "warning",
          module: "Overtime",
          title: "High overtime hours",
          description: `${data.employee} recorded ${Math.round(data.hours)} OT hours this month`,
          recommendation: "Monitor workload and verify OT approvals",
          affectedEntity: data.employee,
          value: `${Math.round(data.hours)}h`,
        });
      }
      if (data.weekend > 24) {
        faults.push({
          id: `ot-weekend-${empId}`,
          severity: "warning",
          module: "Overtime",
          title: "High weekend/public holiday OT",
          description: `${data.employee} has ${Math.round(data.weekend)}h of weekend/holiday OT (2x-3x rate)`,
          recommendation: "Verify business necessity for premium-rate OT hours",
          affectedEntity: data.employee,
          value: `${Math.round(data.weekend)}h premium`,
        });
      }
    }
    
    // --- PERFORMANCE RISKS ---
    const performances = await prisma.performance.findMany({
      include: { employee: true },
      orderBy: [{ year: "desc" }, { quarter: "desc" }],
    });
    
    const perfByEmp: Record<string, { scores: { quarter: string; year: number; score: number }[]; employee: string }> = {};
    for (const p of performances) {
      if (!perfByEmp[p.employeeId]) perfByEmp[p.employeeId] = { scores: [], employee: p.employee?.name || "Unknown" };
      perfByEmp[p.employeeId].scores.push({ quarter: p.quarter, year: p.year, score: p.score });
    }
    
    for (const [empId, data] of Object.entries(perfByEmp)) {
      const latest = data.scores[0];
      const previous = data.scores[1];
      if (!latest) continue;
      if (latest.score < 50) {
        faults.push({
          id: `perf-low-${empId}`,
          severity: "critical",
          module: "Performance",
          title: "Critically low performance score",
          description: `${data.employee} scored ${latest.score} in Q${latest.quarter} ${latest.year} — below 50 threshold`,
          recommendation: "Initiate Performance Improvement Plan (PIP) immediately",
          affectedEntity: data.employee,
          value: `Score: ${latest.score}`,
        });
      }
      if (latest.score < 65 && latest.score >= 50) {
        faults.push({
          id: `perf-decline-${empId}`,
          severity: "warning",
          module: "Performance",
          title: "Below-average performance",
          description: `${data.employee} scored ${latest.score} in Q${latest.quarter} ${latest.year}`,
          recommendation: "Schedule coaching session and set improvement targets",
          affectedEntity: data.employee,
          value: `Score: ${latest.score}`,
        });
      }
      if (previous && previous.score > 0 && (previous.score - latest.score) > 20) {
        faults.push({
          id: `perf-drop-${empId}`,
          severity: "warning",
          module: "Performance",
          title: "Significant performance drop",
          description: `${data.employee}'s score dropped from ${previous.score} to ${latest.score} (${Math.round((1 - latest.score / previous.score) * 100)}% decline)`,
          recommendation: "Investigate cause — workload, personal issues, or role fit",
          affectedEntity: data.employee,
          value: `-${previous.score - latest.score} pts`,
        });
      }
    }
    
    // --- DOCUMENT EXPIRY ---
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 86400000);
    const expiringDocs = await prisma.document.findMany({
      where: { expiryDate: { lte: thirtyDaysFromNow, gte: now }, status: "Active" },
    });
    
    const allEmployees = await prisma.employee.findMany();
    const getEmpName = (empId: string) => allEmployees.find(e => e.id === empId)?.name || "Unknown";

    for (const doc of expiringDocs) {
      const daysLeft = Math.ceil((new Date(doc.expiryDate!).getTime() - now.getTime()) / 86400000);
      faults.push({
        id: `doc-expire-${doc.id}`,
        severity: daysLeft <= 7 ? "critical" : "warning",
        module: "Documents",
        title: `Document expiring in ${daysLeft} day${daysLeft > 1 ? 's' : ''}`,
        description: `"${doc.title}" (${doc.type}) for ${getEmpName(doc.employeeId)} expires on ${new Date(doc.expiryDate!).toLocaleDateString()}`,
        recommendation: daysLeft <= 7 ? "Renew IMMEDIATELY to avoid compliance breach" : "Schedule renewal before expiry",
        affectedEntity: getEmpName(doc.employeeId),
        value: `${daysLeft}d`,
      });
    }
    
    const expiredDocs = await prisma.document.findMany({
      where: { expiryDate: { lt: now }, status: "Active" },
    });
    
    for (const doc of expiredDocs) {
      faults.push({
        id: `doc-expired-${doc.id}`,
        severity: "critical",
        module: "Documents",
        title: "Expired document still marked active",
        description: `"${doc.title}" (${doc.type}) for ${getEmpName(doc.employeeId)} expired on ${new Date(doc.expiryDate!).toLocaleDateString()}`,
        recommendation: "Update status to Expired and arrange immediate renewal",
        affectedEntity: getEmpName(doc.employeeId),
        value: "EXPIRED",
      });
    }
    
    // --- FOREIGN WORKER COMPLIANCE ---
    const fwList = await prisma.foreignWorker.findMany({ include: { employee: true } });
    const ninetyDaysFromNow = new Date(now.getTime() + 90 * 86400000);
    
    for (const fw of fwList) {
      if (fw.permitExpiry && fw.permitExpiry < thirtyDaysFromNow && fw.permitExpiry > now) {
        const daysLeft = Math.ceil((new Date(fw.permitExpiry).getTime() - now.getTime()) / 86400000);
        faults.push({
          id: `fw-permit-${fw.id}`,
          severity: daysLeft <= 14 ? "critical" : "warning",
          module: "Foreign Workers",
          title: `Work permit expiring in ${daysLeft} days`,
          description: `${fw.employee?.name || "Worker"} (${fw.nationality}) — VP(TE) permit expires ${new Date(fw.permitExpiry).toLocaleDateString()}`,
          recommendation: "Submit permit renewal application to Immigration Department immediately",
          affectedEntity: fw.employee?.name || "Unknown",
          value: `${daysLeft}d remaining`,
        });
      }
      if (fw.fomemaStatus === "Due") {
        faults.push({
          id: `fw-fomema-${fw.id}`,
          severity: "warning",
          module: "Foreign Workers",
          title: "FOMEMA medical check-up due",
          description: `${fw.employee?.name || "Worker"} has FOMEMA status "Due" — mandatory annual check-up required`,
          recommendation: "Schedule FOMEMA appointment at registered panel clinic",
          affectedEntity: fw.employee?.name || "Unknown",
          value: "Due",
        });
      }
    }
    
    // --- CLAIMS ANOMALIES ---
    const allClaims = await prisma.claim.findMany({ include: { employee: true } });
    const claimsByEmp: Record<string, { count: number; total: number; employee: string }> = {};
    for (const c of allClaims) {
      if (!claimsByEmp[c.employeeId]) claimsByEmp[c.employeeId] = { count: 0, total: 0, employee: c.employee?.name || "Unknown" };
      claimsByEmp[c.employeeId].count++;
      claimsByEmp[c.employeeId].total += c.amount;
    }
    
    for (const [empId, data] of Object.entries(claimsByEmp)) {
      if (data.total > 2000) {
        faults.push({
          id: `claim-high-${empId}`,
          severity: "warning",
          module: "Claims",
          title: "High total claims value",
          description: `${data.employee} has claimed RM ${data.total.toLocaleString()} across ${data.count} submissions`,
          recommendation: "Audit claims for compliance with company expense policy",
          affectedEntity: data.employee,
          value: `RM ${data.total.toLocaleString()}`,
        });
      }
      if (data.count > 5) {
        faults.push({
          id: `claim-freq-${empId}`,
          severity: "info",
          module: "Claims",
          title: "High claim submission frequency",
          description: `${data.employee} submitted ${data.count} claims — above average frequency`,
          recommendation: "Check for duplicate or split claims (claim splitting is a red flag)",
          affectedEntity: data.employee,
          value: `${data.count} submissions`,
        });
      }
    }
    
    const pendingClaims = allClaims.filter(c => c.status === "Pending");
    const oldPendingClaims = pendingClaims.filter(c => {
      return (now.getTime() - new Date(c.date).getTime()) > 14 * 86400000;
    });
    
    if (oldPendingClaims.length > 0) {
      faults.push({
        id: "claims-stale",
        severity: "warning",
        module: "Claims",
        title: "Stale pending claims",
        description: `${oldPendingClaims.length} claims have been pending for more than 14 days`,
        recommendation: "Escalate to department heads for immediate approval",
        affectedEntity: "Multiple employees",
        value: `${oldPendingClaims.length} stale`,
      });
    }
    
    // --- RECRUITMENT BOTTLENECKS ---
    const jobs = await prisma.jobPosting.findMany({
      where: { status: "Open" },
      orderBy: { createdAt: "desc" },
    });
    
    for (const job of jobs) {
      const daysOpen = Math.ceil((now.getTime() - new Date(job.createdAt).getTime()) / 86400000);
      if (daysOpen > 60) {
        const applicants = await prisma.applicant.count({ where: { jobPostingId: job.id } });
        faults.push({
          id: `job-stale-${job.id}`,
          severity: "warning",
          module: "Recruitment",
          title: "Job open >60 days with pending candidates",
          description: `"${job.title}" has been open ${daysOpen} days with ${applicants} applicants in pipeline`,
          recommendation: "Review screening criteria, consider expanding sourcing channels or adjusting requirements",
          affectedEntity: job.title,
          value: `${daysOpen}d open`,
        });
      }
    }
    
    // --- TRAINING GAPS ---
    const trainingRecords = await prisma.training.findMany();
    const activeEmployees = await prisma.employee.findMany({ where: { status: "Active" } });
    const trainedEmpIds = new Set(trainingRecords.map(t => t.employeeId));
    const untrained = activeEmployees.filter(e => !trainedEmpIds.has(e.id)).slice(0, 5);
    
    if (untrained.length > 0) {
      faults.push({
        id: "training-gap",
        severity: "info",
        module: "Training",
        title: "Employees without training records",
        description: `${untrained.length} active employees have no training records: ${untrained.map(e => e.name).join(", ")}`,
        recommendation: "Schedule mandatory onboarding or compliance training",
        affectedEntity: `${untrained.length} employees`,
        value: "No records",
      });
    }
    
    // --- ATTENDANCE ISSUES ---
    const attendance = await prisma.attendance.findMany({ include: { employee: true } });
    const attByEmp: Record<string, { late: number; absent: number; employee: string }> = {};
    for (const a of attendance) {
      if (!attByEmp[a.employeeId]) attByEmp[a.employeeId] = { late: 0, absent: 0, employee: a.employee?.name || "Unknown" };
      if (a.status === "Late") attByEmp[a.employeeId].late++;
      if (a.status === "Absent") attByEmp[a.employeeId].absent++;
    }
    
    for (const [empId, data] of Object.entries(attByEmp)) {
      if (data.late >= 5) {
        faults.push({
          id: `att-late-${empId}`,
          severity: "warning",
          module: "Attendance",
          title: "Chronic lateness",
          description: `${data.employee} has been late ${data.late} times — pattern of poor punctuality`,
          recommendation: "Conduct counselling session and issue written warning if pattern continues",
          affectedEntity: data.employee,
          value: `${data.late} late`,
        });
      }
      if (data.absent >= 3) {
        faults.push({
          id: `att-absent-${empId}`,
          severity: "warning",
          module: "Attendance",
          title: "Frequent absences",
          description: `${data.employee} has ${data.absent} absences without leave records`,
          recommendation: "Verify if unofficial absences — may require disciplinary action",
          affectedEntity: data.employee,
          value: `${data.absent} absent`,
        });
      }
    }
    
    // --- SORT AND SUMMARISE ---
    faults.sort((a, b) => {
      const order = { critical: 0, warning: 1, info: 2 };
      return order[a.severity] - order[b.severity];
    });
    
    const critical = faults.filter(f => f.severity === "critical").length;
    const warnings = faults.filter(f => f.severity === "warning").length;
    const infos = faults.filter(f => f.severity === "info").length;
    
    const healthScore = Math.max(0, 100 - (critical * 15 + warnings * 5 + infos * 2));
    
    const summary = {
      healthScore,
      totalFaults: faults.length,
      critical,
      warnings,
      infos,
      modulesAffected: [...new Set(faults.map(f => f.module))],
      faults: faults.slice(0, 30),
    };
    
    return NextResponse.json({ success: true, data: summary } satisfies ApiResponse);
  } catch (error) {
    console.error("Fault detect error:", error);
    return NextResponse.json({ success: false, error: String(error) } satisfies ApiResponse, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const getRes = await GET();
    const getData = await getRes.json();
    if (!getData.success) return getRes;
    
    const summary = getData.data;
    
    const provider = await prisma.aiProvider.findFirst({ where: { enabled: true } });
    if (!provider) {
      return NextResponse.json({
        success: true,
        data: { ...summary, aiAnalysis: "No AI provider configured. Add one in Admin → AI Connectors." },
      } satisfies ApiResponse);
    }
    
    const faultsList = summary.faults.slice(0, 20).map((f: Fault) =>
      `[${f.severity.toUpperCase()}] ${f.module}: ${f.title} — ${f.description} → Recommendation: ${f.recommendation}`
    ).join("\n");
    
    const prompt = `You are an HR analytics AI. Review the following fault detection report for MyHRM (Malaysia HR system).

Health Score: ${summary.healthScore}/100
Total Faults: ${summary.totalFaults} (${summary.critical} critical, ${summary.warnings} warnings, ${summary.infos} info)
Affected Modules: ${summary.modulesAffected.join(", ")}

Detected faults:
${faultsList}

Please provide:
1. Executive summary (2-3 sentences on overall health)
2. Top 3 most urgent issues requiring immediate action
3. Root cause analysis for the most critical pattern
4. Recommended preventative measures for the next 30 days
5. If health score is below 70, provide a recovery action plan

Be concise and actionable. Format with clear headings.`;
    
    const aiAnalysis = await callAi(provider.provider, provider.apiKey, [
      { role: "system", content: "You are an expert HR analytics and risk management AI. Provide concise, actionable analysis." },
      { role: "user", content: prompt },
    ], provider.endpoint);
    
    return NextResponse.json({
      success: true,
      data: { ...summary, aiAnalysis },
    } satisfies ApiResponse);
  } catch (error) {
    console.error("AI fault detect error:", error);
    return NextResponse.json({ success: false, error: String(error) } satisfies ApiResponse, { status: 500 });
  }
}
