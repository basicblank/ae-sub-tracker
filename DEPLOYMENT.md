# Deployment Guide - AE Sub Tracker Dashboard

This guide will help you deploy the dashboard online using GitHub Pages so your team can access it from anywhere.

## Prerequisites

- A GitHub account (free)
- Git installed on your computer (check with `git --version`)

## Option 1: Deploy with GitHub Pages (Recommended)

### Step 1: Create a GitHub Repository

1. Go to [GitHub](https://github.com) and sign in
2. Click the "+" icon in the top-right corner
3. Select "New repository"
4. Name it: `ae-sub-tracker` (or any name you prefer)
5. Set it to **Public** (required for free GitHub Pages)
6. Click "Create repository"

### Step 2: Push Your Code to GitHub

Open your terminal/command prompt in the project directory and run:

```bash
# If you haven't already initialized git (already done)
git init

# Add all files
git add .

# Commit the files
git commit -m "Initial commit - AE Sub Tracker Dashboard"

# Add your GitHub repository as remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/ae-sub-tracker.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 3: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click "Settings" tab
3. Scroll down to "Pages" in the left sidebar
4. Under "Source", select "main" branch
5. Select "/ (root)" folder
6. Click "Save"

### Step 4: Configure for Dashboard

Since your dashboard is in a `/dashboard` folder, you need to either:

**Option A: Move dashboard files to root (Easier)**
```bash
# Move all dashboard files to root
mv dashboard/index.html ./
mv dashboard/styles.css ./
mv dashboard/app.js ./
mv dashboard/README.md ./DASHBOARD_README.md

# Commit and push
git add .
git commit -m "Move dashboard files to root for GitHub Pages"
git push
```

**Option B: Update GitHub Pages settings to use /dashboard folder**
1. In GitHub repository settings > Pages
2. Change folder from "/ (root)" to "/dashboard"
3. Save

### Step 5: Access Your Dashboard

After a few minutes, your dashboard will be live at:
```
https://YOUR_USERNAME.github.io/ae-sub-tracker/
```

Or if you kept it in the dashboard folder:
```
https://YOUR_USERNAME.github.io/ae-sub-tracker/dashboard/
```

---

## Option 2: Deploy with Netlify (Alternative)

Netlify offers free hosting with custom domains and is very easy to use.

### Quick Deploy

1. Go to [Netlify](https://www.netlify.com/)
2. Sign up/Sign in (can use GitHub account)
3. Click "Add new site" > "Deploy manually"
4. Drag and drop your `dashboard` folder
5. Your site will be live in seconds at a URL like: `random-name-123.netlify.app`

### Connect to GitHub (Recommended)

1. Push your code to GitHub (see Option 1 steps above)
2. On Netlify, click "Add new site" > "Import an existing project"
3. Choose "GitHub" and authorize Netlify
4. Select your repository
5. Set build settings:
   - Base directory: `dashboard`
   - Build command: (leave empty)
   - Publish directory: `dashboard`
6. Click "Deploy"

Your site will auto-update whenever you push to GitHub!

---

## Option 3: Deploy with Vercel (Alternative)

Similar to Netlify, very fast and easy.

1. Go to [Vercel](https://vercel.com/)
2. Sign up/Sign in with GitHub
3. Click "Add New Project"
4. Import your GitHub repository
5. Configure:
   - Root directory: `dashboard`
   - Framework Preset: "Other"
6. Click "Deploy"

---

## Connecting Your Google Sheets

After deploying, you'll need to connect your Google Sheets data:

### Method 1: Google Sheets API (Recommended)

1. Follow the instructions in `dashboard/README.md`
2. Get your API key and Sheet ID
3. Update `app.js` with the API integration code
4. Push the changes to GitHub (it will auto-deploy)

### Method 2: Google Apps Script Web App

1. Create the Apps Script web app (see `dashboard/README.md`)
2. Update `app.js` with the web app URL
3. Push changes to GitHub

### Security Note

If you're using API keys:
- **DO NOT** commit your actual API key to GitHub
- Use environment variables or a config file that's in `.gitignore`
- For GitHub Pages, since it's static, you may need to use the Apps Script method instead

---

## Custom Domain (Optional)

### For GitHub Pages:
1. Buy a domain (Namecheap, Google Domains, etc.)
2. In your GitHub repo settings > Pages
3. Add your custom domain
4. Configure DNS settings with your domain provider

### For Netlify/Vercel:
1. Go to site settings > Domain management
2. Add custom domain
3. Follow their DNS configuration instructions

---

## Updating Your Dashboard

Whenever you make changes:

```bash
# Make your changes to the files
# Then:
git add .
git commit -m "Description of changes"
git push
```

Your site will automatically update within seconds to minutes!

---

## Troubleshooting

**Dashboard not showing up:**
- Wait 5-10 minutes for GitHub Pages to build
- Check that index.html is in the correct folder
- Verify your repository is public

**Styles not loading:**
- Check that all file paths are relative (no absolute paths)
- Verify styles.css and app.js are in the same folder as index.html

**Charts not displaying:**
- Check browser console for errors (F12)
- Verify Chart.js CDN is loading

**Data not loading:**
- Ensure Google Sheets API is configured correctly
- Check CORS settings if using Apps Script
- Verify API keys are correct

---

## Recommended Workflow

1. **Initial Setup**: Use GitHub Pages (free, easy, auto-updates)
2. **Connect Data**: Use Google Apps Script web app (easier than API for static sites)
3. **Share**: Send your team the GitHub Pages URL
4. **Updates**: Just push to GitHub whenever you make changes

Your dashboard will always be up-to-date and accessible from anywhere!
