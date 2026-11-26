"use client";

import { useState } from "react";
import { GripVertical, Pencil, Plus, Trash2 } from "lucide-react";
import type { State, StateGroup } from "@/shared/api/types";
import { StateIcon } from "@/shared/ui/issue-icons";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Label, Select } from "@/shared/ui/form";
import { Modal } from "@/shared/ui/modal";
import { useStates } from "@/shared/api/lookups";

const groups: { value: StateGroup; label: string }[] = [
  { value: "backlog", label: "Backlog" },
  { value: "unstarted", label: "Unstarted" },
  { value: "started", label: "Started" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

/** Статусы проекта = колонки доски. Позже: useStates() + create/update/delete */
export function StatesSettings({ workspaceSlug, projectId }: { workspaceSlug: string; projectId: string }) {
  const { data: states } = useStates(workspaceSlug, projectId);
  const [deleting, setDeleting] = useState<State | null>(null);

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">
        Statuses are the columns of the board. Each status belongs to one of five groups.
      </p>

      {groups.map((group) => {
        const groupStates = states.filter((s) => s.group === group.value).sort((a, b) => a.order - b.order);
        return (
          <section key={group.value} className="rounded-xl border border-gray-200 bg-white">
            <header className="flex items-center justify-between border-b border-gray-100 px-4 py-2.5">
              <span className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                <StateIcon group={group.value} color="#6B7280" />
                {group.label}
              </span>
              <button className="flex items-center gap-1 text-sm text-indigo-600 hover:underline">
                <Plus className="size-4" /> Add status
              </button>
            </header>
            <ul className="divide-y divide-gray-100">
              {groupStates.length === 0 && <li className="px-4 py-3 text-sm text-gray-400">No statuses in this group</li>}
              {groupStates.map((state) => (
                <li key={state.id} className="flex items-center gap-3 px-4 py-2.5">
                  <GripVertical className="size-4 cursor-grab text-gray-300" />
                  <span className="size-3 rounded-full" style={{ backgroundColor: state.color }} />
                  <span className="text-sm text-gray-900">{state.name}</span>
                  {state.is_default && <Badge tone="indigo">Default</Badge>}
                  <div className="ml-auto flex gap-1">
                    <button className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700" aria-label="Edit">
                      <Pencil className="size-4" />
                    </button>
                    <button
                      onClick={() => setDeleting(state)}
                      className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                      aria-label="Delete"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      {/* Удалить статус можно, только перенеся его задачи в другой статус */}
      <Modal
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        title={`Delete status “${deleting?.name ?? ""}”`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleting(null)}>
              Cancel
            </Button>
            <Button variant="danger">Delete status</Button>
          </>
        }
      >
        <p className="text-sm text-gray-600">Tasks in this status will be moved to another status.</p>
        <div className="mt-4">
          <Label htmlFor="move-to">Move tasks to *</Label>
          <Select id="move-to" defaultValue="">
            <option value="" disabled>
              Select a status…
            </option>
            {states
              .filter((s) => s.id !== deleting?.id)
              .map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
          </Select>
        </div>
      </Modal>
    </div>
  );
}
