import { api } from "@/shared/api/client";
import { queryKeys } from "@/shared/api/queryKeys";
import { useQuery } from "@tanstack/react-query";

export type IssueFilters = {
  cycle?: string;
  module?: string;
};

import type { Issue } from "@/shared/api/types";

type IssuesResponse = {
  data: Issue[];
  next_cursor: string | null;
};
// GET /workspaces/:slug/projects/:projectId/issues
export const useGetIssuesQuery = (
  workspaceSlug: string,
  projectId: string,
  filters: IssueFilters = {},
) =>
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