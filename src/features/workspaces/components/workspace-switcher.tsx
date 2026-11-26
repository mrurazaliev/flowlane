import Link from "next/link";
import { ChevronsUpDown } from "lucide-react";
import { useWorkspace } from "@/shared/api/lookups";

/**
 * D2.2 Переключатель workspace (слот вверху сайдбара).
 * Пока ведёт на страницу выбора; позже — выпадающий список из GET /workspaces.
 */
export function WorkspaceSwitcher({ workspaceSlug }: { workspaceSlug: string }) {
  const { data: workspace } = useWorkspace(workspaceSlug);
  const name = workspace?.name ?? workspaceSlug;

  return (
    <Link
      href="/workspaces"
      className="flex items-center gap-2 rounded-md border border-gray-200 px-3 py-2 hover:bg-gray-50"
    >
      <span className="flex size-6 items-center justify-center rounded bg-indigo-100 text-xs font-semibold text-indigo-700">
        {name[0]?.toUpperCase()}
      </span>
      <span className="flex-1 truncate text-sm font-medium text-gray-800">{name}</span>
      <ChevronsUpDown className="size-4 text-gray-400" />
    </Link>
  );
}
