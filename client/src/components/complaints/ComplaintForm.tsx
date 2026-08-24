import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Select } from "../ui/Select";
import { Textarea } from "../ui/Textarea";
import { Button } from "../ui/Button";
import { ImageUpload } from "./ImageUpload";
import { categoryLabels } from "../../utils/format";

export const complaintFormSchema = z.object({
  category: z.enum(
    ["PLUMBING", "ELECTRICAL", "SECURITY", "CLEANLINESS", "LIFT", "PARKING", "WATER_SUPPLY", "OTHER"],
    { message: "Please select a category" }
  ),
  description: z.string().trim().min(10, "Description must be at least 10 characters"),
});

export type ComplaintFormValues = z.infer<typeof complaintFormSchema>;

interface ComplaintFormProps {
  onSubmit: (values: ComplaintFormValues, photo: File | null) => Promise<void>;
  submitting?: boolean;
}

export function ComplaintForm({ onSubmit, submitting }: ComplaintFormProps) {
  const [photo, setPhoto] = useState<File | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ComplaintFormValues>({ resolver: zodResolver(complaintFormSchema) });

  return (
    <form
      onSubmit={handleSubmit((values) => onSubmit(values, photo))}
      className="flex flex-col gap-4"
      noValidate
    >
      <Select label="Category" error={errors.category?.message} {...register("category")}>
        <option value="">Select a category</option>
        {Object.entries(categoryLabels).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </Select>

      <Textarea
        label="Description"
        rows={5}
        placeholder="Describe the issue in detail..."
        error={errors.description?.message}
        {...register("description")}
      />

      <ImageUpload onChange={setPhoto} />

      <Button type="submit" loading={submitting} className="self-start">
        Submit Complaint
      </Button>
    </form>
  );
}
