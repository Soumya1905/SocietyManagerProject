import { Pin, Pencil, Trash2 } from "lucide-react";
import type { Notice } from "../../types";
import { formatDateTime } from "../../utils/format";
import { Card, CardBody } from "../ui/Card";

interface NoticeCardProps {
  notice: Notice;
  isAdmin?: boolean;
  onEdit?: (notice: Notice) => void;
  onDelete?: (notice: Notice) => void;
}

export function NoticeCard({ notice, isAdmin, onEdit, onDelete }: NoticeCardProps) {
  return (
    <Card className={notice.isImportant ? "border-amber-300 bg-amber-50/40" : undefined}>
      <CardBody>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2">
            {notice.isImportant && (
              <span className="mt-0.5 inline-flex items-center gap-1 rounded-full bg-amber-500 px-2 py-0.5 text-xs font-semibold text-white">
                <Pin className="h-3 w-3" /> Important
              </span>
            )}
          </div>
          {isAdmin && (
            <div className="flex gap-2">
              <button
                aria-label="Edit notice"
                onClick={() => onEdit?.(notice)}
                className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                aria-label="Delete notice"
                onClick={() => onDelete?.(notice)}
                className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
        <h3 className="mt-2 text-base font-semibold text-slate-900">{notice.title}</h3>
        <p className="mt-1 whitespace-pre-wrap text-sm text-slate-600">{notice.content}</p>
        <p className="mt-3 text-xs text-slate-400">
          {notice.authorName} · {formatDateTime(notice.createdAt)}
        </p>
      </CardBody>
    </Card>
  );
}
