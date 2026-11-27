import { useMe } from "@/features/auth";
import { useWorkspaceMembersQuery } from "@/features/workspaces";

export function useProjectAccess(workspaceSlug: string) {
  const membersQuery = useWorkspaceMembersQuery(workspaceSlug);
  const { data: me } = useMe();
  const role = membersQuery.data?.find((member) => member.user_id === me?.id)?.role;
  return { membersQuery, canManage: !membersQuery.isError && (role === "owner" || role === "admin") };
}
