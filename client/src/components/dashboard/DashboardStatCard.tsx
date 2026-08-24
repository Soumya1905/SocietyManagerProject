import type { LucideIcon } from "lucide-react";
import clsx from "clsx";

interface DashboardStatCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  tone?: "default" | "warning" | "danger" | "success";
}

const toneClasses: Record<NonNullable<DashboardStatCardProps["tone"]>, string> = {
  default: "bg-brand-50 text-brand-600",
  warning: "bg-amber-50 text-amber-600",
  danger: "bg-red-50 text-red-600",
  success: "bg-emerald-50 text-emerald-600",
};

export function DashboardStatCard({ label, value, icon: Icon, tone = "default" }: DashboardStatCardProps) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className={clsx("rounded-lg p-3", toneClasses[tone])}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-2xl font-semibold text-slate-900">{value}</p>
        <p className="text-sm text-slate-500">{label}</p>
      </div>
    </div>
  );
}
