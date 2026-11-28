export type Priority = "urgent" | "high" | "medium" | "low" | "none";
export type StateGroup = "backlog" | "unstarted" | "started" | "completed" | "cancelled";
export type WorkspaceRole = "owner" | "admin" | "member" | "guest";
export type ProjectRole = "admin" | "member" | "viewer";
export type ModuleStatus = "backlog" | "in_progress" | "paused" | "completed" | "cancelled";
export type CycleStatus = "upcoming" | "active" | "completed";
export type NotificationType = "issue_assigned" | "comment_added" | "mentioned";

export interface User {
  id: string;
  email: string;
  display_name: string;
  avatar_url: string | null;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
  created_at: string;
}

export interface WorkspaceMember {
  workspace_id: string;
  user_id: string;
  role: WorkspaceRole;
  user: User;
}

export interface Project {
  id: string;
  workspace_id: string;
  name: string;
  identifier: string;
  description: string | null;
  lead_id: string | null;
  is_archived: boolean;
}

export interface State {
  id: string;
  project_id: string;
  name: string;
  color: string;
  group: StateGroup;
  order: number;
  is_default: boolean;
}

export interface Label {
  id: string;
  name: string;
  color: string;
}

export interface Issue {
  id: string;
  project_id: string;
  sequence_id: number;
  title: string;
  description: string | null;
  state_id: string;
  priority: Priority;
  cycle_id: string | null;
  parent_id: string | null;
  start_date: string | null;
  due_date: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
  assignees: { user_id: string; user: User }[];
  labels: { label: Label }[];
}

export interface Comment {
  id: string;
  issue_id: string;
  body: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  author: Pick<User, "id" | "display_name" | "avatar_url">;
}

export interface ProjectMember {
  project_id: string;
  user_id: string;
  role: ProjectRole;
  user: User;
}

export interface Progress {
  total: number;
  backlog: number;
  unstarted: number;
  started: number;
  completed: number;
  cancelled: number;
  completion_percentage: number;
}

export interface Cycle {
  id: string;
  project_id: string;
  name: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  status: CycleStatus;
  progress?: Progress;
}

export interface Module {
  id: string;
  project_id: string;
  name: string;
  description: string | null;
  status: ModuleStatus;
  lead_id: string | null;
  start_date: string | null;
  target_date: string | null;
  progress?: Progress;
}

export interface Notification {
  id: string;
  workspace_id: string;
  type: NotificationType;
  issue_id: string | null;
  is_read: boolean;
  created_at: string;
  actor: Pick<User, "id" | "display_name" | "avatar_url">;
}
