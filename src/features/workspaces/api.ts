import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/shared/api/client'
import { queryKeys } from '@/shared/api/queryKeys'
import type { Workspace, WorkspaceMember, WorkspaceRole } from '@/shared/api/types'

type WorkspacePayload = Pick<Workspace, 'name' | 'slug'>
export type AssignableWorkspaceRole = Exclude<WorkspaceRole, 'owner'>
type WorkspaceMemberPayload = { user_id: string; role: AssignableWorkspaceRole }

const workspacesUrl = '/workspaces/'
const workspacesQueryKey = queryKeys.workspaces.all

function workspacePath(slug: string) {
  return `${workspacesUrl}${encodeURIComponent(slug)}`
}

async function getWorkspaces(signal: AbortSignal): Promise<Workspace[]> {
  const { data } = await api.get<Workspace[]>(workspacesUrl, { signal })
  return data
}

async function getWorkspace(slug: string, signal: AbortSignal): Promise<Workspace> {
  const { data } = await api.get<Workspace>(workspacePath(slug), { signal })
  return data
}

async function addWorkspace(payload: WorkspacePayload): Promise<Workspace> {
  const { data } = await api.post<Workspace>(workspacesUrl, payload)
  return data
}

async function editWorkspace(slug: string, payload: Partial<WorkspacePayload>): Promise<Workspace> {
  const { data } = await api.patch<Workspace>(workspacePath(slug), payload)
  return data
}

async function deleteWorkspace(slug: string): Promise<void> {
  await api.delete(workspacePath(slug))
}

async function getWorkspaceMembers(slug: string, signal: AbortSignal): Promise<WorkspaceMember[]> {
  const { data } = await api.get<WorkspaceMember[]>(`${workspacePath(slug)}/members`, { signal })
  return data
}

async function addWorkspaceMember(slug: string, payload: WorkspaceMemberPayload): Promise<WorkspaceMember> {
  const { data } = await api.post<WorkspaceMember>(`${workspacePath(slug)}/members`, payload)
  return data
}

async function editWorkspaceMemberRole(slug: string, { user_id, role }: WorkspaceMemberPayload): Promise<WorkspaceMember> {
  const { data } = await api.patch<WorkspaceMember>(
    `${workspacePath(slug)}/members/${encodeURIComponent(user_id)}`,
    { role },
  )
  return data
}

async function removeWorkspaceMember(slug: string, userId: string): Promise<void> {
  await api.delete(`${workspacePath(slug)}/members/${encodeURIComponent(userId)}`)
}

export function useWorkspaces() {
  return useQuery({ queryKey: workspacesQueryKey, queryFn: ({ signal }) => getWorkspaces(signal) })
}

export function useAddWorkspace() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: addWorkspace,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: workspacesQueryKey, exact: true })
    },
  })
}

export function useWorkspace(slug: string) {
  return useQuery({
    queryKey: queryKeys.workspaces.detail(slug),
    queryFn: ({ signal }) => getWorkspace(slug, signal),
  })
}

export function useEditWorkspace(slug: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: Partial<WorkspacePayload>) => editWorkspace(slug, payload),
    onSuccess: async (workspace) => {
      const nextDetailKey = queryKeys.workspaces.detail(workspace.slug)
      await queryClient.cancelQueries({ queryKey: nextDetailKey, exact: true })

      if (workspace.slug !== slug) {
        queryClient.removeQueries({ queryKey: queryKeys.workspaces.detail(slug) })
      }

      queryClient.setQueryData(nextDetailKey, workspace)
      queryClient.setQueryData<Workspace[]>(workspacesQueryKey, (current) =>
        current?.map((item) => item.id === workspace.id ? workspace : item),
      )
      void queryClient.invalidateQueries({ queryKey: workspacesQueryKey, exact: true })
    },
  })
}

export function useDeleteWorkspace(slug: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => deleteWorkspace(slug),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: queryKeys.workspaces.detail(slug) })
      queryClient.setQueryData<Workspace[]>(workspacesQueryKey, (current) =>
        current?.filter((item) => item.slug !== slug),
      )
      void queryClient.invalidateQueries({ queryKey: workspacesQueryKey, exact: true })
    },
  })
}

export function useWorkspaceMembers(slug: string) {
  return useQuery({
    queryKey: queryKeys.workspaces.members(slug),
    queryFn: ({ signal }) => getWorkspaceMembers(slug, signal),
  })
}

export function useAddWorkspaceMember(slug: string) {
  const queryClient = useQueryClient()
  const queryKey = queryKeys.workspaces.members(slug)

  return useMutation({
    mutationFn: (payload: WorkspaceMemberPayload) => addWorkspaceMember(slug, payload),
    onSuccess: (member) => {
      queryClient.setQueryData<WorkspaceMember[]>(queryKey, (current) =>
        current && !current.some((item) => item.user_id === member.user_id) ? [...current, member] : current,
      )
      void queryClient.invalidateQueries({ queryKey, exact: true })
    },
  })
}

export function useEditWorkspaceMemberRole(slug: string) {
  const queryClient = useQueryClient()
  const queryKey = queryKeys.workspaces.members(slug)

  return useMutation({
    mutationFn: (payload: WorkspaceMemberPayload) => editWorkspaceMemberRole(slug, payload),
    onSuccess: (member) => {
      queryClient.setQueryData<WorkspaceMember[]>(queryKey, (current) =>
        current?.map((item) => item.user_id === member.user_id ? member : item),
      )
      void queryClient.invalidateQueries({ queryKey, exact: true })
    },
  })
}

export function useRemoveWorkspaceMember(slug: string) {
  const queryClient = useQueryClient()
  const queryKey = queryKeys.workspaces.members(slug)

  return useMutation({
    mutationFn: (userId: string) => removeWorkspaceMember(slug, userId),
    onSuccess: (_, userId) => {
      queryClient.setQueryData<WorkspaceMember[]>(queryKey, (current) =>
        current?.filter((item) => item.user_id !== userId),
      )
      void queryClient.invalidateQueries({ queryKey, exact: true })
    },
  })
}
