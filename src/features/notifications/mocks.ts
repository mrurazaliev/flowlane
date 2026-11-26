// ВРЕМЕННЫЕ уведомления (только для features/notifications). Удалить, когда подключим API.
import type { Notification } from "@/shared/api/types";

export const notifications: Notification[] = [
  {
    id: "n1",
    workspace_id: "w1",
    type: "issue_assigned",
    issue_id: "i6",
    is_read: false,
    created_at: "2026-11-26T08:10:00Z",
    actor: { id: "u2", display_name: "Sarah Chen", avatar_url: null },
  },
  {
    id: "n2",
    workspace_id: "w1",
    type: "comment_added",
    issue_id: "i6",
    is_read: false,
    created_at: "2026-11-25T09:15:00Z",
    actor: { id: "u2", display_name: "Sarah Chen", avatar_url: null },
  },
  {
    id: "n3",
    workspace_id: "w1",
    type: "mentioned",
    issue_id: "i3",
    is_read: true,
    created_at: "2026-11-24T14:00:00Z",
    actor: { id: "u3", display_name: "Timur Karimov", avatar_url: null },
  },
];

/**
 * В уведомлении есть только issue_id. Чтобы показать "WEB-6 · Fix token…" и открыть задачу,
 * её нужно догрузить отдельно. Пока — готовые подписи и projectId.
 */
export const issueRefs: Record<string, { label: string; projectId: string }> = {
  i3: { label: "WEB-3 · Revamp hero section layout", projectId: "p1" },
  i6: { label: "WEB-6 · Fix token refresh on 401", projectId: "p1" },
};
