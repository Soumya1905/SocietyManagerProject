import type { ComplaintPriority } from "../../types";
import { priorityLabels } from "../../utils/format";

const styles: Record<ComplaintPriority, string> = {
  LOW: "bg-slate-100 text-slate-700 border-slate-200",
  MEDIUM: "bg-indigo-100 text-indigo-800 border-indigo-200",
  HIGH: "bg-red-100 text-red-800 border-red-200",
};

export function PriorityBadge({ priority }: { priority: ComplaintPriority }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${styles[priority]}`}
    >
      {priorityLabels[priority]}
    </span>
  );
}
