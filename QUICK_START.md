# Quick Start Guide

## 1. Install Dependencies (First Time Only)
```bash
npm install
```

## 2. Setup Supabase (First Time Only)

### Create Project
1. Go to https://supabase.com → New Project
2. Copy Project URL and anon key

### Run Schema
1. Supabase Dashboard → SQL Editor
2. Copy/paste entire `supabase/schema.sql`
3. Click Run

### Add Credentials
Create `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

### Create Test Doctor
1. Supabase → Authentication → Add User
   - Email: `doctor@test.com`
   - Password: `Test123456`
   - ✅ Auto Confirm
2. Copy the UUID
3. SQL Editor → Run:
```sql
INSERT INTO profiles VALUES ('PASTE_UUID', 'doctor@test.com', 'Dr. Test', 'doctor', '+1234567890');
INSERT INTO doctor_profiles VALUES ('PASTE_UUID', 'General Medicine', 'TEST-001', 'MBBS', 5, 500.00);
```

## 3. Run App
```bash
npm run dev
```

## 4. Test
- Patient Signup: http://localhost:3000/signup
- Doctor Login: http://localhost:3000/login (Doctor tab)

## Common Issues

**CSS not showing?**
```bash
rm -rf .next node_modules
npm install
npm run dev
```

**Can't login?**
- Check `.env.local` exists with correct values
- Verify user is confirmed in Supabase Dashboard
- Check browser console for errors

**Database errors?**
- Verify `schema.sql` ran without errors
- Check Supabase logs in Dashboard
