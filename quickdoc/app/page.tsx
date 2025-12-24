import Link from "next/link";
import {
  CalendarCheck,
  Clock3,
  HeartPulse,
  Search,
  ShieldCheck,
  Stethoscope,
} from "lucide-react";

const features = [
  {
    title: "Search",
    description:
      "Browse verified doctors by specialization and years of experience.",
    icon: Search,
  },
  {
    title: "Book",
    description:
      "Pick a time, share your symptoms, and receive instant status updates.",
    icon: CalendarCheck,
  },
  {
    title: "Heal",
    description: "Track prescriptions and visit history in one place.",
    icon: HeartPulse,
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-white to-slate-50">
      <main className="mx-auto flex max-w-6xl flex-col gap-12 px-6 py-16 md:px-12">
        <section className="grid items-center gap-10 md:grid-cols-2">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-sm font-semibold text-teal-700 ring-1 ring-inset ring-teal-200">
              <Stethoscope className="h-4 w-4" />
              QuickDoc • Medical Appointments
            </span>
            <h1 className="text-4xl font-semibold leading-tight text-slate-900 md:text-5xl">
              Find your doctor and book the care you need—fast.
            </h1>
            <p className="text-lg text-slate-600">
              QuickDoc connects patients and doctors with smooth scheduling,
              instant updates, and secure follow-ups powered by Supabase.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/login"
                className="rounded-md bg-teal-600 px-5 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-teal-700"
              >
                Get Started
              </Link>
              <a
                href="#features"
                className="rounded-md px-5 py-3 text-base font-semibold text-teal-700 ring-1 ring-inset ring-teal-200 transition hover:bg-teal-50"
              >
                See how it works
              </a>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
              <span className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-teal-600" />
                Secure by design
              </span>
              <span className="flex items-center gap-2">
                <Clock3 className="h-4 w-4 text-teal-600" />
                24/7 scheduling
              </span>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
            <div className="grid grid-cols-2 gap-4 text-sm text-slate-600">
              <div className="rounded-lg border border-slate-200 p-4">
                <h3 className="flex items-center gap-2 text-base font-semibold text-slate-900">
                  <Search className="h-4 w-4 text-teal-600" />
                  Smart Search
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  Filter by specialization, experience, and availability.
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 p-4">
                <h3 className="flex items-center gap-2 text-base font-semibold text-slate-900">
                  <CalendarCheck className="h-4 w-4 text-teal-600" />
                  Instant Booking
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  Reserve slots with live status updates.
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 p-4">
                <h3 className="flex items-center gap-2 text-base font-semibold text-slate-900">
                  <HeartPulse className="h-4 w-4 text-teal-600" />
                  Ongoing Care
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  Track prescriptions and appointment history.
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 p-4">
                <h3 className="flex items-center gap-2 text-base font-semibold text-slate-900">
                  <ShieldCheck className="h-4 w-4 text-teal-600" />
                  Role-aware Access
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  Patients and doctors see tailored dashboards by design.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="grid gap-6 md:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="flex h-full flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
                <feature.icon className="h-5 w-5" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-slate-900">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-600">{feature.description}</p>
              </div>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
