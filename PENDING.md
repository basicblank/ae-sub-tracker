# Pending Changes

## Renewal Tracking — Sheet Data Model Fix + Code Update

**Context:**
The app currently gives each customer one row in the sheet. When a subscription renews, the existing row gets updated (new expiration date) instead of a new row being added. This causes renewals to be missed in monthly revenue calculations.

**Example — Row 46 (app.alphaextract@048823.com):**
- First payment: $70 on 1/7/2026, covers Jan–Mar
- Renewal payment: $70 on 4/7/2026, covers Apr–Jun
- Sheet currently has one combined row: paid = $140, transactionDate = 1/7/2026, activeMonths = 2
- Result: April revenue is missing the $17.97 it should receive from this renewal

---

### Step 1 — Audit and fix existing renewal rows

For every customer who has renewed, split their single row into one row per payment:

| Field | Original payment row | Renewal row |
|-------|---------------------|-------------|
| Email | (same) | (same) |
| Category | (same) | (same) |
| Active | `No` (if superseded) or `Yes` | `Yes` |
| Active for Months | months in that payment period | months in that payment period |
| Paid | amount for that period only | amount for that period only |
| Transaction Date | original purchase date | renewal date |
| Expiration Date | end of original period | end of renewal period |

Rows to check (any row where the gap between Transaction Date and Expiration Date is longer than `Active for Months` × 1 month, or where `Paid` seems too high for the stated duration).

---

### Step 2 — Update the app to derive months from expiration date

Once the sheet data is correct (one row per payment), replace the `sub.activeMonths || 1` fallback in `app.js` with a helper that auto-calculates months from the transaction → expiration date range. This removes the need to manually keep `Active for Months` in sync.

The code for this was already written and tested — it just needs the sheet data to be correct first:

```js
function getEffectiveMonths(sub) {
    const startDate = parseTransactionDate(sub.transactionDate);
    const expDate = parseTransactionDate(sub.expirationDate);

    if (!sub.expirationDate || isNaN(expDate.getTime()) || isNaN(startDate.getTime())) {
        return sub.activeMonths || 1;
    }

    const months = (expDate.getFullYear() - startDate.getFullYear()) * 12 +
                   (expDate.getMonth() - startDate.getMonth());

    return months > 0 ? months : (sub.activeMonths || 1);
}
```

Then replace every `sub.activeMonths || 1` in `getCurrentMonthRevenue()` and `getMonthlyRevenue()` with `getEffectiveMonths(sub)`.

---

### Going forward (once Step 1 is done)

**Never update an existing row when someone renews.** Always add a new row with:
- The renewal date as `Transaction Date`
- The renewal payment amount as `Paid`
- The correct expiration date for that period
