import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/shared/api/client";
import { queryKeys } from "@/shared/api/queryKeys";
import type { Label } from "@/shared/api/types";

// Лейблы проекта: создать, изменить, удалить. Список берётся из useLabels (shared/api/lookups).
// Создавать и менять лейблы может только admin или owner.

export type LabelInput = {
  name: string;
  color: string; // "#3B82F6"
};

const labelsUrl = (workspaceSlug: string, projectId: string) =>
  `/workspaces/${encodeURIComponent(workspaceSlug)}/projects/${encodeURIComponent(projectId)}/labels`;

// После изменения обновляем и список лейблов, и задачи (на карточках видны имена и цвета лейблов)
const useRefreshLabels = (workspaceSlug: string, projectId: string) => {
  const queryClient = useQueryClient();
  return () => Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.labels(workspaceSlug, projectId), exact: true }),
    queryClient.invalidateQueries({ queryKey: [...queryKeys.issues.all, workspaceSlug, projectId] }),
  ]);
};

// POST
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

// PATCH
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

// DELETE
export const useDeleteLabelMutation = (workspaceSlug: string, projectId: string) => {
  const refresh = useRefreshLabels(workspaceSlug, projectId);
  return useMutation({
    mutationFn: (labelId: string) => api.delete(`${labelsUrl(workspaceSlug, projectId)}/${encodeURIComponent(labelId)}`),
    onSuccess: refresh,
  });
};
