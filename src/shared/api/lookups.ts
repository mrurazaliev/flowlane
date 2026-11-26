// SHARED (F1.4): справочные данные, которые нужны обоим разработчикам.
// Сейчас возвращают моки в форме, похожей на useQuery ({ data, isLoading }).
// Позже каждая функция станет useQuery({ queryKey: queryKeys..., queryFn: ... }),
// а компоненты менять не придётся.
import { labels, projectMembers, projects, states, users, workspaceMembers, workspaces } from "./mocks";

function result<T>(data: T) {
  return { data, isLoading: false as const, error: null };
}

export function useWorkspaces() {
  return result(workspaces);
}

export function useWorkspace(workspaceSlug: string) {
  return result(workspaces.find((w) => w.slug === workspaceSlug));
}

export function useProjects(workspaceSlug: string) {
  const workspace = workspaces.find((w) => w.slug === workspaceSlug);
  return result(projects.filter((p) => p.workspace_id === workspace?.id));
}

export function useProject(workspaceSlug: string, projectId: string) {
  void workspaceSlug;
  return result(projects.find((p) => p.id === projectId));
}

export function useStates(workspaceSlug: string, projectId: string) {
  void workspaceSlug;
  void projectId;
  return result([...states].sort((a, b) => a.order - b.order));
}

export function useLabels(workspaceSlug: string, projectId: string) {
  void workspaceSlug;
  void projectId;
  return result(labels);
}

export function useWorkspaceMembers(workspaceSlug: string) {
  void workspaceSlug;
  return result(workspaceMembers);
}

/** Удобный вариант: просто пользователи workspace (для select «Assignee», «Lead») */
export function useMemberUsers(workspaceSlug: string) {
  void workspaceSlug;
  return result(users);
}

export function useProjectMembers(workspaceSlug: string, projectId: string) {
  void workspaceSlug;
  return result(projectMembers.filter((m) => m.project_id === projectId));
}

/** Цвет точки проекта (в API у проекта нет цвета — берём по порядку) */
const projectColors = ["#4F46E5", "#10B981", "#F59E0B", "#EF4444", "#06B6D4"];
export function projectColor(index: number) {
  return projectColors[index % projectColors.length];
}
