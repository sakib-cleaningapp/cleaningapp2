# Supabase Setup Guide

This guide will help you set up Supabase authentication for the Cleanly platform.

## 🚀 Quick Setup

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign in with GitHub/Google
4. Click "New Project"
5. Choose an organization
6. Enter project details:
   - **Name**: `cleanly-platform`
   - **Database Password**: Generate a strong password
   - **Region**: Choose closest to your users
7. Wait for project creation (2-3 minutes)

### 2. Get Your Credentials

Once your project is ready:

1. Go to **Settings** → **API**
2. Copy the following:
   - **Project URL** (looks like: `https://abcdefghijklmn.supabase.co`)
   - **Anon public key** (starts with `eyJhbGci...`)

### 3. Configure Environment Variables

1. Open `apps/web/.env.local`
2. Replace the placeholder values:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Enable Authentication Providers

#### Email Authentication (Default)

1. Go to **Authentication** → **Settings**
2. Under **Auth Providers**, ensure **Email** is enabled
3. Configure email templates if needed

#### Google OAuth (Optional)

1. Go to **Authentication** → **Settings**
2. Click **Google** under Auth Providers
3. Enable Google
4. Follow Google OAuth setup:
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project or select existing
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URI: `https://your-project.supabase.co/auth/v1/callback`
5. Copy Client ID and Client Secret to Supabase

## 🔧 Database Schema Setup

The app expects the following user metadata fields:

- `full_name` - User's full name
- `postcode` - User's postcode for service area validation

These are automatically saved during registration.

## 🛠 Troubleshooting

### "Failed to fetch" Error

This usually means:

1. **Invalid Supabase URL** - Check your project URL is correct
2. **Network issues** - Check your internet connection
3. **Project not ready** - Wait a few minutes after creation

### Demo Mode

If Supabase isn't configured, the app runs in demo mode:

- ✅ UI works normally
- ✅ Registration/login simulated
- ❌ No real user accounts created
- ❌ No email verification
- ❌ Google OAuth disabled

### Getting Valid Credentials

If your JWT token doesn't work:

1. Go to your Supabase dashboard
2. **Settings** → **API**
3. Copy the **Project URL** and **anon/public key**
4. Do NOT use service role key for frontend

### Common Issues

**Issue**: "Invalid JWT"
**Solution**: Make sure you're using the anon key, not service role

**Issue**: "Project not found"
**Solution**: Verify your project URL is exactly as shown in Settings → API

**Issue**: Google sign-in not working
**Solution**: Configure Google OAuth in Authentication → Settings

## 📧 Email Configuration

For production, configure custom SMTP:

1. **Authentication** → **Settings** → **SMTP Settings**
2. Add your email service credentials
3. Customize email templates

## 🔐 Security Notes

- Never commit real credentials to git
- Use environment variables only
- anon key is safe for frontend use
- service role key should NEVER be in frontend

## 🚀 Production Deployment

For production:

1. Set up custom domain
2. Configure email sending
3. Set up row-level security policies
4. Configure rate limiting

---

Need help? Check the [Supabase documentation](https://supabase.com/docs) or contact support.
