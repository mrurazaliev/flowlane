
import { useQuery } from "@tanstack/react-query";
import { api } from "./client";
import { queryKeys } from "./queryKeys";
import type { Label, Project, State } from "./types";
import { projectMembers, users, workspaceMembers, workspaces } from "./mocks";

function result<T>(data: T) {
  return { data, isLoading: false as const, error: null };
}

export function useWorkspaces() {
  return result(workspaces);
}

export function useWorkspace(workspaceSlug: string) {
  return result(workspaces.find((w) => w.slug === workspaceSlug));
}
export const useProjects = (workspaceSlug: string) => {
  const query = useQuery({
    queryKey: queryKeys.projects.all(workspaceSlug),
    queryFn: async () => {
      const { data } = await api.get<Project[]>(`/workspaces/${workspaceSlug}/projects`);
      return data;
    },
  });
  return { ...query, data: query.data ?? [] };
};

export const useProject = (workspaceSlug: string, projectId: string) =>
  useQuery({
    queryKey: queryKeys.projects.detail(workspaceSlug, projectId),
    queryFn: async () => {
      const { data } = await api.get<Project>(`/workspaces/${workspaceSlug}/projects/${projectId}`);
      return data;
    },
  });

export const useStates = (workspaceSlug: string, projectId: string) => {
  const query = useQuery({
    queryKey: queryKeys.states(workspaceSlug, projectId),
    queryFn: async () => {
      const { data } = await api.get<State[]>(`/workspaces/${workspaceSlug}/projects/${projectId}/states`);
      return data;
    },
  });
  return { ...query, data: query.data ?? [] };
};

export const useLabels = (workspaceSlug: string, projectId: string) => {
  const query = useQuery({
    queryKey: queryKeys.labels(workspaceSlug, projectId),
    queryFn: async () => {
      const { data } = await api.get<Label[]>(`/workspaces/${workspaceSlug}/projects/${projectId}/labels`);
      return data;
    },
  });
  return { ...query, data: query.data ?? [] };
};

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
