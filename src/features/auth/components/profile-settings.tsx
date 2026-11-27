"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { isAxiosError } from "axios";
import { ArrowLeft, Check } from "lucide-react";
import type { User } from "@/shared/api/types";
import { errorText } from "@/shared/lib/errors";
import { useT } from "@/shared/lib/i18n";
import { Avatar } from "@/shared/ui/avatar";
import { Button } from "@/shared/ui/button";
import { ErrorBanner, FieldError, FieldHint, Input, Label } from "@/shared/ui/form";
import { PageHeader } from "@/shared/ui/page";
import { useChangePasswordMutation, useEditMeMutation } from "../api";
import { useMe } from "../hooks";
import { PasswordInput } from "./password-input";

const apiErrorText = (error: unknown) =>
  error && isAxiosError(error) ? errorText(error.response?.data) : null;

/** D1.3 Профиль: имя и аватар (PATCH /auth/me) + смена пароля (POST /auth/change-password) */
export function ProfileSettings() {
  const t = useT();
  const { data: currentUser } = useMe();

  if (!currentUser) return null; // пользователь ещё грузится с бэкенда

  return (
    <div className="mx-auto max-w-2xl p-6">
      <Link href="/workspaces" className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800">
        <ArrowLeft className="size-4" /> {t("profile.back")}
      </Link>
      <PageHeader title={t("profile.title")} description={t("profile.description")} />

      <div className="max-w-2xl space-y-6">
        {/* key: если данные пользователя пришли заново — форма начнётся с них */}
        <PersonalInfoForm key={currentUser.id} user={currentUser} />
        <ChangePasswordForm />
      </div>
    </div>
  );
}

// ---------- Личные данные ----------

const personalSchema = z.object({
  display_name: z.string().trim().min(1, "validation.nameRequired").max(100, "validation.nameTooLong"),
  avatar_url: z.union([z.literal(""), z.string().trim().url("validation.avatarUrl")]),
});

type PersonalFormData = z.infer<typeof personalSchema>;

const PersonalInfoForm = ({ user }: { user: User }) => {
  const t = useT();
  const editMe = useEditMeMutation();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isDirty },
  } = useForm<PersonalFormData>({
    resolver: zodResolver(personalSchema),
    defaultValues: { display_name: user.display_name, avatar_url: user.avatar_url ?? "" },
  });

  const onSubmit = async (data: PersonalFormData) => {
    const updated = await editMe.mutateAsync({
      display_name: data.display_name,
      avatar_url: data.avatar_url || null, // пустое поле → убрать аватар
    });
    // Новые значения становятся «исходными» — кнопка снова неактивна, пока не изменишь
    reset({ display_name: updated.display_name, avatar_url: updated.avatar_url ?? "" });
  };

  // Превью аватара меняется сразу, пока печатаешь
  const previewName = watch("display_name") || user.display_name;
  const previewAvatar = watch("avatar_url") || null;

  return (
    <form className="space-y-4 rounded-xl border border-gray-200 bg-white p-6" onSubmit={handleSubmit(onSubmit)}>
      <h2 className="text-base font-semibold text-gray-900">{t("profile.personalInfo")}</h2>
      <ErrorBanner>{apiErrorText(editMe.error)}</ErrorBanner>

      <div className="flex items-start gap-4">
        <Avatar name={previewName} src={previewAvatar} size="md" className="size-14 text-base" />
        <div className="flex-1">
          <Label htmlFor="avatar">{t("profile.avatarUrl")}</Label>
          <Input
            id="avatar"
            type="url"
            placeholder="https://…/photo.jpg"
            invalid={!!errors.avatar_url}
            {...register("avatar_url")}
          />
          <FieldError>{errors.avatar_url?.message && t(errors.avatar_url.message)}</FieldError>
        </div>
      </div>

      <div>
        <Label htmlFor="display-name">{t("profile.displayName")}</Label>
        <Input id="display-name" invalid={!!errors.display_name} {...register("display_name")} />
        <FieldError>{errors.display_name?.message && t(errors.display_name.message)}</FieldError>
      </div>

      <div>
        <Label htmlFor="profile-email">{t("field.email")}</Label>
        <Input id="profile-email" value={user.email} readOnly className="bg-gray-50 text-gray-500" />
      </div>

      <div className="flex items-center justify-end gap-3">
        {editMe.isSuccess && !isDirty && (
          <span className="flex items-center gap-1.5 text-sm text-[#3a9a6b]" role="status">
            <Check className="size-4" /> {t("profile.saved")}
          </span>
        )}
        <Button type="submit" disabled={!isDirty || editMe.isPending}>
          {editMe.isPending ? t("profile.saving") : t("profile.save")}
        </Button>
      </div>
    </form>
  );
};

// ---------- Смена пароля ----------

const passwordSchema = z
  .object({
    current_password: z.string().min(1, "validation.currentPasswordRequired"),
    new_password: z.string().min(8, "validation.passwordMin"),
    confirm_password: z.string().min(1, "validation.confirmRequired"),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "validation.passwordsMismatch",
    path: ["confirm_password"],
  });

type PasswordFormData = z.infer<typeof passwordSchema>;

const ChangePasswordForm = () => {
  const t = useT();
  const router = useRouter();
  const changePassword = useChangePasswordMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PasswordFormData>({ resolver: zodResolver(passwordSchema) });

  const onSubmit = async (data: PasswordFormData) => {
    await changePassword.mutateAsync({
      current_password: data.current_password,
      new_password: data.new_password,
    });
    // Токены уже удалены в хуке. Оставляем записку для страницы логина и уходим туда
    sessionStorage.setItem("password-changed", "1");
    router.replace("/login");
  };

  return (
    <form className="space-y-4 rounded-xl border border-gray-200 bg-white p-6" onSubmit={handleSubmit(onSubmit)}>
      <h2 className="text-base font-semibold text-gray-900">{t("profile.changePassword")}</h2>
      <ErrorBanner>{apiErrorText(changePassword.error)}</ErrorBanner>

      <div>
        <Label htmlFor="current-password">{t("profile.currentPassword")}</Label>
        <PasswordInput
          id="current-password"
          autoComplete="current-password"
          invalid={!!errors.current_password}
          {...register("current_password")}
        />
        <FieldError>{errors.current_password?.message && t(errors.current_password.message)}</FieldError>
      </div>

      <div>
        <Label htmlFor="new-password">{t("profile.newPassword")}</Label>
        <PasswordInput
          id="new-password"
          autoComplete="new-password"
          invalid={!!errors.new_password}
          {...register("new_password")}
        />
        {errors.new_password?.message ? (
          <FieldError>{t(errors.new_password.message)}</FieldError>
        ) : (
          <FieldHint>{t("profile.newPasswordHint")}</FieldHint>
        )}
      </div>

      <div>
        <Label htmlFor="confirm-new-password">{t("profile.confirmPassword")}</Label>
        <PasswordInput
          id="confirm-new-password"
          autoComplete="new-password"
          invalid={!!errors.confirm_password}
          {...register("confirm_password")}
        />
        <FieldError>{errors.confirm_password?.message && t(errors.confirm_password.message)}</FieldError>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={changePassword.isPending}>
          {changePassword.isPending ? t("profile.updating") : t("profile.updatePassword")}
        </Button>
      </div>
    </form>
  );
};
