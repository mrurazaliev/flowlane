"use client";

import { Search } from "lucide-react";
import { useProject } from "@/shared/api/lookups";
import { Button } from "@/shared/ui/button";
import { PriorityIcon } from "@/shared/ui/issue-icons";
import { Modal } from "@/shared/ui/modal";
import { issues as allIssues, moduleIssueIds } from "../mocks";
import type { IssueListFilter } from "./issue-list";

interface AddIssuesModalProps {
  open: boolean;
  onClose: () => void;
  title: string; // "Add tasks to Sprint 3"
  hint?: string;
  workspaceSlug: string;
  projectId: string;
  /** Не показывать задачи, которые уже в этом цикле/модуле */
  exclude?: IssueListFilter;
  /** Позже: Dev 2 вызывает здесь POST .../cycles/:id/issues или .../modules/:id/issues */
  onAdd?: (issueIds: string[]) => void;
}

/** Выбор существующих задач — для Dev 2 (цикл и модуль) */
export function AddIssuesModal({ open, onClose, title, hint, workspaceSlug, projectId, exclude = {} }: AddIssuesModalProps) {
  const { data: project } = useProject(workspaceSlug, projectId);

  const issues = allIssues.filter(
    (i) =>
      i.project_id === projectId &&
      (!exclude.cycle || i.cycle_id !== exclude.cycle) &&
      (!exclude.module || !(moduleIssueIds[exclude.module] ?? []).includes(i.id)),
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      className="max-w-xl"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button>Add selected</Button>
        </>
      }
    >
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
        <input
          placeholder="Search tasks…"
          className="h-10 w-full rounded-md border border-gray-200 pl-9 pr-3 text-sm focus:border-indigo-500 focus:outline-none"
        />
      </div>

      <ul className="mt-3 max-h-72 divide-y divide-gray-100 overflow-y-auto rounded-lg border border-gray-200">
        {issues.length === 0 && <li className="px-4 py-6 text-center text-sm text-gray-400">No tasks to add</li>}
        {issues.map((issue) => (
          <li key={issue.id}>
            <label className="flex cursor-pointer items-center gap-3 px-4 py-2.5 hover:bg-gray-50">
              <input type="checkbox" className="size-4 accent-indigo-600" />
              <span className="w-16 text-xs font-medium text-gray-500">
                {project?.identifier}-{issue.sequence_id}
              </span>
              <span className="flex-1 truncate text-sm text-gray-900">{issue.title}</span>
              <PriorityIcon priority={issue.priority} />
            </label>
          </li>
        ))}
      </ul>

      {hint && <p className="mt-3 text-xs text-gray-500">{hint}</p>}
    </Modal>
  );
}
