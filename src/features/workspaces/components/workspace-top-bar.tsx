"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell } from "lucide-react";
import { useNotificationCount } from "@/features/notifications/api";
import { cn } from "@/shared/lib/utils";
import { useT } from "@/shared/lib/i18n";
import { useWorkspace } from "../api";

export function WorkspaceTopBar({ workspaceSlug }: { workspaceSlug: string }) {
  const t = useT();
  const pathname = usePathname();
  const { data: workspace } = useWorkspace(workspaceSlug);
  const { data: unreadCount = 0 } = useNotificationCount(workspaceSlug);

  const notificationsHref = `/w/${workspaceSlug}/notifications`;

  return (
    <div className="hidden h-[60px] shrink-0 items-center gap-4 border-b border-line px-7 md:flex">
      <p className="truncate text-[14px] text-muted">{workspace?.name ?? workspaceSlug}</p>

      <div className="ml-auto flex items-center gap-3">
        <Link
          href={notificationsHref}
          aria-label={t("Notifications")}
          className={cn(
            "relative grid size-10 place-items-center rounded-[12px] text-ink-2 transition-colors hover:bg-white hover:text-ink",
            pathname === notificationsHref && "bg-white text-ink",
          )}
        >
          <Bell className="size-[18px]" />
          {unreadCount > 0 && (
            <span className="absolute right-1.5 top-1.5 min-w-4 rounded-full bg-marking px-1 text-center text-[10px] font-bold leading-4 text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Link>
      </div>
    </div>
  );
}
