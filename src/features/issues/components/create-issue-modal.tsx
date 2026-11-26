"use client";

import type { Label as LabelType, State, User } from "@/shared/api/types";
import { Button } from "@/shared/ui/button";
import { Dropdown } from "@/shared/ui/dropdown";
import { FieldError, Input, Label, Textarea } from "@/shared/ui/form";
import { memberOptions, priorityOptions, stateOptions } from "@/shared/ui/issue-options";
import { Modal } from "@/shared/ui/modal";

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
  const defaultState = defaultStateId ?? states.find((s) => s.is_default)?.id ?? states[0]?.id ?? null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="New task"
      className="max-w-xl"
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
          <Label htmlFor="title">Title</Label>
          <Input id="title" placeholder="What needs to be done?" />
          {/* Позже: ошибка из Zod, например "Add a title" */}
          <FieldError />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" placeholder="Details, steps to reproduce, acceptance criteria" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Status</Label>
            <Dropdown value={defaultState} options={stateOptions(states)} ariaLabel="Status" />
          </div>
          <div>
            <Label>Priority</Label>
            <Dropdown value="none" options={priorityOptions()} ariaLabel="Priority" />
          </div>
          <div>
            <Label>Assignee</Label>
            <Dropdown value="none" options={memberOptions(members)} ariaLabel="Assignee" />
          </div>
          <div>
            <Label>Label</Label>
            <Dropdown
              value={null}
              placeholder="No label"
              ariaLabel="Label"
              options={labels.map((l) => ({
                value: l.id,
                label: l.name,
                icon: <span className="size-2 rounded-full" style={{ backgroundColor: l.color }} />,
              }))}
            />
          </div>
          <div>
            <Label htmlFor="start">Start date</Label>
            <Input id="start" type="date" />
          </div>
          <div>
            <Label htmlFor="due">Due date</Label>
            <Input id="due" type="date" />
          </div>
        </div>
      </form>
    </Modal>
  );
}
