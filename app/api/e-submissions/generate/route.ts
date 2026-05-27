import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import type { ApiResponse } from "@/lib/types";

function pad(n: number, w: number) { return String(n).padStart(w, '0'); }

function generateBankFile(employees: { name: string; employeeId: string; netPay: number }[], companyName: string, bankName: string, accountNo: string, month: number, year: number) {
  const refNo = `PY${year}${pad(month, 2)}`;
  const lines: string[] = [];
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  lines.push(`HDR,${companyName},${bankName},${accountNo},${refNo},${months[month-1]} ${year}`);
  lines.push(`DAT,${new Date().toISOString().split('T')[0]},${employees.length}`);

  let total = 0;
  employees.forEach((e, i) => {
    const amt = e.netPay.toFixed(2);
    total += e.netPay;
    lines.push(`PAY,${pad(i+1, 4)},${e.employeeId},${e.name},${amt}`);
  });

  lines.push(`TRL,${employees.length},${total.toFixed(2)}`);
  return lines.join('\n');
}

function generateEPFFile(employees: { name: string; employeeId: string; gross: number; epfEmployee: number; epfEmployer: number }[], month: number, year: number) {
  const lines: string[] = [];
  lines.push(`KWSP,${pad(month,2)}/${year},${new Date().toISOString().split('T')[0]}`);
  lines.push(`No,EmpID,Name,Gross,Employee,Employer,Total`);

  let totalGross = 0, totalEmp = 0, totalEr = 0;
  employees.forEach((e, i) => {
    totalGross += e.gross; totalEmp += e.epfEmployee; totalEr += e.epfEmployer;
    lines.push(`${i+1},${e.employeeId},${e.name},${e.gross.toFixed(2)},${e.epfEmployee.toFixed(2)},${e.epfEmployer.toFixed(2)},${(e.epfEmployee+e.epfEmployer).toFixed(2)}`);
  });

  lines.push(`TOTAL,,,,${totalGross.toFixed(2)},${totalEmp.toFixed(2)},${totalEr.toFixed(2)}`);
  return lines.join('\n');
}

function generateSOCSOFile(employees: { name: string; employeeId: string; gross: number; socsoEmployee: number; socsoEmployer: number }[], month: number, year: number) {
  const lines: string[] = [];
  lines.push(`PERKESO,${pad(month,2)}/${year}`);
  lines.push(`No,EmpID,Name,Gross,Employee,Employer,Total`);

  let totalGross = 0, totalEmp = 0, totalEr = 0;
  employees.forEach((e, i) => {
    totalGross += e.gross; totalEmp += e.socsoEmployee; totalEr += e.socsoEmployer;
    lines.push(`${i+1},${e.employeeId},${e.name},${e.gross.toFixed(2)},${e.socsoEmployee.toFixed(2)},${e.socsoEmployer.toFixed(2)},${(e.socsoEmployee+e.socsoEmployer).toFixed(2)}`);
  });

  lines.push(`TOTAL,,,,${totalGross.toFixed(2)},${totalEmp.toFixed(2)},${totalEr.toFixed(2)}`);
  return lines.join('\n');
}

function generateEISFile(employees: { name: string; employeeId: string; gross: number; eisEmployee: number; eisEmployer: number }[], month: number, year: number) {
  const lines: string[] = [];
  lines.push(`SIP,${pad(month,2)}/${year}`);
  lines.push(`No,EmpID,Name,Gross,Employee,Employer,Total`);

  let totalGross = 0, totalEmp = 0, totalEr = 0;
  employees.forEach((e, i) => {
    totalGross += e.gross; totalEmp += e.eisEmployee; totalEr += e.eisEmployer;
    lines.push(`${i+1},${e.employeeId},${e.name},${e.gross.toFixed(2)},${e.eisEmployee.toFixed(2)},${e.eisEmployer.toFixed(2)},${(e.eisEmployee+e.eisEmployer).toFixed(2)}`);
  });

  lines.push(`TOTAL,,,,${totalGross.toFixed(2)},${totalEmp.toFixed(2)},${totalEr.toFixed(2)}`);
  return lines.join('\n');
}

function generateCP39(employees: { name: string; employeeId: string; gross: number; pcb: number }[], month: number, year: number) {
  const lines: string[] = [];
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  lines.push(`CP39 ${months[month-1]} ${year}`);
  lines.push(`="No",="EmpID",="Name",="Gross Salary",="PCB Amount"`);

  let totalGross = 0, totalPCB = 0;
  employees.forEach((e, i) => {
    totalGross += e.gross; totalPCB += e.pcb;
    lines.push(`=${i+1},=${e.employeeId},="${e.name}",=${e.gross.toFixed(2)},=${e.pcb.toFixed(2)}`);
  });

  lines.push(`=TOTAL,,,=${totalGross.toFixed(2)},=${totalPCB.toFixed(2)}`);
  return lines.join('\n');
}

