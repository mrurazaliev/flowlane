"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Link2, Plus, Trash2 } from "lucide-react";
import { useMemberUsers, useProject, useStates } from "@/shared/api/lookups";
import { Button } from "@/shared/ui/button";
import { Select } from "@/shared/ui/form";
import { PriorityIcon, StateIcon, priorityLabels, priorityOrder } from "@/shared/ui/issue-icons";
import { Tabs } from "@/shared/ui/tabs";
import { formatDate } from "@/shared/lib/utils";
import { activity, attachments, comments, issues } from "../mocks";
import { Attachments } from "./attachments";
import { Comments } from "./comments";

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
  const [tab, setTab] = useState<"comments" | "activity">("comments");

  const { data: project } = useProject(workspaceSlug, projectId);
  const { data: states } = useStates(workspaceSlug, projectId);
  const { data: members } = useMemberUsers(workspaceSlug);

  const issue = issues.find((i) => i.id === issueId);
  if (!issue || !project) return <p className="p-6 text-sm text-gray-500">Task not found</p>;

  const key = (seq: number) => `${project.identifier}-${seq}`;
  const parent = issues.find((i) => i.id === issue.parent_id);
  const subIssues = issues.filter((i) => i.parent_id === issue.id);
  const doneSubIssues = subIssues.filter((i) => states.find((s) => s.id === i.state_id)?.group === "completed");
  const base = `/w/${workspaceSlug}/p/${projectId}`;

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto grid max-w-6xl gap-8 p-6 lg:grid-cols-[1fr_300px]">
        {/* Левая колонка */}
        <div className="min-w-0 space-y-8">
          <div>
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Link href={`${base}/board`} className="inline-flex items-center gap-1 hover:text-gray-800">
                  <ArrowLeft className="size-4" /> Board
                </Link>
                <span>/</span>
                {parent && (
                  <>
                    <Link href={`${base}/issues/${parent.id}`} className="hover:text-gray-800">
                      {key(parent.sequence_id)}
                    </Link>
                    <span>/</span>
                  </>
                )}
                <span className="font-medium text-indigo-600">{key(issue.sequence_id)}</span>
              </div>
              <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50">
                <Trash2 className="size-4" /> Delete
              </Button>
            </div>

            <input
              defaultValue={issue.title}
              className="w-full rounded-md text-2xl font-semibold text-gray-900 outline-none focus:bg-gray-50"
            />
            <textarea
              defaultValue={issue.description ?? ""}
              placeholder="Add a description… (markdown)"
              className="mt-3 min-h-32 w-full rounded-md border border-transparent p-2 text-sm text-gray-700 outline-none hover:border-gray-200 focus:border-indigo-500"
            />
          </div>

          {/* D1.11 Подзадачи — только 1 уровень */}
          <section>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Sub-tasks{" "}
                {subIssues.length > 0 && (
                  <span className="text-gray-400">
                    ({doneSubIssues.length}/{subIssues.length} done)
                  </span>
                )}
              </h3>
              {/* У подзадачи нет кнопки "Add sub-task" */}
              {!issue.parent_id && (
                <button className="flex items-center gap-1 text-sm text-indigo-600 hover:underline">
                  <Plus className="size-4" /> Add sub-task
                </button>
              )}
            </div>
            {subIssues.length === 0 ? (
              <p className="text-sm text-gray-400">No sub-tasks</p>
            ) : (
              <ul className="divide-y divide-gray-100 rounded-lg border border-gray-200">
                {subIssues.map((sub) => {
                  const state = states.find((s) => s.id === sub.state_id);
                  return (
                    <li key={sub.id}>
                      <Link href={`${base}/issues/${sub.id}`} className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50">
                        {state && <StateIcon group={state.group} color={state.color} />}
                        <span className="text-xs text-gray-500">{key(sub.sequence_id)}</span>
                        <span className="flex-1 truncate text-sm text-gray-900">{sub.title}</span>
                        <PriorityIcon priority={sub.priority} />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          {/* D1.12 Связи: blocks, blocked_by, relates_to, duplicates */}
          <section>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Relations</h3>
              <button className="flex items-center gap-1 text-sm text-indigo-600 hover:underline">
                <Link2 className="size-4" /> Add relation
              </button>
            </div>
            <p className="text-sm text-gray-400">No relations</p>
          </section>

          {/* D1.15 Файлы */}
          <Attachments attachments={attachments.filter((a) => a.issue_id === issue.id)} />

          {/* D1.13 Комментарии / D1.14 История */}
          <section>
            <Tabs
              className="mb-4"
              value={tab}
              onChange={setTab}
              tabs={[
                { value: "comments", label: "Comments" },
                { value: "activity", label: "Activity" },
              ]}
            />
            {tab === "comments" ? (
              <Comments comments={comments.filter((c) => c.issue_id === issue.id)} />
            ) : (
              <ul className="space-y-3">
                {activity
                  .filter((a) => a.issue_id === issue.id)
                  .map((a) => (
                    <li key={a.id} className="flex gap-2 text-sm">
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-gray-300" />
                      <span className="text-gray-700">
                        <span className="font-medium text-gray-900">{a.actor}</span> {a.text}
                        <span className="ml-2 text-xs text-gray-400">{formatDate(a.created_at)}</span>
                      </span>
                    </li>
                  ))}
              </ul>
            )}
          </section>
        </div>

        {/* Правая колонка: свойства */}
        <aside className="h-fit space-y-4 rounded-xl border border-gray-200 bg-white p-4">
          <Property label="Status">
            <Select defaultValue={issue.state_id}>
              {states.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </Select>
          </Property>
          <Property label="Priority">
            <Select defaultValue={issue.priority}>
              {priorityOrder.map((p) => (
                <option key={p} value={p}>
                  {priorityLabels[p]}
                </option>
              ))}
            </Select>
          </Property>
          <Property label="Assignee">
            <Select defaultValue={issue.assignees[0]?.user_id ?? ""}>
              <option value="">Unassigned</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.display_name}
                </option>
              ))}
            </Select>
          </Property>
          <Property label="Labels">
            <div className="flex flex-wrap gap-1.5">
              {issue.labels.length === 0 && <span className="text-sm text-gray-400">No labels</span>}
              {issue.labels.map(({ label }) => (
                <span key={label.id} className="flex items-center gap-1 rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-700">
                  <span className="size-1.5 rounded-full" style={{ backgroundColor: label.color }} />
                  {label.name}
                </span>
              ))}
            </div>
          </Property>
          <div className="grid grid-cols-2 gap-3">
            <Property label="Start date">
              <input
                type="date"
                defaultValue={issue.start_date?.slice(0, 10) ?? ""}
                className="h-10 w-full rounded-md border border-gray-200 px-2 text-sm"
              />
            </Property>
            <Property label="Due date">
              <input
                type="date"
                defaultValue={issue.due_date?.slice(0, 10) ?? ""}
                className="h-10 w-full rounded-md border border-gray-200 px-2 text-sm"
              />
            </Property>
          </div>
          <p className="border-t border-gray-100 pt-3 text-xs text-gray-400">
            Created {formatDate(issue.created_at)} · Updated {formatDate(issue.updated_at)}
          </p>
        </aside>
      </div>
    </div>
  );
}

function Property({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1 text-xs font-medium text-gray-500">{label}</p>
      {children}
    </div>
  );
}
