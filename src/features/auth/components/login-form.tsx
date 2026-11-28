"use client";

import { useEffect, useState } from "react";
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
import { useT } from "@/shared/lib/i18n";

const loginSchema = z.object({
  email: z.string().email("validation.email"),
  password: z.string().min(1, "validation.passwordRequired"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginForm = () => {
  const t = useT();
  const router = useRouter();
  const login = useLoginMutation();
  const [notice, setNotice] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("password-changed")) {
      sessionStorage.removeItem("password-changed");
      setNotice(true);
    }
  }, []);

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
      <h1 className="font-serif text-[40px] font-semibold leading-tight tracking-tight">{t("login.title")}</h1>
      <p className="mb-8 mt-2 text-[15px] text-muted">{t("login.subtitle")}</p>

      <form method="post" className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        {notice && (
          <p role="status" className="rounded-[12px] border border-sage/30 bg-sage/10 px-3.5 py-2.5 text-sm text-[#3f6b50] dark:text-[#8fc0a0]">
            {t("login.passwordChanged")}
          </p>
        )}
        <ErrorBanner>{apiError}</ErrorBanner>

        <div>
          <Label htmlFor="email">{t("field.email")}</Label>
          <Input
            id="email"
            type="email"
            placeholder={t("field.emailPlaceholder")}
            autoComplete="email"
            invalid={!!errors.email}
            {...register("email")}
          />
          <FieldError>{errors.email?.message && t(errors.email.message)}</FieldError>
        </div>

        <div>
          <Label htmlFor="password">{t("field.password")}</Label>
          <PasswordInput
            id="password"
            autoComplete="current-password"
            invalid={!!errors.password}
            {...register("password")}
          />
          <FieldError>{errors.password?.message && t(errors.password.message)}</FieldError>
        </div>

        <Button
          type="submit"
          disabled={login.isPending}
          className="mt-3 h-12 w-full rounded-[12px] text-[15px] font-semibold"
        >
          {login.isPending ? t("login.submitting") : t("login.submit")}
        </Button>
      </form>

      <p className="mt-6 text-center text-muted">
        {t("login.noAccount")}{" "}
        <Link
          href="/register"
          className="font-semibold text-ink underline decoration-marking decoration-2 underline-offset-[3px]"
        >
          {t("login.createAccount")}
        </Link>
      </p>
    </>
  );
};