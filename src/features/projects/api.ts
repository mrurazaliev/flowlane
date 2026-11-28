import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query'
import { api } from '@/shared/api/client'
import { queryKeys } from '@/shared/api/queryKeys'
import type { Project, ProjectMember, State } from '@/shared/api/types'

type ProjectPayload = Pick<Project, 'name' | 'identifier'> & { description?: string; lead_id?: string }
type EditProjectPayload = Partial<Pick<Project, 'name' | 'description' | 'lead_id' | 'is_archived'>>
type ProjectMemberPayload = Pick<ProjectMember, 'user_id' | 'role'>
type StatePayload = Pick<State, 'name' | 'color' | 'group' | 'order' | 'is_default'>

function projectsPath(slug: string) {
  return `/workspaces/${encodeURIComponent(slug)}/projects/`
}

function projectPath(slug: string, id: string) {
  return `${projectsPath(slug)}${encodeURIComponent(id)}`
}

async function getProjects(slug: string, signal: AbortSignal): Promise<Project[]> {
  const { data } = await api.get<Project[]>(projectsPath(slug), { signal })
  return data
}

async function getProject(slug: string, id: string, signal: AbortSignal): Promise<Project> {
  const { data } = await api.get<Project>(projectPath(slug, id), { signal })
  return data
}

async function addProject(slug: string, payload: ProjectPayload): Promise<Project> {
  const { data } = await api.post<Project>(projectsPath(slug), payload)
  return data
}

async function editProject(slug: string, id: string, payload: EditProjectPayload): Promise<Project> {
  const { data } = await api.patch<Project>(projectPath(slug, id), payload)
  return data
}

async function deleteProject(slug: string, id: string): Promise<void> {
  await api.delete(projectPath(slug, id))
}

async function getProjectMembers(slug: string, id: string, signal: AbortSignal): Promise<ProjectMember[]> {
  const { data } = await api.get<ProjectMember[]>(`${projectPath(slug, id)}/members`, { signal })
  return data
}

async function addProjectMember(slug: string, id: string, payload: ProjectMemberPayload): Promise<ProjectMember> {
  const { data } = await api.post<ProjectMember>(`${projectPath(slug, id)}/members`, payload)
  return data
}

async function removeProjectMember(slug: string, id: string, userId: string): Promise<void> {
  await api.delete(`${projectPath(slug, id)}/members/${encodeURIComponent(userId)}`)
}

function cacheProject(client: QueryClient, slug: string, project: Project) {
  const listKey = queryKeys.projects.all(slug)
  client.setQueryData(queryKeys.projects.detail(slug, project.id), project)
  client.setQueryData<Project[]>(listKey, (current) => {
    if (!current) return current
    return current.some((item) => item.id === project.id)
      ? current.map((item) => item.id === project.id ? project : item)
      : [...current, project]
  })
  void client.invalidateQueries({ queryKey: listKey, exact: true })
}

export function useProjects(slug: string) {
  return useQuery({
    queryKey: queryKeys.projects.all(slug),
    queryFn: ({ signal }) => getProjects(slug, signal),
  })
}

export function useProject(slug: string, id: string) {
  return useQuery({
    queryKey: queryKeys.projects.detail(slug, id),
    queryFn: ({ signal }) => getProject(slug, id, signal),
  })
}

export function useAddProject(slug: string) {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (payload: ProjectPayload) => addProject(slug, payload),
    onSuccess: (project) => cacheProject(client, slug, project),
  })
}

export function useEditProject(slug: string, id: string) {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (payload: EditProjectPayload) => editProject(slug, id, payload),
    onSuccess: async (project) => {
      await client.cancelQueries({ queryKey: queryKeys.projects.detail(slug, id), exact: true })
      cacheProject(client, slug, project)
    },
  })
}

export function useDeleteProject(slug: string, id: string) {
  const client = useQueryClient()
  return useMutation({
    mutationFn: () => deleteProject(slug, id),
    onSuccess: () => {
      const listKey = queryKeys.projects.all(slug)
      client.removeQueries({ queryKey: queryKeys.projects.detail(slug, id) })
      client.setQueryData<Project[]>(listKey, (current) => current?.filter((item) => item.id !== id))
      void client.invalidateQueries({ queryKey: listKey, exact: true })
    },
  })
}

export function useProjectMembers(slug: string, id: string) {
  return useQuery({
    queryKey: queryKeys.projects.members(slug, id),
    queryFn: ({ signal }) => getProjectMembers(slug, id, signal),
  })
}

export function useAddProjectMember(slug: string, id: string) {
  const client = useQueryClient()
  const queryKey = queryKeys.projects.members(slug, id)
  return useMutation({
    mutationFn: (payload: ProjectMemberPayload) => addProjectMember(slug, id, payload),
    onSuccess: (member) => {
      client.setQueryData<ProjectMember[]>(queryKey, (current) =>
        current && !current.some((item) => item.user_id === member.user_id) ? [...current, member] : current,
      )
      void client.invalidateQueries({ queryKey, exact: true })
    },
  })
}

export function useRemoveProjectMember(slug: string, id: string) {
  const client = useQueryClient()
  const queryKey = queryKeys.projects.members(slug, id)
  return useMutation({
    mutationFn: (userId: string) => removeProjectMember(slug, id, userId),
    onSuccess: (_, userId) => {
      client.setQueryData<ProjectMember[]>(queryKey, (current) => current?.filter((member) => member.user_id !== userId))
      void client.invalidateQueries({ queryKey, exact: true })
    },
  })
}

function refreshProjectStates(client: QueryClient, slug: string, id: string) {
  return Promise.all([
    client.invalidateQueries({ queryKey: queryKeys.states(slug, id), exact: true }),
    client.invalidateQueries({ queryKey: [...queryKeys.issues.all, slug, id] }),
    client.invalidateQueries({ queryKey: queryKeys.cycles.all(slug, id) }),
    client.invalidateQueries({ queryKey: queryKeys.modules.all(slug, id) }),
  ])
}

export function useSaveProjectState(slug: string, id: string) {
  const client = useQueryClient()
  const path = `${projectPath(slug, id)}/states/`
  return useMutation({
    mutationFn: async (change: { stateId: string; payload: Partial<StatePayload> } | { payload: StatePayload }) => {
      const { data } = 'stateId' in change
        ? await api.patch<State>(`${path}${encodeURIComponent(change.stateId)}`, change.payload)
        : await api.post<State>(path, change.payload)
      return data
    },
    onSuccess: () => refreshProjectStates(client, slug, id),
  })
}

export function useDeleteProjectState(slug: string, id: string) {
  const client = useQueryClient()
  return useMutation({
    mutationFn: ({ stateId, transferToStateId }: { stateId: string; transferToStateId: string }) =>
      api.delete(`${projectPath(slug, id)}/states/${encodeURIComponent(stateId)}`, {
        data: transferToStateId ? { transfer_to_state_id: transferToStateId } : {},
      }),
    onSuccess: () => refreshProjectStates(client, slug, id),
  })
}
