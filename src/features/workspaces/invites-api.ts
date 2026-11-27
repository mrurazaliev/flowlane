import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMe } from '@/features/auth'
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
type IncomingInvite = Pick<Invite, 'role' | 'expires_at' | 'workspace' | 'invited_by'> & { id: string; token: string }

const invitesUrl = '/invites'
const incomingInvitesQueryKey = ['invites', 'incoming'] as const

async function addInvite(slug: string, payload: InvitePayload): Promise<CreatedInvite> {
  const { data } = await api.post<CreatedInvite>(`/workspaces/${encodeURIComponent(slug)}/members/invite`, payload)
  return data
}

async function getInvite(token: string, signal: AbortSignal): Promise<Invite> {
  const { data } = await api.get<Invite>(`${invitesUrl}/${encodeURIComponent(token)}`, { signal })
  return data
}

async function getInvites(signal: AbortSignal): Promise<IncomingInvite[]> {
  const { data } = await api.get<IncomingInvite[]>(`${invitesUrl}/`, { signal })
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

export function useInvites() {
  const { data: user } = useMe()

  return useQuery({
    queryKey: [...incomingInvitesQueryKey, user?.id],
    queryFn: ({ signal }) => getInvites(signal),
    enabled: !!user?.id,
    staleTime: 15_000,
    refetchInterval: 30_000,
  })
}

export function useAcceptInvite(token: string, slug?: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => acceptInvite(token),
    onSuccess: () => {
      queryClient.setQueriesData<IncomingInvite[]>({ queryKey: incomingInvitesQueryKey }, (invites) =>
        invites?.filter((invite) => invite.token !== token),
      )
      void queryClient.invalidateQueries({ queryKey: incomingInvitesQueryKey })
      void queryClient.invalidateQueries({ queryKey: queryKeys.workspaces.all, exact: true })
      if (slug) void queryClient.invalidateQueries({ queryKey: queryKeys.workspaces.members(slug), exact: true })
    },
  })
}
