export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface DashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  departmentBreakdown: { department: string; count: number }[];
  employeeStatuses: { status: string; count: number }[];
  pendingClaims: number;
  claimsValue: number;
  recentClaims: { id: string; type: string; amount: number; date: string; status: string; employee: { name: string } }[];
  pendingLeave: number;
  leaveTypes: { annual: number; mc: number; other: number };
  pendingLeaveRequests: { id: string; type: string; startDate: string; endDate: string; employee: { name: string } }[];
  otHours: number;
  otAccrued: number;
  otDayTypes: { dayType: string; hours: number }[];
  approvalsAwaiting: number;
  approvalsApproved: number;
  approvalsRejected: number;
  payrollGross: number;
  payrollEpf: number;
  payrollSocso: number;
  payrollEis: number;
  payrollNet: number;
  payrollTrend: { month: number; year: number; gross: number; net: number }[];
  mileageKm: number;
  mileageValue: number;
  orgAvgScore: number;
  kpiAttainment: number;
  highPerformers: number;
  atRiskStaff: number;
  attritionRate: number;
  levyPaid: number;
  fwHeadcount: number;
  fwExpiringSoon: number;
  activeJobs: number;
  totalApplicants: number;
  upcomingInterviews: number;
  documentsExpiringSoon: number;
  upcomingTraining: number;
  totalAssets: number;
  totalAssetValue: number;
  trainingCompleted: number;
  trainingInProgress: number;
  recentAnnouncements: { id: string; title: string; priority: string; createdAt: string }[];
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

export interface UserInput {
  username: string;
  email: string;
  givenName: string;
  surname: string;
  role: string;
  department: string;
  hierarchyLevel: number;
  approvalLevel: number;
  status?: string;
}

export interface AiProviderInput {
  apiKey: string;
  endpoint: string;
  enabled: boolean;
}

export interface EmployeeInput {
  employeeId: string;
  name: string;
  role: string;
  department: string;
  employmentType: string;
  status?: string;
}
