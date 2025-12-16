# Fix: Supabase Rate Limit Error

## Error Message
```
For security purposes, you can only request this after 43 seconds.
```

## Quick Fix: Disable Rate Limiting (Development Only)

### Option 1: Wait 60 Seconds
Just wait a minute between signup attempts.

### Option 2: Disable Rate Limiting in Supabase

1. Go to Supabase Dashboard
2. Navigate to **Authentication** → **Rate Limits**
3. Find these settings and increase/disable:

**Email Signups:**
- Change from default (e.g., 3 per hour) to **100 per hour**

**Or completely disable for development:**
- Set to **0** (unlimited)

### Option 3: Clear Supabase Auth State

If you keep getting this error:

1. **Clear Browser Data:**
   - Open DevTools (F12)
   - Application tab → Storage → Clear site data
   - Refresh page

2. **Use Incognito/Private Window:**
   - Test signup in private browsing mode

3. **Try Different Email:**
   - Use a different email address

## Recommended Settings for Development

Go to **Authentication** → **Rate Limits** in Supabase:

```
Email Signups: 100 per hour
Password Signins: 100 per hour
Password Recovery: 100 per hour
Token Refresh: 1000 per hour
```

## For Production

Keep rate limits enabled:
```
Email Signups: 3-5 per hour per IP
Password Signins: 10-20 per hour per IP
```

## Alternative: Use Supabase Dashboard to Create Users

Instead of using signup form during testing:

1. Supabase Dashboard → **Authentication** → **Users**
2. Click **Add User** → **Create new user**
3. Enter email/password
4. ✅ Auto Confirm User
5. User is created instantly without rate limits
