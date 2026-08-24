import { CheckCircle2, Circle, Clock } from "lucide-react";
import type { ComplaintHistoryEntry } from "../../types";
import { statusLabels } from "../../utils/format";
import { formatDateTime } from "../../utils/format";

const icons = {
  OPEN: Circle,
  IN_PROGRESS: Clock,
  RESOLVED: CheckCircle2,
} as const;

export function ComplaintTimeline({ history }: { history: ComplaintHistoryEntry[] }) {
  if (history.length === 0) return null;

  return (
    <ol className="relative border-l border-slate-200 pl-6" data-testid="complaint-timeline">
      {history.map((entry, index) => {
        const Icon = icons[entry.newStatus];
        const isFirst = index === 0;
        return (
          <li key={entry.id} className="mb-6 last:mb-0">
            <span className="absolute -left-[9px] flex h-4 w-4 items-center justify-center rounded-full bg-brand-600">
              <Icon className="h-2.5 w-2.5 text-white" />
            </span>
            <p className="text-sm font-semibold text-slate-900">
              {isFirst ? "Complaint Created" : "Status Updated"}
            </p>
            <p className="text-sm text-slate-600">
              {entry.previousStatus ? (
                <>
                  {statusLabels[entry.previousStatus]} → {statusLabels[entry.newStatus]}
                </>
              ) : (
                <>Status: {statusLabels[entry.newStatus]}</>
              )}
            </p>
            <p className="text-xs text-slate-500">
              Actor: {entry.actorName} ({entry.actorRole === "ADMIN" ? "Admin" : "Resident"})
            </p>
            {entry.note && <p className="mt-1 text-sm italic text-slate-600">Note: {entry.note}</p>}
            <p className="mt-1 text-xs text-slate-400">{formatDateTime(entry.createdAt)}</p>
          </li>
        );
      })}
    </ol>
  );
}
