// SHARED (F1.4): справочные данные, которые нужны обоим разработчикам.
// Массивы возвращаются пустыми ([]), пока данные грузятся, — компоненты могут сразу делать .map/.filter.
import { useQuery } from "@tanstack/react-query";
import { api } from "./client";
import { queryKeys } from "./queryKeys";
import type { Label, Project, ProjectMember, State, Workspace, WorkspaceMember } from "./types";

// ---------- Workspaces ----------
export const useWorkspaces = () => {
  const query = useQuery({
    queryKey: queryKeys.workspaces.all,
    queryFn: async () => {
      const { data } = await api.get<Workspace[]>("/workspaces/");
      return data;
    },
  });
  return { ...query, data: query.data ?? [] };
};

export const useWorkspace = (workspaceSlug: string) =>
  useQuery({
    queryKey: queryKeys.workspaces.detail(workspaceSlug),
    queryFn: async () => {
      const { data } = await api.get<Workspace>(`/workspaces/${workspaceSlug}`);
      return data;
    },
  });

// ---------- Projects ----------
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

// ---------- States & labels ----------
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

// ---------- Members ----------
export const useWorkspaceMembers = (workspaceSlug: string) => {
  const query = useQuery({
    queryKey: queryKeys.workspaces.members(workspaceSlug),
    queryFn: async () => {
      const { data } = await api.get<WorkspaceMember[]>(`/workspaces/${workspaceSlug}/members`);
      return data;
    },
  });
  return { ...query, data: query.data ?? [] };
};

/** Просто пользователи workspace — для выпадающих списков «Assignee», «Lead» */
export const useMemberUsers = (workspaceSlug: string) => {
  const { data: members, ...rest } = useWorkspaceMembers(workspaceSlug);
  return { ...rest, data: members.map((m) => m.user) };
};

export const useProjectMembers = (workspaceSlug: string, projectId: string) => {
  const query = useQuery({
    queryKey: queryKeys.projects.members(workspaceSlug, projectId),
    queryFn: async () => {
      const { data } = await api.get<ProjectMember[]>(`/workspaces/${workspaceSlug}/projects/${projectId}/members`);
      return data;
    },
  });
  return { ...query, data: query.data ?? [] };
};

/** Цвет точки проекта (в API у проекта нет цвета — берём по порядку) */
const projectColors = ["#4F46E5", "#10B981", "#F59E0B", "#EF4444", "#06B6D4"];
export const projectColor = (index: number) => projectColors[index % projectColors.length];