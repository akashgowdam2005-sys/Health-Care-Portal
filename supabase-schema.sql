-- Health Care Portal Database Schema for Supabase

-- Profiles table (links to auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  role TEXT NOT NULL CHECK (role IN ('PATIENT', 'DOCTOR', 'PHARMACIST')),
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Patient-specific profile data
CREATE TABLE patient_profiles (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE PRIMARY KEY,
  date_of_birth DATE,
  address TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  medical_history TEXT,
  allergies TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Doctor-specific profile data
CREATE TABLE doctor_profiles (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE PRIMARY KEY,
  specialization TEXT NOT NULL,
  license_number TEXT UNIQUE NOT NULL,
  years_of_experience INTEGER,
  education TEXT,
  consultation_fee DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pharmacist-specific profile data
CREATE TABLE pharmacist_profiles (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE PRIMARY KEY,
  license_number TEXT UNIQUE NOT NULL,
  pharmacy_name TEXT,
  pharmacy_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Appointments
CREATE TABLE appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  doctor_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER DEFAULT 30,
  status TEXT NOT NULL CHECK (status IN ('SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW')) DEFAULT 'SCHEDULED',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Prescriptions
CREATE TABLE prescriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  doctor_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  patient_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  pharmacist_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  medication_details JSONB NOT NULL,
  diagnosis TEXT,
  instructions TEXT,
  date_issued TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  date_filled TIMESTAMP WITH TIME ZONE,
  filled_status BOOLEAN DEFAULT FALSE,
  refills_remaining INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_appointments_patient_datetime ON appointments(patient_id, datetime);
CREATE INDEX idx_appointments_doctor_datetime ON appointments(doctor_id, datetime);
CREATE INDEX idx_prescriptions_patient ON prescriptions(patient_id, date_issued);
CREATE INDEX idx_prescriptions_doctor ON prescriptions(doctor_id, date_issued);
CREATE INDEX idx_prescriptions_status ON prescriptions(filled_status, date_issued);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE pharmacist_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Doctors can view patient profiles" ON profiles FOR SELECT USING (
  role = 'PATIENT' AND EXISTS (
    SELECT 1 FROM appointments WHERE doctor_id = auth.uid() AND patient_id = id
  )
);

CREATE POLICY "Patients can manage own profile" ON patient_profiles FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Doctors can view patient profiles" ON patient_profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM appointments WHERE doctor_id = auth.uid() AND patient_id = user_id)
);

CREATE POLICY "Doctors can manage own profile" ON doctor_profiles FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "All can view doctor profiles" ON doctor_profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Pharmacists can manage own profile" ON pharmacist_profiles FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Patients can view own appointments" ON appointments FOR SELECT USING (auth.uid() = patient_id);
CREATE POLICY "Doctors can view own appointments" ON appointments FOR SELECT USING (auth.uid() = doctor_id);
CREATE POLICY "Patients can create appointments" ON appointments FOR INSERT WITH CHECK (auth.uid() = patient_id);
CREATE POLICY "Doctors can update appointments" ON appointments FOR UPDATE USING (auth.uid() = doctor_id);

CREATE POLICY "Patients can view own prescriptions" ON prescriptions FOR SELECT USING (auth.uid() = patient_id);
CREATE POLICY "Doctors can manage prescriptions" ON prescriptions FOR ALL USING (auth.uid() = doctor_id);
CREATE POLICY "Pharmacists can view all prescriptions" ON prescriptions FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'PHARMACIST')
);
CREATE POLICY "Pharmacists can update prescription status" ON prescriptions FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'PHARMACIST')
);

-- Functions for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_patient_profiles_updated_at BEFORE UPDATE ON patient_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_doctor_profiles_updated_at BEFORE UPDATE ON doctor_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_prescriptions_updated_at BEFORE UPDATE ON prescriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();