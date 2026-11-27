import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/shared/api/client";
import { queryKeys } from "@/shared/api/queryKeys";
import type { Workspace } from "@/shared/api/types";

type CreateWorkspaceInput = Pick<Workspace, "name" | "slug">;

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
