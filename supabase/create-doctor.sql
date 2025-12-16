-- Admin Script: Create Doctor Account
-- Run this in Supabase SQL Editor to create doctor accounts

-- Step 1: Create auth user (replace with actual values)
-- This will be done via Supabase Dashboard > Authentication > Add User
-- Or use this function:

CREATE OR REPLACE FUNCTION create_doctor_account(
  p_email TEXT,
  p_password TEXT,
  p_full_name TEXT,
  p_phone TEXT,
  p_specialization TEXT,
  p_license_number TEXT,
  p_qualification TEXT,
  p_experience_years INTEGER DEFAULT 0,
  p_consultation_fee DECIMAL DEFAULT 500.00
)
RETURNS UUID AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Note: In production, create user via Supabase Dashboard
  -- This is a placeholder for the user_id you'll get
  
  -- For now, manually create user in Supabase Dashboard, then run:
  -- INSERT INTO profiles...
  
  RAISE NOTICE 'Create user in Supabase Dashboard first, then use user_id below';
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 2: After creating user in Dashboard, insert profiles manually
-- Replace 'USER_ID_FROM_DASHBOARD' with actual UUID

/*
-- Example: Create doctor profile after user creation
INSERT INTO profiles (id, email, full_name, role, phone)
VALUES (
  'USER_ID_FROM_DASHBOARD',
  'doctor@example.com',
  'Dr. John Smith',
  'doctor',
  '+1234567890'
);

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
  'USER_ID_FROM_DASHBOARD',
  'Cardiology',
  'MED123456',
  'MBBS, MD (Cardiology)',
  10,
  1000.00,
  'Experienced cardiologist specializing in heart disease prevention and treatment.'
);
*/

-- Quick Template for Creating Doctors:
-- 1. Go to Supabase Dashboard > Authentication > Add User
-- 2. Enter email and password
-- 3. Copy the user UUID
-- 4. Run the INSERT statements above with the UUID
