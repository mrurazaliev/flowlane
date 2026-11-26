import { X } from "lucide-react";
import type { ProjectRole } from "@/shared/api/types";
import { Avatar } from "@/shared/ui/avatar";
import { Button } from "@/shared/ui/button";
import { Select } from "@/shared/ui/form";
import { useProjectMembers, useWorkspaceMembers } from "@/shared/api/lookups";

const roles: ProjectRole[] = ["admin", "member", "viewer"];

/** Участники проекта. Добавлять можно только тех, кто уже в workspace */
export function ProjectMembersSettings({ workspaceSlug, projectId }: { workspaceSlug: string; projectId: string }) {
  const { data: workspaceMembers } = useWorkspaceMembers(workspaceSlug);
  const { data: projectMembers } = useProjectMembers(workspaceSlug, projectId);
  const notInProject = workspaceMembers.filter((wm) => !projectMembers.some((pm) => pm.user_id === wm.user_id));

  return (
    <div className="space-y-4">
      <form className="flex gap-2 rounded-xl border border-gray-200 bg-white p-4" onSubmit={(e) => e.preventDefault()}>
        <Select defaultValue="" className="flex-1">
          <option value="" disabled>
            Add a workspace member…
          </option>
          {notInProject.map((m) => (
            <option key={m.user_id} value={m.user_id}>
              {m.user.display_name} ({m.user.email})
            </option>
          ))}
        </Select>
        <Select defaultValue="member" className="w-32">
          {roles.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </Select>
        <Button type="submit">Add</Button>
      </form>

      <ul className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white">
        {projectMembers.map((m) => (
          <li key={m.user_id} className="flex items-center gap-3 px-4 py-3">
            <Avatar name={m.user.display_name} size="md" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{m.user.display_name}</p>
              <p className="text-xs text-gray-500">{m.user.email}</p>
            </div>
            <Select defaultValue={m.role} className="h-9 w-32">
              {roles.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </Select>
            <button className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600" aria-label="Remove">
              <X className="size-4" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
