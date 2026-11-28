import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/shared/api/client'
import { queryKeys } from '@/shared/api/queryKeys'
import type { Cycle, Module, ModuleStatus } from '@/shared/api/types'

type PlanningKind = 'cycles' | 'modules'
type PlanningScope = { workspaceSlug: string; projectId: string }
type PlanningTarget = PlanningScope & { kind: PlanningKind; id: string }

type PlanningInput = {
  name: string
  description?: string | null
  start_date: string | null
}

type CycleInput = PlanningInput & { end_date: string | null }
type ModuleInput = PlanningInput & {
  status: ModuleStatus
  lead_id?: string | null
  target_date: string | null
}

function planningUrl({ workspaceSlug, projectId }: PlanningScope, kind: PlanningKind) {
  return `/workspaces/${encodeURIComponent(workspaceSlug)}/projects/${encodeURIComponent(projectId)}/${kind}`
}

function usePlanningList<T>(scope: PlanningScope, kind: PlanningKind) {
  return useQuery({
    queryKey: queryKeys[kind].all(scope.workspaceSlug, scope.projectId),
    queryFn: async ({ signal }) => {
      const { data } = await api.get<T[]>(`${planningUrl(scope, kind)}/`, { signal })
      return data
    },
  })
}

function usePlanningItem<T>(scope: PlanningScope, kind: PlanningKind, id: string) {
  return useQuery({
    queryKey: queryKeys[kind].detail(scope.workspaceSlug, scope.projectId, id),
    queryFn: async ({ signal }) => {
      const { data } = await api.get<T>(`${planningUrl(scope, kind)}/${encodeURIComponent(id)}`, { signal })
      return data
    },
  })
}

function useSavePlanningItem<T, Input>(scope: PlanningScope, kind: PlanningKind, id?: string) {
  const client = useQueryClient()
  return useMutation({
    mutationFn: async (input: Input) => {
      const url = planningUrl(scope, kind)
      const { data } = id
        ? await api.patch<T>(`${url}/${encodeURIComponent(id)}`, input)
        : await api.post<T>(`${url}/`, input)
      return data
    },
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys[kind].all(scope.workspaceSlug, scope.projectId) }),
  })
}

export const useCycles = (scope: PlanningScope) => usePlanningList<Cycle>(scope, 'cycles')
export const useCycle = (scope: PlanningScope, id: string) => usePlanningItem<Cycle>(scope, 'cycles', id)
export const useSaveCycle = (scope: PlanningScope, id?: string) => useSavePlanningItem<Cycle, CycleInput>(scope, 'cycles', id)

export const useModules = (scope: PlanningScope) => usePlanningList<Module>(scope, 'modules')
export const useModule = (scope: PlanningScope, id: string) => usePlanningItem<Module>(scope, 'modules', id)
export const useSaveModule = (scope: PlanningScope, id?: string) => useSavePlanningItem<Module, ModuleInput>(scope, 'modules', id)

export function useDeletePlanningItem(target: PlanningTarget) {
  const client = useQueryClient()
  const { workspaceSlug, projectId, kind, id } = target
  return useMutation({
    mutationFn: () => api.delete(`${planningUrl(target, kind)}/${encodeURIComponent(id)}`),
    onSuccess: () => Promise.all([
      client.invalidateQueries({ queryKey: queryKeys[kind].all(workspaceSlug, projectId), exact: true }),
      client.invalidateQueries({ queryKey: [...queryKeys.issues.all, workspaceSlug, projectId] }),
    ]),
  })
}

export function useChangePlanningTasks(target: PlanningTarget, action: 'add' | 'remove') {
  const client = useQueryClient()
  const { workspaceSlug, projectId, kind, id } = target
  const url = `${planningUrl(target, kind)}/${encodeURIComponent(id)}/issues`

  return useMutation({
    mutationFn: (issueIds: [string, ...string[]]) => action === 'add'
      ? api.post(url, { issue_ids: issueIds })
      : api.delete(`${url}/${encodeURIComponent(issueIds[0])}`),
    onSuccess: () => Promise.all([
      client.invalidateQueries({ queryKey: [...queryKeys.issues.all, workspaceSlug, projectId] }),
      client.invalidateQueries({ queryKey: queryKeys[kind].all(workspaceSlug, projectId) }),
    ]),
  })
}
