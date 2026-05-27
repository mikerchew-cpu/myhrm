# Malaysia Payroll Processing Guide

**Department:** Finance

---

## Payroll Cycle

| Item | Detail |
|------|--------|
| Frequency | Monthly |
| Cut-off Date | 25th of each month |
| Processing Period | 3–5 working days before month end |
| Payment Date | Last day of month or last working day if month-end falls on a weekend/public holiday |

---

## Gross Salary Components

- **Basic Salary** — Fixed monthly amount per employment contract
- **Fixed Allowances** — Housing, transport, meal, phone, travel
- **Variable Allowances** — Shift allowance, call allowance, on-call pay
- **Overtime (OT)** — Calculated per Employment Act 1955 (1.5× base rate for normal OT, 2.0× for rest day, 3.0× for public holiday)
- **Commissions** — Sales-based variable pay
- **Bonuses** — Annual, performance, or contractual bonuses
- **Arrears** — Retroactive salary adjustments
- **Director Fees** — Separate fee schedule for board members (subject to PCB without EPF)

---

## Statutory Deductions (Employee)

### EPF (Employees Provident Fund / KWSP)
| Category | Employee Contribution |
|----------|----------------------|
| Malaysian citizen (age < 60) | 11% of monthly wages |
| Malaysian citizen (age 60+) | 0% (optional 5.5% if elected) |
| Non-citizen | 0% (optional) |
| Wage ceiling | RM20,000 (surplus above ceiling is exempt) |

### SOCSO (Social Security Organisation / PERKESO)
- Category 1 — Contribution table based on monthly wages (tiers from RM0 to RM8,000+)
- Employee share: ranges from RM0.10 to RM34.45 per month (table-based)
- Covers employment injury, invalidity, and occupational disease

### EIS (Employment Insurance System / SIP)
- Table-based contribution on monthly wages up to RM5,000 ceiling
- Employee share: ranges from RM0.05 to RM7.90 per month

### PCB (Monthly Tax Deduction)
- Progressive tax rates per LHDN Schedule (0% to 30%)
- Calculated using LHDN formula: `[ (P - M) × R + B ] / 12`
- Use LHDN's official PCB calculator or system integration
- Exemption: RM2,000 monthly threshold (below this, no PCB)

---

## Employer Contributions

| Scheme | Rate | Cap |
|--------|------|-----|
| EPF (Malaysian, age < 60) | 12% or 13% of monthly wages | RM20,000 ceiling |
| EPF (Malaysian, age 60+) | 6% of monthly wages | RM20,000 ceiling |
| SOCSO | ~1.75% of monthly wages | RM8,000 ceiling |
| EIS | 0.2% of monthly wages | RM5,000 ceiling |
| HRDF | 1% of monthly wages | Mandatory for eligible employers |

---

## Net Salary Calculation

```
Net Salary = Gross Salary − Statutory Deductions − Other Deductions
```

**Other Deductions may include:**
- Insurance premiums (group hospitalisation, GTL)
- Staff loan repayment
- Salary advance recovery
- Employee share scheme contributions
- Union dues
- Court-ordered deductions (child support, garnishment)

---

## Payslip Requirements

Effective **1 January 2023**, all employers must issue itemised payslips per Employment (Amendment) Act 2022.

**Mandatory fields:**
- Employee name and ID
- Basic salary
- Allowances (itemised by type)
- Overtime payments
- Deductions (itemised by type: EPF, SOCSO, EIS, PCB, others)
- Net salary
- Total working days and OT hours (if applicable)
- Year-to-date totals

---

## Payment Methods

- **Bank transfer (EFT/IBG)** — Mandated under Employment (Amendment) Act 2023; salary must be credited to employee's bank account
- **Cash** — Only permitted if expressly agreed in employment contract; not recommended
- **Cheque** — Rare; acceptable only if bank transfer is unavailable

---

## Year-End Processing

| Item | Deadline | Description |
|------|----------|-------------|
| Form EA | 28 February | Certificate of remuneration for each employee |
| Form E | 31 March | Employer's return of employees to LHDN |
| PCB Reconciliation | By 31 March | Adjust annual PCB against actual tax liability |
| EA Correction | Before 30 April | Resubmit if errors discovered |

---

## Record Keeping

| Record Type | Retention Period |
|-------------|------------------|
| Payroll registers | 6 years (min) |
| Timesheets | 6 years |
| OT records | 6 years |
| EA/Form E | 7 years |
| EPF and SOCSO statements | 6 years |
| Employment contracts | 6 years post-employment |

---

## Common Errors

| Error | Impact | Prevention |
|-------|--------|------------|
| Wrong EPF rate for salary band | Over/under contribution | Use EPF's wage ceiling table |
| Incorrect SOCSO table lookup | Wrong deduction | Auto-calculate via SOCSO API |
| Missed OT threshold rules | Salary shortfall | Apply monthly OT cap of 104 hours |
| PCB miscalculation | Under/over deduction | Use LHDN PCB calculator monthly |
| Missed pro-ration for new joiners | Wrong first-month salary | Pro-rate basic salary by calendar days |
| Late EPF payment | Penalty ~15% p.a. | Remit by 15th of following month |
| Wrong EA classification | Incomplete tax reporting | Correctly classify benefits-in-kind |
| Expatriate tax errors | Non-compliance | Apply separate PCB rate for non-citizens |
