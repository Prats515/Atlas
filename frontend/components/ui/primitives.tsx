import { ReactNode } from "react";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-zinc-200 bg-white p-6 shadow-sm ${className}`}>
      {children}
    </div>
  );
}

export function Button({ children, className = "", variant = "primary" }: { children: ReactNode; className?: string, variant?: "primary" | "secondary" }) {
  const base = "px-4 py-2 rounded-lg text-sm font-medium transition-colors";
  const variants = {
    primary: "bg-zinc-900 text-white hover:bg-zinc-800",
    secondary: "bg-zinc-100 text-zinc-900 hover:bg-zinc-200"
  };
  return <button className={`${base} ${variants[variant]} ${className}`}>{children}</button>;
}

export function Badge({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-700 ${className}`}>{children}</span>;
}
