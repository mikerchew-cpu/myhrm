# HR Calendar & Event Scheduling Guide

**Department:** General

---

## Event Types

| Event Type | Description | Module Source |
|------------|-------------|---------------|
| **Annual Leave** | Employee annual leave days | Leave module |
| **Medical Leave** | Sick leave with or without MC | Leave module |
| **Maternity Leave** | 98 consecutive days (per EA 1955) | Leave module |
| **Paternity Leave** | 7 consecutive days (per EA 1955 amendment) | Leave module |
| **Unpaid Leave** | Leave without pay | Leave module |
| **Compassionate Leave** | Bereavement or family emergency | Leave module |
| **Interviews** | Candidate interviews scheduled | Recruitment module |
| **Training Sessions** | Internal and external training | Training / L&D module |
| **Document Expiries** | Permit/cert/contract renewal dates | Document management |
| **Company Events** | Dinners, parties, team building | Calendar (manual) |
| **Public Holidays** | National and state gazetted holidays | Calendar (auto-populated) |
| **Recurring Meetings** | Weekly/monthly team meetings | Calendar (manual) |
| **Compliance Deadlines** | Tax, levy, statutory deadlines | Calendar (auto-populated) |
| **Health Screenings** | Medical checkup schedules | Benefits / wellness |
| **Probation Reviews** | End-of-probation assessments | Performance module |

---

## Leave Calendar

The leave calendar provides a centralised view of all employees' leave across the organisation.

### Features
- **Monthly View** — Full month displayed with all leave entries
- **Weekly View** — Week-by-week breakdown
- **Daily View** — Detailed list of who is on leave each day
- **Colour-Coded** — Each leave type has a distinct colour:

| Leave Type | Colour |
|------------|--------|
| Annual leave | Blue |
| Medical leave | Red |
| Maternity leave | Pink |
| Paternity leave | Purple |
| Unpaid leave | Grey |
| Compassionate leave | Orange |

### Filters
- **Department** — Select specific department(s)
- **Team** — View team-level calendar
- **Employee** — View individual employee leave
- **Date Range** — Custom date range selection

### Status Indicators
- **Tentative** — Striped/faded colour (pending approval)
- **Confirmed** — Solid colour (approved)
- **Cancelled** — Crossed out / removed

---

## Interview Calendar

### Fields
| Field | Details |
|-------|---------|
| Candidate name | Applicant's full name |
| Position | Job title applied for |
| Interviewer(s) | Name(s) of interviewing panel |
| Mode | Video call (Zoom/Teams/Google Meet) or In-person |
| Room | Physical room / Virtual link |
| Duration | Scheduled time slot (30 min to 2 hours) |
| Notes | Private notes for interviewer |

### Scheduling Rules
- Each interviewer must have at least 30 minutes gap between interviews
- Room bookings integrate with company meeting room system
- Video links auto-generated if Zoom/Teams integration enabled
- Calendar shows interviewer availability before scheduling

### Notifications
- **24 hours before** — Reminder to interviewer(s) and candidate
- **1 hour before** — Final reminder with link/room number
- **If cancelled** — Immediate notification to all parties

---

## Training Calendar

### Fields
| Field | Details |
|-------|---------|
| Course name | Training title |
| Trainer / Provider | Internal or external trainer name |
| Venue | Physical address or online platform |
| Date & time | Schedule |
| Duration | Hours / days |
| Participants | Enrolled list |
| Capacity | Max participants |
| Registration deadline | Last day to register |
| Cost per participant | Training cost tracked for budget |
| HRD Corp claim eligible | Yes/No flag |

### Registration Flow
1. Employee browses training calendar
2. Selects training session
3. Registers for session
4. Manager approval (if required)
5. Confirmation sent to employee
6. Calendar entry added to employee's calendar

### Attendance Tracking
- Trainer marks attendance during session
- Auto-generated attendance report
- Certificate of completion issued (if applicable)
- Attendance recorded in training history

---

## Document Expiry Calendar

Auto-populated from the Document Management module.

### Events Tracked
| Event | Lead Time for Alerts |
|-------|---------------------|
| Work permit (PLKS) expiry | 90, 60, 30, 14 days |
| Professional certification expiry | 90, 30 days |
| Insurance policy renewal | 30 days |
| Fixed-term contract end | 60, 30, 14 days |
| NDA / non-compete expiry | 30 days |
| Medical fit-for-work expiry | 14 days |
| Tenancy / lease agreement end | 60, 30 days |
| Service/outsourcing contract end | 90, 30 days |

