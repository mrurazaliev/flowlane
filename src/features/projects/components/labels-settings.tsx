import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/form";
import { useLabels } from "@/shared/api/lookups";

/** Метки проекта. Позже: useLabels() + create/update/delete */
export function LabelsSettings({ workspaceSlug, projectId }: { workspaceSlug: string; projectId: string }) {
  const { data: labels } = useLabels(workspaceSlug, projectId);

  return (
    <div className="space-y-4">
      <form
        className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white p-4"
        onSubmit={(e) => e.preventDefault()}
      >
        <input type="color" defaultValue="#4F46E5" className="size-10 cursor-pointer rounded-md border border-gray-200 p-1" />
        <Input placeholder="New label name" className="flex-1" />
        <Button type="submit">
          <Plus className="size-4" /> Add label
        </Button>
      </form>

      <ul className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white">
        {labels.map((label) => (
          <li key={label.id} className="flex items-center gap-3 px-4 py-3">
            <span className="size-3 rounded-full" style={{ backgroundColor: label.color }} />
            <span className="text-sm text-gray-900">{label.name}</span>
            <div className="ml-auto flex gap-1">
              <button className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700" aria-label="Edit">
                <Pencil className="size-4" />
              </button>
              <button className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600" aria-label="Delete">
                <Trash2 className="size-4" />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
