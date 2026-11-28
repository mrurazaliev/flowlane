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
import { GoogleButton } from "./google-button";
import { useT } from "@/shared/lib/i18n";

const registerSchema = z
  .object({
    display_name: z.string().min(1, "validation.nameRequired").max(100, "validation.nameTooLong"),
    email: z.string().email("validation.email"),
    password: z.string().min(8, "validation.passwordMin"),
    confirm_password: z.string().min(1, "validation.confirmRequired"),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "validation.passwordsMismatch",
    path: ["confirm_password"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export const RegisterForm = () => {
  const t = useT();
  const router = useRouter();
  const registerUser = useRegisterMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (data: RegisterFormData) => {
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
      <h1 className="font-serif text-[40px] font-semibold leading-tight tracking-tight">{t("register.title")}</h1>
      <p className="mb-8 mt-2 text-[15px] text-muted">{t("register.subtitle")}</p>

      <form method="post" className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <ErrorBanner>{apiError}</ErrorBanner>

        <div>
          <Label htmlFor="name">{t("register.name")}</Label>
          <Input
            id="name"
            placeholder={t("register.namePlaceholder")}
            autoComplete="name"
            invalid={!!errors.display_name}
            {...register("display_name")}
          />
          <FieldError>{errors.display_name?.message && t(errors.display_name.message)}</FieldError>
        </div>

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
            autoComplete="new-password"
            invalid={!!errors.password}
            {...register("password")}
          />
          {errors.password ? (
            <FieldError>{errors.password.message && t(errors.password.message)}</FieldError>
          ) : (
            <FieldHint>{t("register.passwordHint")}</FieldHint>
          )}
        </div>

        <div>
          <Label htmlFor="confirm_password">{t("register.confirmPassword")}</Label>
          <PasswordInput
            id="confirm_password"
            autoComplete="new-password"
            invalid={!!errors.confirm_password}
            {...register("confirm_password")}
          />
          <FieldError>{errors.confirm_password?.message && t(errors.confirm_password.message)}</FieldError>
        </div>

        <Button
          type="submit"
          disabled={registerUser.isPending}
          className="mt-3 h-12 w-full rounded-[12px] text-[15px] font-semibold"
        >
          {registerUser.isPending ? t("register.submitting") : t("register.submit")}
        </Button>
      </form>

      <GoogleButton />

      <p className="mt-6 text-center text-muted">
        {t("register.haveAccount")}{" "}
        <Link
          href="/login"
          className="font-semibold text-ink underline decoration-marking decoration-2 underline-offset-[3px]"
        >
          {t("register.login")}
        </Link>
      </p>
    </>
  );
};