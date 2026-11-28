"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AlertCircle, Check, ChevronLeft, Loader2, Plus, Trash2, X } from "lucide-react";
import { isAxiosError } from "axios";
import { useLabels, useMemberUsers, useProject, useStates } from "@/shared/api/lookups";
import { errorText } from "@/shared/lib/errors";
import { Button } from "@/shared/ui/button";
import { Dropdown } from "@/shared/ui/dropdown";
import { ErrorBanner } from "@/shared/ui/form";
import { StateIcon } from "@/shared/ui/issue-icons";
import { memberOptions, priorityOptions, stateOptions } from "@/shared/ui/issue-options";
import { Modal } from "@/shared/ui/modal";
import { formatDate } from "@/shared/lib/utils";
import { CreateIssueModal } from "./create-issue-modal";
import { Discussion } from "./comments";
import {
  useAddAssigneeMutation,
  useAddLabelMutation,
  useDeleteIssueMutation,
  useEditIssueMutation,
  useGetIssueQuery,
  useGetIssuesQuery,
  useRemoveAssigneeMutation,
  useRemoveLabelMutation,
} from "../api";
import { useT } from "@/shared/lib/i18n";

export function IssueDetail() {
  const t = useT();
  const { workspaceSlug, projectId, issueId } = useParams<{
    workspaceSlug: string;
    projectId: string;
    issueId: string;
  }>();
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [subTaskOpen, setSubTaskOpen] = useState(false);

  const { data: project } = useProject(workspaceSlug, projectId);
  const { data: states } = useStates(workspaceSlug, projectId);
  const { data: members } = useMemberUsers(workspaceSlug);

  const { data: issue, isLoading, isError } = useGetIssueQuery(workspaceSlug, projectId, issueId);
  const { data: issues = [] } = useGetIssuesQuery(workspaceSlug, projectId);
  const { data: labels } = useLabels(workspaceSlug, projectId);
  const editIssue = useEditIssueMutation(workspaceSlug, projectId, issueId);
  const addAssignee = useAddAssigneeMutation(workspaceSlug, projectId, issueId);
  const removeAssignee = useRemoveAssigneeMutation(workspaceSlug, projectId, issueId);
  const addLabel = useAddLabelMutation(workspaceSlug, projectId, issueId);
  const removeLabel = useRemoveLabelMutation(workspaceSlug, projectId, issueId);
  const deleteIssue = useDeleteIssueMutation(workspaceSlug, projectId);

  if (isLoading) return <p className="p-7 text-muted">{t("Loading task...")}</p>;
  if (isError || !issue || !project) return <p className="p-7 text-muted">{t("Task not found")}</p>;

  const handleDelete = async () => {
    await deleteIssue.mutateAsync(issue.id);
    setDeleteOpen(false);
    router.push(`/w/${workspaceSlug}/p/${projectId}/board`);
  };

  const deleteError =
    deleteIssue.error && isAxiosError(deleteIssue.error) ? errorText(deleteIssue.error.response?.data) : null;

  const changeAssignee = async (userId: string) => {
    const current = issue.assignees[0]?.user_id;
    if (current === userId) return;
    if (current) await removeAssignee.mutateAsync(current);
    if (userId !== "none") await addAssignee.mutateAsync(userId);
  };

  const issueLabelIds = issue.labels.map(({ label }) => label.id);
  const availableLabels = labels.filter((l) => !issueLabelIds.includes(l.id));

  const lastSave = [editIssue, addAssignee, removeAssignee, addLabel, removeLabel].reduce((latest, m) =>
    m.submittedAt > latest.submittedAt ? m : latest,
  );

  const key = (seq: number) => `${project.identifier}-${seq}`;
  const base = `/w/${workspaceSlug}/p/${projectId}`;
  const parent = issues.find((i) => i.id === issue.parent_id);
  const subIssues = issues.filter((i) => i.parent_id === issue.id);
  const stateOf = (id: string) => states.find((s) => s.id === id);
  const doneCount = subIssues.filter((i) => stateOf(i.state_id)?.group === "completed").length;

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto lg:flex-row lg:overflow-hidden">
      <article className="min-w-0 flex-1 px-4 pb-12 pt-6 md:px-14 lg:overflow-y-auto">
        <div className="mx-auto max-w-[720px]">
          <div className="flex items-center gap-2 text-[13px] text-muted">
            <Link href={`${base}/board`} className="flex items-center gap-0.5 hover:text-ink">
              <ChevronLeft className="size-4" /> {t("Board")}
            </Link>
            <span className="text-faint">/</span>
            {parent && (
              <>
                <Link href={`${base}/issues/${parent.id}`} className="hover:text-ink">
                  {key(parent.sequence_id)}
                </Link>
                <span className="text-faint">/</span>
              </>
            )}
            <span className="font-medium text-ink">{key(issue.sequence_id)}</span>

            <span className="ml-auto">
              <SaveStatus pending={lastSave.isPending} failed={lastSave.isError} saved={lastSave.isSuccess} />
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDeleteOpen(true)}
              className="text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              <Trash2 className="size-4" /> {t("Delete")}
            </Button>
          </div>

          <div className="group mt-3">
            <textarea
              key={`title-${issue.id}`}
              defaultValue={issue.title}
              placeholder={t("Task title")}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  e.currentTarget.blur();
                }
                if (e.key === "Escape") {
                  e.currentTarget.value = issue.title;
                  e.currentTarget.blur();
                }
              }}
              onBlur={(e) => {
                const title = e.target.value.trim();
                if (!title) e.target.value = issue.title;
                else if (title !== issue.title) editIssue.mutate({ title });
              }}
              rows={1}
              aria-label={t("Title")}
              className="-mx-2 w-[calc(100%+1rem)] resize-none rounded-lg border border-transparent bg-transparent px-2 py-1 text-[28px] font-semibold leading-tight tracking-tight outline-none transition-colors field-sizing-content hover:border-line focus:border-marking focus:bg-white md:text-[30px]"
            />
            <p className="hidden px-0.5 pt-1 text-xs text-muted group-focus-within:block">
              {t("Enter to save, Esc to cancel")}
            </p>
          </div>

          <div className="group mt-2">
            <textarea
              key={`description-${issue.id}`}
              defaultValue={issue.description ?? ""}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  e.currentTarget.value = issue.description ?? "";
                  e.currentTarget.blur();
                }
              }}
              onBlur={(e) => {
                const description = e.target.value;
                if (description !== (issue.description ?? "")) editIssue.mutate({ description: description || null });
              }}
              placeholder={t("Add a description…")}
              aria-label={t("Description")}
              className="-mx-2 min-h-28 w-[calc(100%+1rem)] resize-none rounded-lg border border-transparent bg-transparent px-2 py-1.5 text-[15px] leading-relaxed text-gray-700 outline-none transition-colors field-sizing-content placeholder:text-faint hover:border-line focus:border-marking focus:bg-white"
            />
            <p className="hidden px-0.5 pt-1 text-xs text-muted group-focus-within:block">
              {t("Saves when you click outside. Esc to cancel")}
            </p>
          </div>

          <Section
            title={t("Sub-tasks")}
            meta={
              subIssues.length > 0 && (
                <>
                  {doneCount} of {subIssues.length} done
                  <span className="ml-2 inline-block h-1 w-20 overflow-hidden rounded-full bg-line-soft align-middle">
                    <span className="block h-full bg-[#3a9a6b]" style={{ width: `${(doneCount / subIssues.length) * 100}%` }} />
                  </span>
                </>
              )
            }
            action={
              !issue.parent_id && (
                <SectionAction onClick={() => setSubTaskOpen(true)}>
                  <Plus className="size-3.5" /> {t("Add sub-task")}
                </SectionAction>
              )
            }
          >
            {subIssues.length === 0 ? (
              <p className="text-faint">{t("No sub-tasks")}</p>
            ) : (
              <ul className="divide-y divide-line-soft rounded-xl border border-line bg-white">
                {subIssues.map((sub) => {
                  const state = stateOf(sub.state_id);
                  return (
                    <li key={sub.id}>
                      <Link href={`${base}/issues/${sub.id}`} className="flex items-center gap-3 px-3.5 py-2.5 hover:bg-gray-50">
                        {state && <StateIcon group={state.group} color={state.color} />}
                        <span className="w-14 text-[12.5px] text-muted">{key(sub.sequence_id)}</span>
                        <span className="flex-1 truncate">{sub.title}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </Section>

          <Discussion issueId={issue.id} />
        </div>
      </article>

      <aside className="shrink-0 border-t border-line bg-white px-5 py-5 lg:w-[340px] lg:overflow-y-auto lg:border-l lg:border-t-0">
        <h2 className="mb-2 text-[13px] text-muted">{t("Properties")}</h2>
        <Property label={t("Status")}>
          <Dropdown
            variant="inline"
            value={issue.state_id}
            onChange={(state_id) => editIssue.mutate({ state_id })}
            options={stateOptions(states)}
            ariaLabel={t("Status")}
          />
        </Property>
        <Property label={t("Priority")}>
          <Dropdown
            variant="inline"
            value={issue.priority}
            onChange={(priority) => editIssue.mutate({ priority })}
            options={priorityOptions()}
            ariaLabel={t("Priority")}
            searchPlaceholder={t("Change priority…")}
          />
        </Property>
        <Property label={t("Assignee")}>
          <Dropdown
            key={`assignee-${issue.assignees[0]?.user_id ?? "none"}`}
            variant="inline"
            value={issue.assignees[0]?.user_id ?? "none"}
            onChange={(userId) => void changeAssignee(userId)}
            options={memberOptions(members)}
            ariaLabel={t("Assignee")}
            searchPlaceholder={t("Assign to…")}
          />
        </Property>
        <Property label={t("Labels")}>
          <div className="flex flex-wrap items-center gap-1 py-1.5">
            {issue.labels.map(({ label }) => (
              <span
                key={label.id}
                className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 py-px pl-2 pr-1 text-xs text-gray-600"
              >
                <span className="size-1.5 rounded-full" style={{ backgroundColor: label.color }} />
                {label.name}
                <button
                  onClick={() => removeLabel.mutate(label.id)}
                  disabled={removeLabel.isPending}
                  aria-label={t("Remove label {name}", { name: label.name })}
                  className="grid size-4 place-items-center rounded-full text-faint hover:bg-gray-200 hover:text-ink"
                >
                  <X className="size-3" />
                </button>
              </span>
            ))}

            {availableLabels.length > 0 ? (
              <Dropdown
                key={`add-label-${issue.labels.length}`}
                variant="ghost"
                value={null}
                placeholder={t("+ Add label")}
                onChange={(labelId) => addLabel.mutate(labelId)}
                options={availableLabels.map((l) => ({
                  value: l.id,
                  label: l.name,
                  icon: <span className="size-2 rounded-full" style={{ backgroundColor: l.color }} />,
                }))}
                ariaLabel={t("Add label")}
                searchPlaceholder={t("Find a label…")}
              />
            ) : (
              issue.labels.length === 0 && <span className="text-faint">{t("No labels in this project yet")}</span>
            )}
          </div>
        </Property>
        <Property label={t("Start")}>
          <DateField value={issue.start_date} onChange={(start_date) => editIssue.mutate({ start_date })} />
        </Property>
        <Property label={t("Due")}>
          <DateField value={issue.due_date} onChange={(due_date) => editIssue.mutate({ due_date })} />
        </Property>

        <p className="mt-4 border-t border-line-soft pt-4 text-[12.5px] leading-relaxed text-muted">
          Created on {formatDate(issue.created_at)}
          <br />
          Updated on {formatDate(issue.updated_at)}
        </p>
      </aside>

      <CreateIssueModal
        open={subTaskOpen}
        onClose={() => setSubTaskOpen(false)}
        states={states}
        members={members}
        labels={labels}
        parentId={issue.id}
      />

      <Modal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title={t("Delete this task?")}
        icon={<Trash2 className="size-5 text-red-600" />}
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteOpen(false)} disabled={deleteIssue.isPending}>
              {t("Cancel")}
            </Button>
            <Button variant="danger" onClick={handleDelete} disabled={deleteIssue.isPending}>
              {deleteIssue.isPending ? t("Deleting...") : t("Delete task")}
            </Button>
          </>
        }
      >
        <ErrorBanner>{deleteError}</ErrorBanner>
        <p className="text-muted">
          <span className="font-medium text-ink">
            {key(issue.sequence_id)} {issue.title}
          </span>{" "}
          will be deleted for everyone in the project, together with its comments and files. This can&apos;t be undone.
        </p>
      </Modal>
    </div>
  );
}

function SaveStatus({ pending, failed, saved }: { pending: boolean; failed: boolean; saved: boolean }) {
  const t = useT();
  if (pending) {
    return (
      <span className="flex items-center gap-1.5 text-muted" role="status">
        <Loader2 className="size-3.5 animate-spin" /> {t("Saving…")}
      </span>
    );
  }
  if (failed) {
    return (
      <span className="flex items-center gap-1.5 text-red-600" role="alert">
        <AlertCircle className="size-3.5" /> {t("Couldn't save")}
      </span>
    );
  }
  if (saved) {
    return (
      <span className="flex items-center gap-1.5 text-[#3a9a6b]" role="status">
        <Check className="size-3.5" /> {t("Saved")}
      </span>
    );
  }
  return null;
}

function Section({
  title,
  meta,
  action,
  children,
}: {
  title: string;
  meta?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-8">
      <div className="mb-2.5 flex items-center gap-2.5">
        <h3 className="text-[15px] font-semibold">{title}</h3>
        {meta && <span className="text-[13px] tabular-nums text-muted">{meta}</span>}
        <span className="ml-auto">{action}</span>
      </div>
      {children}
    </section>
  );
}

function SectionAction({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex items-center gap-1 text-[13px] font-medium text-muted hover:text-ink">
      {children}
    </button>
  );
}

function Property({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex min-h-10 items-center">
      <span className="w-24 shrink-0 text-[13px] text-muted">{label}</span>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

function DateField({ value, onChange }: { value: string | null; onChange: (date: string | null) => void }) {
  return (
    <input
      type="date"
      defaultValue={value?.slice(0, 10) ?? ""}
      onChange={(e) => onChange(e.target.value ? new Date(e.target.value).toISOString() : null)}
      className="-ml-2 h-9 w-full rounded-lg bg-transparent px-2 text-sm text-ink outline-none hover:bg-gray-100 focus:bg-gray-100"
    />
  );
}
