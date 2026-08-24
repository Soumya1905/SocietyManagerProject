import { useEffect, useState } from "react";
import { NoticeCard } from "../../components/notices/NoticeCard";
import { LoadingState } from "../../components/LoadingState";
import { ErrorState } from "../../components/ErrorState";
import { EmptyState } from "../../components/EmptyState";
import { listNotices } from "../../services/noticeService";
import type { Notice } from "../../types";
import { extractErrorMessage } from "../../services/api";

export default function ResidentNotices() {
  const [notices, setNotices] = useState<Notice[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    setError(null);
    listNotices()
      .then(setNotices)
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-slate-900">Notice Board</h1>

      {loading && <LoadingState />}
      {!loading && error && <ErrorState message={error} onRetry={load} />}
      {!loading && !error && notices && notices.length === 0 && (
        <EmptyState title="No notices yet" description="Check back later for society announcements." />
      )}
      {!loading && !error && notices && notices.length > 0 && (
        <div className="flex flex-col gap-3">
          {notices.map((n) => (
            <NoticeCard key={n.id} notice={n} />
          ))}
        </div>
      )}
    </div>
  );
}
