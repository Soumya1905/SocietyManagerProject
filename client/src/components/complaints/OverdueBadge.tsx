import { AlarmClock } from "lucide-react";

export function OverdueBadge({ isOverdue, overdueDays }: { isOverdue: boolean; overdueDays: number }) {
  if (!isOverdue) return null;

  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-red-300 bg-red-600 px-2.5 py-0.5 text-xs font-semibold text-white">
      <AlarmClock className="h-3 w-3" />
      {overdueDays > 0 ? `Overdue by ${overdueDays}d` : "Overdue"}
    </span>
  );
}
