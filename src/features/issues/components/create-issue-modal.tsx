"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { isAxiosError } from "axios";
import type { Label as LabelType, State, User } from "@/shared/api/types";
import { errorText } from "@/shared/lib/errors";
import { Button } from "@/shared/ui/button";
import { Dropdown } from "@/shared/ui/dropdown";
import { ErrorBanner, FieldError, Input, Label, Textarea } from "@/shared/ui/form";
import { memberOptions, priorityOptions, stateOptions } from "@/shared/ui/issue-options";
import { Modal } from "@/shared/ui/modal";
import { useAddIssueMutation } from "../api";
import { useT } from "@/shared/lib/i18n";

interface CreateIssueModalProps {
  open: boolean;
  onClose: () => void;
  states: State[];
  members: User[];
  labels: LabelType[];
  defaultStateId?: string;
  /** Если передан — создаём подзадачу этой задачи */
  parentId?: string;
}

const issueSchema = z.object({
  title: z.string().trim().min(1, "Add a title").max(500, "Title is too long"),
  description: z.string(),
  state_id: z.string().min(1, "Choose a status"),
  priority: z.enum(["urgent", "high", "medium", "low", "none"]),
  assignee_id: z.string(), // "none" или id пользователя
  label_id: z.string().nullable(),
  start_date: z.string(),
  due_date: z.string(),
});

type IssueFormData = z.infer<typeof issueSchema>;

const toIso = (date: string) => (date ? new Date(date).toISOString() : null);

export const CreateIssueModal = ({ open, onClose, states, members, labels, defaultStateId, parentId }: CreateIssueModalProps) => {
  const t = useT();
  const { workspaceSlug, projectId } = useParams<{ workspaceSlug: string; projectId: string }>();
  const addIssue = useAddIssueMutation(workspaceSlug, projectId);

  const defaultState = defaultStateId ?? states.find((s) => s.is_default)?.id ?? states[0]?.id ?? "";

  const emptyForm: IssueFormData = {
    title: "",
    description: "",
    state_id: defaultState,
    priority: "none",
    assignee_id: "none",
    label_id: null,
    start_date: "",
    due_date: "",
  };

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<IssueFormData>({ resolver: zodResolver(issueSchema), defaultValues: emptyForm });

  // Каждый раз при открытии — чистая форма (и нужный статус, если нажали «+» в колонке)
  useEffect(() => {
    if (open) {
      reset(emptyForm);
      addIssue.reset();
    }
  }, [open, defaultState]);

  const onSubmit = async (data: IssueFormData) => {
    await addIssue.mutateAsync({
      title: data.title,
      description: data.description || undefined,
      state_id: data.state_id,
      priority: data.priority,
      assignee_ids: data.assignee_id !== "none" ? [data.assignee_id] : [],
      label_ids: data.label_id ? [data.label_id] : [],
      parent_id: parentId,
      start_date: toIso(data.start_date),
      due_date: toIso(data.due_date),
    });
    onClose();
  };

  const apiError =
    addIssue.error && isAxiosError(addIssue.error) ? errorText(addIssue.error.response?.data) : null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={parentId ? t("New sub-task") : t("New task")}
      className="max-w-xl"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            {t("Cancel")}
          </Button>
          <Button type="submit" form="create-issue-form" disabled={addIssue.isPending}>
            {addIssue.isPending ? t("Creating...") : t("Create task")}
          </Button>
        </>
      }
    >
      <form id="create-issue-form" className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <ErrorBanner>{apiError}</ErrorBanner>

        <div>
          <Label htmlFor="title">{t("Title")}</Label>
          <Input id="title" placeholder={t("What needs to be done?")} invalid={!!errors.title} {...register("title")} />
          <FieldError>{errors.title?.message}</FieldError>
        </div>

        <div>
          <Label htmlFor="description">{t("Description")}</Label>
          <Textarea
            id="description"
            placeholder={t("Details, steps to reproduce, acceptance criteria")}
            {...register("description")}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>{t("Status")}</Label>
            <Controller
              control={control}
              name="state_id"
              render={({ field }) => (
                <Dropdown value={field.value} onChange={field.onChange} options={stateOptions(states)} ariaLabel={t("Status")} />
              )}
            />
            <FieldError>{errors.state_id?.message}</FieldError>
          </div>
          <div>
            <Label>{t("Priority")}</Label>
            <Controller
              control={control}
              name="priority"
              render={({ field }) => (
                <Dropdown value={field.value} onChange={field.onChange} options={priorityOptions()} ariaLabel={t("Priority")} />
              )}
            />
          </div>
          <div>
            <Label>{t("Assignee")}</Label>
            <Controller
              control={control}
              name="assignee_id"
              render={({ field }) => (
                <Dropdown value={field.value} onChange={field.onChange} options={memberOptions(members)} ariaLabel={t("Assignee")} />
              )}
            />
          </div>
          <div>
            <Label>{t("Label")}</Label>
            <Controller
              control={control}
              name="label_id"
              render={({ field }) => (
                <Dropdown
                  value={field.value}
                  onChange={field.onChange}
                  placeholder={t("No label")}
                  ariaLabel={t("Label")}
                  options={labels.map((l) => ({
                    value: l.id,
                    label: l.name,
                    icon: <span className="size-2 rounded-full" style={{ backgroundColor: l.color }} />,
                  }))}
                />
              )}
            />
          </div>
          <div>
            <Label htmlFor="start">{t("Start date")}</Label>
            <Input id="start" type="date" {...register("start_date")} />
          </div>
          <div>
            <Label htmlFor="due">{t("Due date")}</Label>
            <Input id="due" type="date" {...register("due_date")} />
          </div>
        </div>
      </form>
    </Modal>
  );
};