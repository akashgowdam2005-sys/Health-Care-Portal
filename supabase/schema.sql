-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ENUM for user roles
CREATE TYPE user_role AS ENUM ('patient', 'doctor');

-- Create ENUM for appointment status
CREATE TYPE appointment_status AS ENUM ('pending', 'in_progress', 'completed', 'cancelled');

-- ============================================
-- PROFILES TABLE (Core User Data)
-- ============================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role user_role NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- DOCTOR PROFILES (Extended Doctor Info)
-- ============================================
CREATE TABLE doctor_profiles (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  specialization TEXT NOT NULL,
  license_number TEXT UNIQUE NOT NULL,
  qualification TEXT NOT NULL,
  experience_years INTEGER DEFAULT 0,
  consultation_fee DECIMAL(10,2) DEFAULT 0,
  bio TEXT,
  available_days TEXT[] DEFAULT ARRAY['monday','tuesday','wednesday','thursday','friday'],
  available_start_time TIME DEFAULT '09:00:00',
  available_end_time TIME DEFAULT '17:00:00',
  is_accepting_patients BOOLEAN DEFAULT TRUE
);

-- ============================================
-- PATIENT PROFILES (Extended Patient Info)
-- ============================================
CREATE TABLE patient_profiles (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  date_of_birth DATE,
  blood_group TEXT,
  allergies TEXT[],
  chronic_conditions TEXT[],
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  address TEXT
);

-- ============================================
-- APPOINTMENTS
-- ============================================
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  status appointment_status DEFAULT 'pending',
  reason TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_doctor_slot UNIQUE(doctor_id, appointment_date, appointment_time)
);

-- ============================================
-- PRESCRIPTIONS
-- ============================================
CREATE TABLE prescriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  diagnosis TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_appointment_prescription UNIQUE(appointment_id)
);

-- ============================================
-- MEDICINES (Prescription Line Items)
-- ============================================
CREATE TABLE medicines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prescription_id UUID NOT NULL REFERENCES prescriptions(id) ON DELETE CASCADE,
  medicine_name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  frequency TEXT NOT NULL,
  duration TEXT NOT NULL,
  instructions TEXT
);

-- ============================================
-- LAB REPORTS (File Storage References)
-- ============================================
CREATE TABLE lab_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- AUDIT LOGS (Compliance Tracking)
-- ============================================
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  metadata JSONB,
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE medicines ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- PROFILES: Users can read their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- DOCTOR PROFILES: Patients can view all doctors, doctors can update their own
CREATE POLICY "Anyone can view doctor profiles" ON doctor_profiles
  FOR SELECT USING (TRUE);

CREATE POLICY "Doctors can update own profile" ON doctor_profiles
  FOR UPDATE USING (auth.uid() = id);

-- PATIENT PROFILES: Patients can view/update own, doctors can view their patients
CREATE POLICY "Patients can view own profile" ON patient_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Patients can insert own profile" ON patient_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Patients can update own profile" ON patient_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Doctors can view patient profiles" ON patient_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'doctor'
    )
  );

-- APPOINTMENTS: Patients see their own, doctors see their appointments
CREATE POLICY "Patients can view own appointments" ON appointments
  FOR SELECT USING (patient_id = auth.uid());

CREATE POLICY "Patients can create appointments" ON appointments
  FOR INSERT WITH CHECK (patient_id = auth.uid());

CREATE POLICY "Patients can cancel own appointments" ON appointments
  FOR UPDATE USING (patient_id = auth.uid() AND status = 'pending');

CREATE POLICY "Doctors can view their appointments" ON appointments
  FOR SELECT USING (doctor_id = auth.uid());

CREATE POLICY "Doctors can update their appointments" ON appointments
  FOR UPDATE USING (doctor_id = auth.uid());

-- PRESCRIPTIONS: Patients see their own, doctors see their prescriptions
CREATE POLICY "Patients can view own prescriptions" ON prescriptions
  FOR SELECT USING (patient_id = auth.uid());

CREATE POLICY "Doctors can view their prescriptions" ON prescriptions
  FOR SELECT USING (doctor_id = auth.uid());

CREATE POLICY "Doctors can create prescriptions" ON prescriptions
  FOR INSERT WITH CHECK (doctor_id = auth.uid());

