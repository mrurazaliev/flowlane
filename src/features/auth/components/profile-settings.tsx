"use client";

import { Avatar } from "@/shared/ui/avatar";
import { Button } from "@/shared/ui/button";
import { FieldError, FieldHint, Input, Label } from "@/shared/ui/form";
import { PageHeader } from "@/shared/ui/page";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useT } from "@/shared/lib/i18n";
import { useMe } from "../hooks";

/** Позже: useMe(), PATCH /auth/me, POST /auth/change-password */
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
        <form className="space-y-4 rounded-xl border border-gray-200 bg-white p-6" onSubmit={(e) => e.preventDefault()}>
          <h2 className="text-base font-semibold text-gray-900">{t("profile.personalInfo")}</h2>

          <div className="flex items-center gap-4">
            <Avatar name={currentUser.display_name} src={currentUser.avatar_url} size="md" className="size-14 text-base" />
            <div className="flex-1">
              <Label htmlFor="avatar">{t("profile.avatarUrl")}</Label>
              <Input id="avatar" type="url" placeholder="https://…/photo.jpg" defaultValue={currentUser.avatar_url ?? ""} />
            </div>
          </div>

          <div>
            <Label htmlFor="display-name">{t("profile.displayName")}</Label>
            <Input id="display-name" defaultValue={currentUser.display_name} />
            <FieldError />
          </div>

          <div>
            <Label htmlFor="profile-email">{t("field.email")}</Label>
            <Input id="profile-email" value={currentUser.email} readOnly className="bg-gray-50 text-gray-500" />
          </div>

          <div className="flex justify-end">
            <Button type="submit">{t("profile.save")}</Button>
          </div>
        </form>

        <form className="space-y-4 rounded-xl border border-gray-200 bg-white p-6" onSubmit={(e) => e.preventDefault()}>
          <h2 className="text-base font-semibold text-gray-900">{t("profile.changePassword")}</h2>
          <div>
            <Label htmlFor="current-password">{t("profile.currentPassword")}</Label>
            <Input id="current-password" type="password" autoComplete="current-password" />
          </div>
          <div>
            <Label htmlFor="new-password">{t("profile.newPassword")}</Label>
            <Input id="new-password" type="password" autoComplete="new-password" />
            <FieldHint>{t("profile.newPasswordHint")}</FieldHint>
            <FieldError />
          </div>
          <div className="flex justify-end">
            <Button type="submit">{t("profile.updatePassword")}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
