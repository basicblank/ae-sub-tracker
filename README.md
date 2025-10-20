# AE Sub Tracker - Alpha Extract Subscription Tracker

A subscription tracking system for Alpha Extract, combining Google Sheets with a custom dashboard for revenue analytics and goal tracking.

## Project Overview

**Current Data Tracked:**
- Email
- Category (Paid Nowpayments, Paid Stripe, Giveaway)
- Active Status (Yes/No)
- Active for Months
- Paid Amount (default $39/month)
- Transaction Date (MM/DD/YYYY)
- Expiration Date (MM/DD/YYYY)
- Notes

**Goals:**
1. **Operational Cost Goal**: $285 (1.5 years × $190/year)
2. **Team Trip Goal**: $1,000

## Features

### Phase 1: Google Sheets Enhancement
- Monthly revenue tracking (all transactions in month)
- Goal progress indicators
- Automated expiration tracking
- Category-based revenue breakdown

### Phase 2: Advanced Dashboard
- Interactive visualizations
- Revenue trends over time
- Subscription analytics
- Goal progress tracking

## Project Structure

```
AE Sub Tracker/
├── README.md
├── sheets-setup/
│   ├── formulas.md          # Google Sheets formulas
│   ├── setup-guide.md       # Implementation instructions
│   └── apps-script/         # Google Apps Script files
└── dashboard/               # Phase 2: Web dashboard
```

## Getting Started

See `sheets-setup/setup-guide.md` for instructions on implementing the Google Sheets enhancements.
