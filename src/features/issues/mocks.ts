// ВРЕМЕННЫЕ данные задач (только для features/issues). Удалить, когда подключим API.
import type { Attachment, Comment, Issue, Priority } from "@/shared/api/types";
import { labelMap, users } from "@/shared/api/mocks";

let seq = 0;
function issue(
  title: string,
  state_id: string,
  priority: Priority,
  opts: { assignee?: number; labels?: (keyof typeof labelMap)[]; due?: string; description?: string; cycle?: string; parent?: string } = {},
): Issue {
  seq += 1;
  const assignee = opts.assignee !== undefined ? users[opts.assignee] : undefined;
  return {
    id: `i${seq}`,
    project_id: "p1",
    sequence_id: seq,
    title,
    description: opts.description ?? null,
    state_id,
    priority,
    cycle_id: opts.cycle ?? null,
    parent_id: opts.parent ?? null,
    start_date: null,
    due_date: opts.due ?? null,
    sort_order: seq,
    created_at: "2026-11-20T10:00:00Z",
    updated_at: "2026-11-24T10:00:00Z",
    assignees: assignee ? [{ user_id: assignee.id, user: assignee }] : [],
    labels: (opts.labels ?? []).map((key) => ({ label: labelMap[key] })),
  };
}

export const issues: Issue[] = [
  issue("Define analytics tracking events", "s1", "low", { assignee: 1, labels: ["feature"], due: "2026-12-10T00:00:00Z" }),
  issue("Competitive audit of pricing pages", "s1", "none", { assignee: 3 }),
  issue("Revamp hero section layout", "s2", "high", { assignee: 0, labels: ["design"], due: "2026-11-28T00:00:00Z", cycle: "cy1" }),
  issue("Integrate newsletter signup form", "s2", "medium", { assignee: 2, labels: ["feature"], due: "2026-12-02T00:00:00Z" }),
  issue("Fix broken links in footer", "s2", "urgent", { assignee: 1, labels: ["bug"], due: "2026-11-27T00:00:00Z", cycle: "cy1" }),
  issue("Fix token refresh on 401", "s3", "urgent", {
    assignee: 0,
    labels: ["bug", "backend"],
    due: "2026-11-27T00:00:00Z",
    cycle: "cy1",
    description:
      "When the access token expires, several requests fail with 401 at the same time and each one tries to refresh the token.\n\nOnly one refresh request should be sent; the others should wait for it.",
  }),
  issue("Redesign onboarding checklist", "s3", "high", { assignee: 1, labels: ["design"], due: "2026-11-30T00:00:00Z", cycle: "cy1" }),
  issue("Set up Tailwind design tokens", "s4", "medium", { assignee: 3, labels: ["design"], cycle: "cy1" }),
  issue("Configure CI pipeline", "s4", "low", { assignee: 2, labels: ["backend"], cycle: "cy2" }),
  issue("Share one refresh promise in axios interceptor", "s4", "high", { assignee: 0, parent: "i6" }),
  issue("Log out when refresh fails", "s2", "medium", { assignee: 0, parent: "i6" }),
];

export const comments: Comment[] = [
  {
    id: "c1",
    issue_id: "i6",
    body: "I can reproduce it on slow 3G — three refresh calls go out at once.",
    created_at: "2026-11-25T09:15:00Z",
    updated_at: "2026-11-25T09:15:00Z",
    deleted_at: null,
    author: { id: "u2", display_name: "Sarah Chen", avatar_url: null },
  },
  {
    id: "c2",
    issue_id: "i6",
    body: "Let's keep a single refresh promise in the axios interceptor and reuse it.",
    created_at: "2026-11-25T11:40:00Z",
    updated_at: "2026-11-25T11:40:00Z",
    deleted_at: null,
    author: { id: "u1", display_name: "Alex Rivera", avatar_url: null },
  },
];


/** Какие задачи в каком модуле (в API — таблица ModuleIssue) */
export const moduleIssueIds: Record<string, string[]> = {
  m1: ["i5", "i6", "i9"],
  m2: ["i1", "i3", "i4", "i7"],
  m3: ["i9"],
};

export const attachments: Attachment[] = [
  {
    id: "a1",
    issue_id: "i6",
    file_name: "network-trace.json",
    file_size: 48_200,
    mime_type: "application/json",
    created_at: "2026-11-25T09:20:00Z",
    uploaded_by: { id: "u2", display_name: "Sarah Chen" },
  },
  {
    id: "a2",
    issue_id: "i6",
    file_name: "console-error.png",
    file_size: 420_000,
    mime_type: "image/png",
    created_at: "2026-11-25T09:22:00Z",
    uploaded_by: { id: "u2", display_name: "Sarah Chen" },
  },
];


/** История изменений задачи (GET .../issues/:issueId/activity) */
export const activity = [
  { id: "ac1", issue_id: "i6", actor: "Sarah Chen", text: "created the task", created_at: "2026-11-20T10:00:00Z" },
  { id: "ac2", issue_id: "i6", actor: "Sarah Chen", text: "set priority to Urgent", created_at: "2026-11-20T10:02:00Z" },
  { id: "ac3", issue_id: "i6", actor: "Alex Rivera", text: "changed status from Todo to In Progress", created_at: "2026-11-24T09:00:00Z" },
];