function generateBorangE(employees: { name: string; employeeId: string; gross: number; epf: number; pcb: number }[], year: number) {
  const lines: string[] = [];
  lines.push(`BORANG E ${year}`);
  lines.push(`No,EmpID,Name,Total Gross,EPF,PCB`);

  let totalGross = 0, totalEPF = 0, totalPCB = 0;
  employees.forEach((e, i) => {
    totalGross += e.gross; totalEPF += e.epf; totalPCB += e.pcb;
    lines.push(`${i+1},${e.employeeId},${e.name},${e.gross.toFixed(2)},${e.epf.toFixed(2)},${e.pcb.toFixed(2)}`);
  });

  lines.push(`TOTAL,,,${totalGross.toFixed(2)},${totalEPF.toFixed(2)},${totalPCB.toFixed(2)}`);
  return lines.join('\n');
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });

    const body = await req.json();
    const { type, periodMonth, periodYear } = body;

    const employees = await prisma.employee.findMany({
      where: { status: "Active" },
      include: { payrollRecords: { where: { month: periodMonth, year: periodYear } } },
    });

    let title = '';
    let content = '';
    let recordCount = 0;
    let totalAmount = 0;

    const empData = employees.filter(e => e.payrollRecords.length > 0).map(e => {
      const p = e.payrollRecords[0];
      return {
        name: e.name,
        employeeId: e.employeeId,
        gross: p.gross,
        epf: p.epf,
        socso: p.socso,
        eis: p.eis,
        net: p.net,
        pcb: p.gross - p.epf - p.socso - p.eis - p.net,
      };
    });

    if (empData.length === 0) {
      return NextResponse.json({ success: false, error: `No payroll data for ${periodMonth}/${periodYear}` }, { status: 400 });
    }

    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const monthLabel = months[periodMonth - 1];

    switch (type) {
      case 'BANK_FILE': {
        title = `Bank File ${monthLabel} ${periodYear}`;
        content = generateBankFile(empData.map(e => ({ name: e.name, employeeId: e.employeeId, netPay: e.net })), 'MyHRM Sdn Bhd', 'Maybank', '5641-2345-6789', periodMonth, periodYear);
        recordCount = empData.length;
        totalAmount = empData.reduce((s, e) => s + e.net, 0);
        break;
      }
      case 'EPF': {
        title = `EPF ${monthLabel} ${periodYear}`;
        content = generateEPFFile(empData.map(e => ({
          ...e,
          epfEmployee: Math.round(e.epf * (11/19) * 100) / 100,
          epfEmployer: Math.round(e.epf * (8/19) * 100) / 100,
        })), periodMonth, periodYear);
        recordCount = empData.length;
        totalAmount = empData.reduce((s, e) => s + e.epf, 0);
        break;
      }
      case 'SOCSO': {
        title = `SOCSO ${monthLabel} ${periodYear}`;
        content = generateSOCSOFile(empData.map(e => ({
          ...e,
          socsoEmployee: Math.round(e.socso * (0.5/2.25) * 100) / 100,
          socsoEmployer: Math.round(e.socso * (1.75/2.25) * 100) / 100,
        })), periodMonth, periodYear);
        recordCount = empData.length;
        totalAmount = empData.reduce((s, e) => s + e.socso, 0);
        break;
      }
      case 'EIS': {
        title = `EIS ${monthLabel} ${periodYear}`;
        content = generateEISFile(empData.map(e => ({
          ...e,
          eisEmployee: Math.round(e.eis * (0.2/0.4) * 100) / 100,
          eisEmployer: Math.round(e.eis * (0.2/0.4) * 100) / 100,
        })), periodMonth, periodYear);
        recordCount = empData.length;
        totalAmount = empData.reduce((s, e) => s + e.eis, 0);
        break;
      }
      case 'CP39': {
        title = `CP39 ${monthLabel} ${periodYear}`;
        content = generateCP39(empData, periodMonth, periodYear);
        recordCount = empData.length;
        totalAmount = empData.reduce((s, e) => s + e.pcb, 0);
        break;
      }
      case 'BORANG_E': {
        title = `Borang E ${periodYear}`;
        content = generateBorangE(empData, periodYear);
        recordCount = empData.length;
        totalAmount = empData.reduce((s, e) => s + e.gross, 0);
        break;
      }
      default:
        return NextResponse.json({ success: false, error: `Unknown type: ${type}` }, { status: 400 });
    }

    const submission = await prisma.eSubmission.create({
      data: { type, title, periodMonth, periodYear, content, recordCount, totalAmount },
    });

    return NextResponse.json({ success: true, data: submission } satisfies ApiResponse, { status: 201 });
  } catch (error) {
    console.error("POST /api/e-submissions/generate error:", error);
    return NextResponse.json({ success: false, error: "Generation failed" }, { status: 500 });
  }
}
