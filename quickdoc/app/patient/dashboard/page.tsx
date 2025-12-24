"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { CheckCircle2, Clock3, ClipboardPlus, Stethoscope } from "lucide-react";
import { createSupabaseBrowserClient } from "@/utils/supabase/client";

type Doctor = {
  id: string;
  full_name: string;
  specialization: string | null;
  experience_years: number | null;
};

type Appointment = {
  id: string;
  doctor_id: string;
  patient_id: string;
  date_time: string;
  symptoms: string | null;
  status: string;
};

const statusStyles: Record<
  string,
  { bg: string; text: string; label?: string }
> = {
  pending: { bg: "bg-amber-50", text: "text-amber-700", label: "Pending" },
  confirmed: { bg: "bg-emerald-50", text: "text-emerald-700", label: "Confirmed" },
  completed: { bg: "bg-blue-50", text: "text-blue-700", label: "Completed" },
  rejected: { bg: "bg-rose-50", text: "text-rose-700", label: "Rejected" },
};

export default function PatientDashboard() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const router = useRouter();

  const [userId, setUserId] = useState<string | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [bookingDoctor, setBookingDoctor] = useState<Doctor | null>(null);
  const [dateTime, setDateTime] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setUserId(user.id);
      await Promise.all([loadDoctors(), loadAppointments(user.id)]);
    };

    void init();
  }, [supabase, router]);

  const loadDoctors = async () => {
    const { data, error: doctorsError } = await supabase
      .from("doctors")
      .select("id, full_name, specialization, experience_years")
      .order("full_name", { ascending: true });

    if (doctorsError) {
      setError(doctorsError.message);
    } else {
      setDoctors(data || []);
    }
  };

  const loadAppointments = async (patientId: string) => {
    const { data, error: apptError } = await supabase
      .from("appointments")
      .select("id, doctor_id, patient_id, date_time, symptoms, status")
      .eq("patient_id", patientId)
      .order("date_time", { ascending: false });

    if (apptError) {
      setError(apptError.message);
    } else {
      setAppointments(data || []);
    }
  };

  const submitBooking = async () => {
    if (!bookingDoctor || !userId) return;
    setLoading(true);
    setError(null);
    try {
      const { error: insertError } = await supabase.from("appointments").insert({
        doctor_id: bookingDoctor.id,
        patient_id: userId,
        date_time: dateTime ? new Date(dateTime).toISOString() : null,
        symptoms,
        status: "pending",
      });

      if (insertError) throw insertError;
      setBookingDoctor(null);
      setDateTime("");
      setSymptoms("");
      await loadAppointments(userId);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to book appointment.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const doctorById = (id: string) =>
    doctors.find((doc) => doc.id === id) || null;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-12">
        <header className="flex flex-col gap-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-sm font-semibold text-teal-700 ring-1 ring-inset ring-teal-200">
            <Stethoscope className="h-4 w-4" />
            Patient Dashboard
          </div>
          <h1 className="text-3xl font-semibold text-slate-900">
            Welcome{userId ? "" : " back"}
          </h1>
          <p className="text-slate-600">
            Browse doctors, book visits, and review your appointment history.
          </p>
        </header>

        {error && (
          <p className="rounded-md border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </p>
        )}

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900">Doctors</h2>
            <p className="text-sm text-slate-500">
              Choose a doctor and book in seconds.
            </p>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {doctors.map((doctor) => (
              <div
                key={doctor.id}
                className="flex h-full flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-teal-700">
                      {doctor.specialization || "General Practitioner"}
                    </p>
                    <h3 className="text-lg font-semibold text-slate-900">
                      {doctor.full_name}
                    </h3>
                  </div>
                  <span className="text-xs font-semibold text-slate-500">
                    {doctor.experience_years != null
                      ? `${doctor.experience_years} yrs`
                      : "—"}
                  </span>
                </div>
                <p className="text-sm text-slate-600">
                  Experienced specialist ready to assist with your needs.
                </p>
                <button
                  onClick={() => setBookingDoctor(doctor)}
                  className="mt-auto inline-flex items-center justify-center rounded-md bg-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700"
                >
                  <ClipboardPlus className="mr-2 h-4 w-4" />
                  Book
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900">
              My Appointments
            </h2>
            <p className="text-sm text-slate-500">
              Track upcoming and past visits.
            </p>
          </div>
          {appointments.length === 0 ? (
            <p className="mt-4 text-sm text-slate-600">
              No appointments yet. Book a doctor to get started.
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {appointments.map((appt) => {
                const doctor = doctorById(appt.doctor_id);
                const status = statusStyles[appt.status] ?? statusStyles.pending;
                return (
                  <div
                    key={appt.id}
                    className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-slate-50 p-4 md:flex-row md:items-center md:justify-between"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-slate-900">
                        {doctor?.full_name || "Doctor"} ·{" "}
                        <span className="text-teal-700">
                          {doctor?.specialization || "Specialist"}
                        </span>
                      </p>
                      <p className="text-sm text-slate-600">
                        {appt.date_time
                          ? format(new Date(appt.date_time), "PPpp")
                          : "Date not set"}
                      </p>
                      {appt.symptoms && (
                        <p className="text-xs text-slate-500">
                          Symptoms: {appt.symptoms}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${status.bg} ${status.text}`}
                      >
                        {appt.status === "confirmed" ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : (
                          <Clock3 className="h-4 w-4" />
                        )}
                        {status.label || appt.status}
                      </span>
                  </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {bookingDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-teal-700">
                  Book with {bookingDoctor.specialization || "Doctor"}
                </p>
                <h3 className="text-xl font-semibold text-slate-900">
                  {bookingDoctor.full_name}
                </h3>
              </div>
              <button
                onClick={() => setBookingDoctor(null)}
                className="text-sm font-semibold text-slate-500 hover:text-slate-700"
              >
                Close
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-700">
                  Date &amp; time
                </span>
                <input
                  type="datetime-local"
                  value={dateTime}
                  onChange={(e) => setDateTime(e.target.value)}
                  className="rounded-md border border-slate-200 px-3 py-2 text-slate-900 focus:border-teal-500 focus:outline-none"
                  required
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-700">
                  Symptoms / notes
                </span>
                <textarea
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  rows={3}
                  className="rounded-md border border-slate-200 px-3 py-2 text-slate-900 focus:border-teal-500 focus:outline-none"
                  placeholder="Describe your symptoms"
                />
              </label>

              <div className="flex flex-wrap items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setBookingDoctor(null)}
                  className="rounded-md px-4 py-2 text-sm font-semibold text-slate-600 ring-1 ring-inset ring-slate-200 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={submitBooking}
                  className="inline-flex items-center justify-center rounded-md bg-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 disabled:opacity-70"
                >
                  {loading ? "Booking..." : "Confirm booking"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

