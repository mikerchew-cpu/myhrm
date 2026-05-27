# HR Approval Workflow Guide

**Department:** General

---

## Overview

The HR Approval Workflow is a multi-level system for processing leave, claims, overtime, expenses, recruitment, and procurement requests. Each request flows through predefined approval levels based on type, amount, and duration.

### Workflow Types

| Request Type | Levels |
|-------------|--------|
| Leave | L1: Supervisor → L2: Manager → L3: Director → L4: CEO |
| Claims | L1: Manager → L2: Director → L3: CEO |
| Overtime | L1: Supervisor → L2: Manager → L3: Director |
| Expenses | L1: Manager → L2: Director → L3: CEO |
| Recruitment | L1: Manager → L2: Director → L3: CEO |
| Procurement | L1: Budget Holder → L2: Director → L3: CEO |

---

## First Level Approver — Direct Supervisor/Manager

**Who:** The employee's immediate reporting manager.

**Responsibility:**
- Review request for completeness (dates correct, amounts accurate, supporting docs attached)
- Verify policy compliance (leave balance sufficient, claim within entitlement)
- Check budget availability (for claims and expenses)
- Business justification (is this leave period acceptable? Is this expense necessary?)
- Recommend approval or rejection with comments

**Scope:**
- All requests must pass through Level 1 first
- Level 1 cannot approve requests for themselves (auto-escalate to Level 2)
- Level 1 cannot override policy ceilings (e.g., approve leave beyond balance)

---

## Second Level Approver — Head of Department / Finance

**Who:** Department head, Finance manager (for financial items), or HR manager (for policy exceptions).

**Responsibility:**
- Review for policy exceptions (leave beyond policy, non-standard OT)
- Check budget impact (for claims, expenses, procurement)
- Verify inter-departmental impact
- Approve or reject with comments
- Escalate to Level 3 if beyond authority limit

**Scope:**
- Triggered when:
  - Leave > 3 days (Manager approval)
  - Claims > RM500 (Director approval)
  - OT on public holiday
  - Recruitment of replacement headcount
  - Procurement > RM2,000

---

## Third Level Approver — Director / CEO

**Who:** Director (L2), CEO (L1) for high-value or strategic items.

**Responsibility:**
- Strategic impact assessment
- Overall budget approval
- Exception approval (policy override)
- Final sign-off on high-value decisions

**Scope:**
| Condition | Approver |
|-----------|----------|
| Leave > 5 consecutive days | Director → CEO |
| Claims > RM2,000 | CEO |
| New headcount creation | Director → CEO |
| Capital expenditure > RM5,000 | CEO |
| Annual leave carry-forward > policy max | HR Manager → CEO |
| Salary adjustment / bonus | Director → CEO |

---

## SLA Timelines

| Request Type | Duration | SLA |
|-------------|----------|-----|
| Leave | ≤ 3 days | 24 hours |
| Leave | > 3 days | 48 hours |
| Claims | < RM500 | 48 hours |
| Claims | RM500 – RM2,000 | 72 hours |
| Claims | > RM2,000 | 5 working days |
| OT approval | Standard | 24 hours |
| OT approval | Public holiday | 48 hours |
| Expense | < RM1,000 | 48 hours |
| Expense | RM1,000 – RM5,000 | 72 hours |
| Expense | > RM5,000 | 5 working days |
| Recruitment | Replacement | 5 working days |
| Recruitment | New headcount | 10 working days |
| Procurement | < RM2,000 | 3 working days |
| Procurement | > RM2,000 | 5 working days |

*SLA countdown starts from time of submission (not from previous approval).*

---

## Escalation

### Auto-Escalation Rules
- If approver does not act within SLA → system auto-escalates to next level
- Escalation notification sent to: current approver, next approver, and requestor
- Each escalation level has its own SLA (same as above)
- After third escalation → auto-approved (for leave) or forwarded to CEO (for claims/expenses)

### Escalation Flow
```
Request submitted → Level 1 (SLA) → Overdue → Level 2 (SLA) → Overdue → Level 3 → CEO
```

### Approver on Leave
- Approver may delegate authority before going on leave
- If no delegation set and approver is unavailable → auto-escalate after 24 hours
- Delegation must be recorded in the system with start/end dates

---

## Notifications

| Event | Recipient | Method | Timing |
|-------|-----------|--------|--------|
| Request submitted | Approver (L1) | Email + in-app | Immediate |
| Request pending | Approver | Email reminder | After 24 hours |
| SLA approaching | Approver | Email reminder | 4 hours before deadline |
| SLA overdue | Approver + next level | Email + in-app | At deadline |
| Escalation triggered | Next approver + requestor | Email + in-app | Immediate |
| Approved | Requestor | Email + in-app | Immediate |
| Rejected | Requestor | Email + in-app | Immediate |
| Delegation activated | Designated approver | Email | On delegation start |

---

## Rejection

### Rejection Requirements
- **Must include a reason** — free text explaining why the request was rejected
- Option to suggest corrections or provide guidance
- Requestor receives rejection notification with reason

### Resubmission
- Rejected request can be revised and resubmitted
- Resubmission resets the approval flow (starts from Level 1)
- Previous rejection reason visible to all approvers in the chain
- Maximum 3 resubmissions per request (after 3rd rejection, request is final)

---

## Audit Trail

Every approval action is recorded with full traceability.

### Audit Record Fields

| Field | Description |
|-------|-------------|
| Request ID | Unique identifier |
| Request type | Leave, claim, OT, etc. |
| Requestor | Employee ID and name |
| Request date | Timestamp of submission |
| Approver | Employee ID and name |
| Approval level | L1, L2, L3 |
| Action | Approved, rejected, escalated, delegated |
| Comment | Approver's notes |
| Action timestamp | Date and time |
| Previous status | What changed from |
| IP address / device | Source of approval action |

### Retention
- Approval audit trail retained for **6 years**
- Exportable for compliance and industrial court cases

---

## Delegation

### When Delegation is Used
- Approver is on annual leave
- Approver is on medical leave (extended)
- Approver is travelling / out of office
- Approver has a conflict of interest (e.g., self-approval)

### Delegation Rules
| Rule | Detail |
|------|--------|
| Designation | Approver must designate a delegate **in advance** |
| Scope | Can delegate all requests or specific types |
| Duration | Set start date and end date |
| Level | Delegate must be same level or higher |
| Recording | Delegation recorded in system with audit log |
| Revocation | Original approver can revoke delegation at any time |
| Notification | HR and delegate notified of delegation |

### Delegation Workflow
1. Approver logs into system
2. Navigates to Settings > Delegation
3. Selects delegate from dropdown (peers or above)
4. Selects date range (start/end)
5. Selects request types to delegate
6. Confirms with digital signature
7. System notifies delegate and HR
8. Delegate has full approval authority within scope
