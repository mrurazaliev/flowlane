"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { isAxiosError } from "axios";
import { ArrowLeft, Check, Copy, ImageUp, Trash2 } from "lucide-react";
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

export function ProfileSettings() {
  const t = useT();
  const { data: currentUser } = useMe();

  if (!currentUser) return null;

  return (
    <div className="mx-auto max-w-2xl p-6">
      <Link href="/workspaces" className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800">
        <ArrowLeft className="size-4" /> {t("profile.back")}
      </Link>
      <PageHeader title={t("profile.title")} description={t("profile.description")} />

      <div className="max-w-2xl space-y-6">
        <PersonalInfoForm key={currentUser.id} user={currentUser} />
        <ChangePasswordForm />
      </div>
    </div>
  );
}

const personalSchema = z.object({
  display_name: z.string().trim().min(1, "validation.nameRequired").max(100, "validation.nameTooLong"),
  avatar_url: z.string(),
});

type PersonalFormData = z.infer<typeof personalSchema>;

const MAX_PHOTO_SIZE = 5 * 1024 * 1024;
const AVATAR_SIZE = 256;

const resizeToAvatar = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const side = Math.min(img.width, img.height);
      const canvas = document.createElement("canvas");
      canvas.width = AVATAR_SIZE;
      canvas.height = AVATAR_SIZE;
      canvas
        .getContext("2d")
        ?.drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, AVATAR_SIZE, AVATAR_SIZE);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.85));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read the image"));
    };
    img.src = url;
  });

const PersonalInfoForm = ({ user }: { user: User }) => {
  const t = useT();
  const editMe = useEditMeMutation();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors, isDirty },
  } = useForm<PersonalFormData>({
    resolver: zodResolver(personalSchema),
    defaultValues: { display_name: user.display_name, avatar_url: user.avatar_url ?? "" },
  });
  const [copied, setCopied] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);

  const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) return setPhotoError("validation.imageType");
    if (file.size > MAX_PHOTO_SIZE) return setPhotoError("validation.imageSize");
    try {
      const dataUrl = await resizeToAvatar(file);
      setValue("avatar_url", dataUrl, { shouldDirty: true });
      setPhotoError(null);
    } catch {
      setPhotoError("validation.imageType");
    }
  };

  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(user.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      (document.getElementById("user-id") as HTMLInputElement | null)?.select();
    }
  };

  const onSubmit = async (data: PersonalFormData) => {
    const updated = await editMe.mutateAsync({
      display_name: data.display_name,
      avatar_url: data.avatar_url || null,
    });
    reset({ display_name: updated.display_name, avatar_url: updated.avatar_url ?? "" });
  };

  const previewName = watch("display_name") || user.display_name;
  const previewAvatar = watch("avatar_url") || null;

  return (
    <form className="space-y-4 rounded-xl border border-gray-200 bg-white p-6" onSubmit={handleSubmit(onSubmit)}>
      <h2 className="text-base font-semibold text-gray-900">{t("profile.personalInfo")}</h2>
      <ErrorBanner>{apiErrorText(editMe.error)}</ErrorBanner>

      <div className="flex items-center gap-4">
        <Avatar name={previewName} src={previewAvatar} size="md" className="size-16 text-lg" />
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <label className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-line bg-white px-3 text-sm font-medium hover:bg-gray-50 focus-within:ring-[3px] focus-within:ring-marking-soft">
              <ImageUp className="size-4" />
              {previewAvatar ? t("profile.changePhoto") : t("profile.uploadPhoto")}
              <input type="file" accept="image/*" onChange={(e) => void handlePhoto(e)} className="sr-only" />
            </label>
            {previewAvatar && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setValue("avatar_url", "", { shouldDirty: true })}
                className="text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                <Trash2 className="size-4" /> {t("profile.removePhoto")}
              </Button>
            )}
          </div>
          {photoError ? <FieldError>{t(photoError)}</FieldError> : <FieldHint>{t("profile.photoHint")}</FieldHint>}
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

      <div>
        <Label htmlFor="user-id">{t("profile.userId")}</Label>
        <div className="flex gap-2">
          <Input
            id="user-id"
            value={user.id}
            readOnly
            onFocus={(e) => e.currentTarget.select()}
            className="flex-1 bg-gray-50 font-mono text-[13px] text-gray-500"
          />
          <Button type="button" variant="secondary" onClick={() => void copyId()} className="shrink-0">
            {copied ? (
              <>
                <Check className="size-4 text-[#3a9a6b]" /> {t("profile.copied")}
              </>
            ) : (
              <>
                <Copy className="size-4" /> {t("profile.copy")}
              </>
            )}
          </Button>
        </div>
        <FieldHint>{t("profile.userIdHint")}</FieldHint>
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
