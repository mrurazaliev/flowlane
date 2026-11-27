import { api } from "@/shared/api/client";
import { queryKeys } from "@/shared/api/queryKeys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Issue, Priority } from "@/shared/api/types";

export type IssueFilters = {
    cycle?: string;
    module?: string;
};

export type IssueInput = {
title: string;
description?: string;
state_id: string;
priority: Priority;
assignee_ids?: string[];
label_ids?: string[];
start_date?: string | null;
due_date?: string | null;
};

export type IssueUpdate = {
  title?: string;
  description?: string | null;
  state_id?: string;
  priority?: Priority;
  start_date?: string | null;
  due_date?: string | null;
};

type IssuesResponse = {
  data: Issue[];
  next_cursor: string | null;
};
// GET /workspaces/:slug/projects/:projectId/issues
export const useGetIssuesQuery = ( workspaceSlug: string, projectId: string, filters: IssueFilters = {},) =>
  useQuery({
    queryKey: queryKeys.issues.list(workspaceSlug, projectId, filters),
    queryFn: async () => {
      const { data } = await api.get<IssuesResponse>(
        `/workspaces/${workspaceSlug}/projects/${projectId}/issues`,
        { params: { limit: 100, ...filters } },
      );
      return data.data;
    },
  });


// POST /workspaces/:slug/projects/:projectId/issues
export const useAddIssueMutation = (workspaceSlug: string, projectId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newIssue: IssueInput) => {
      const { data } = await api.post<Issue>(
        `/workspaces/${workspaceSlug}/projects/${projectId}/issues`,
        newIssue,
      );
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.issues.all }),
  });
};



// GET одной задачи
export const useGetIssueQuery = (workspaceSlug: string, projectId: string, issueId: string) =>
  useQuery({
    queryKey: queryKeys.issues.detail(workspaceSlug, projectId, issueId),
    queryFn: async () => {
      const { data } = await api.get<Issue>(
        `/workspaces/${workspaceSlug}/projects/${projectId}/issues/${issueId}`,
      );
      return data;
    },
  });

// PATCH
export const useEditIssueMutation = (workspaceSlug: string, projectId: string, issueId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (changes: IssueUpdate) => {
      const { data } = await api.patch<Issue>(
        `/workspaces/${workspaceSlug}/projects/${projectId}/issues/${issueId}`,
        changes,
      );
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.issues.all }),
  });
};

// DELETE
export const useDeleteIssueMutation = (workspaceSlug: string, projectId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (issueId: string) =>
      api.delete(`/workspaces/${workspaceSlug}/projects/${projectId}/issues/${issueId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.issues.all }),
  });
};