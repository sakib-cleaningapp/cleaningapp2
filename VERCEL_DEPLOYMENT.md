# Vercel Deployment Guide

## How to Trigger a Vercel Deployment

There are several ways to trigger a deployment in Vercel:

### Method 1: Push to GitHub (Automatic - Recommended)

**This is the standard way deployments work:**

1. Make your changes
2. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Your commit message"
   git push origin main
   ```
3. Vercel automatically detects the push and starts a deployment within 1-2 minutes

**Requirements:**

- GitHub repository must be connected to Vercel
- Commit author email must have access to the Vercel team
- Push must be to the branch that's configured for auto-deployment (usually `main`)

---

### Method 2: Empty Commit (Trigger Redeployment)

**If you need to trigger a redeployment without code changes:**

```bash
# Create an empty commit
git commit --allow-empty -m "Trigger Vercel redeployment"

# Push to GitHub
git push origin main
```

This creates a commit with no code changes, which will trigger Vercel to redeploy the current codebase.

---

### Method 3: Vercel CLI (Manual Deployment)

**Deploy directly from your local machine:**

```bash
# Deploy to production
vercel --prod

# Or deploy to preview
vercel
```

**Requirements:**

- Must be logged in: `vercel login`
- Git author email must have access to the Vercel team
- Project must be linked: `vercel link`

**Note:** CLI deployments may fail if your Git author email doesn't match your Vercel account email.

---

### Method 4: Vercel Dashboard (Manual Deployment)

**Trigger deployment from the web interface:**

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Click "Deployments" tab
4. Click "Create Deployment" button
5. Enter a commit SHA (e.g., `719061c` or full SHA)
6. Click "Create Deployment"

**Note:** You cannot use branch names like `main` - you must use a specific commit SHA.

---

## Troubleshooting Deployment Issues

### Issue: "Git author email must have access to the team"

**Problem:** Your Git commit author email doesn't match your Vercel account email.

**Solution Options:**

1. **Add your email to the Vercel team** (Recommended):
   - Go to Vercel Dashboard → Team Settings → Members
   - Add your Git author email to the team

2. **Change your Git author email**:

   ```bash
   # Set your Git email to match Vercel account
   git config user.email "your-vercel-email@example.com"

   # Update existing commits (if needed)
   git commit --amend --reset-author --no-edit
   git push --force-with-lease origin main
   ```

### Issue: Deployments not triggering from GitHub

**Check:**

1. GitHub repository is connected in Vercel Dashboard → Settings → Git
2. Webhook is active: GitHub repo → Settings → Webhooks
3. Commit author email has team access
4. You're pushing to the correct branch (usually `main`)

### Issue: Build failures

**Common causes:**

- Missing environment variables
- Build command errors
- Dependency issues
- TypeScript/ESLint errors (if not ignored in build)

**Check build logs:**

```bash
vercel logs <deployment-url>
```

Or view in Vercel Dashboard → Deployments → Click deployment → View build logs

---

## Current Project Configuration

**Repository:** `https://github.com/jmadeiros/cleanly.git`  
**Vercel Project:** `cleanlymvpcursor`  
**Team:** `joshuamadeiros-lgimcom's projects`  
**Production Branch:** `main`  
**Build Command:** `cd apps/web && npm run build`  
**Output Directory:** `apps/web/.next`

**Git Author Email:** `joshmadeiros8@gmail.com` (matches Vercel account)

---

## Quick Reference Commands

```bash
# Check deployment status
vercel ls

# View deployment logs
vercel logs <deployment-url>

# Trigger redeployment via empty commit
git commit --allow-empty -m "Trigger redeployment" && git push origin main

# Manual CLI deployment
vercel --prod

# Check Git author email
git config user.email

# Update Git author email
git config user.email "your-email@example.com"
```

---

## Best Practices

1. **Use GitHub pushes** for normal deployments (automatic, tracks history)
2. **Use empty commits** only when you need to trigger a redeploy without code changes
3. **Keep Git author email consistent** with your Vercel account email
4. **Monitor deployments** in Vercel Dashboard for build status
5. **Check build logs** if deployments fail to identify issues quickly
