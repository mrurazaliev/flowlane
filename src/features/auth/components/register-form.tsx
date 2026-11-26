"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { isAxiosError } from "axios";
import { Button } from "@/shared/ui/button";
import { ErrorBanner, FieldError, FieldHint, Input, Label } from "@/shared/ui/form";
import { errorText } from "@/shared/lib/errors";
import { useRegisterMutation } from "../api";
import { PasswordInput } from "./password-input";

const registerSchema = z
  .object({
    display_name: z.string().min(1, "Enter your name").max(100, "Name is too long"),
    email: z.string().email("Enter a valid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirm_password: z.string().min(1, "Repeat your password"),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords don't match",
    path: ["confirm_password"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export const RegisterForm = () => {
  const router = useRouter();
  const registerUser = useRegisterMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (data: RegisterFormData) => {
    // confirm_password нужен только для проверки в форме, на бэкенд его не отправляем
    const { confirm_password: _confirm, ...body } = data;
    await registerUser.mutateAsync(body);
    router.push("/workspaces");
  };

  const apiError =
    registerUser.error && isAxiosError(registerUser.error)
      ? errorText(registerUser.error.response?.data)
      : null;

  return (
    <>
      <h1 className="text-[26px] font-semibold tracking-tight">Create an account</h1>
      <p className="mb-7 mt-1.5 text-muted">Start organizing work with your team.</p>

      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <ErrorBanner>{apiError}</ErrorBanner>

        <div>
          <Label htmlFor="name">Your name</Label>
          <Input
            id="name"
            placeholder="Alex Rivera"
            autoComplete="name"
            invalid={!!errors.display_name}
            {...register("display_name")}
          />
          <FieldError>{errors.display_name?.message}</FieldError>
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@company.com"
            autoComplete="email"
            invalid={!!errors.email}
            {...register("email")}
          />
          <FieldError>{errors.email?.message}</FieldError>
        </div>

        <div>
          <Label htmlFor="password">Password</Label>
          <PasswordInput
            id="password"
            autoComplete="new-password"
            invalid={!!errors.password}
            {...register("password")}
          />
          {errors.password ? (
            <FieldError>{errors.password.message}</FieldError>
          ) : (
            <FieldHint>At least 8 characters</FieldHint>
          )}
        </div>

        <div>
          <Label htmlFor="confirm_password">Confirm password</Label>
          <PasswordInput
            id="confirm_password"
            autoComplete="new-password"
            invalid={!!errors.confirm_password}
            {...register("confirm_password")}
          />
          <FieldError>{errors.confirm_password?.message}</FieldError>
        </div>

        <Button
          type="submit"
          disabled={registerUser.isPending}
          className="mt-2 h-[46px] w-full text-[15px] font-semibold"
        >
          {registerUser.isPending ? "Creating account..." : "Create account"}
        </Button>
      </form>

      <p className="mt-6 text-center text-muted">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-ink underline decoration-marking decoration-2 underline-offset-[3px]"
        >
          Log in
        </Link>
      </p>
    </>
  );
};