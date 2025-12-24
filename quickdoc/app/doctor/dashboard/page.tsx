"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  CheckCircle2,
  ClipboardCheck,
  ClipboardX,
  FileText,
  Stethoscope,
  Users,
} from "lucide-react";
import { createSupabaseBrowserClient } from "@/utils/supabase/client";

type Appointment = {
  id: string;
  patient_id: string;
  doctor_id: string;
  date_time: string;
  symptoms: string | null;
  status: string;
  prescription: string | null;
};

type Patient = {
  id: string;
  full_name: string;
};

export default function DoctorDashboard() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const router = useRouter();

  const [doctorId, setDoctorId] = useState<string | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patientMap, setPatientMap] = useState<Record<string, Patient>>({});
  const [loadingAction, setLoadingAction] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalAppointments = appointments.length;
  const pending = appointments.filter((appt) => appt.status === "pending");
  const confirmed = appointments.filter((appt) => appt.status === "confirmed");
  const completed = appointments.filter((appt) => appt.status === "completed");

  useEffect(() => {
    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      setDoctorId(user.id);
      await refreshData(user.id);
    };

    void init();
  }, [supabase, router]);

  const refreshData = async (userId: string) => {
    setError(null);
    const { data, error: apptError } = await supabase
      .from("appointments")
      .select("id, patient_id, doctor_id, date_time, symptoms, status, prescription")
      .eq("doctor_id", userId)
      .order("date_time", { ascending: true });

    if (apptError) {
      setError(apptError.message);
      return;
    }

    setAppointments(data || []);

    const patientIds = Array.from(
      new Set((data || []).map((appt) => appt.patient_id).filter(Boolean))
    );
    if (patientIds.length === 0) {
      setPatientMap({});
      return;
    }

    const { data: patients, error: patientsError } = await supabase
      .from("patients")
      .select("id, full_name")
      .in("id", patientIds);

    if (patientsError) {
      setError(patientsError.message);
      return;
    }

    const map: Record<string, Patient> = {};
    (patients || []).forEach((p) => {
      map[p.id] = p;
    });
    setPatientMap(map);
  };

  const updateStatus = async (
    appointmentId: string,
    status: "confirmed" | "rejected"
  ) => {
    if (!doctorId) return;
    setLoadingAction(true);
    setError(null);
    try {
      const { error: updateError } = await supabase
        .from("appointments")
        .update({ status })
        .eq("id", appointmentId)
        .eq("doctor_id", doctorId);

      if (updateError) throw updateError;
      await refreshData(doctorId);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to update appointment.";
      setError(message);
    } finally {
      setLoadingAction(false);
    }
  };

  const completeAppointment = async (appointmentId: string) => {
    if (!doctorId) return;
    const prescription = window.prompt("Add prescription notes") || "";
    setLoadingAction(true);
    setError(null);
    try {
      const { error: updateError } = await supabase
        .from("appointments")
        .update({ status: "completed", prescription })
        .eq("id", appointmentId)
        .eq("doctor_id", doctorId);

      if (updateError) throw updateError;
      await refreshData(doctorId);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Unable to complete the appointment.";
      setError(message);
    } finally {
      setLoadingAction(false);
    }
  };

  const patientName = (id: string) =>
    patientMap[id]?.full_name || "Patient";

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-12">
        <header className="flex flex-col gap-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-sm font-semibold text-teal-700 ring-1 ring-inset ring-teal-200">
            <Stethoscope className="h-4 w-4" />
            Doctor Dashboard
          </div>
          <h1 className="text-3xl font-semibold text-slate-900">
            Manage your appointments
          </h1>
          <p className="text-slate-600">
            Confirm incoming requests, complete consultations, and share prescriptions.
          </p>
        </header>

        {error && (
          <p className="rounded-md border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </p>
        )}

        <section className="grid gap-4 md:grid-cols-3">
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="rounded-lg bg-teal-50 p-3 text-teal-700">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500">Appointments</p>
              <p className="text-2xl font-semibold text-slate-900">{totalAppointments}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="rounded-lg bg-amber-50 p-3 text-amber-700">
              <ClipboardCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500">Pending</p>
              <p className="text-2xl font-semibold text-slate-900">{pending.length}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="rounded-lg bg-emerald-50 p-3 text-emerald-700">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500">Completed</p>
              <p className="text-2xl font-semibold text-slate-900">{completed.length}</p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900">
              Incoming Requests
            </h2>
            <p className="text-sm text-slate-500">
              Confirm or reject pending appointments.
            </p>
          </div>
          {pending.length === 0 ? (
            <p className="mt-4 text-sm text-slate-600">No pending requests.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {pending.map((appt) => (
                <div
                  key={appt.id}
                  className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-slate-900">
                      {patientName(appt.patient_id)}
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
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      disabled={loadingAction}
                      onClick={() => updateStatus(appt.id, "confirmed")}
                      className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-70"
                    >
                      <ClipboardCheck className="h-4 w-4" />
                      Accept
                    </button>
                    <button
                      disabled={loadingAction}
                      onClick={() => updateStatus(appt.id, "rejected")}
                      className="inline-flex items-center gap-2 rounded-md bg-rose-100 px-3 py-2 text-xs font-semibold text-rose-700 ring-1 ring-inset ring-rose-200 transition hover:bg-rose-200 disabled:opacity-70"
                    >
                      <ClipboardX className="h-4 w-4" />
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900">
              Consultations (Confirmed)
            </h2>
            <p className="text-sm text-slate-500">Complete and add prescriptions.</p>
          </div>
          {confirmed.length === 0 ? (
            <p className="mt-4 text-sm text-slate-600">No confirmed visits.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {confirmed.map((appt) => (
                <div
                  key={appt.id}
                  className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-slate-900">
                      {patientName(appt.patient_id)}
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
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      disabled={loadingAction}
                      onClick={() => completeAppointment(appt.id)}
                      className="inline-flex items-center gap-2 rounded-md bg-teal-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-teal-700 disabled:opacity-70"
                    >
                      <FileText className="h-4 w-4" />
                      Complete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900">
              Completed with Prescription
            </h2>
            <p className="text-sm text-slate-500">Shared notes for patients.</p>
          </div>
          {completed.length === 0 ? (
            <p className="mt-4 text-sm text-slate-600">No completed visits yet.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {completed.map((appt) => (
                <div
                  key={appt.id}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-semibold text-slate-900">
                      {patientName(appt.patient_id)}
                    </p>
                    <p className="text-sm text-slate-600">
                      {appt.date_time
                        ? format(new Date(appt.date_time), "PPpp")
                        : "Date not set"}
                    </p>
                    {appt.prescription ? (
                      <p className="text-xs text-slate-700">
                        Prescription: {appt.prescription}
                      </p>
                    ) : (
                      <p className="text-xs text-slate-500">No prescription recorded.</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

