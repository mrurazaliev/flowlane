// ВРЕМЕННЫЕ справочные данные. Читаются ТОЛЬКО через shared/api/lookups.ts
// (и useMe в features/auth). Когда lookups подключатся к API — файл удаляется.
import type { Label, Project, ProjectMember, State, User, Workspace, WorkspaceMember } from "./types";

export const currentUser: User = {
  id: "u1",
  email: "demo@example.com",
  display_name: "Alex Rivera",
  avatar_url: null,
};

export const users: User[] = [
  currentUser,
  { id: "u2", email: "sarah@example.com", display_name: "Sarah Chen", avatar_url: null },
  { id: "u3", email: "timur@example.com", display_name: "Timur Karimov", avatar_url: null },
  { id: "u4", email: "elena@example.com", display_name: "Elena Rostova", avatar_url: null },
];

export const members = users;


export const workspaces: Workspace[] = [
  { id: "w1", name: "Demo Workspace", slug: "demo", owner_id: "u1", created_at: "2026-11-01T00:00:00Z" },
  { id: "w2", name: "Design Lab", slug: "design-lab", owner_id: "u2", created_at: "2026-11-05T00:00:00Z" },
];

export const projects: Project[] = [
  { id: "p1", workspace_id: "w1", name: "Website", identifier: "WEB", description: "Marketing site and landing pages", lead_id: "u1", is_archived: false },
  { id: "p2", workspace_id: "w1", name: "Mobile App", identifier: "MOB", description: "iOS & Android client", lead_id: "u2", is_archived: false },
  { id: "p3", workspace_id: "w1", name: "Design System", identifier: "DS", description: null, lead_id: null, is_archived: false },
];

/** Цвет точки проекта в сайдбаре (в API цвета у проекта нет — берём по индексу) */
export const projectColors = ["#4F46E5", "#10B981", "#F59E0B", "#EF4444", "#06B6D4"];

// Статусы по умолчанию — такие бэкенд создаёт для нового проекта
export const states: State[] = [
  { id: "s1", project_id: "p1", name: "Backlog", color: "#9CA3AF", group: "backlog", order: 0, is_default: false },
  { id: "s2", project_id: "p1", name: "Todo", color: "#6B7280", group: "unstarted", order: 1, is_default: true },
  { id: "s3", project_id: "p1", name: "In Progress", color: "#F59E0B", group: "started", order: 2, is_default: false },
  { id: "s4", project_id: "p1", name: "Done", color: "#10B981", group: "completed", order: 3, is_default: false },
  { id: "s5", project_id: "p1", name: "Cancelled", color: "#EF4444", group: "cancelled", order: 4, is_default: false },
];

export const labelMap: Record<string, Label> = {
  bug: { id: "l1", name: "Bug", color: "#EF4444" },
  feature: { id: "l2", name: "Feature", color: "#4F46E5" },
  design: { id: "l3", name: "Design", color: "#EC4899" },
  backend: { id: "l4", name: "Backend", color: "#10B981" },
};

export const labels: Label[] = Object.values(labelMap);

export const workspaceMembers: WorkspaceMember[] = [
  { workspace_id: "w1", user_id: "u1", role: "owner", user: users[0] },
  { workspace_id: "w1", user_id: "u2", role: "admin", user: users[1] },
  { workspace_id: "w1", user_id: "u3", role: "member", user: users[2] },
  { workspace_id: "w1", user_id: "u4", role: "guest", user: users[3] },
];

export const projectMembers: ProjectMember[] = [
  { project_id: "p1", user_id: "u1", role: "admin", user: users[0] },
  { project_id: "p1", user_id: "u2", role: "member", user: users[1] },
  { project_id: "p1", user_id: "u3", role: "viewer", user: users[2] },
];

