import type { QueryClient } from '@tanstack/react-query'
import { api } from '@/shared/api/client'
import { getLabels } from '@/shared/api/lookups'
import { queryKeys } from '@/shared/api/queryKeys'
import type { Issue } from '@/shared/api/types'

type ListParam = string[] | undefined
type IssueFilters = {
  cycle?: string
  module?: string
  search?: string
  state?: string[]
  priority?: string[]
  assignee?: string[]
  label?: string[]
}

const asList = (value: ListParam) => {
  if (!value?.length) return undefined
  return value.length === 1 ? [value[0], value[0]] : value
}
type IssuesResponse = { data: Issue[]; next_cursor: string | null }

export async function getIssuesPage(
  url: string,
  filters: Omit<IssueFilters, 'label'> & { label?: string | string[] },
  cursor: string | null,
  signal: AbortSignal,
) {
  const { label, state, priority, assignee, ...issueFilters } = filters
  const { data } = await api.get<IssuesResponse>(url, {
    params: {
      limit: 100,
      ...issueFilters,
      state: asList(state),
      priority: asList(priority),
      assignee: asList(assignee),
      label: asList(typeof label === 'string' ? [label] : label),
      cursor: cursor ?? undefined,
    },
    paramsSerializer: { indexes: null },
    signal,
  })
  return data
}

export async function resolveIssueLabels(
  issues: Issue[],
  scope: { workspaceSlug: string; projectId: string },
  url: string,
  filters: IssueFilters,
  client: QueryClient,
  signal: AbortSignal,
) {
  const missing = new Map<string, { remaining: number; labels: Issue['labels'] }>()
  for (const issue of issues) {
    const links = issue.labels ?? []
    const labels = links.filter((link) => link?.label?.id)
    if (links.length > labels.length) missing.set(issue.id, { remaining: links.length - labels.length, labels })
  }
  if (!missing.size) return issues

  const { workspaceSlug, projectId } = scope
  const projectLabels = await client.fetchQuery({
    queryKey: queryKeys.labels(workspaceSlug, projectId),
    queryFn: ({ signal }) => getLabels(workspaceSlug, projectId, signal),
    staleTime: 30_000,
  })

  for (const label of projectLabels) {
    const candidates = new Set([...missing].filter(([, entry]) =>
      entry.remaining > 0 && !entry.labels.some((link) => link.label.id === label.id),
    ).map(([id]) => id))
    if (!candidates.size) continue

    let cursor: string | null = null
    do {
      const page = await getIssuesPage(url, { ...filters, label: label.id }, cursor, signal)
      for (const issue of page.data) {
        if (!candidates.delete(issue.id)) continue
        const entry = missing.get(issue.id)
        if (entry) {
          entry.labels.push({ label })
          entry.remaining -= 1
        }
      }
      cursor = page.next_cursor
    } while (cursor && candidates.size)
  }

  return issues.map((issue) => {
    const entry = missing.get(issue.id)
    return entry ? { ...issue, labels: entry.labels } : issue
  })
}
