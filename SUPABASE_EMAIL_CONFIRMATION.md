# Fix: Disable Email Confirmation (Development)

## Problem
Supabase requires email confirmation by default. During development, this causes signup to fail because:
1. No email is actually sent (no SMTP configured)
2. User can't confirm their email
3. Profile creation fails

## Solution: Disable Email Confirmation

### Step 1: Go to Supabase Dashboard

1. Open your Supabase project
2. Navigate to **Authentication** → **Providers**
3. Click on **Email** provider

### Step 2: Disable Confirmation

Find these settings and change them:

**Confirm email:**
- ❌ Uncheck "Enable email confirmations"

**Or set to:**
- ✅ "Disable email confirmations"

### Step 3: Save Changes

Click **Save** at the bottom

### Step 4: Test Signup

1. Go to http://localhost:3000/signup
2. Fill in the form
3. Submit
4. Should now work without email confirmation!

## Alternative: Auto-Confirm in Development

If you want to keep email confirmation enabled but auto-confirm in dev:

### Option A: Use Supabase Dashboard
When creating users manually:
- ✅ Check "Auto Confirm User"

### Option B: Modify Auth Settings
In Supabase Dashboard → **Authentication** → **URL Configuration**:
- Set "Site URL" to `http://localhost:3000`
- Set "Redirect URLs" to `http://localhost:3000/**`

## For Production

Re-enable email confirmation:
1. ✅ Enable email confirmations
2. Configure SMTP settings
3. Set up email templates

## Quick Test

After disabling email confirmation:

```bash
# Clear browser cache
# Go to signup page
# Create account
# Should redirect to /patient immediately
```

## Still Getting Errors?

Check the browser console and terminal for specific error messages. Common issues:

1. **Rate limiting** - See `SUPABASE_RATE_LIMIT_FIX.md`
2. **RLS policies** - Verify schema.sql ran successfully
3. **Missing tables** - Re-run schema.sql
4. **Wrong credentials** - Check .env.local

## Verify Settings

In Supabase Dashboard → **Authentication** → **Providers** → **Email**:

```
✅ Enable Email provider: ON
❌ Confirm email: OFF (for development)
✅ Enable Signup: ON
```
