import { Archive, Trash2 } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { FieldHint, Input, Label, Select, Textarea } from "@/shared/ui/form";
import { useMemberUsers } from "@/shared/api/lookups";
import type { Project } from "@/shared/api/types";

/** D2.8 Основные настройки проекта. Позже: PATCH / DELETE proj */
export function GeneralSettings({ project, workspaceSlug }: { project: Project; workspaceSlug: string }) {
  const { data: members } = useMemberUsers(workspaceSlug);

  return (
    <div className="space-y-6">
      <form className="space-y-4 rounded-xl border border-gray-200 bg-white p-6" onSubmit={(e) => e.preventDefault()}>
        <h2 className="text-base font-semibold text-gray-900">General</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">
            <Label htmlFor="p-name">Project name</Label>
            <Input id="p-name" defaultValue={project.name} />
          </div>
          <div>
            <Label htmlFor="p-identifier">Identifier</Label>
            <Input id="p-identifier" defaultValue={project.identifier} className="uppercase" maxLength={10} />
          </div>
        </div>
        <div>
          <Label htmlFor="p-description">Description</Label>
          <Textarea id="p-description" defaultValue={project.description ?? ""} maxLength={500} />
          <FieldHint>Max 500 characters</FieldHint>
        </div>
        <div>
          <Label htmlFor="p-lead">Project lead</Label>
          <Select id="p-lead" defaultValue={project.lead_id ?? ""}>
            <option value="">No lead</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.display_name}
              </option>
            ))}
          </Select>
        </div>
        <div className="flex justify-end">
          <Button type="submit">Save changes</Button>
        </div>
      </form>

      <section className="rounded-xl border border-red-200 bg-white p-6">
        <h2 className="text-base font-semibold text-red-700">Danger zone</h2>
        <div className="mt-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-gray-900">Archive project</p>
            <p className="text-sm text-gray-500">Hide the project from the sidebar. You can restore it later.</p>
          </div>
          <Button variant="secondary">
            <Archive className="size-4" /> Archive
          </Button>
        </div>
        <div className="mt-4 flex items-center justify-between gap-4 border-t border-gray-100 pt-4">
          <div>
            <p className="text-sm font-medium text-gray-900">Delete project</p>
            <p className="text-sm text-gray-500">All tasks, cycles and modules will be deleted.</p>
          </div>
          <Button variant="danger">
            <Trash2 className="size-4" /> Delete
          </Button>
        </div>
      </section>
    </div>
  );
}
