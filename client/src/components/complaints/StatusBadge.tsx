import { Circle, Clock, CheckCircle2 } from "lucide-react";
import type { ComplaintStatus } from "../../types";
import { statusLabels } from "../../utils/format";

const styles: Record<ComplaintStatus, string> = {
  OPEN: "bg-amber-100 text-amber-800 border-amber-200",
  IN_PROGRESS: "bg-blue-100 text-blue-800 border-blue-200",
  RESOLVED: "bg-emerald-100 text-emerald-800 border-emerald-200",
};

const icons: Record<ComplaintStatus, typeof Circle> = {
  OPEN: Circle,
  IN_PROGRESS: Clock,
  RESOLVED: CheckCircle2,
};

export function StatusBadge({ status }: { status: ComplaintStatus }) {
  const Icon = icons[status];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${styles[status]}`}
    >
      <Icon className="h-3 w-3" />
      {statusLabels[status]}
    </span>
  );
}
