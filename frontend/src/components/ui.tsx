import type { ButtonHTMLAttributes, ReactNode } from "react";

export const inputClass =
  "mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20";

export const selectClass = inputClass;

export function PageHeader({
  title,
  subtitle,
  accent = "emerald",
}: {
  title: string;
  subtitle?: string;
  accent?: "emerald" | "orange";
}) {
  return (
    <div className="mb-8">
      <p className={`text-xs font-semibold uppercase tracking-[0.16em] ${
        accent === "orange" ? "text-orange-600" : "text-emerald-700"
      }`}>
        Carnet d&apos;Échange
      </p>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">{title}</h1>
      {subtitle && <p className="mt-1.5 max-w-2xl text-sm text-slate-500">{subtitle}</p>}
    </div>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm ${className}`}>
      {children}
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center text-sm text-slate-500">
      {message}
    </div>
  );
}

export function LoadingState() {
  return <p className="py-16 text-center text-sm text-slate-400">Chargement…</p>;
}

export function PrimaryButton({
  children,
  className = "",
  variant = "emerald",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "emerald" | "orange" | "violet" | "danger" }) {
  const colors = {
    emerald: "bg-emerald-700 text-white hover:bg-emerald-800",
    orange: "bg-orange-600 text-white hover:bg-orange-700",
    violet: "bg-violet-700 text-white hover:bg-violet-800",
    danger: "border border-red-200 bg-white text-red-600 hover:bg-red-50",
  };
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:opacity-50 ${colors[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

export function Badge({
  children,
  tone = "slate",
}: {
  children: ReactNode;
  tone?: "emerald" | "slate" | "amber" | "blue" | "violet" | "orange" | "green";
}) {
  const tones = {
    emerald: "bg-emerald-50 text-emerald-800",
    slate: "bg-slate-100 text-slate-600",
    amber: "bg-amber-50 text-amber-800",
    blue: "bg-sky-50 text-sky-800",
    violet: "bg-violet-50 text-violet-800",
    orange: "bg-orange-50 text-orange-800",
    green: "bg-green-50 text-green-800",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
}
