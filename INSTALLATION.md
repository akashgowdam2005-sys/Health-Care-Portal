# VitalSync Installation Guide

## Prerequisites
- Node.js 18+ installed
- Supabase account (free tier works)

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Setup Supabase

### 2.1 Create Supabase Project
1. Go to https://supabase.com
2. Click "New Project"
3. Fill in project details
4. Wait for project to be ready

### 2.2 Run Database Schema
1. In Supabase Dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy entire contents of `supabase/schema.sql`
4. Paste and click "Run"
5. Wait for success message

### 2.3 Get API Credentials
1. Go to **Project Settings** → **API**
2. Copy:
   - Project URL
   - anon/public key

### 2.4 Create Environment File
Create `.env.local` in project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

## Step 3: Create a Test Doctor Account

### 3.1 Create Auth User
1. In Supabase Dashboard, go to **Authentication** → **Users**
2. Click **Add User** → **Create new user**
3. Enter:
   - Email: `doctor@test.com`
   - Password: `Test123456`
   - ✅ Auto Confirm User
4. Click **Create User**
5. **Copy the User UUID**

### 3.2 Create Doctor Profile
1. Go to **SQL Editor**
2. Run this (replace `USER_UUID` with copied UUID):

```sql
-- Replace USER_UUID with the actual UUID from step 3.1
INSERT INTO profiles (id, email, full_name, role, phone)
VALUES (
  'USER_UUID',
  'doctor@test.com',
  'Dr. Test Doctor',
  'doctor',
  '+1234567890'
);

INSERT INTO doctor_profiles (
  id,
  specialization,
  license_number,
  qualification,
  experience_years,
  consultation_fee
)
VALUES (
  'USER_UUID',
  'General Medicine',
  'TEST-001',
  'MBBS',
  5,
  500.00
);
```

## Step 4: Run Development Server

```bash
npm run dev
```

Open http://localhost:3000

## Step 5: Test the Application

### Test Patient Signup
1. Go to http://localhost:3000
2. Click "Sign up"
3. Fill form:
   - Name: John Doe
   - Email: patient@test.com
   - Phone: +1234567890
   - Password: Test123456
4. Click "Sign Up"
5. Should redirect to `/patient` dashboard

### Test Doctor Login
1. Go to http://localhost:3000/login
2. Click "Doctor" tab
3. Enter:
   - Email: doctor@test.com
   - Password: Test123456
4. Click "Sign In as Doctor"
5. Should redirect to `/doctor` dashboard

## Troubleshooting

### CSS Not Loading
```bash
# Delete .next folder and reinstall
rm -rf .next
npm install
npm run dev
```

### Database Errors
- Check if schema.sql ran successfully
- Verify RLS policies are enabled
- Check Supabase logs in Dashboard

### Auth Errors
- Verify .env.local has correct credentials
- Check if user is confirmed in Supabase Dashboard
- Clear browser cookies and try again

### Module Not Found
```bash
npm install
```

## Project Structure
```
Health-Care-Portal/
├── app/
│   ├── login/page.tsx          # Login with role tabs
│   ├── signup/page.tsx         # Patient signup only
│   ├── patient/                # Patient portal
│   └── doctor/                 # Doctor portal
├── components/ui/              # Shadcn components
├── lib/
│   ├── supabase/              # Supabase clients
│   └── auth-actions.ts        # Server actions
├── supabase/
│   └── schema.sql             # Database schema
└── types/
    └── supabase.ts            # TypeScript types
```

## Next Steps
- See `SETUP_DOCTORS.md` for creating more doctors
- Phase 2B will add doctor features (queue, prescriptions)
- Phase 3 will add patient features (booking, history)
