# How to Create Doctor Accounts

## Important: Doctors Cannot Self-Register

Only **patients** can create accounts via the signup page. Doctor accounts must be created by administrators through Supabase Dashboard.

## Steps to Create a Doctor Account

### 1. Create Auth User in Supabase Dashboard

1. Go to your Supabase project
2. Navigate to **Authentication** → **Users**
3. Click **Add User** → **Create new user**
4. Enter:
   - Email: `doctor@example.com`
   - Password: `SecurePassword123`
   - Auto Confirm User: ✅ (check this)
5. Click **Create User**
6. **Copy the User UUID** (you'll need this)

### 2. Create Profile Records in SQL Editor

Go to **SQL Editor** and run:

```sql
-- Replace 'PASTE_USER_UUID_HERE' with the UUID from step 1

-- Create base profile
INSERT INTO profiles (id, email, full_name, role, phone)
VALUES (
  'PASTE_USER_UUID_HERE',
  'doctor@example.com',
  'Dr. Sarah Johnson',
  'doctor',
  '+1-555-0123'
);

-- Create doctor profile
INSERT INTO doctor_profiles (
  id,
  specialization,
  license_number,
  qualification,
  experience_years,
  consultation_fee,
  bio
)
VALUES (
  'PASTE_USER_UUID_HERE',
  'Cardiology',
  'MED-2024-12345',
  'MBBS, MD (Cardiology)',
  12,
  1500.00,
  'Board-certified cardiologist with 12 years of experience in treating heart conditions.'
);
```

### 3. Test Login

1. Go to `/login`
2. Select **Doctor** tab
3. Enter the email and password
4. Should redirect to `/doctor` dashboard

## Example: Create Multiple Doctors

```sql
-- Doctor 1: Cardiologist
INSERT INTO profiles VALUES (
  'uuid-1',
  'cardio@hospital.com',
  'Dr. Sarah Johnson',
  'doctor',
  '+1-555-0123'
);
INSERT INTO doctor_profiles VALUES (
  'uuid-1',
  'Cardiology',
  'MED-001',
  'MBBS, MD',
  12,
  1500.00
);

-- Doctor 2: Neurologist
INSERT INTO profiles VALUES (
  'uuid-2',
  'neuro@hospital.com',
  'Dr. Michael Chen',
  'doctor',
  '+1-555-0124'
);
INSERT INTO doctor_profiles VALUES (
  'uuid-2',
  'Neurology',
  'MED-002',
  'MBBS, DM (Neurology)',
  8,
  1800.00
);

-- Doctor 3: General Physician
INSERT INTO profiles VALUES (
  'uuid-3',
  'gp@hospital.com',
  'Dr. Emily Davis',
  'doctor',
  '+1-555-0125'
);
INSERT INTO doctor_profiles VALUES (
  'uuid-3',
  'General Medicine',
  'MED-003',
  'MBBS',
  5,
  800.00
);
```

## Quick Reference

**Patient Signup:** ✅ Self-service at `/signup`  
**Doctor Signup:** ❌ Admin-only via Supabase Dashboard

**Login:**
- Patients: Select "Patient" tab
- Doctors: Select "Doctor" tab

## Security Note

This approach ensures:
- Only verified medical professionals can access doctor portal
- Hospital/clinic admins control who gets doctor access
- Prevents unauthorized users from creating fake doctor accounts
