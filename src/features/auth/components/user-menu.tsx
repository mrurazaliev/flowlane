"use client";

import { useState } from "react";
import Link from "next/link";
import { CircleUser, LogOut } from "lucide-react";
import { Avatar } from "@/shared/ui/avatar";
import { useMe } from "../hooks";

/** Меню профиля внизу сайдбара (слот в AppShell, Dev 1) */
export function UserMenu() {
  const { data: user } = useMe();
  const [open, setOpen] = useState(false);

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
              <CircleUser className="size-4 text-muted" /> Profile
            </Link>
            {/* Позже: logout() — POST /auth/logout, очистить store, перейти на /login */}
            <Link href="/login" className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-red-600 hover:bg-red-50">
              <LogOut className="size-4" /> Log out
            </Link>
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
