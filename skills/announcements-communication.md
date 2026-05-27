# HR Announcements & Internal Communications Guide

**Department:** General

---

## Purpose

The HR Announcements module enables the company to keep all employees informed of important news, policy changes, upcoming events, reminders, and urgent communications through a centralised channel.

---

## Categories

| Category | Description | Examples |
|----------|-------------|----------|
| **HR Policy Updates** | Changes to company policies or procedures | Updated leave policy, new dress code, revised working hours |
| **Company Events** | Internal or external company events | Annual Dinner, Family Day, Team Building, Sports Day |
| **Payroll & Leave** | Payroll-related reminders and notices | Pay date changes, leave balance reminders, EA form available |
| **Compliance Notices** | Regulatory or statutory updates | PKP/MCO instructions, SOP changes, BOMBA notices |
| **Training & Development** | Learning and development opportunities | Upcoming training courses, HRD Corp deadlines, certification programmes |
| **Welfare & Social** | Employee well-being and engagement | Health screening, counselling services, festive greetings |
| **Urgent / Emergency** | Time-sensitive critical communications | Office closure, system outage, safety alerts, flood/storm notice |
| **General** | Other miscellaneous announcements | New hire welcome, employee milestones, birthdays |

---

## Priority Levels

| Priority | Label | Visual Indicator | SLA for Action |
|----------|-------|------------------|----------------|
| **Low** | Informational | Blue banner | No action required |
| **Medium** | Action Required | Yellow/Amber banner | Read within 3 working days |
| **High** | Urgent | Red banner with exclamation | Read within 24 hours |

### Priority Rules
- High-priority announcements can be pushed as SMS notifications (if configured)
- Medium-priority announcements trigger email digest
- Low-priority announcements appear in-app only
- Only HR Manager, Director, and CEO may create High-priority announcements

---

## Expiry

| Rule | Detail |
|------|--------|
| Auto-archive | Announcements auto-archive after expiry date |
| Hidden from main view | Expired announcements not shown on dashboard or feed |
| Searchable archive | Expired announcements remain searchable in archive |
| Default expiry | 30 days from publish date (configurable) |
| No expiry | Policy announcements can be set with no expiry |
| Archive retention | 6 years minimum for compliance and audit |

---

## Format

### Announcement Fields

| Field | Required | Description |
|-------|----------|-------------|
| **Title** | Yes | Short, descriptive headline |
| **Content** | Yes | Full announcement body (rich text or markdown) |
| **Category** | Yes | Category from the list above |
| **Priority** | Yes | Low / Medium / High |
| **Publish Date** | Yes | Date and time to publish |
| **Expiry Date** | Yes | Date to auto-archive |
| **Target Audience** | Yes | All employees / Department / Location / Employment type |
| **Attachment** | No | PDF, image, or document (max 10MB) |
| **Banner Image** | No | Optional hero image for header |

### Rich Text Options
- Bold, italic, underline
- Bullet and numbered lists
- Hyperlinks
- Tables
- Images
- Embedded video links (YouTube, internal video)

*Markdown is supported for advanced formatting.*

---

## Targeting

| Filter | Description |
|--------|-------------|
| All employees | Every active employee in the system |
| By department | Specific department(s) e.g., Sales, IT, Finance |
| By location | Specific office/branch e.g., KL HQ, Penang, JB |
| By employment type | Permanent, contract, intern, part-time |
| By level | L1–L5 selection |
| By custom group | Pre-defined groups (e.g., management team, shift workers) |

---

## Approval

| Type | Required Approval |
|------|-------------------|
| HR policy update | HR Manager |
| Company-wide announcement | Director / CEO |
| Urgent / Emergency | Director / CEO |
| Department-specific | Department Head |
| Training announcement | HR / L&D |
| Welfare / social | HR Manager |
| General | HR Staff |

### Approval Workflow
1. Author creates announcement with all fields
2. Submits for approval
3. Approver receives notification
4. Approver reviews content, targeting, and priority
5. Approved → scheduled for publishing
6. Rejected → returned to author with reason

---

## Read Tracking

The system tracks whether each recipient has viewed the announcement.

| Metric | Description |
|--------|-------------|
| Total recipients | Number of employees targeted |
| Read count | Number of employees who have viewed |
| Unread count | Recipients who have not viewed |
| Read rate | Percentage: (read / total) × 100 |
| Last opened | Timestamp of most recent view |

### Read Status
- **Read** — Announcement has been opened and viewed for ≥ 3 seconds
- **Unread** — Not yet opened or opened for less than 3 seconds
- **Dismissed** — User dismissed without reading

### Reminders
- Automatic reminder sent to unread recipients for Medium/High priority
- Reminder frequency:
  - Medium: daily for 3 days
  - High: every 6 hours until read or expiry
- Authors can manually send additional reminders

---

## Distribution Channels

| Channel | Latency | Best For |
|---------|---------|----------|
| **In-App Notification** | Immediate | All announcements |
| **Email Digest (Daily)** | End of day | Low-priority announcements |
| **Email Digest (Weekly)** | Monday morning | Weekly roundup |
| **Urgent Email** | Immediate | Medium/High priority |
| **SMS** | Immediate | High / Emergency (if enabled) |
| **Mobile Push** | Immediate | If mobile app is available |

### Digest Settings
Employees can configure their notification preferences:
- Instant (every announcement)
- Daily digest (once per day)
- Weekly digest (once per week)
- Never (opt-out; not permitted for High-priority)

---

## Archives

### Archive Features
- **Search** — Full-text search across all archived announcements (including content)
- **Filter** — By category, priority, date range, author, target audience
- **Export** — Export selected announcements as PDF or CSV
- **Compliance** — Archived announcements retained for minimum 6 years

### Archive Access
- **HR** — Full access to all archived announcements
- **Managers** — Can view announcements that targeted their team
- **Employees** — Can view announcements that targeted them

### Purge Policy
- Announcements older than 7 years may be purged
- Legal hold: announcements related to active legal matters are exempt from purge
- Purge requires HR Manager approval
- Purge log maintained for audit

---

## Best Practices

| Practice | Detail |
|----------|--------|
| Clear subject line | Summarise the action or news in < 10 words |
| One topic per announcement | Avoid mixing unrelated news |
| Specify action required | Tell employees exactly what to do (read, approve, attend, etc.) |
| Keep it concise | Aim for 3–5 paragraphs max |
| Use attachments wisely | Don't embed long documents; attach as PDF |
| Schedule wisely | Avoid posting Friday 5 PM — announcements may be missed over weekend |
| Set appropriate expiry | Don't leave short-lived announcements unexpired |
| Proofread | All announcements reflect company professionalism |
