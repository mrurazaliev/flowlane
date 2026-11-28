"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import { Bell, Search } from "lucide-react";
import { useNotificationCount } from "@/features/notifications/api";
import { cn } from "@/shared/lib/utils";
import { useT } from "@/shared/lib/i18n";
import { useWorkspace } from "../api";

export function WorkspaceTopBar({ workspaceSlug }: { workspaceSlug: string }) {
  const t = useT();
  const router = useRouter();
  const pathname = usePathname();
  const { projectId } = useParams<{ projectId?: string }>();
  const { data: workspace } = useWorkspace(workspaceSlug);
  const { data: unreadCount = 0 } = useNotificationCount(workspaceSlug);
  const [query, setQuery] = useState("");

  const notificationsHref = `/w/${workspaceSlug}/notifications`;
  const projectBase = projectId ? `/w/${workspaceSlug}/p/${projectId}` : null;

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!projectBase) return;
    const view = pathname.startsWith(`${projectBase}/board`) ? "board" : "issues";
    const text = query.trim();
    router.push(text ? `${projectBase}/${view}?q=${encodeURIComponent(text)}` : `${projectBase}/${view}`);
  };

  return (
    <div className="hidden h-[60px] shrink-0 items-center gap-4 border-b border-line px-7 md:flex">
      <p className="truncate text-[14px] text-muted">{workspace?.name ?? workspaceSlug}</p>

      <div className="ml-auto flex items-center gap-3">
        {projectBase && (
          <form role="search" onSubmit={submit}>
            <label className="flex h-10 w-72 items-center gap-2 rounded-[12px] border border-line bg-white px-3 text-faint focus-within:border-ink focus-within:ring-[3px] focus-within:ring-marking-soft lg:w-80">
              <Search className="size-4 shrink-0" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("Search tasks")}
                aria-label={t("Search tasks")}
                className="w-full bg-transparent text-ink outline-none placeholder:text-faint"
              />
              <kbd className="font-id rounded border border-line px-1.5 text-[11px] text-faint">Enter</kbd>
            </label>
          </form>
        )}

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