### Calendar Display
- Displays expiry date and document type
- Employee name linked to document
- Colour-coded urgency:
  - Green: > 30 days away
  - Amber: 14–30 days away
  - Red: < 14 days away
  - Grey: Expired

---

## Public Holidays

### Pre-Populated Holidays
- All gazetted Malaysia public holidays
- National holidays (e.g., Merdeka Day, Malaysia Day, Agong's Birthday)
- Federal Territory holidays (KL, Putrajaya, Labuan)
- State-specific holidays for multi-state companies

### State Holidays
| State | Example Holidays |
|-------|------------------|
| Johor (JB) | Hari Hol Almarhum Sultan Johor |
| Penang | George Town Heritage Day |
| Kedah | Hari Keputeraan Sultan Kedah |
| Kelantan | Hari Keputeraan Sultan Kelantan |
| Perak | Hari Keputeraan Sultan Perak |
| Sabah | Hari Keputeraan Yang di-Pertua Negeri Sabah |
| Sarawak | Hari Keputeraan Yang di-Pertua Negeri Sarawak |
| Terengganu | Hari Keputeraan Sultan Terengganu |

### Handling
- HR sets which state's holiday calendar applies to each employee
- Employees working in different branches see their local holidays
- Company can add supplementary holidays (e.g., company anniversary)

---

## Recurring Events

| Event | Frequency | Auto-Create |
|-------|-----------|-------------|
| Monthly team meeting | Monthly | Yes (set by admin) |
| Weekly department standup | Weekly | Yes |
| Quarterly town hall | Quarterly | Yes |
| Annual performance review cycle | Annually | Yes |
| Compliance deadline reminders | Annual | Yes |
| Payroll processing dates | Monthly | Yes |
| EPF/SOCSO submission due dates | Monthly | Yes |
| HRD Corp levy due date (15th) | Monthly | Yes |
| Probation review (end of 3rd/6th month) | Per employee | Yes |

---

## Integration

The calendar is a unified view combining events from multiple modules:

```
┌──────────────────┐
│   Leave Module   │──── Employee leave
├──────────────────┤
│ Recruitment      │──── Interviews
├──────────────────┤
│ Training / L&D   │──── Training sessions
├──────────────────┤
│ Document Mgmt    │──── Expiry dates
├──────────────────┤
│ Public Holidays  │──── National/state holidays
├──────────────────┤
│ Manual Events    │──── Company events, meetings
└──────────────────┘
        │
        ▼
┌──────────────────┐
│  Unified Calendar │
└──────────────────┘
```

### Filter Options
- **Module filter** — Show/hide events from specific modules
- **Employee filter** — Show specific employee events
- **Department filter** — Show department-wide events
- **Type filter** — Show/hide specific event types
- **Date range** — Custom or preset (today, this week, this month)

---

## Notifications

### Event Reminders

| Timing | Event Type | Channel |
|--------|------------|---------|
| 1 day before | Leave | Email |
| 1 day before | Training | Email + in-app |
| 1 hour before | Interview | Email + in-app |
| 1 week before | Document expiry | Email |
| 30 days before | Document expiry | Email + in-app |
| 14 days before | Document expiry | Email |
| 7 days before | Contract end | Email |
| Day of | All events | In-app |

### Expiry Alerts

| Alert Period | Document Type |
|--------------|---------------|
| 90 days | Work permit, service contract |
| 60 days | Contract end, lease |
| 30 days | Insurance, certification, work permit |
| 14 days | Work permit, medical cert |
| 7 days | Contract end |
| 0 days (expired) | All |

### Notification Recipients
- **Employee** — Notified of their own expiry events
- **Manager** — Notified of team member's key expiries
- **HR** — Notified of all expiry events
- **Finance** — Notified of contract/lease/insurance renewals

---

## Approval Status on Calendar

| Status | Visual | Meaning |
|--------|--------|---------|
| **Tentative** | Striped/faded | Leave requested but not yet approved |
| **Confirmed** | Solid colour | Leave approved or event confirmed |
| **Pending HR** | Dashed border | Requires HR verification |
| **Rejected** | Crossed out / hidden | Request rejected |
| **Cancelled** | Grey strikethrough | Event cancelled by organiser or employee |

### Rules
- Leave only shows as **Confirmed** once all approvals obtained
- Tentative leave is visible to manager and HR only
- Confirmed leave is visible to all (based on calendar permissions)
- Company events are always shown as Confirmed
