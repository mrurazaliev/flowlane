"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronLeft, Link2, Plus, Trash2 } from "lucide-react";
import { useMemberUsers, useProject, useStates } from "@/shared/api/lookups";
import { LabelChip } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Dropdown } from "@/shared/ui/dropdown";
import { StateIcon } from "@/shared/ui/issue-icons";
import { memberOptions, priorityOptions, stateOptions } from "@/shared/ui/issue-options";
import { formatDate } from "@/shared/lib/utils";
import { activity, attachments, comments, issues } from "../mocks";
import { Attachments } from "./attachments";
import { Discussion } from "./comments";

/**
 * D1.10 Страница задачи /w/:slug/p/:projectId/issues/:issueId (в URL — UUID, ключ WEB-6 только текстом).
 * Позже: GET/PATCH/DELETE .../issues/:issueId, inline-редактирование, markdown в описании.
 */
export function IssueDetail() {
  const { workspaceSlug, projectId, issueId } = useParams<{
    workspaceSlug: string;
    projectId: string;
    issueId: string;
  }>();

  const { data: project } = useProject(workspaceSlug, projectId);
  const { data: states } = useStates(workspaceSlug, projectId);
  const { data: members } = useMemberUsers(workspaceSlug);

  const issue = issues.find((i) => i.id === issueId);
  if (!issue || !project) return <p className="p-7 text-muted">Task not found</p>;

  const key = (seq: number) => `${project.identifier}-${seq}`;
  const base = `/w/${workspaceSlug}/p/${projectId}`;
  const parent = issues.find((i) => i.id === issue.parent_id);
  const subIssues = issues.filter((i) => i.parent_id === issue.id);
  const stateOf = (id: string) => states.find((s) => s.id === id);
  const doneCount = subIssues.filter((i) => stateOf(i.state_id)?.group === "completed").length;

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto lg:flex-row lg:overflow-hidden">
      {/* Основная колонка */}
      <article className="min-w-0 flex-1 px-4 pb-12 pt-6 md:px-14 lg:overflow-y-auto">
        <div className="mx-auto max-w-[720px]">
          <div className="flex items-center gap-2 text-[13px] text-muted">
            <Link href={`${base}/board`} className="flex items-center gap-0.5 hover:text-ink">
              <ChevronLeft className="size-4" /> Board
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
            <Button variant="ghost" size="sm" className="ml-auto text-red-600 hover:bg-red-50 hover:text-red-700">
              <Trash2 className="size-4" /> Delete
            </Button>
          </div>

          <textarea
            defaultValue={issue.title}
            rows={1}
            aria-label="Title"
            className="mt-3 w-full resize-none rounded-lg bg-transparent text-[28px] font-semibold leading-tight tracking-tight outline-none field-sizing-content focus:bg-white md:text-[30px]"
          />
          <textarea
            defaultValue={issue.description ?? ""}
            placeholder="Add a description…"
            aria-label="Description"
            className="mt-2 min-h-28 w-full resize-none rounded-lg bg-transparent p-0 text-[15px] leading-relaxed text-gray-700 outline-none field-sizing-content placeholder:text-faint focus:bg-white"
          />

          {/* D1.11 Подзадачи — только 1 уровень */}
          <Section
            title="Sub-tasks"
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
                <SectionAction>
                  <Plus className="size-3.5" /> Add sub-task
                </SectionAction>
              )
            }
          >
            {subIssues.length === 0 ? (
              <p className="text-faint">No sub-tasks</p>
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

          {/* D1.12 Связи: blocks, blocked_by, relates_to, duplicates */}
          <Section
            title="Relations"
            action={
              <SectionAction>
                <Link2 className="size-3.5" /> Add relation
              </SectionAction>
            }
          >
            <p className="text-faint">No relations yet</p>
          </Section>

          {/* D1.15 Файлы */}
          <Attachments attachments={attachments.filter((a) => a.issue_id === issue.id)} />

          {/* D1.13 Комментарии + D1.14 История — одной лентой */}
          <Discussion
            comments={comments.filter((c) => c.issue_id === issue.id)}
            activity={activity.filter((a) => a.issue_id === issue.id)}
          />
        </div>
      </article>

      {/* Свойства задачи */}
      <aside className="shrink-0 border-t border-line bg-white px-5 py-5 lg:w-[340px] lg:overflow-y-auto lg:border-l lg:border-t-0">
        <h2 className="mb-2 text-[13px] text-muted">Properties</h2>
        <Property label="Status">
          <Dropdown variant="inline" value={issue.state_id} options={stateOptions(states)} ariaLabel="Status" />
        </Property>
        <Property label="Priority">
          <Dropdown variant="inline" value={issue.priority} options={priorityOptions()} ariaLabel="Priority" searchPlaceholder="Change priority…" />
        </Property>
        <Property label="Assignee">
          <Dropdown variant="inline" value={issue.assignees[0]?.user_id ?? "none"} options={memberOptions(members)} ariaLabel="Assignee" />
        </Property>
        <Property label="Labels">
          <div className="flex flex-wrap gap-1 py-1.5">
            {issue.labels.length === 0 && <span className="text-faint">No labels</span>}
            {issue.labels.map(({ label }) => (
              <LabelChip key={label.id} name={label.name} color={label.color} />
            ))}
          </div>
        </Property>
        <Property label="Start">
          <DateField value={issue.start_date} />
        </Property>
        <Property label="Due">
          <DateField value={issue.due_date} />
        </Property>

        <p className="mt-4 border-t border-line-soft pt-4 text-[12.5px] leading-relaxed text-muted">
          Created on {formatDate(issue.created_at)}
          <br />
          Updated on {formatDate(issue.updated_at)}
        </p>
      </aside>
    </div>
  );
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

function SectionAction({ children }: { children: React.ReactNode }) {
  return <button className="flex items-center gap-1 text-[13px] font-medium text-muted hover:text-ink">{children}</button>;
}

function Property({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex min-h-10 items-center">
      <span className="w-24 shrink-0 text-[13px] text-muted">{label}</span>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

function DateField({ value }: { value: string | null }) {
  return (
    <input
      type="date"
      defaultValue={value?.slice(0, 10) ?? ""}
      className="-ml-2 h-9 w-full rounded-lg bg-transparent px-2 text-sm text-ink outline-none hover:bg-gray-100 focus:bg-gray-100"
    />
  );
}
