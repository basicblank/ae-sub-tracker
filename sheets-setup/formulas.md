# Google Sheets Formulas for AE Sub Tracker

## Important Notes

### Tax Deduction
**Stripe payments are subject to 23% tax.** All revenue calculations for "Paid Stripe" category should automatically deduct 23% to show actual revenue received.

### Multi-Month Subscriptions
For subscriptions with "Active for Months" > 1, the web dashboard automatically distributes revenue evenly across all months. For example:
- A subscription with $78 paid and 2 active months = $39 allocated to month 1 and $39 to month 2
- In Google Sheets, you can track this using the "Active for Months" column and divide the total by that number for monthly calculations

## Sheet Structure

### Main Data Sheet: "Subscriptions"
Columns A-H:
- A: Email
- B: Category
- C: Active (Yes/No)
- D: Active for Months
- E: Paid (gross amount before tax)
- F: Transaction Date
- G: Expiration Date
- H: Notes

### Recommended Additional Column:
- I: Actual Revenue (net after tax)
  - Formula: `=IF(B2="Paid Stripe", E2*0.77, E2)`
  - This calculates: Stripe payments × 77% (after 23% tax), other payments remain unchanged

---

## Dashboard Sheet Setup

Create a new sheet called "Dashboard" for analytics and tracking.

### Monthly Revenue Tracking

**Month/Year List** (Column A, starting at A2):
```
=TEXT(UNIQUE(ARRAYFORMULA(DATE(YEAR(Subscriptions!F:F), MONTH(Subscriptions!F:F), 1))), "MMM YYYY")
```

**Revenue per Month (After Tax)** (Column B, starting at B2):
```
=SUMIFS(Subscriptions!$I:$I, Subscriptions!$F:$F, ">="&DATE(YEAR(A2), MONTH(A2), 1), Subscriptions!$F:$F, "<"&EOMONTH(DATE(YEAR(A2), MONTH(A2), 1), 0)+1)
```
Note: This uses column I (Actual Revenue) which accounts for the 23% Stripe tax.

Or for a simpler approach, create a manual list:

**Simple Monthly Revenue Table:**

Cell | Formula | Description
-----|---------|------------
A1 | `Month` | Header
B1 | `Actual Revenue` | Header
A2 | `01/2024` | Manual entry (or current month)
B2 | `=SUMIFS(Subscriptions!I:I, Subscriptions!F:F, ">="&DATE(YEAR(A2), MONTH(A2), 1), Subscriptions!F:F, "<"&EOMONTH(A2, 0)+1)` | Sum actual revenue (after tax) in Jan 2024

**To get current month revenue (after tax):**
```
=SUMIFS(Subscriptions!I:I, Subscriptions!F:F, ">="&DATE(YEAR(TODAY()), MONTH(TODAY()), 1), Subscriptions!F:F, "<=", TODAY())
```

---

### Revenue by Category

**Category Breakdown Table:**

Cell | Content | Formula
-----|---------|--------
D1 | `Category` | (Header)
E1 | `Actual Revenue` | (Header)
D2 | `Paid Stripe` | (Manual text)
E2 | | `=SUMIF(Subscriptions!B:B, D2, Subscriptions!I:I)`
D3 | `Paid Nowpayments` | (Manual text)
E3 | | `=SUMIF(Subscriptions!B:B, D3, Subscriptions!I:I)`
D4 | `Giveaway` | (Manual text)
E4 | | `=SUMIF(Subscriptions!B:B, D4, Subscriptions!I:I)`
D5 | `TOTAL` | (Manual text)
E5 | | `=SUM(E2:E4)`

**Note:** All formulas now use column I (Actual Revenue) which automatically deducts 23% tax from Stripe payments.

---

### Goal Progress Indicators

**Goal Tracking Section:**

Cell | Content | Formula/Value
-----|---------|---------------
G1 | `GOAL TRACKER` | (Header - merge G1:H1)
G3 | `Total Actual Revenue (After Tax)` |
H3 | | `=SUM(Subscriptions!I:I)`
G5 | `Goal 1: Operational Cost` |
H5 | `$3,420.00` | (Manual entry)
G6 | `Current Progress` |
H6 | | `=H3`
G7 | `Remaining` |
H7 | | `=H5-H6`
G8 | `Progress %` |
H8 | | `=H6/H5`
G10 | `Goal 2: Team Trip House` |
H10 | `$1,000.00` | (Manual entry)
G11 | `Current Progress` |
H11 | | `=H3`
G12 | `Remaining` |
H12 | | `=H10-H11`
G13 | `Progress %` |
H13 | | `=H11/H10`

**Format H8 and H13 as percentage.**

---

### Visual Progress Bars

For visual goal tracking, you can use conditional formatting or REPT function:

**Simple Text-Based Progress Bar** (in column I):

I8 (Operational Cost Progress):
```
=REPT("█", MIN(20, ROUND(H8*20, 0))) & REPT("░", MAX(0, 20-ROUND(H8*20, 0))) & " " & TEXT(H8, "0%")
```

I13 (Team Trip Progress):
```
=REPT("█", MIN(20, ROUND(H13*20, 0))) & REPT("░", MAX(0, 20-ROUND(H13*20, 0))) & " " & TEXT(H13, "0%")
```

---

### Active Subscription Stats

Cell | Content | Formula
-----|---------|--------
G15 | `Active Subscriptions` |
H15 | | `=COUNTIF(Subscriptions!C:C, "Yes")`
G16 | `Inactive Subscriptions` |
H16 | | `=COUNTIF(Subscriptions!C:C, "No")`
G17 | `Total Subscribers (All Time)` |
H17 | | `=COUNTA(Subscriptions!A:A)-1`

---

### Automated Expiration Tracking

Add this to the main "Subscriptions" sheet in a new column (e.g., Column I):

**I1 Header:** `Status Check`

**I2 Formula:**
```
=IF(C2="Yes", IF(G2<TODAY(), "⚠️ EXPIRED - Update Status", "✓ Active"), "Inactive")
```

This will flag subscriptions marked as "Yes" but have passed their expiration date.

---

### Revenue Metrics

Add these summary stats to your Dashboard:

Cell | Content | Formula
-----|---------|--------
G19 | `Average Actual Revenue per Transaction` |
H19 | | `=AVERAGE(Subscriptions!I:I)`
G20 | `Total Paid Subs (Stripe + NowPayments)` |
H20 | | `=COUNTIF(Subscriptions!B:B, "Paid Stripe")+COUNTIF(Subscriptions!B:B, "Paid Nowpayments")`
G21 | `Total Giveaways` |
H21 | | `=COUNTIF(Subscriptions!B:B, "Giveaway")`

---

## Quick Setup Checklist

1. ✅ Create "Dashboard" sheet
2. ✅ Copy formulas for Monthly Revenue Tracking
3. ✅ Set up Goal Progress Indicators
4. ✅ Add Revenue by Category breakdown
5. ✅ Add Status Check column to main sheet
6. ✅ Format currency cells (columns with $)
7. ✅ Format percentage cells (H8, H13)
8. ✅ Apply conditional formatting for visual appeal
