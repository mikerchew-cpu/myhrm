export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface DashboardStats {
  totalEmployees: number;
  pendingClaims: number;
  claimsValue: number;
  pendingLeave: number;
  leaveTypes: { annual: number; mc: number };
  otHours: number;
  otAccrued: number;
  approvalsAwaiting: number;
  approvalsApproved: number;
  approvalsRejected: number;
  payrollGross: number;
  payrollEpf: number;
  payrollSocso: number;
  payrollEis: number;
  payrollNet: number;
  mileageKm: number;
  mileageValue: number;
  orgAvgScore: number;
  kpiAttainment: number;
  highPerformers: number;
  atRiskStaff: number;
  attritionRate: number;
  levyPaid: number;
  fwHeadcount: number;
}

export interface ClaimInput {
  employeeId: string;
  type: string;
  date: string;
  fromLocation: string;
  toLocation: string;
  distance: number;
  rate: number;
  amount: number;
  remarks?: string;
}

export interface LeaveInput {
  employeeId: string;
  type: string;
  halfDay: string;
  startDate: string;
  endDate: string;
  reason?: string;
}

export interface EmployeeInput {
  employeeId: string;
  name: string;
  role: string;
  department: string;
  employmentType: string;
  status?: string;
}
