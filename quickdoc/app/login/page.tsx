"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  Lock,
  Mail,
  Phone,
  Stethoscope,
  UserRound,
} from "lucide-react";
import { createSupabaseBrowserClient } from "@/utils/supabase/client";

type Role = "patient" | "doctor";

const tabs: { label: string; value: Role }[] = [
  { label: "Patient Login", value: "patient" },
  { label: "Doctor Login", value: "doctor" },
];

export default function LoginPage() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const router = useRouter();

  const [role, setRole] = useState<Role>("patient");
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const redirectByRole = async (userId: string) => {
    const { data: doctor } = await supabase
      .from("doctors")
      .select("id")
      .eq("id", userId)
      .maybeSingle();

    if (doctor) {
      router.push("/doctor/dashboard");
      return;
    }

    const { data: patient } = await supabase
      .from("patients")
      .select("id")
      .eq("id", userId)
      .maybeSingle();

    if (patient) {
      router.push("/patient/dashboard");
    } else {
      setError("No profile found. Please sign up first.");
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);

    try {
      if (isSignUp) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (signUpError) throw signUpError;
        const userId = data.user?.id;
        if (!userId) throw new Error("Missing user id after sign up.");

        if (role === "doctor") {
          const { error: doctorInsertError } = await supabase
            .from("doctors")
            .insert({
              id: userId,
              email,
              full_name: fullName,
              specialization,
              experience_years: experienceYears
                ? Number(experienceYears)
                : null,
            });

          if (doctorInsertError) throw doctorInsertError;
          setInfo("Doctor account created. Redirecting to dashboard...");
          await redirectByRole(userId);
          return;
        }

        const { error: patientInsertError } = await supabase
          .from("patients")
          .insert({
            id: userId,
            email,
            full_name: fullName,
            phone,
          });

        if (patientInsertError) throw patientInsertError;
        setInfo("Patient account created. Redirecting to dashboard...");
        await redirectByRole(userId);
        return;
      }

      const { data, error: signInError } = await supabase.auth.signInWithPassword(
        {
          email,
          password,
        }
      );

      if (signInError) throw signInError;
      const userId = data.user?.id;
      if (!userId) throw new Error("Unable to load user after login.");

      await redirectByRole(userId);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong. Try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex max-w-4xl flex-col gap-8 px-6 py-16">
        <div className="space-y-3 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-sm font-semibold text-teal-700 ring-1 ring-inset ring-teal-200">
            <Stethoscope className="h-4 w-4" />
            QuickDoc Access
          </div>
          <h1 className="text-3xl font-semibold text-slate-900 md:text-4xl">
            Sign in or create your account
          </h1>
          <p className="text-slate-600">
            Choose your role to get the right dashboard and tools.
          </p>
        </div>

        <div className="mx-auto w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-6 grid grid-cols-2 gap-2 rounded-lg bg-slate-100 p-1">
            {tabs.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => {
                  setRole(tab.value);
                  setError(null);
                  setInfo(null);
                }}
                className={`rounded-md px-4 py-2 text-sm font-semibold transition ${
                  role === tab.value
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-700">
                  Email
                </span>
                <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 focus-within:border-teal-500">
                  <Mail className="h-4 w-4 text-slate-400" />
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-transparent text-slate-900 outline-none"
                    placeholder="you@example.com"
                  />
                </div>
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-700">
                  Password
                </span>
                <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 focus-within:border-teal-500">
                  <Lock className="h-4 w-4 text-slate-400" />
                  <input
                    required
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-transparent text-slate-900 outline-none"
                    placeholder="••••••••"
                  />
                </div>
              </label>
            </div>

            {isSignUp && (
              <div className="grid gap-4 md:grid-cols-2">
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-slate-700">
                    Full name
                  </span>
                  <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 focus-within:border-teal-500">
                    <UserRound className="h-4 w-4 text-slate-400" />
                    <input
                      required
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-transparent text-slate-900 outline-none"
                      placeholder="Alex Smith"
                    />
                  </div>
                </label>

                {role === "patient" ? (
                  <label className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-slate-700">
                      Phone
                    </span>
                    <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 focus-within:border-teal-500">
                      <Phone className="h-4 w-4 text-slate-400" />
                      <input
                        required
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-transparent text-slate-900 outline-none"
                        placeholder="+1 555 000 1234"
                      />
                    </div>
                  </label>
                ) : (
                  <label className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-slate-700">
                      Specialization
                    </span>
                    <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 focus-within:border-teal-500">
                      <GraduationCap className="h-4 w-4 text-slate-400" />
                      <input
                        required
                        type="text"
                        value={specialization}
                        onChange={(e) => setSpecialization(e.target.value)}
                        className="w-full bg-transparent text-slate-900 outline-none"
                        placeholder="Cardiology"
                      />
                    </div>
                  </label>
                )}

                {role === "doctor" && (
                  <label className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-slate-700">
                      Experience (years)
                    </span>
                    <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 focus-within:border-teal-500">
                      <Stethoscope className="h-4 w-4 text-slate-400" />
                      <input
                        type="number"
                        min={0}
                        value={experienceYears}
                        onChange={(e) => setExperienceYears(e.target.value)}
                        className="w-full bg-transparent text-slate-900 outline-none"
                        placeholder="5"
                      />
                    </div>
                  </label>
                )}
              </div>
            )}

            {error && (
              <p className="rounded-md border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </p>
            )}
            {info && (
              <p className="rounded-md border border-teal-100 bg-teal-50 px-4 py-3 text-sm text-teal-800">
                {info}
              </p>
            )}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center rounded-md bg-teal-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 disabled:opacity-70 sm:w-auto"
              >
                {loading
                  ? "Please wait..."
                  : isSignUp
                    ? `Create ${role} account`
                    : `Login as ${role}`}
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsSignUp((prev) => !prev);
                  setError(null);
                  setInfo(null);
                }}
                className="text-sm font-semibold text-teal-700 underline-offset-4 hover:underline"
              >
                {isSignUp
                  ? "Have an account? Sign in"
                  : "New here? Create an account"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

