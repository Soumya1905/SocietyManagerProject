import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { NoticeCard } from "../../components/notices/NoticeCard";
import { NoticeForm, type NoticeFormValues } from "../../components/notices/NoticeForm";
import { LoadingState } from "../../components/LoadingState";
import { ErrorState } from "../../components/ErrorState";
import { EmptyState } from "../../components/EmptyState";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import * as noticeService from "../../services/noticeService";
import type { Notice } from "../../types";
import { extractErrorMessage } from "../../services/api";
import { useToast } from "../../context/ToastContext";

export default function NoticeManagement() {
  const { showToast } = useToast();
  const [notices, setNotices] = useState<Notice[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Notice | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Notice | null>(null);
  const [deleting, setDeleting] = useState(false);

  function load() {
    setLoading(true);
    setError(null);
    noticeService
      .listNotices()
      .then(setNotices)
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(notice: Notice) {
    setEditing(notice);
    setFormOpen(true);
  }

  async function handleSubmit(values: NoticeFormValues) {
    setSubmitting(true);
    try {
      if (editing) {
        await noticeService.updateNotice(editing.id, values);
        showToast("Notice updated");
      } else {
        await noticeService.createNotice(values);
        showToast("Notice published");
      }
      setFormOpen(false);
      load();
    } catch (err) {
      showToast(extractErrorMessage(err), "error");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await noticeService.deleteNotice(deleteTarget.id);
      showToast("Notice deleted");
      setDeleteTarget(null);
      load();
    } catch (err) {
      showToast(extractErrorMessage(err), "error");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-slate-900">Notice Management</h1>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" /> New Notice
        </Button>
      </div>

      {loading && <LoadingState />}
      {!loading && error && <ErrorState message={error} onRetry={load} />}
      {!loading && !error && notices && notices.length === 0 && (
        <EmptyState title="No notices yet" description="Publish your first notice to residents." />
      )}
      {!loading && !error && notices && notices.length > 0 && (
        <div className="flex flex-col gap-3">
          {notices.map((n) => (
            <NoticeCard key={n.id} notice={n} isAdmin onEdit={openEdit} onDelete={setDeleteTarget} />
          ))}
        </div>
      )}

      <Modal open={formOpen} title={editing ? "Edit Notice" : "New Notice"} onClose={() => setFormOpen(false)}>
        <NoticeForm
          initial={editing ?? undefined}
          onSubmit={handleSubmit}
          onCancel={() => setFormOpen(false)}
          submitting={submitting}
        />
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete this notice?"
        description={`"${deleteTarget?.title}" will be permanently removed from the notice board.`}
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
