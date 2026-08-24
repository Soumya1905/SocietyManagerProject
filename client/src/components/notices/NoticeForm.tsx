import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "../ui/Input";
import { Textarea } from "../ui/Textarea";
import { Button } from "../ui/Button";
import type { Notice } from "../../types";

const noticeFormSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters"),
  content: z.string().trim().min(5, "Content must be at least 5 characters"),
  isImportant: z.boolean(),
});

export type NoticeFormValues = z.infer<typeof noticeFormSchema>;

interface NoticeFormProps {
  initial?: Notice;
  onSubmit: (values: NoticeFormValues) => Promise<void>;
  onCancel: () => void;
  submitting?: boolean;
}

export function NoticeForm({ initial, onSubmit, onCancel, submitting }: NoticeFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<NoticeFormValues>({
    resolver: zodResolver(noticeFormSchema),
    defaultValues: {
      title: initial?.title ?? "",
      content: initial?.content ?? "",
      isImportant: initial?.isImportant ?? false,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <Input label="Title" error={errors.title?.message} {...register("title")} />
      <Textarea label="Content" rows={4} error={errors.content?.message} {...register("content")} />
      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input type="checkbox" className="h-4 w-4 rounded border-slate-300" {...register("isImportant")} />
        Mark as important
      </label>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={submitting}>
          {initial ? "Save Changes" : "Publish Notice"}
        </Button>
      </div>
    </form>
  );
}
