"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { isAxiosError } from "axios";
import { Button } from "@/shared/ui/button";
import { ErrorBanner, FieldError, Input, Label } from "@/shared/ui/form";
import { errorText } from "@/shared/lib/errors";
import { useLoginMutation } from "../api";
import { PasswordInput } from "./password-input";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Enter your password"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginForm = () => {
  const router = useRouter();
  const login = useLoginMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginFormData) => {
    await login.mutateAsync(data);
    router.push("/workspaces");
  };

  const apiError =
    login.error && isAxiosError(login.error) ? errorText(login.error.response?.data) : null;

  return (
    <>
      <h1 className="text-[26px] font-semibold tracking-tight">Log in</h1>
      <p className="mb-7 mt-1.5 text-muted">Welcome back. Use your work email.</p>

      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <ErrorBanner>{apiError}</ErrorBanner>

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
            autoComplete="current-password"
            invalid={!!errors.password}
            {...register("password")}
          />
          <FieldError>{errors.password?.message}</FieldError>
        </div>

        <Button
          type="submit"
          disabled={login.isPending}
          className="mt-2 h-[46px] w-full text-[15px] font-semibold"
        >
          {login.isPending ? "Logging in..." : "Log in"}
        </Button>
      </form>

      <p className="mt-6 text-center text-muted">
        New here?{" "}
        <Link
          href="/register"
          className="font-semibold text-ink underline decoration-marking decoration-2 underline-offset-[3px]"
        >
          Create an account
        </Link>
      </p>
    </>
  );
};