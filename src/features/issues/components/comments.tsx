import { Send } from "lucide-react";
import type { Comment } from "@/shared/api/types";
import { Avatar } from "@/shared/ui/avatar";
import { useMe } from "@/features/auth";
import { formatDate } from "@/shared/lib/utils";

export function Comments({ comments }: { comments: Comment[] }) {
  const { data: currentUser } = useMe();

  return (
    <div>
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
        Comments <span className="text-gray-400">({comments.length})</span>
      </h3>

      <ul className="space-y-4">
        {comments.length === 0 && <li className="text-sm text-gray-400">No comments yet.</li>}
        {comments.map((comment) => (
          <li key={comment.id} className="flex gap-3">
            <Avatar name={comment.author.display_name} src={comment.author.avatar_url} size="md" />
            <div className="flex-1 rounded-lg bg-gray-50 px-3 py-2">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-sm font-medium text-gray-900">{comment.author.display_name}</span>
                <span className="text-xs text-gray-400">{formatDate(comment.created_at)}</span>
              </div>
              {comment.deleted_at ? (
                <p className="mt-1 text-sm italic text-gray-400">This comment was deleted</p>
              ) : (
                <p className="mt-1 whitespace-pre-line text-sm text-gray-700">{comment.body}</p>
              )}
              {/* Свои комментарии можно редактировать и удалять. Позже: id из useMe() */}
              {comment.author.id === currentUser.id && !comment.deleted_at && (
                <div className="mt-1.5 flex gap-3 text-xs">
                  <button className="text-gray-500 hover:text-gray-800">Edit</button>
                  <button className="text-gray-500 hover:text-red-600">Delete</button>
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>

      <form onSubmit={(e) => e.preventDefault()} className="mt-4 flex items-center gap-2 rounded-lg border border-gray-200 bg-white p-1.5 pl-3 focus-within:border-indigo-500">
        <input placeholder="Write a comment…" className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400" />
        <button
          type="submit"
          className="flex size-8 items-center justify-center rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
          aria-label="Send comment"
        >
          <Send className="size-4" />
        </button>
      </form>
    </div>
  );
}
