import { useMe } from '@/features/auth'
import { useWorkspaceMembers } from '@/features/workspaces'

export function useProjectAccess(workspaceSlug: string) {
  const membersQuery = useWorkspaceMembers(workspaceSlug)
  const { data: me } = useMe()
  const role = membersQuery.data?.find((member) => member.user_id === me?.id)?.role
  return { membersQuery, canManage: !membersQuery.isError && (role === 'owner' || role === 'admin') }
}
