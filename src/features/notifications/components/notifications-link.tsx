"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { notifications } from "../mocks";

/**
 * D2.15 Колокольчик со счётчиком (слот в сайдбаре).
 * Позже: GET .../notifications раз в 30–60 с (refetchInterval), badge = unread_count из ответа.
 */
export function NotificationsLink({ workspaceSlug }: { workspaceSlug: string }) {
  const pathname = usePathname();
  const href = `/w/${workspaceSlug}/notifications`;
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2.5 rounded-md px-2 py-2 text-sm",
        pathname === href ? "bg-indigo-50 font-medium text-indigo-700" : "text-gray-700 hover:bg-gray-100",
      )}
    >
      <Bell className="size-4" />
      <span className="flex-1">Notifications</span>
      {unreadCount > 0 && (
        <span className="rounded-full bg-indigo-600 px-1.5 text-xs font-medium text-white">{unreadCount}</span>
      )}
    </Link>
  );
}
