"use client";

import { useState, type DragEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { FolderOpen, Plus } from "lucide-react";
import { isAxiosError } from "axios";
import { useProjectAccess } from "@/features/projects/use-project-access";
import type { Issue } from "@/shared/api/types";
import { useLabels, useMemberUsers, useProject, useStates } from "@/shared/api/lookups";
import { Button, Kbd } from "@/shared/ui/button";
import { ErrorBanner } from "@/shared/ui/form";
import { errorText } from "@/shared/lib/errors";
import { BoardColumn } from "./board-column";
import { CreateIssueModal } from "./create-issue-modal";
import { IssueFilters } from "./issue-filters";
import { useGetIssuesQuery, useMoveIssueMutation } from "../api";
import { useT } from "@/shared/lib/i18n";

export function Board() {
  const t = useT();
  const { workspaceSlug, projectId } = useParams<{ workspaceSlug: string; projectId: string }>();
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const [createInState, setCreateInState] = useState<string | undefined>();
  const [draggedIssue, setDraggedIssue] = useState<Issue | null>(null);

  const { data: project } = useProject(workspaceSlug, projectId);
  const { data: states } = useStates(workspaceSlug, projectId);
  const { data: members } = useMemberUsers(workspaceSlug);
  const { data: labels } = useLabels(workspaceSlug, projectId);
  const { canWrite } = useProjectAccess(workspaceSlug);
  const { data: issues = [], isLoading, isError } = useGetIssuesQuery(workspaceSlug, projectId, {}, { allPages: true });
  const moveIssue = useMoveIssueMutation(workspaceSlug, projectId);

  if (!project) return <p className="p-7 text-muted">{t("Project not found")}</p>;
  if (isLoading) return <p className="p-7 text-muted">{t("Loading tasks...")}</p>;
  if (isError) return <p className="p-7 text-red-600">{t("Could not load tasks")}</p>;
  const pendingMove = moveIssue.isPending ? moveIssue.variables : undefined;
  const boardIssues = pendingMove
    ? issues.map((issue) => issue.id === pendingMove.issueId ? { ...issue, state_id: pendingMove.stateId } : issue)
    : issues;
  const doneStateIds = new Set(states.filter((s) => s.group === "completed").map((s) => s.id));
  const meta = (issue: Issue) => {
    const children = boardIssues.filter((i) => i.parent_id === issue.id);
    return {
      subTasks: { done: children.filter((c) => doneStateIds.has(c.state_id)).length, total: children.length },
      commentCount: 0,
    };
  };

  const openCreate = (stateId?: string) => {
    setCreateInState(stateId);
    setCreateOpen(true);
  };

  function moveToState(issue: Issue, stateId: string) {
    if (!canWrite || moveIssue.isPending || issue.state_id === stateId) return;
    moveIssue.mutate({ issueId: issue.id, stateId });
  }

  function startDrag(event: DragEvent<HTMLButtonElement>, issue: Issue) {
    if (!canWrite || moveIssue.isPending) {
      event.preventDefault();
      return;
    }
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", issue.id);
    setDraggedIssue(issue);
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <IssueFilters
        members={members}
        labels={labels}
        states={states}
        actions={canWrite && (
          <Button onClick={() => openCreate()}>
            <Plus className="size-4" strokeWidth={2.2} /> {t("New task")} <Kbd>C</Kbd>
          </Button>
        )}
      />

      {moveIssue.isError && (
        <div className="px-4 py-2 md:px-7" role="alert">
          <ErrorBanner>
            {errorText(isAxiosError(moveIssue.error) ? moveIssue.error.response?.data : null, t("Could not move the task. Try again."))}
          </ErrorBanner>
        </div>
      )}
      <p className="sr-only" role="status">
        {moveIssue.isPending ? t("Moving task…") : moveIssue.isSuccess ? t("Task status saved.") : ""}
      </p>

      <div className="relative flex min-h-0 flex-1 snap-x overflow-x-auto px-4 pb-4 md:px-7">
        {states.map((state, index) => (
          <BoardColumn
            key={state.id}
            first={index === 0}
            state={state}
            issues={boardIssues.filter((i) => i.state_id === state.id)}
            identifier={project.identifier}
            meta={meta}
            onIssueClick={(issue) => router.push(`/w/${workspaceSlug}/p/${projectId}/issues/${issue.id}`)}
            onAddClick={canWrite ? () => openCreate(state.id) : undefined}
            states={states}
            canMove={canWrite && !moveIssue.isPending}
            draggedIssue={draggedIssue}
            onDragStart={startDrag}
            onDragEnd={() => setDraggedIssue(null)}
            onMove={moveToState}
          />
        ))}

        {issues.length === 0 && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-4">
            <div className="pointer-events-auto w-full max-w-md rounded-2xl border border-line bg-white p-8 text-center shadow-[0_24px_60px_-24px_rgba(30,34,42,.35)]">
              <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-marking-soft text-marking-dark">
                <FolderOpen className="size-6" />
              </span>
              <h2 className="mt-4 text-xl tracking-tight">{t("No tasks yet")}</h2>
              {canWrite && (
                <>
                  <p className="mt-1 text-muted">{t("Create the first task and it will appear in its lane.")}</p>
                  <Button className="mt-5" onClick={() => openCreate()}>
                    <Plus className="size-4" /> {t("Create a task")}
                  </Button>
                </>
              )}
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
