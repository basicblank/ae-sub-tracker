# Dashboard Password

## Current Password
```
AE2025!Tracker
```

## Changing the Password

To change the dashboard password:

1. Open `login.html`
2. Find this line (around line 111):
   ```javascript
   const DASHBOARD_PASSWORD = 'AE2025!Tracker';
   ```
3. Replace `'AE2025!Tracker'` with your new password
4. Save and push to GitHub

## Security Note

**IMPORTANT:** This is basic client-side password protection. The password is visible in the source code if someone inspects `login.html`.

For your use case (preventing casual access from people who find your GitHub), this is sufficient. However, for production/sensitive data, you would need:
- Backend authentication server
- Encrypted passwords
- Token-based authentication (JWT)

Since your repository is now private, this provides an additional layer of protection beyond the login page.

## How It Works

- The password is checked client-side when accessing `login.html`
- Upon successful login, a session flag is stored (`ae_authenticated`)
- `index.html` checks for this flag; if missing, redirects to login
- The session persists until the browser tab is closed

## Sharing Access with Your Team

Share this information with your team:
1. **URL**: https://basicblank.github.io/ae-sub-tracker/dashboard/login.html
2. **Password**: `AE2025!Tracker`

They'll be redirected to login automatically if they try to access the dashboard directly.
