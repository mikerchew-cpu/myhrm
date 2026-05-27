# Employee Self-Service Portal Guide

**Department:** General

---

## Purpose

The Employee Self-Service (ESS) Portal empowers employees to manage their own HR information without requiring HR admin intervention. This reduces admin workload, improves data accuracy, and gives employees direct control over their personal records.

---

## Features

| Feature | Description |
|---------|-------------|
| Profile Management | View and update personal information |
| Leave Management | Submit, view, and cancel leave requests |
| Payslip Access | View and download monthly payslips |
| Claims Submission | Submit expense and mileage claims |
| Bank Details | Update bank account information |
| Document Upload | Upload personal documents (certificates, IC) |
| Attendance Records | View attendance and timesheet history |
| Training Calendar | View and register for training sessions |
| Org Chart | View company hierarchy |
| Announcements | Read company announcements |
| Calendar | View leave calendar and events |

---

## Login

### First-Time Login
1. Navigate to ESS portal URL
2. Enter Employee ID (provided by HR)
3. Enter temporary password (provided by HR via secure email)
4. System prompts for password change
5. Set new password (minimum 8 characters, mixed case + number + special character)
6. Accept terms and conditions
7. Set security questions (for password reset)

### Subsequent Logins
1. Enter Employee ID and password
2. Optionally enable "Remember Me" on personal devices
3. Multi-factor authentication (MFA) for high-risk actions (bank detail change)

### Password Reset
- Click "Forgot Password" on login page
- Answer security questions
- Receive reset link via registered email
- Set new password

---

## Viewing Payslips

### Monthly Payslip View
- Employee name and ID
- Pay period (month/year)
- Basic salary
- Allowances (itemised: housing, transport, meal, shift, OT)
- Statutory deductions (EPF, SOCSO, EIS)
- Tax deduction (PCB)
- Other deductions (insurance, loan, advance)
- Net salary
- Year-to-date totals for EPF, SOCSO, PCB

### Actions
- **View on screen** — Full itemised breakdown
- **Download PDF** — Printable format; includes QR code for verification
- **Email** — Send payslip to personal email
- **Year-end** — View and download Form EA from ESS

### Payslip History
- Access to all previous payslips (current employment)
- Filter by month/year
- Download multiple payslips as ZIP

---

## Updating Profile

### Editable Fields

| Field | Require Verification? |
|-------|----------------------|
| Home address | No |
| Phone number (personal) | Yes — OTP |
| Email (personal) | Yes — confirmation email |
| Emergency contact name | No |
| Emergency contact phone | No |
| Emergency contact relationship | No |
| Bank account number | Yes — HR validation |
| Marital status | Yes — supporting document required |
| Education qualifications | Yes — certificate upload |

### Change Workflow
1. Employee updates field
2. If change is critical (bank, marital status), HR receives notification
3. HR reviews and approves/rejects change
4. Employee receives email notification of change status
5. Audit log records: who changed, what changed, when, from which IP

---

## Leave Application

### Application Flow
1. Navigate to Leave > Apply
2. Select leave type:
   - Annual leave
   - Medical leave (with MC upload)
   - Hospitalisation leave
   - Maternity leave
   - Paternity leave
   - Unpaid leave
   - Compassionate leave
   - Exam leave
3. Select date range (start/end)
4. Select half day (AM/PM) or full day
5. Enter reason (mandatory for all types)
6. For medical leave: upload MC (image/PDF)
7. View remaining balance automatically calculated
8. Submit

### Leave Balance Display

| Column | Description |
|--------|-------------|
| Leave Type | Annual, medical, etc. |
| Total Entitlement | Annual allocation per policy |
| Taken This Year | Days used YTD |
| Remaining Balance | Total − Taken − Pending |
| Pending Approval | Currently awaiting manager decision |
| Carried Forward | Balance from previous year |

### Leave Rules
- Pro-rated for new joiners (based on completed months)
- Unused annual leave may be carried forward (max 14 days per policy)
- Medical leave > 2 days requires MC upload
- Consecutive leave (annual + weekend) counted correctly
- Public holidays excluded from annual leave count

---

## Claims Submission

### Workflow
1. Navigate to Claims > New Claim
2. Select claim type:
   - Travel / mileage
   - Accommodation
   - Meals / entertainment
   - Medical / dental
   - Phone / internet
   - Training / seminar
   - Others
3. Enter amount and description
4. For mileage: enter route (from/to), distance (km), rate per km
5. Upload supporting documents (receipt images, PDFs)
6. Maximum 5 attachments per claim
7. Apply digital signature (or acknowledge declaration)
8. Submit for approval

### Rules
- Claims must be submitted within 30 days of expense date
- Receipts must clearly show supplier, date, amount, and GST (if any)
- Claims without supporting documents will be rejected
- Mileage claims use standard rate (per company policy, typically RM0.50–RM0.80/km)

---

## Approval Notifications

| Event | Notification Type | Content |
|-------|-------------------|---------|
| Leave approved | Email + in-app | Dates, leave type, status |
| Leave rejected | Email + in-app | Reason for rejection |
| Claim approved | Email + in-app | Amount, reimbursement date |
| Claim rejected | Email + in-app | Reason, option to resubmit |
| Profile change approved | Email | Which field changed |
| Profile change rejected | Email | Reason for rejection |

### Notification Channels
- **In-app** — Notification bell icon in ESS portal
- **Email** — Sent to work email (and personal if configured)
- **Mobile push** — If ESS has a mobile app
- **Dashboard** — Recent activity widget on ESS home screen

---

## Data Privacy

| User Role | Can See |
|-----------|---------|
| Employee | Own data only |
| Manager | Own data + direct reports (excluding financial and medical) |
| HR | All employee records |
| Finance | Salary, bank, statutory data only |
| Director / CEO | All employee records |

- Employees cannot see colleagues' payslips, leave balances, or personal data
- All data access is logged and auditable
- PDPA 2010 compliance — employee data cannot be shared externally without consent

---

## Compliance

| Area | Requirement |
|------|-------------|
| Password policy | Min 8 chars, uppercase, lowercase, number, special character |
| Password expiry | Every 90 days (prompted) |
| Session timeout | Auto-logout after 15 minutes of inactivity |
| Audit log | All changes recorded: user, timestamp, field, old value, new value |
| Login attempts | Lockout after 5 failed attempts (reset by HR) |
| Data encryption | HTTPS in transit; AES-256 at rest |
| Access revocation | Deactivated immediately on termination/notice period |
| MFA | Required for sensitive changes (bank details, password change) |
