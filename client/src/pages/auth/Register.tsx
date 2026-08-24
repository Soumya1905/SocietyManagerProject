import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { extractErrorMessage } from "../../services/api";

const registerSchema = z.object({
  fullName: z.string().trim().min(2, "Full name must be at least 2 characters"),
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  apartmentNumber: z.string().trim().min(1, "Apartment number is required"),
});

type RegisterValues = z.infer<typeof registerSchema>;

export default function Register() {
  const { register: registerUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterValues>({ resolver: zodResolver(registerSchema) });

  async function onSubmit(values: RegisterValues) {
    setSubmitting(true);
    try {
      await registerUser(values);
      showToast("Account created successfully");
      navigate("/resident/dashboard");
    } catch (err) {
      showToast(extractErrorMessage(err), "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-900">Create your account</h1>
      <p className="mt-1 text-sm text-slate-500">Register as a resident to raise and track complaints.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 flex flex-col gap-4" noValidate>
        <Input label="Full Name" error={errors.fullName?.message} {...register("fullName")} />
        <Input label="Email" type="email" error={errors.email?.message} {...register("email")} />
        <Input label="Apartment Number" error={errors.apartmentNumber?.message} {...register("apartmentNumber")} />
        <Input
          label="Password"
          type="password"
          error={errors.password?.message}
          {...register("password")}
        />
        <Button type="submit" loading={submitting} className="mt-2 w-full">
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link to="/login" className="font-medium text-brand-600 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
