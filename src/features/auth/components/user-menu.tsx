"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronsUpDown, CircleUser, LogOut } from "lucide-react";
import { Avatar } from "@/shared/ui/avatar";
import { useMe } from "../hooks";

/** Меню профиля внизу сайдбара (слот в shared/layout, делает Dev 1) */
export function UserMenu() {
  const { data: user } = useMe();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      {open && (
        <>
          {/* клик вне меню — закрыть */}
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute bottom-full left-0 z-20 mb-2 w-full rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
            <div className="border-b border-gray-100 px-3 py-2">
              <p className="text-sm font-medium text-gray-900">{user.display_name}</p>
              <p className="truncate text-xs text-gray-500">{user.email}</p>
            </div>
            <Link
              href="/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <CircleUser className="size-4" /> Profile
            </Link>
            {/* Позже: вызов logout() вместо простой ссылки */}
            <Link
              href="/login"
              className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              <LogOut className="size-4" /> Log out
            </Link>
          </div>
        </>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left hover:bg-gray-100"
      >
        <Avatar name={user.display_name} src={user.avatar_url} size="md" />
        <span className="flex-1 truncate text-sm font-medium text-gray-800">{user.display_name}</span>
        <ChevronsUpDown className="size-4 text-gray-400" />
      </button>
    </div>
  );
}
