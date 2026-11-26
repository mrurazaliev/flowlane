"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { FolderOpen, Plus } from "lucide-react";
import { useLabels, useMemberUsers, useProject, useStates } from "@/shared/api/lookups";
import { Button } from "@/shared/ui/button";
import { issues as allIssues } from "../mocks";
import { BoardColumn } from "./board-column";
import { CreateIssueModal } from "./create-issue-modal";
import { IssueFilters } from "./issue-filters";

/**
 * D1.9 Kanban board: колонки = статусы проекта.
 * Позже: useIssues() вместо моков; drag (dnd-kit) → PATCH state_id сразу (optimistic), при ошибке откат.
 */
export function Board() {
  const { workspaceSlug, projectId } = useParams<{ workspaceSlug: string; projectId: string }>();
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const [createInState, setCreateInState] = useState<string | undefined>();

  const { data: project } = useProject(workspaceSlug, projectId);
  const { data: states } = useStates(workspaceSlug, projectId);
  const { data: members } = useMemberUsers(workspaceSlug);
  const { data: labels } = useLabels(workspaceSlug, projectId);
  const issues = allIssues.filter((i) => i.project_id === projectId);

  if (!project) return <p className="p-6 text-sm text-gray-500">Project not found</p>;

  const openCreate = (stateId?: string) => {
    setCreateInState(stateId);
    setCreateOpen(true);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Поиск, фильтры и создание задачи */}
      <div className="flex items-center justify-between gap-4 border-b border-gray-200 bg-white px-6 py-3">
        <IssueFilters members={members} labels={labels} states={states} />
        <Button onClick={() => openCreate()}>
          <Plus className="size-4" /> New task
        </Button>
      </div>

      {/* Колонки */}
      <div className="relative flex flex-1 gap-4 overflow-x-auto p-6">
        {states.map((state) => (
          <BoardColumn
            key={state.id}
            state={state}
            issues={issues.filter((i) => i.state_id === state.id)}
            identifier={project.identifier}
            onIssueClick={(issue) => router.push(`/w/${workspaceSlug}/p/${projectId}/issues/${issue.id}`)}
            onAddClick={() => openCreate(state.id)}
          />
        ))}

        {/* Пустой проект */}
        {issues.length === 0 && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="pointer-events-auto w-full max-w-md rounded-xl border border-gray-200 bg-white p-8 text-center shadow-lg">
              <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                <FolderOpen className="size-6" />
              </span>
              <h2 className="mt-4 text-lg font-semibold text-gray-900">No tasks yet — create your first task</h2>
              <p className="mt-1 text-sm text-gray-500">Tasks track bugs, features and chores for this project.</p>
              <Button className="mt-5" onClick={() => openCreate()}>
                <Plus className="size-4" /> Create task
              </Button>
            </div>
          </div>
        )}
      </div>

      <CreateIssueModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        states={states}
        members={members}
        labels={labels}
        defaultStateId={createInState}
      />
    </div>
  );
}
