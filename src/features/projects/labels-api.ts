import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/shared/api/client";
import { queryKeys } from "@/shared/api/queryKeys";
import type { Label } from "@/shared/api/types";

export type LabelInput = {
  name: string;
  color: string;
};

const labelsUrl = (workspaceSlug: string, projectId: string) =>
  `/workspaces/${encodeURIComponent(workspaceSlug)}/projects/${encodeURIComponent(projectId)}/labels`;

const useRefreshLabels = (workspaceSlug: string, projectId: string) => {
  const queryClient = useQueryClient();
  return () => Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.labels(workspaceSlug, projectId), exact: true }),
    queryClient.invalidateQueries({ queryKey: [...queryKeys.issues.all, workspaceSlug, projectId] }),
  ]);
};

export const useAddLabelMutation = (workspaceSlug: string, projectId: string) => {
  const refresh = useRefreshLabels(workspaceSlug, projectId);
  return useMutation({
    mutationFn: async (newLabel: LabelInput) => {
      const { data } = await api.post<Label>(`${labelsUrl(workspaceSlug, projectId)}/`, newLabel);
      return data;
    },
    onSuccess: refresh,
  });
};

export const useEditLabelMutation = (workspaceSlug: string, projectId: string) => {
  const refresh = useRefreshLabels(workspaceSlug, projectId);
  return useMutation({
    mutationFn: async ({ labelId, ...changes }: Partial<LabelInput> & { labelId: string }) => {
      const { data } = await api.patch<Label>(`${labelsUrl(workspaceSlug, projectId)}/${encodeURIComponent(labelId)}`, changes);
      return data;
    },
    onSuccess: refresh,
  });
};

export const useDeleteLabelMutation = (workspaceSlug: string, projectId: string) => {
  const refresh = useRefreshLabels(workspaceSlug, projectId);
  return useMutation({
    mutationFn: (labelId: string) => api.delete(`${labelsUrl(workspaceSlug, projectId)}/${encodeURIComponent(labelId)}`),
    onSuccess: refresh,
  });
};
