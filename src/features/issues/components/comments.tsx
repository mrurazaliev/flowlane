"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Send } from "lucide-react";
import { useMe } from "@/features/auth";
import { Avatar } from "@/shared/ui/avatar";
import { Button } from "@/shared/ui/button";
import { formatDate } from "@/shared/lib/utils";
import { useLabels, useMemberUsers, useStates } from "@/shared/api/lookups";
import { priorityLabels } from "@/shared/ui/issue-icons";
import type { Priority } from "@/shared/api/types";
import {
  type ActivityEntry,
  useAddCommentMutation,
  useDeleteCommentMutation,
  useEditCommentMutation,
  useGetActivityQuery,
  useGetCommentsQuery,
} from "../api";
import { useT } from "@/shared/lib/i18n";

export const Discussion = ({ issueId }: { issueId: string }) => {
  const t = useT();
  const { workspaceSlug, projectId } = useParams<{ workspaceSlug: string; projectId: string }>();
  const { data: me } = useMe();

  const { data: activityEntries = [] } = useGetActivityQuery(workspaceSlug, projectId, issueId);
  const { data: states } = useStates(workspaceSlug, projectId);
  const { data: members } = useMemberUsers(workspaceSlug);
  const { data: labels } = useLabels(workspaceSlug, projectId);

  const { data: comments = [], isLoading, isError } = useGetCommentsQuery(workspaceSlug, projectId, issueId);
  const addComment = useAddCommentMutation(workspaceSlug, projectId, issueId);
  const editComment = useEditCommentMutation(workspaceSlug, projectId, issueId);
  const deleteComment = useDeleteCommentMutation(workspaceSlug, projectId, issueId);

  const [text, setText] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = text.trim();
    if (!body) return;
    await addComment.mutateAsync(body);
    setText("");
  };

  const startEdit = (commentId: string, body: string) => {
    setEditingId(commentId);
    setEditText(body);
    setConfirmDeleteId(null);
  };

  const saveEdit = async () => {
    const body = editText.trim();
    if (!editingId || !body) return;
    await editComment.mutateAsync({ commentId: editingId, body });
    setEditingId(null);
  };

  const handleDelete = async (commentId: string) => {
    await deleteComment.mutateAsync(commentId);
    setConfirmDeleteId(null);
  };

  const nameOf = {
    state: (id: string | null) => states.find((s) => s.id === id)?.name ?? t("unknown"),
    user: (id: string | null) => members.find((u) => u.id === id)?.display_name ?? t("someone"),
    label: (id: string | null) => labels.find((l) => l.id === id)?.name ?? t("a label"),
    date: (value: string | null) => (value ? formatDate(value) : null),
    priority: (value: string | null) => (value ? t(priorityLabels[value as Priority] ?? value) : t("none")),
  };

  const describe = (entry: ActivityEntry): string | null => {
    const { action, field, old_value: from, new_value: to } = entry;
    switch (action) {
      case "issue.created":
        return t("created the task");
      case "issue.assignee_added":
        return t("assigned {user}", { user: nameOf.user(to) });
      case "issue.assignee_removed":
        return t("unassigned {user}", { user: nameOf.user(from) });
      case "issue.label_added":
        return t("added the label {label}", { label: nameOf.label(to) });
      case "issue.label_removed":
        return t("removed the label {label}", { label: nameOf.label(from) });
      case "issue.attachment_added":
        return t("attached a file");
      case "issue.attachment_removed":
        return t("removed a file");
      case "issue.updated":
        switch (field) {
          case "state_id":
            return t("changed status from {from} to {to}", { from: nameOf.state(from), to: nameOf.state(to) });
          case "priority":
            return t("changed priority from {from} to {to}", { from: nameOf.priority(from), to: nameOf.priority(to) });
          case "title":
            return t("renamed the task to “{title}”", { title: to ?? "" });
          case "description":
            return to ? t("updated the description") : t("removed the description");
          case "start_date":
            return to ? t("set the start date to {date}", { date: nameOf.date(to) ?? "" }) : t("removed the start date");
          case "due_date":
            return to ? t("set the due date to {date}", { date: nameOf.date(to) ?? "" }) : t("removed the due date");
          case "parent_id":
            return to ? t("made this a sub-task") : t("removed the parent task");
          default:
            return field ? t("updated {field}", { field }) : t("updated the task");
        }
      default:
        return null;
    }
  };

  const activity = activityEntries.flatMap((entry) => {
    const text = describe(entry);
    return text ? [{ id: entry.id, actor: entry.actor.display_name, text, created_at: entry.created_at }] : [];
  });

  const feed = [
    ...activity.map((a) => ({ kind: "activity" as const, at: a.created_at, item: a })),
    ...comments.map((c) => ({ kind: "comment" as const, at: c.created_at, item: c })),
  ].sort((a, b) => a.at.localeCompare(b.at));

  return (
    <section className="mt-8">
      <h3 className="mb-3 text-[15px] font-semibold">
        {t("Discussion")}
        {comments.length > 0 && <span className="ml-2 text-[13px] font-medium text-muted">{comments.length}</span>}
      </h3>

      {isLoading && <p className="text-[13px] text-muted">{t("Loading comments...")}</p>}
      {isError && <p className="text-[13px] text-red-600">{t("Could not load comments")}</p>}

      <ol className="space-y-4">
        {feed.map((entry) => {
          if (entry.kind === "activity") {
            return (
              <li key={entry.item.id} className="flex items-center gap-2.5 pl-2 text-[13px] text-muted">
                <span className="size-1.5 rounded-full bg-gray-300" />
                <span>
                  <span className="font-medium text-ink">{entry.item.actor}</span> {entry.item.text}, {formatDate(entry.at)}
                </span>
              </li>
            );
          }

          const comment = entry.item;
          const isMine = comment.author.id === me?.id;
          const isEditing = editingId === comment.id;

          return (
            <li key={comment.id} className="flex gap-3">
              <Avatar name={comment.author.display_name} src={comment.author.avatar_url} size="md" />
              <div className="min-w-0 flex-1">
                <p className="text-[13.5px]">
                  <span className="font-semibold">{comment.author.display_name}</span>
                  <span className="ml-2 text-[12.5px] text-muted">
                    {formatDate(comment.created_at)}
                    {comment.updated_at !== comment.created_at && !comment.deleted_at && ", edited"}
                  </span>
                </p>

                {comment.deleted_at ? (
                  <p className="mt-0.5 italic text-faint">{t("This comment was deleted")}</p>
                ) : isEditing ? (
                  <div className="mt-1.5">
                    <textarea
                      autoFocus
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Escape") setEditingId(null);
                        if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) void saveEdit();
                      }}
                      className="w-full resize-none rounded-lg border border-marking bg-white px-3 py-2 leading-relaxed outline-none field-sizing-content"
                    />
                    <div className="mt-1.5 flex items-center gap-2">
                      <Button size="sm" onClick={() => void saveEdit()} disabled={editComment.isPending || !editText.trim()}>
                        {editComment.isPending ? t("Saving...") : t("Save")}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                        {t("Cancel")}
                      </Button>
                      <span className="text-xs text-muted">{t("Ctrl+Enter to save, Esc to cancel")}</span>
                    </div>
                    {editComment.isError && <p className="mt-1 text-xs text-red-600">{t("Couldn't save the comment")}</p>}
                  </div>
                ) : (
                  <p className="mt-0.5 whitespace-pre-line leading-relaxed text-gray-700">{comment.body}</p>
                )}

                {isMine && !comment.deleted_at && !isEditing && (
                  <div className="mt-1 flex items-center gap-3.5 text-[12.5px] text-faint">
                    {confirmDeleteId === comment.id ? (
                      <>
                        <span className="text-ink">{t("Delete this comment?")}</span>
                        <button
                          onClick={() => void handleDelete(comment.id)}
                          disabled={deleteComment.isPending}
                          className="font-medium text-red-600 hover:underline"
                        >
                          {deleteComment.isPending ? t("Deleting...") : t("Delete")}
                        </button>
                        <button onClick={() => setConfirmDeleteId(null)} className="hover:text-ink">
                          {t("Cancel")}
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => startEdit(comment.id, comment.body)} className="hover:text-ink">
                          {t("Edit")}
                        </button>
                        <button onClick={() => setConfirmDeleteId(comment.id)} className="hover:text-red-600">
                          {t("Delete")}
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      {!isLoading && feed.length === 0 && <p className="text-faint">{t("No comments yet. Start the discussion.")}</p>}

      <form
        onSubmit={handleSend}
        className="mt-5 flex items-center gap-2 rounded-xl border border-line bg-white p-2 pl-3.5 focus-within:border-asphalt focus-within:ring-[3px] focus-within:ring-marking-soft"
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t("Write a comment…")}
          aria-label={t("New comment")}
          className="flex-1 bg-transparent outline-none placeholder:text-faint"
        />
        <button
          type="submit"
          disabled={addComment.isPending || !text.trim()}
          className="grid size-8 place-items-center rounded-lg bg-asphalt text-white hover:bg-asphalt-2 disabled:opacity-40 dark:bg-marking dark:text-asphalt"
          aria-label={t("Send comment")}
        >
          <Send className="size-4" />
        </button>
      </form>
      {addComment.isError && <p className="mt-1.5 text-xs text-red-600">{t("Couldn't send the comment. Try again.")}</p>}
    </section>
  );
};
