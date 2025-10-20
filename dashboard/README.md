# AE Sub Tracker Dashboard

A modern, interactive web dashboard for visualizing Alpha Extract subscription data and tracking revenue goals.

## Features

- **Goal Progress Tracking**: Visual progress bars for Operational Cost ($285) and Team Trip ($1,000) goals
- **Key Metrics**: Total revenue, active subscribers, monthly revenue, and average transaction value
- **Interactive Charts**:
  - Doughnut chart for revenue by category
  - Line chart for monthly revenue trends
- **Subscription Status**: Real-time counts of active, inactive, and expired subscriptions
- **Recent Subscriptions Table**: Shows the 10 most recent subscriptions with status badges
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Quick Start

### Option 1: View Locally (Recommended for Testing)

1. Open `index.html` in your web browser
2. The dashboard will load with sample data

### Option 2: Use with Live Server (VS Code)

1. Install the "Live Server" extension in VS Code
2. Right-click on `index.html` and select "Open with Live Server"
3. The dashboard will open in your browser with auto-reload on changes

## Connecting to Google Sheets

The dashboard currently uses sample data. To connect it to your actual Google Sheets:

### Method 1: Google Sheets API (Recommended)

1. **Enable Google Sheets API:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Enable the Google Sheets API
   - Create credentials (API Key for public sheets, or OAuth 2.0 for private sheets)

2. **Make Your Sheet Public (for API Key method):**
   - Open your Google Sheet
   - Click Share > Get link
   - Set to "Anyone with the link can view"
   - Copy the Sheet ID from the URL

3. **Update app.js:**
   - Replace the `loadData()` function with the API integration code below

```javascript
// Add these at the top of app.js
const SHEET_ID = 'YOUR_SHEET_ID_HERE';
const API_KEY = 'YOUR_API_KEY_HERE';
const RANGE = 'Subscriptions!A2:H'; // Adjust range as needed

async function loadData() {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE}?key=${API_KEY}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.values) {
            subscriptionData.subscriptions = data.values.map(row => ({
                email: row[0] || '',
                category: row[1] || '',
                active: row[2] || 'No',
                activeMonths: parseInt(row[3]) || 0,
                paid: parseFloat(row[4]) || 0,
                transactionDate: row[5] || '',
                expirationDate: row[6] || '',
                notes: row[7] || ''
            }));

            updateDashboard();
        }
    } catch (error) {
        console.error('Error loading data:', error);
    }
}
```

### Method 2: Google Apps Script Web App

1. **Create a Web App in Google Sheets:**
   - Open your Google Sheet
   - Go to Extensions > Apps Script
   - Paste the following code:

```javascript
function doGet() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Subscriptions');
  const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 8).getValues();

  const subscriptions = data.map(row => ({
    email: row[0],
    category: row[1],
    active: row[2],
    activeMonths: row[3],
    paid: row[4],
    transactionDate: row[5],
    expirationDate: row[6],
    notes: row[7]
  }));

  return ContentService.createTextOutput(JSON.stringify({ subscriptions }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

2. **Deploy the Web App:**
   - Click Deploy > New deployment
   - Select type: Web app
   - Execute as: Me
   - Who has access: Anyone
   - Click Deploy and copy the Web App URL

3. **Update app.js:**

```javascript
const WEB_APP_URL = 'YOUR_WEB_APP_URL_HERE';

async function loadData() {
    try {
        const response = await fetch(WEB_APP_URL);
        const data = await response.json();
        subscriptionData = data;
        updateDashboard();
    } catch (error) {
        console.error('Error loading data:', error);
    }
}
```

### Method 3: Manual CSV Export (Simple but Manual)

1. Export your Google Sheet as CSV
2. Create a `data.json` file in the dashboard folder
3. Convert CSV to JSON format
4. Update `loadData()` to fetch from `data.json`

## Customization

### Change Goal Values

Edit the `GOALS` object in `app.js`:

```javascript
const GOALS = {
    operational: 285,  // Change this value
    teamTrip: 1000     // Change this value
};
```

### Modify Colors

Edit the CSS variables in `styles.css`:

```css
:root {
    --primary-color: #6366f1;
    --secondary-color: #8b5cf6;
    --success-color: #10b981;
    /* ... etc */
}
```

### Add More Charts

Use Chart.js to add additional visualizations. Documentation: https://www.chartjs.org/docs/latest/

## Auto-Refresh

To automatically refresh data every 5 minutes, add this to `app.js`:

```javascript
// Add to the init() function
setInterval(() => {
    loadData();
}, 5 * 60 * 1000); // 5 minutes
```

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Troubleshooting

**Charts not displaying:**
- Check browser console for errors
- Ensure Chart.js CDN is loading correctly
- Verify data format matches expected structure

**Data not loading:**
- Check API credentials
- Verify Sheet ID is correct
- Ensure sheet permissions are set correctly
- Check browser console for CORS errors

**Styles not applying:**
- Clear browser cache
- Verify `styles.css` is in the same directory as `index.html`

## Future Enhancements

- [ ] Real-time data synchronization
- [ ] Export data as PDF reports
- [ ] Email notifications for expired subscriptions
- [ ] Advanced filtering and search
- [ ] Custom date range selection
- [ ] Comparison between time periods

## Support

For issues or questions, refer to the main project README.
