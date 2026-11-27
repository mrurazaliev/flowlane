"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CircleUser, LogOut } from "lucide-react";
import { Avatar } from "@/shared/ui/avatar";
import { ThemeToggle } from "@/shared/ui/theme-toggle";
import { LanguageSwitcher } from "@/shared/ui/language-switcher";
import { useT } from "@/shared/lib/i18n";
import { useMe } from "../hooks";
import { useLogoutMutation } from "../api";

/** Меню профиля внизу сайдбара (слот в AppShell, Dev 1) */
export function UserMenu() {
  const t = useT();
  const { data: user } = useMe();
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const logout = useLogoutMutation();

  if (!user) return null; // ← после ВСЕХ хуков

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSettled: () => router.push("/login"),
    });
  };

  return (
    <div className="relative">
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute bottom-full left-0 z-20 mb-2 w-full rounded-xl border border-line bg-white p-1.5 text-ink shadow-[0_16px_36px_-12px_rgba(30,34,42,.4)]">
            <Link
              href="/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm hover:bg-gray-100"
            >
              <CircleUser className="size-4 text-muted" /> {t("menu.profile")}
            </Link>

            <ThemeToggle withLabel />

            <div className="flex items-center justify-between px-2.5 py-1.5 text-sm">
              <span className="text-muted">{t("common.language")}</span>
              <LanguageSwitcher />
            </div>

            <div className="my-1 border-t border-line-soft" />

            <button
              onClick={handleLogout}
              disabled={logout.isPending}
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              <LogOut className="size-4" /> {logout.isPending ? t("menu.loggingOut") : t("menu.logout")}
            </button>
          </div>
        </>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left hover:bg-asphalt-2"
      >
        <Avatar name={user.display_name} src={user.avatar_url} size="md" />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm text-white">{user.display_name}</span>
          <span className="block truncate text-xs text-[#8c93a0]">{user.email}</span>
        </span>
      </button>
    </div>
  );
}
