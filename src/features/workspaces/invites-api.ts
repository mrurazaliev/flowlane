import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/shared/api/client'
import { queryKeys } from '@/shared/api/queryKeys'
import type { Workspace, WorkspaceRole } from '@/shared/api/types'
import type { AssignableWorkspaceRole } from './api'

type InvitePayload = { email: string; role: AssignableWorkspaceRole }
type CreatedInvite = { token: string; email: string }
type Invite = InvitePayload & {
  expires_at: string
  workspace: Pick<Workspace, 'id' | 'name' | 'slug'>
  invited_by: { display_name: string }
}
type AcceptedInvite = { workspace_id: string; user_id: string; role: WorkspaceRole }

const invitesUrl = '/invites'

async function addInvite(slug: string, payload: InvitePayload): Promise<CreatedInvite> {
  const { data } = await api.post<CreatedInvite>(`/workspaces/${encodeURIComponent(slug)}/members/invite`, payload)
  return data
}

async function getInvite(token: string, signal: AbortSignal): Promise<Invite> {
  const { data } = await api.get<Invite>(`${invitesUrl}/${encodeURIComponent(token)}`, { signal })
  return data
}

async function acceptInvite(token: string): Promise<AcceptedInvite> {
  const { data } = await api.post<AcceptedInvite>(`${invitesUrl}/${encodeURIComponent(token)}/accept`)
  return data
}

export function useAddInvite(slug: string) {
  return useMutation({ mutationFn: (payload: InvitePayload) => addInvite(slug, payload) })
}

export function useInvite(token: string) {
  return useQuery({
    queryKey: ['invites', token],
    queryFn: ({ signal }) => getInvite(token, signal),
    retry: false,
    gcTime: 0,
  })
}

export function useAcceptInvite(token: string, slug?: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => acceptInvite(token),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.workspaces.all, exact: true })
      if (slug) void queryClient.invalidateQueries({ queryKey: queryKeys.workspaces.members(slug), exact: true })
    },
  })
}
