"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { FolderOpen, Plus } from "lucide-react";
import type { Issue } from "@/shared/api/types";
import { useLabels, useMemberUsers, useProject, useStates } from "@/shared/api/lookups";
import { Button, Kbd } from "@/shared/ui/button";
import { BoardColumn } from "./board-column";
import { CreateIssueModal } from "./create-issue-modal";
import { IssueFilters } from "./issue-filters";
import { useGetIssuesQuery } from "../api";

/**
 * D1.9 Kanban board: колонки = статусы проекта («полосы движения»).
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
  const { data: issues = [], isLoading, isError } = useGetIssuesQuery(workspaceSlug, projectId);

  if (!project) return <p className="p-7 text-muted">Project not found</p>;
if (isLoading) return <p className="p-7 text-muted">Loading tasks...</p>;
if (isError) return <p className="p-7 text-red-600">Could not load tasks</p>;
  const doneStateIds = new Set(states.filter((s) => s.group === "completed").map((s) => s.id));
  const meta = (issue: Issue) => {
    const children = issues.filter((i) => i.parent_id === issue.id);
    return {
      subTasks: { done: children.filter((c) => doneStateIds.has(c.state_id)).length, total: children.length },
      commentCount: 0, // бэкенд не присылает количество комментариев в списке задач
    };
  };

  const openCreate = (stateId?: string) => {
    setCreateInState(stateId);
    setCreateOpen(true);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <IssueFilters
        members={members}
        labels={labels}
        states={states}
        actions={
          <Button onClick={() => openCreate()}>
            <Plus className="size-4" strokeWidth={2.2} /> New task <Kbd>C</Kbd>
          </Button>
        }
      />

      <div className="relative flex min-h-0 flex-1 snap-x overflow-x-auto px-2 md:px-3">
        {states.map((state, index) => (
          <BoardColumn
            key={state.id}
            first={index === 0}
            state={state}
            issues={issues.filter((i) => i.state_id === state.id)}
            identifier={project.identifier}
            meta={meta}
            onIssueClick={(issue) => router.push(`/w/${workspaceSlug}/p/${projectId}/issues/${issue.id}`)}
            onAddClick={() => openCreate(state.id)}
          />
        ))}

        {/* Пустой проект */}
        {issues.length === 0 && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-4">
            <div className="pointer-events-auto w-full max-w-md rounded-2xl border border-line bg-white p-8 text-center shadow-[0_24px_60px_-24px_rgba(30,34,42,.35)]">
              <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-marking-soft text-[#8a6410]">
                <FolderOpen className="size-6" />
              </span>
              <h2 className="mt-4 text-lg font-semibold tracking-tight">No tasks yet</h2>
              <p className="mt-1 text-muted">Create the first task and it will appear in its lane.</p>
              <Button className="mt-5" onClick={() => openCreate()}>
                <Plus className="size-4" /> Create a task
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
