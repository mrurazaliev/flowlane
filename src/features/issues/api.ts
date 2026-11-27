import { useQuery } from '@tanstack/react-query';
import { api } from '@/shared/api/client';
import { queryKeys } from '@/shared/api/queryKeys';
import type { Issue } from '@/shared/api/types';

type IssuesResponse = {
  data: Issue[];
  next_cursor: string | null;
};

export const useGetIssuesQuery = (workspaceSlug: string, projectId: string) =>
  useQuery({
    queryKey: queryKeys.issues.list(workspaceSlug, projectId, {}),
    queryFn: async () => {
      const { data } = await api.get<IssuesResponse>(
        `/workspaces/${workspaceSlug}/projects/${projectId}/issues`,
        { params: { limit: 100 } },
      );
      return data.data;
    },
  });