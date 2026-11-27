"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Send } from "lucide-react";
import { useMe } from "@/features/auth";
import { Avatar } from "@/shared/ui/avatar";
import { Button } from "@/shared/ui/button";
import { formatDate } from "@/shared/lib/utils";
import {
  useAddCommentMutation,
  useDeleteCommentMutation,
  useEditCommentMutation,
  useGetCommentsQuery,
} from "../api";

interface ActivityItem {
  id: string;
  actor: string;
  text: string;
  created_at: string;
}

/**
 * D1.13 Комментарии (настоящие, с бэкенда) + D1.14 история изменений одной лентой по времени.
 * История пока из моков — следующий шаг: GET .../activity.
 */
export const Discussion = ({ issueId, activity }: { issueId: string; activity: ActivityItem[] }) => {
  const { workspaceSlug, projectId } = useParams<{ workspaceSlug: string; projectId: string }>();
  const { data: me } = useMe();

  const { data: comments = [], isLoading, isError } = useGetCommentsQuery(workspaceSlug, projectId, issueId);
  const addComment = useAddCommentMutation(workspaceSlug, projectId, issueId);
  const editComment = useEditCommentMutation(workspaceSlug, projectId, issueId);
  const deleteComment = useDeleteCommentMutation(workspaceSlug, projectId, issueId);

  const [text, setText] = useState(""); // новый комментарий
  const [editingId, setEditingId] = useState<string | null>(null); // какой комментарий сейчас редактируем
  const [editText, setEditText] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null); // «Удалить? Да / Нет»

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

  // История и комментарии — одной лентой по времени
  const feed = [
    ...activity.map((a) => ({ kind: "activity" as const, at: a.created_at, item: a })),
    ...comments.map((c) => ({ kind: "comment" as const, at: c.created_at, item: c })),
  ].sort((a, b) => a.at.localeCompare(b.at));

  return (
    <section className="mt-8">
      <h3 className="mb-3 text-[15px] font-semibold">
        Discussion
        {comments.length > 0 && <span className="ml-2 text-[13px] font-medium text-muted">{comments.length}</span>}
      </h3>

      {isLoading && <p className="text-[13px] text-muted">Loading comments...</p>}
      {isError && <p className="text-[13px] text-red-600">Could not load comments</p>}

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
                  <p className="mt-0.5 italic text-faint">This comment was deleted</p>
                ) : isEditing ? (
                  // Режим редактирования
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
                        {editComment.isPending ? "Saving..." : "Save"}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                        Cancel
                      </Button>
                      <span className="text-xs text-muted">Ctrl+Enter to save, Esc to cancel</span>
                    </div>
                    {editComment.isError && <p className="mt-1 text-xs text-red-600">Couldn&apos;t save the comment</p>}
                  </div>
                ) : (
                  <p className="mt-0.5 whitespace-pre-line leading-relaxed text-gray-700">{comment.body}</p>
                )}

                {/* Изменить / удалить — только свои комментарии */}
                {isMine && !comment.deleted_at && !isEditing && (
                  <div className="mt-1 flex items-center gap-3.5 text-[12.5px] text-faint">
                    {confirmDeleteId === comment.id ? (
                      <>
                        <span className="text-ink">Delete this comment?</span>
                        <button
                          onClick={() => void handleDelete(comment.id)}
                          disabled={deleteComment.isPending}
                          className="font-medium text-red-600 hover:underline"
                        >
                          {deleteComment.isPending ? "Deleting..." : "Delete"}
                        </button>
                        <button onClick={() => setConfirmDeleteId(null)} className="hover:text-ink">
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => startEdit(comment.id, comment.body)} className="hover:text-ink">
                          Edit
                        </button>
                        <button onClick={() => setConfirmDeleteId(comment.id)} className="hover:text-red-600">
                          Delete
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

      {!isLoading && feed.length === 0 && <p className="text-faint">No comments yet. Start the discussion.</p>}

      {/* Новый комментарий */}
      <form
        onSubmit={handleSend}
        className="mt-5 flex items-center gap-2 rounded-xl border border-line bg-white p-2 pl-3.5 focus-within:border-asphalt focus-within:ring-[3px] focus-within:ring-marking-soft"
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write a comment…"
          aria-label="New comment"
          className="flex-1 bg-transparent outline-none placeholder:text-faint"
        />
        <button
          type="submit"
          disabled={addComment.isPending || !text.trim()}
          className="grid size-8 place-items-center rounded-lg bg-asphalt text-white hover:bg-asphalt-2 disabled:opacity-40 dark:bg-marking dark:text-asphalt"
          aria-label="Send comment"
        >
          <Send className="size-4" />
        </button>
      </form>
      {addComment.isError && <p className="mt-1.5 text-xs text-red-600">Couldn&apos;t send the comment. Try again.</p>}
    </section>
  );
};
