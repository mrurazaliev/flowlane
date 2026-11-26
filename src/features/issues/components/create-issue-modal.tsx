"use client";

import { ClipboardList } from "lucide-react";
import type { Label as LabelType, State, User } from "@/shared/api/types";
import { Button } from "@/shared/ui/button";
import { FieldError, Input, Label, Select, Textarea } from "@/shared/ui/form";
import { Modal } from "@/shared/ui/modal";
import { priorityLabels, priorityOrder } from "@/shared/ui/issue-icons";

interface CreateIssueModalProps {
  open: boolean;
  onClose: () => void;
  states: State[];
  members: User[];
  labels: LabelType[];
  defaultStateId?: string;
}

/** D1.8 Создание задачи. Позже: RHF + Zod, POST .../issues, затем invalidate queryKeys.issues.all */
export function CreateIssueModal({ open, onClose, states, members, labels, defaultStateId }: CreateIssueModalProps) {
  const defaultState = defaultStateId ?? states.find((s) => s.is_default)?.id ?? states[0]?.id;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="New task"
      icon={<ClipboardList className="size-5 text-indigo-600" />}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="create-issue-form">
            Create task
          </Button>
        </>
      }
    >
      <form id="create-issue-form" className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        <div>
          <Label htmlFor="title">Title *</Label>
          <Input id="title" placeholder="e.g. Fix login redirect" autoFocus />
          {/* Позже: ошибка из Zod, например "Title is required" */}
          <FieldError />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" placeholder="Add details, acceptance criteria…" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="state">Status</Label>
            <Select id="state" defaultValue={defaultState}>
              {states.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="priority">Priority</Label>
            <Select id="priority" defaultValue="none">
              {priorityOrder.map((p) => (
                <option key={p} value={p}>
                  {priorityLabels[p]}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="assignee">Assignee</Label>
            <Select id="assignee" defaultValue="">
              <option value="">Unassigned</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.display_name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="due">Due date</Label>
            <Input id="due" type="date" />
          </div>
          <div>
            <Label htmlFor="labels">Labels</Label>
            <Select id="labels" defaultValue="">
              <option value="">No label</option>
              {labels.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="start">Start date</Label>
            <Input id="start" type="date" />
          </div>
        </div>
      </form>
    </Modal>
  );
}
