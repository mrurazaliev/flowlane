"use client";

import { Send } from "lucide-react";
import type { Comment } from "@/shared/api/types";
import { useMe } from "@/features/auth";
import { Avatar } from "@/shared/ui/avatar";
import { formatDate } from "@/shared/lib/utils";

interface ActivityItem {
  id: string;
  actor: string;
  text: string;
  created_at: string;
}

/**
 * D1.13 Комментарии + D1.14 история изменений одной лентой по времени.
 * Позже: GET .../comments и .../activity; edit/delete — только свои (или admin); @mention.
 */
export function Discussion({ comments, activity }: { comments: Comment[]; activity: ActivityItem[] }) {
  const { data: me } = useMe();

  const feed = [
    ...activity.map((a) => ({ kind: "activity" as const, at: a.created_at, item: a })),
    ...comments.map((c) => ({ kind: "comment" as const, at: c.created_at, item: c })),
  ].sort((a, b) => a.at.localeCompare(b.at));

  return (
    <section className="mt-8">
      <h3 className="mb-3 text-[15px] font-semibold">Discussion</h3>

      <ol className="space-y-4">
        {feed.map((entry) =>
          entry.kind === "activity" ? (
            <li key={entry.item.id} className="flex items-center gap-2.5 pl-2 text-[13px] text-muted">
              <span className="size-1.5 rounded-full bg-gray-300" />
              <span>
                <span className="font-medium text-ink">{entry.item.actor}</span> {entry.item.text}, {formatDate(entry.at)}
              </span>
            </li>
          ) : (
            <li key={entry.item.id} className="flex gap-3">
              <Avatar name={entry.item.author.display_name} src={entry.item.author.avatar_url} size="md" />
              <div className="min-w-0 flex-1">
                <p className="text-[13.5px]">
                  <span className="font-semibold">{entry.item.author.display_name}</span>
                  <span className="ml-2 text-[12.5px] text-muted">
                    {formatDate(entry.item.created_at)}
                    {entry.item.updated_at !== entry.item.created_at && ", edited"}
                  </span>
                </p>
                {entry.item.deleted_at ? (
                  <p className="mt-0.5 italic text-faint">This comment was deleted</p>
                ) : (
                  <p className="mt-0.5 whitespace-pre-line leading-relaxed text-gray-700">{entry.item.body}</p>
                )}
                {entry.item.author.id === me?.id && !entry.item.deleted_at && (
                  <div className="mt-1 flex gap-3.5 text-[12.5px] text-faint">
                    <button className="hover:text-ink">Edit</button>
                    <button className="hover:text-red-600">Delete</button>
                  </div>
                )}
              </div>
            </li>
          ),
        )}
      </ol>

      <form
        onSubmit={(e) => e.preventDefault()}
        className="mt-5 flex items-center gap-2 rounded-xl border border-line bg-white p-2 pl-3.5 focus-within:border-asphalt focus-within:ring-[3px] focus-within:ring-marking-soft"
      >
        <input placeholder="Write a comment… use @ to mention" className="flex-1 bg-transparent outline-none placeholder:text-faint" />
        <button type="submit" className="grid size-8 place-items-center rounded-lg bg-asphalt text-white hover:bg-asphalt-2" aria-label="Send comment">
          <Send className="size-4" />
        </button>
      </form>
    </section>
  );
}
