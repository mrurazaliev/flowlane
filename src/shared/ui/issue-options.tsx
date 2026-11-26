import type { Priority, State, User } from "@/shared/api/types";
import { Avatar } from "./avatar";
import type { DropdownOption } from "./dropdown";
import { PriorityIcon, StateIcon, priorityLabels, priorityOrder } from "./issue-icons";

/** Готовые варианты для <Dropdown>: статусы, приоритеты, участники */

export function stateOptions(states: State[]): DropdownOption<string>[] {
  return states.map((s) => ({ value: s.id, label: s.name, icon: <StateIcon group={s.group} color={s.color} /> }));
}

export function priorityOptions(): DropdownOption<Priority>[] {
  const hints: Record<Priority, string> = { urgent: "1", high: "2", medium: "3", low: "4", none: "0" };
  return priorityOrder.map((p) => ({
    value: p,
    label: priorityLabels[p],
    icon: <PriorityIcon priority={p} />,
    hint: hints[p],
  }));
}

export function memberOptions(users: User[], withNone = true): DropdownOption<string>[] {
  const list = users.map((u) => ({
    value: u.id,
    label: u.display_name,
    icon: <Avatar name={u.display_name} src={u.avatar_url} />,
  }));
  return withNone ? [{ value: "none", label: "Unassigned", icon: <span className="size-6 rounded-full border border-dashed border-gray-300" /> }, ...list] : list;
}