-- MEDICINES: Accessible via prescription policies
CREATE POLICY "Users can view medicines for their prescriptions" ON medicines
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM prescriptions 
      WHERE prescriptions.id = medicines.prescription_id 
      AND (prescriptions.patient_id = auth.uid() OR prescriptions.doctor_id = auth.uid())
    )
  );

CREATE POLICY "Doctors can create medicines" ON medicines
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM prescriptions 
      WHERE prescriptions.id = medicines.prescription_id 
      AND prescriptions.doctor_id = auth.uid()
    )
  );

-- LAB REPORTS: Patients can manage their own reports
CREATE POLICY "Patients can view own lab reports" ON lab_reports
  FOR SELECT USING (patient_id = auth.uid());

CREATE POLICY "Patients can upload lab reports" ON lab_reports
  FOR INSERT WITH CHECK (patient_id = auth.uid());

CREATE POLICY "Patients can delete own lab reports" ON lab_reports
  FOR DELETE USING (patient_id = auth.uid());

CREATE POLICY "Doctors can view patient lab reports" ON lab_reports
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'doctor'
    )
  );

-- AUDIT LOGS: Only viewable by the user themselves
CREATE POLICY "Users can view own audit logs" ON audit_logs
  FOR SELECT USING (user_id = auth.uid());

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to relevant tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create audit log
CREATE OR REPLACE FUNCTION create_audit_log()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (user_id, action, resource_type, resource_id, metadata)
  VALUES (
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    jsonb_build_object('old', to_jsonb(OLD), 'new', to_jsonb(NEW))
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit triggers to sensitive tables
CREATE TRIGGER audit_prescriptions AFTER INSERT OR UPDATE OR DELETE ON prescriptions
  FOR EACH ROW EXECUTE FUNCTION create_audit_log();

CREATE TRIGGER audit_appointments AFTER UPDATE OR DELETE ON appointments
  FOR EACH ROW EXECUTE FUNCTION create_audit_log();

-- ============================================
-- TRANSACTIONAL RPC: Complete Appointment with Prescription
-- ============================================
CREATE OR REPLACE FUNCTION complete_appointment_with_prescription(
  p_appointment_id UUID,
  p_diagnosis TEXT,
  p_notes TEXT,
  p_medicines JSONB
)
RETURNS UUID AS $$
DECLARE
  v_prescription_id UUID;
  v_patient_id UUID;
  v_doctor_id UUID;
  v_medicine JSONB;
BEGIN
  -- Get appointment details
  SELECT patient_id, doctor_id INTO v_patient_id, v_doctor_id
  FROM appointments WHERE id = p_appointment_id AND doctor_id = auth.uid();
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Appointment not found or unauthorized';
  END IF;

  -- Start transaction: Update appointment status
  UPDATE appointments 
  SET status = 'completed', updated_at = NOW()
  WHERE id = p_appointment_id;

  -- Create prescription
  INSERT INTO prescriptions (appointment_id, patient_id, doctor_id, diagnosis, notes)
  VALUES (p_appointment_id, v_patient_id, v_doctor_id, p_diagnosis, p_notes)
  RETURNING id INTO v_prescription_id;

  -- Insert medicines
  FOR v_medicine IN SELECT * FROM jsonb_array_elements(p_medicines)
  LOOP
    INSERT INTO medicines (prescription_id, medicine_name, dosage, frequency, duration, instructions)
    VALUES (
      v_prescription_id,
      v_medicine->>'medicine_name',
      v_medicine->>'dosage',
      v_medicine->>'frequency',
      v_medicine->>'duration',
      v_medicine->>'instructions'
    );
  END LOOP;

  RETURN v_prescription_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- INDEXES for Performance
-- ============================================
CREATE INDEX idx_appointments_patient ON appointments(patient_id);
CREATE INDEX idx_appointments_doctor ON appointments(doctor_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_prescriptions_patient ON prescriptions(patient_id);
CREATE INDEX idx_prescriptions_doctor ON prescriptions(doctor_id);
CREATE INDEX idx_medicines_prescription ON medicines(prescription_id);
CREATE INDEX idx_lab_reports_patient ON lab_reports(patient_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);

-- ============================================
-- STORAGE BUCKET for Lab Reports
-- ============================================
INSERT INTO storage.buckets (id, name, public) 
VALUES ('lab-reports', 'lab-reports', false);

-- Storage policies
CREATE POLICY "Patients can upload own lab reports" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'lab-reports' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Patients can view own lab reports" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'lab-reports' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Doctors can view all lab reports" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'lab-reports' AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'doctor')
  );
