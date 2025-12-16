# Fix: RLS Policy Error

## Error
```
Profile creation failed: new row violates row-level security policy for table "profiles"
```

## Problem
The RLS policies in the schema don't allow INSERT operations during signup.

## Solution

### Run This SQL in Supabase

1. Go to Supabase Dashboard → **SQL Editor**
2. Click **New Query**
3. Copy and paste this:

```sql
-- Add INSERT policy for profiles
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Add INSERT policy for patient_profiles
CREATE POLICY "Patients can insert own profile" ON patient_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
```

4. Click **Run**
5. Should see "Success. No rows returned"

### Test Signup Again

1. Go to http://localhost:3000/signup
2. Fill in the form
3. Submit
4. Should now work!

## What This Does

These policies allow:
- ✅ Users to create their own profile row during signup
- ✅ Patients to create their own patient_profile row
- ❌ Users cannot create profiles for other users (security maintained)

## Verify It Worked

After running the SQL, check policies:

```sql
SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE tablename = 'profiles';
```

Should see:
- `Users can view own profile` (SELECT)
- `Users can update own profile` (UPDATE)
- `Users can insert own profile` (INSERT) ← New!

## Alternative: Re-run Full Schema

If you want to start fresh:

1. Go to **SQL Editor**
2. Run this to drop all tables:
```sql
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS lab_reports CASCADE;
DROP TABLE IF EXISTS medicines CASCADE;
DROP TABLE IF EXISTS prescriptions CASCADE;
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS patient_profiles CASCADE;
DROP TABLE IF EXISTS doctor_profiles CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TYPE IF EXISTS appointment_status CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;
```

3. Then re-run the entire `supabase/schema.sql` with the fixes included
