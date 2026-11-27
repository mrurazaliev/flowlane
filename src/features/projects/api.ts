import { useMutation, useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";
import { api } from "@/shared/api/client";
import { queryKeys } from "@/shared/api/queryKeys";
import type { Project, ProjectMember } from "@/shared/api/types";

type CreateProjectInput = Pick<Project, "name" | "identifier"> & { description?: string; lead_id?: string };
type UpdateProjectInput = Partial<Pick<Project, "name" | "description" | "lead_id" | "is_archived">>;
type AddProjectMemberInput = Pick<ProjectMember, "user_id" | "role">;

function projectsPath(slug: string) {
  return `/workspaces/${encodeURIComponent(slug)}/projects/`;
}

function projectPath(slug: string, id: string) {
  return `${projectsPath(slug)}${encodeURIComponent(id)}`;
}

function cacheProject(client: QueryClient, slug: string, project: Project) {
  const listKey = queryKeys.projects.all(slug);
  client.setQueryData(queryKeys.projects.detail(slug, project.id), project);
  client.setQueryData<Project[]>(listKey, (current) => {
    if (!current) return current;
    return current.some((item) => item.id === project.id)
      ? current.map((item) => item.id === project.id ? project : item)
      : [...current, project];
  });
  void client.invalidateQueries({ queryKey: listKey, exact: true });
}

export function useProjectsQuery(slug: string) {
  return useQuery({
    queryKey: queryKeys.projects.all(slug),
    queryFn: async ({ signal }) => (await api.get<Project[]>(projectsPath(slug), { signal })).data,
  });
}

export function useProjectQuery(slug: string, id: string) {
  return useQuery({
    queryKey: queryKeys.projects.detail(slug, id),
    queryFn: async ({ signal }) => (await api.get<Project>(projectPath(slug, id), { signal })).data,
  });
}

export function useCreateProjectMutation(slug: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateProjectInput) => (await api.post<Project>(projectsPath(slug), input)).data,
    onSuccess: (project) => cacheProject(client, slug, project),
  });
}

export function useUpdateProjectMutation(slug: string, id: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (input: UpdateProjectInput) => (await api.patch<Project>(projectPath(slug, id), input)).data,
    onSuccess: async (project) => {
      await client.cancelQueries({ queryKey: queryKeys.projects.detail(slug, id), exact: true });
      cacheProject(client, slug, project);
    },
  });
}

export function useDeleteProjectMutation(slug: string, id: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async () => { await api.delete(projectPath(slug, id)); },
    onSuccess: () => {
      const listKey = queryKeys.projects.all(slug);
      client.removeQueries({ queryKey: queryKeys.projects.detail(slug, id) });
      client.setQueryData<Project[]>(listKey, (current) => current?.filter((item) => item.id !== id));
      void client.invalidateQueries({ queryKey: listKey, exact: true });
    },
  });
}

export function useProjectMembersQuery(slug: string, id: string) {
  return useQuery({
    queryKey: queryKeys.projects.members(slug, id),
    queryFn: async ({ signal }) => (await api.get<ProjectMember[]>(`${projectPath(slug, id)}/members`, { signal })).data,
  });
}

export function useAddProjectMemberMutation(slug: string, id: string) {
  const client = useQueryClient();
  const queryKey = queryKeys.projects.members(slug, id);
  return useMutation({
    mutationFn: async (input: AddProjectMemberInput) =>
      (await api.post<ProjectMember>(`${projectPath(slug, id)}/members`, input)).data,
    onSuccess: (member) => {
      client.setQueryData<ProjectMember[]>(queryKey, (current) =>
        current && !current.some((item) => item.user_id === member.user_id) ? [...current, member] : current,
      );
      void client.invalidateQueries({ queryKey, exact: true });
    },
  });
}

export function useRemoveProjectMemberMutation(slug: string, id: string) {
  const client = useQueryClient();
  const queryKey = queryKeys.projects.members(slug, id);
  return useMutation({
    mutationFn: async (userId: string) => {
      await api.delete(`${projectPath(slug, id)}/members/${encodeURIComponent(userId)}`);
    },
    onSuccess: (_, userId) => {
      client.setQueryData<ProjectMember[]>(queryKey, (current) => current?.filter((member) => member.user_id !== userId));
      void client.invalidateQueries({ queryKey, exact: true });
    },
  });
}
