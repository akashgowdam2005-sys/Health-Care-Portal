-- Fix RLS Policies for Signup
-- Run this in Supabase SQL Editor

-- Add INSERT policy for profiles (allow users to create their own profile during signup)
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Add INSERT policy for patient_profiles
CREATE POLICY "Patients can insert own profile" ON patient_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Verify policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename IN ('profiles', 'patient_profiles', 'doctor_profiles')
ORDER BY tablename, policyname;
