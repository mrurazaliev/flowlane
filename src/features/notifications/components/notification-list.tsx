"use client";

import { useState } from "react";
import { CheckCheck } from "lucide-react";
import type { NotificationType } from "@/shared/api/types";
import { Avatar } from "@/shared/ui/avatar";
import { Button } from "@/shared/ui/button";
import { EmptyState, PageHeader } from "@/shared/ui/page";
import { Tabs } from "@/shared/ui/tabs";
import { cn, formatDate } from "@/shared/lib/utils";
import { useParams, useRouter } from "next/navigation";
import { issueRefs, notifications } from "../mocks";

const texts: Record<NotificationType, string> = {
  issue_assigned: "assigned you to",
  comment_added: "commented on",
  mentioned: "mentioned you in",
};

type Filter = "all" | "unread";

/** Позже: useNotifications(slug, { read }), markRead(id), markAllRead() */
export function NotificationList() {
  const { workspaceSlug } = useParams<{ workspaceSlug: string }>();
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>("all");

  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const visible = filter === "unread" ? notifications.filter((n) => !n.is_read) : notifications;

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 md:px-7">
      <PageHeader
        title="Notifications"
        actions={
          <Button variant="secondary" disabled={unreadCount === 0}>
            <CheckCheck className="size-4" /> Mark all as read
          </Button>
        }
      />

      <Tabs
        className="mb-4"
        value={filter}
        onChange={setFilter}
        tabs={[
          { value: "all", label: "All", count: notifications.length },
          { value: "unread", label: "Unread", count: unreadCount },
        ]}
      />

      <div className="max-w-3xl">
        {visible.length === 0 ? (
          <EmptyState title="You're all caught up" description="New notifications will appear here." />
        ) : (
          <ul className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white">
            {visible.map((n) => {
              // В уведомлении есть только issue_id — название задачи берём отдельно
              const ref = n.issue_id ? issueRefs[n.issue_id] : undefined;
              return (
                <li key={n.id}>
                  <button
                    // Позже: сначала POST .../notifications/:id/read
                    onClick={() => ref && router.push(`/w/${workspaceSlug}/p/${ref.projectId}/issues/${n.issue_id}`)}
                    className={cn("flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-gray-50", !n.is_read && "bg-indigo-50/40")}>
                    <Avatar name={n.actor.display_name} size="md" />
                    <div className="flex-1 text-sm">
                      <p className="text-gray-700">
                        <span className="font-medium text-gray-900">{n.actor.display_name}</span> {texts[n.type]}{" "}
                        {ref && <span className="font-medium text-indigo-600">{ref.label}</span>}
                      </p>
                      <p className="mt-0.5 text-xs text-gray-400">{formatDate(n.created_at)}</p>
                    </div>
                    {!n.is_read && <span className="mt-2 size-2 shrink-0 rounded-full bg-indigo-600" aria-label="Unread" />}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
