import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/shared/api/client";
import { queryKeys } from "@/shared/api/queryKeys";
import type { Workspace, WorkspaceMember, WorkspaceRole } from "@/shared/api/types";

type CreateWorkspaceInput = Pick<Workspace, "name" | "slug">;
export type AssignableWorkspaceRole = Exclude<WorkspaceRole, "owner">;
type AddMemberInput = { user_id: string; role: AssignableWorkspaceRole };

function workspacePath(slug: string) {
  return `/workspaces/${encodeURIComponent(slug)}`;
}

export function useWorkspacesQuery() {
  return useQuery({
    queryKey: queryKeys.workspaces.all,
    queryFn: async ({ signal }) => {
      const { data } = await api.get<Workspace[]>("/workspaces/", { signal });
      return data;
    },
  });
}

export function useCreateWorkspaceMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateWorkspaceInput) => {
      const { data } = await api.post<Workspace>("/workspaces/", input);
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.workspaces.all, exact: true });
    },
  });
}

export function useWorkspaceQuery(slug: string) {
  return useQuery({
    queryKey: queryKeys.workspaces.detail(slug),
    queryFn: async ({ signal }) => {
      const { data } = await api.get<Workspace>(workspacePath(slug), { signal });
      return data;
    },
  });
}

export function useUpdateWorkspaceMutation(slug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: Partial<CreateWorkspaceInput>) => {
      const { data } = await api.patch<Workspace>(workspacePath(slug), input);
      return data;
    },
    onSuccess: async (workspace) => {
      const nextDetailKey = queryKeys.workspaces.detail(workspace.slug);
      await queryClient.cancelQueries({ queryKey: nextDetailKey, exact: true });

      if (workspace.slug !== slug) {
        queryClient.removeQueries({ queryKey: queryKeys.workspaces.detail(slug) });
      }

      queryClient.setQueryData(nextDetailKey, workspace);
      queryClient.setQueryData<Workspace[]>(queryKeys.workspaces.all, (current) =>
        current?.map((item) => item.id === workspace.id ? workspace : item),
      );
      void queryClient.invalidateQueries({ queryKey: queryKeys.workspaces.all, exact: true });
    },
  });
}

export function useDeleteWorkspaceMutation(slug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await api.delete(workspacePath(slug));
    },
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: queryKeys.workspaces.detail(slug) });
      queryClient.setQueryData<Workspace[]>(queryKeys.workspaces.all, (current) =>
        current?.filter((item) => item.slug !== slug),
      );
      void queryClient.invalidateQueries({ queryKey: queryKeys.workspaces.all, exact: true });
    },
  });
}

export function useWorkspaceMembersQuery(slug: string) {
  return useQuery({
    queryKey: queryKeys.workspaces.members(slug),
    queryFn: async ({ signal }) => {
      const { data } = await api.get<WorkspaceMember[]>(`${workspacePath(slug)}/members`, { signal });
      return data;
    },
  });
}

export function useAddWorkspaceMemberMutation(slug: string) {
  const queryClient = useQueryClient();
  const queryKey = queryKeys.workspaces.members(slug);

  return useMutation({
    mutationFn: async (input: AddMemberInput) => {
      const { data } = await api.post<WorkspaceMember>(`${workspacePath(slug)}/members`, input);
      return data;
    },
    onSuccess: (member) => {
      queryClient.setQueryData<WorkspaceMember[]>(queryKey, (current) =>
        current && !current.some((item) => item.user_id === member.user_id) ? [...current, member] : current,
      );
      void queryClient.invalidateQueries({ queryKey, exact: true });
    },
  });
}

export function useChangeWorkspaceMemberRoleMutation(slug: string) {
  const queryClient = useQueryClient();
  const queryKey = queryKeys.workspaces.members(slug);

  return useMutation({
    mutationFn: async ({ user_id, role }: AddMemberInput) => {
      const { data } = await api.patch<WorkspaceMember>(
        `${workspacePath(slug)}/members/${encodeURIComponent(user_id)}`,
        { role },
      );
      return data;
    },
    onSuccess: (member) => {
      queryClient.setQueryData<WorkspaceMember[]>(queryKey, (current) =>
        current?.map((item) => item.user_id === member.user_id ? member : item),
      );
      void queryClient.invalidateQueries({ queryKey, exact: true });
    },
  });
}

export function useRemoveWorkspaceMemberMutation(slug: string) {
  const queryClient = useQueryClient();
  const queryKey = queryKeys.workspaces.members(slug);

  return useMutation({
    mutationFn: async (userId: string) => {
      await api.delete(`${workspacePath(slug)}/members/${encodeURIComponent(userId)}`);
    },
    onSuccess: (_, userId) => {
      queryClient.setQueryData<WorkspaceMember[]>(queryKey, (current) =>
        current?.filter((item) => item.user_id !== userId),
      );
      void queryClient.invalidateQueries({ queryKey, exact: true });
    },
  });
}
