// SHARED (F1.4): все ключи TanStack Query. Оба разработчика берут ключи ТОЛЬКО отсюда,
// чтобы invalidateQueries у одного обновлял данные у другого.
// Пример: queryClient.invalidateQueries({ queryKey: queryKeys.issues.all })

export const queryKeys = {
  me: ["me"] as const,

  workspaces: {
    all: ["workspaces"] as const,
    detail: (slug: string) => ["workspaces", slug] as const,
    members: (slug: string) => ["workspaces", slug, "members"] as const,
  },

  projects: {
    all: (slug: string) => ["projects", slug] as const,
    detail: (slug: string, projectId: string) => ["projects", slug, projectId] as const,
    members: (slug: string, projectId: string) => ["projects", slug, projectId, "members"] as const,
  },

  states: (slug: string, projectId: string) => ["states", slug, projectId] as const,
  labels: (slug: string, projectId: string) => ["labels", slug, projectId] as const,

  issues: {
    all: ["issues"] as const,
    list: (slug: string, projectId: string, filters: Record<string, unknown> = {}) =>
      ["issues", slug, projectId, "list", filters] as const,
    detail: (slug: string, projectId: string, issueId: string) => ["issues", slug, projectId, issueId] as const,
    comments: (issueId: string) => ["issues", "comments", issueId] as const,
    activity: (issueId: string) => ["issues", "activity", issueId] as const,
    attachments: (issueId: string) => ["issues", "attachments", issueId] as const,
    relations: (issueId: string) => ["issues", "relations", issueId] as const,
  },

  cycles: {
    all: (slug: string, projectId: string) => ["cycles", slug, projectId] as const,
    detail: (slug: string, projectId: string, cycleId: string) => ["cycles", slug, projectId, cycleId] as const,
  },

  modules: {
    all: (slug: string, projectId: string) => ["modules", slug, projectId] as const,
    detail: (slug: string, projectId: string, moduleId: string) => ["modules", slug, projectId, moduleId] as const,
  },

  notifications: {
    all: (slug: string) => ["notifications", slug] as const,
  },
};
