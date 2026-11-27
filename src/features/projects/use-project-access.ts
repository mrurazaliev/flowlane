import { useMe } from '@/features/auth'
import { useWorkspaceMembers } from '@/features/workspaces'

export function useProjectAccess(workspaceSlug: string) {
  const membersQuery = useWorkspaceMembers(workspaceSlug)
  const { data: me } = useMe()
  const role = membersQuery.data?.find((member) => member.user_id === me?.id)?.role
  const canManage = !membersQuery.isError && (role === 'owner' || role === 'admin')
  const canWrite = canManage || (!membersQuery.isError && role === 'member')
  return { membersQuery, canManage, canWrite }
}
