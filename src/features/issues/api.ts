import { api } from "@/shared/api/client";
import { queryKeys } from "@/shared/api/queryKeys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Comment, Issue, Priority } from "@/shared/api/types";

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

// Бэкенд в ответе задачи может прислать в labels/assignees пустые объекты {}
// (в его схеме ответа у этих полей не описаны свойства). Убираем такие записи,
// чтобы страницы не падали на label.id или user.display_name.
const normalizeIssue = (issue: Issue): Issue => ({
  ...issue,
  labels: (issue.labels ?? []).filter((item) => item?.label?.id),
  assignees: (issue.assignees ?? []).filter((item) => item?.user_id && item?.user),
});

type IssuesResponse = {
  data: Issue[];
  next_cursor: string | null;
};
// GET /workspaces/:slug/projects/:projectId/issues
export const useGetIssuesQuery = (
  workspaceSlug: string,
  projectId: string,
  filters: IssueFilters = {},
  { allPages = false, enabled = true } = {},
) =>
  useQuery({
    queryKey: queryKeys.issues.list(workspaceSlug, projectId, allPages ? { ...filters, allPages } : filters),
    enabled,
    queryFn: async ({ signal }) => {
      const issues: Issue[] = [];
      let cursor: string | null = null;
      do {
        const { data }: { data: IssuesResponse } = await api.get<IssuesResponse>(
          `/workspaces/${workspaceSlug}/projects/${projectId}/issues`,
          { params: { limit: 100, ...filters, cursor: cursor ?? undefined }, signal },
        );
        issues.push(...data.data.map(normalizeIssue));
        cursor = data.next_cursor;
      } while (allPages && cursor);
      return issues;
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
      return normalizeIssue(data);
    },
  });

// PATCH
async function editIssue(workspaceSlug: string, projectId: string, issueId: string, changes: IssueUpdate) {
  const { data } = await api.patch<Issue>(
    `/workspaces/${workspaceSlug}/projects/${projectId}/issues/${issueId}`,
    changes,
  );
  return data;
}

export const useEditIssueMutation = (workspaceSlug: string, projectId: string, issueId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (changes: IssueUpdate) => editIssue(workspaceSlug, projectId, issueId, changes),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.issues.all }),
  });
};

export const useMoveIssueMutation = (workspaceSlug: string, projectId: string) => {
  const client = useQueryClient()
  return useMutation({
    mutationFn: ({ issueId, stateId }: { issueId: string; stateId: string }) =>
      editIssue(workspaceSlug, projectId, issueId, { state_id: stateId }),
    onSuccess: async (issue) => {
      const queryKey = [...queryKeys.issues.all, workspaceSlug, projectId]
      await client.cancelQueries({ queryKey })
      client.setQueryData<Issue[]>(queryKeys.issues.list(workspaceSlug, projectId, { allPages: true }), (issues) =>
        issues?.map((item) => item.id === issue.id ? { ...item, state_id: issue.state_id } : item),
      )
      await Promise.all([
        client.invalidateQueries({ queryKey }),
        client.invalidateQueries({ queryKey: queryKeys.cycles.all(workspaceSlug, projectId) }),
        client.invalidateQueries({ queryKey: queryKeys.modules.all(workspaceSlug, projectId) }),
      ])
    },
  })
}

// DELETE
export const useDeleteIssueMutation = (workspaceSlug: string, projectId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (issueId: string) =>
      api.delete(`/workspaces/${workspaceSlug}/projects/${projectId}/issues/${issueId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.issues.all }),
  });
};

// ---------- Комментарии ----------
const commentsUrl = (workspaceSlug: string, projectId: string, issueId: string) =>
  `/workspaces/${workspaceSlug}/projects/${projectId}/issues/${issueId}/comments`;

// GET
export const useGetCommentsQuery = (workspaceSlug: string, projectId: string, issueId: string) =>
  useQuery({
    queryKey: queryKeys.issues.comments(issueId),
    queryFn: async () => {
      const { data } = await api.get<Comment[]>(commentsUrl(workspaceSlug, projectId, issueId));
      return data;
    },
  });

// POST
export const useAddCommentMutation = (workspaceSlug: string, projectId: string, issueId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: string) => api.post(commentsUrl(workspaceSlug, projectId, issueId), { body }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.issues.comments(issueId) }),
  });
};

// PATCH
export const useEditCommentMutation = (workspaceSlug: string, projectId: string, issueId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ commentId, body }: { commentId: string; body: string }) =>
      api.patch(`${commentsUrl(workspaceSlug, projectId, issueId)}/${commentId}`, { body }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.issues.comments(issueId) }),
  });
};

// DELETE
export const useDeleteCommentMutation = (workspaceSlug: string, projectId: string, issueId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (commentId: string) =>
      api.delete(`${commentsUrl(workspaceSlug, projectId, issueId)}/${commentId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.issues.comments(issueId) }),
  });
};

// ---------- Исполнители и лейблы задачи ----------
const issueUrl = (workspaceSlug: string, projectId: string, issueId: string) =>
  `/workspaces/${workspaceSlug}/projects/${projectId}/issues/${issueId}`;

// POST {i}/assignees — назначить исполнителя
export const useAddAssigneeMutation = (workspaceSlug: string, projectId: string, issueId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) =>
      api.post(`${issueUrl(workspaceSlug, projectId, issueId)}/assignees`, { user_id: userId }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.issues.all }),
  });
};

// DELETE {i}/assignees/:userId — снять исполнителя
export const useRemoveAssigneeMutation = (workspaceSlug: string, projectId: string, issueId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => api.delete(`${issueUrl(workspaceSlug, projectId, issueId)}/assignees/${userId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.issues.all }),
  });
};

// POST {i}/labels — добавить лейбл
export const useAddLabelMutation = (workspaceSlug: string, projectId: string, issueId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (labelId: string) =>
      api.post(`${issueUrl(workspaceSlug, projectId, issueId)}/labels`, { label_id: labelId }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.issues.all }),
  });
};

// DELETE {i}/labels/:labelId — убрать лейбл
export const useRemoveLabelMutation = (workspaceSlug: string, projectId: string, issueId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (labelId: string) => api.delete(`${issueUrl(workspaceSlug, projectId, issueId)}/labels/${labelId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.issues.all }),
  });
};
