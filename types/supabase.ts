export type UserRole = 'patient' | 'doctor';
export type AppointmentStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          role: UserRole;
          phone: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name: string;
          role: UserRole;
          phone?: string | null;
          avatar_url?: string | null;
        };
        Update: {
          full_name?: string;
          phone?: string | null;
          avatar_url?: string | null;
        };
      };
      doctor_profiles: {
        Row: {
          id: string;
          specialization: string;
          license_number: string;
          qualification: string;
          experience_years: number;
          consultation_fee: number;
          bio: string | null;
          available_days: string[];
          available_start_time: string;
          available_end_time: string;
          is_accepting_patients: boolean;
        };
        Insert: {
          id: string;
          specialization: string;
          license_number: string;
          qualification: string;
          experience_years?: number;
          consultation_fee?: number;
          bio?: string | null;
        };
        Update: {
          specialization?: string;
          qualification?: string;
          experience_years?: number;
          consultation_fee?: number;
          bio?: string | null;
          available_days?: string[];
          available_start_time?: string;
          available_end_time?: string;
          is_accepting_patients?: boolean;
        };
      };
      patient_profiles: {
        Row: {
          id: string;
          date_of_birth: string | null;
          blood_group: string | null;
          allergies: string[] | null;
          chronic_conditions: string[] | null;
          emergency_contact_name: string | null;
          emergency_contact_phone: string | null;
          address: string | null;
        };
        Insert: {
          id: string;
          date_of_birth?: string | null;
          blood_group?: string | null;
          allergies?: string[] | null;
          chronic_conditions?: string[] | null;
        };
        Update: {
          date_of_birth?: string | null;
          blood_group?: string | null;
          allergies?: string[] | null;
          chronic_conditions?: string[] | null;
          emergency_contact_name?: string | null;
          emergency_contact_phone?: string | null;
          address?: string | null;
        };
      };
      appointments: {
        Row: {
          id: string;
          patient_id: string;
          doctor_id: string;
          appointment_date: string;
          appointment_time: string;
          status: AppointmentStatus;
          reason: string;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          patient_id: string;
          doctor_id: string;
          appointment_date: string;
          appointment_time: string;
          reason: string;
          notes?: string | null;
        };
        Update: {
          status?: AppointmentStatus;
          notes?: string | null;
        };
      };
      prescriptions: {
        Row: {
          id: string;
          appointment_id: string;
          patient_id: string;
          doctor_id: string;
          diagnosis: string;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          appointment_id: string;
          patient_id: string;
          doctor_id: string;
          diagnosis: string;
          notes?: string | null;
        };
        Update: {
          diagnosis?: string;
          notes?: string | null;
        };
      };
      medicines: {
        Row: {
          id: string;
          prescription_id: string;
          medicine_name: string;
          dosage: string;
          frequency: string;
          duration: string;
          instructions: string | null;
        };
        Insert: {
          prescription_id: string;
          medicine_name: string;
          dosage: string;
          frequency: string;
          duration: string;
          instructions?: string | null;
        };
        Update: {
          medicine_name?: string;
          dosage?: string;
          frequency?: string;
          duration?: string;
          instructions?: string | null;
        };
      };
      lab_reports: {
        Row: {
          id: string;
          patient_id: string;
          file_name: string;
          file_path: string;
          file_size: number | null;
          uploaded_at: string;
        };
        Insert: {
          patient_id: string;
          file_name: string;
          file_path: string;
          file_size?: number | null;
        };
        Update: {
          file_name?: string;
        };
      };
      audit_logs: {
        Row: {
          id: string;
          user_id: string;
          action: string;
          resource_type: string;
          resource_id: string | null;
          metadata: any | null;
          ip_address: string | null;
          created_at: string;
        };
      };
    };
    Functions: {
      complete_appointment_with_prescription: {
        Args: {
          p_appointment_id: string;
          p_diagnosis: string;
          p_notes: string;
          p_medicines: any;
        };
        Returns: string;
      };
    };
  };
}
