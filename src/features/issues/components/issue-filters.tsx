"use client";

import { useState } from "react";
import { ListFilter, Search, X } from "lucide-react";
import type { Label, Priority, State, User } from "@/shared/api/types";
import { Avatar } from "@/shared/ui/avatar";
import { PriorityIcon, StateIcon, priorityLabels, priorityOrder } from "@/shared/ui/issue-icons";
import { cn } from "@/shared/lib/utils";
import { useT } from "@/shared/lib/i18n";
import { ViewSwitch } from "./view-switch";

interface IssueFiltersProps {
  members: User[];
  labels: Label[];
  states: State[];
  actions?: React.ReactNode;
}

type FilterKey = "state" | "priority" | "assignee" | "label";

export function IssueFilters({ members, labels, states, actions }: IssueFiltersProps) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Record<FilterKey, string[]>>({
    state: [],
    priority: ["urgent", "high"],
    assignee: [],
    label: [],
  });

  const toggle = (key: FilterKey, value: string) =>
    setSelected((prev) => ({
      ...prev,
      [key]: prev[key].includes(value) ? prev[key].filter((v) => v !== value) : [...prev[key], value],
    }));
  const clear = (key?: FilterKey) =>
    setSelected((prev) => (key ? { ...prev, [key]: [] } : { state: [], priority: [], assignee: [], label: [] }));

  const count = Object.values(selected).reduce((n, list) => n + list.length, 0);

  const names: Record<FilterKey, (v: string) => string> = {
    state: (v) => states.find((s) => s.id === v)?.name ?? v,
    priority: (v) => t(priorityLabels[v as Priority]),
    assignee: (v) => members.find((m) => m.id === v)?.display_name.split(" ")[0] ?? v,
    label: (v) => labels.find((l) => l.id === v)?.name ?? v,
  };
  const titles: Record<FilterKey, string> = { state: t("Status"), priority: t("Priority"), assignee: t("Assignee"), label: t("Label") };

  return (
    <div className="flex flex-wrap items-center gap-2.5 px-4 py-3 md:px-7">
      <ViewSwitch />
      <label className="flex h-10 w-full items-center gap-2 rounded-[12px] border border-line bg-white px-3 text-faint focus-within:border-ink focus-within:ring-[3px] focus-within:ring-marking-soft sm:w-60">
        <Search className="size-4" />
        <input type="search" placeholder={t("Search tasks")} className="w-full bg-transparent text-ink outline-none placeholder:text-faint" />
      </label>

      <div className="relative">
        <button
          onClick={() => setOpen((o) => !o)}
          className={cn("flex h-10 items-center gap-2 rounded-[12px] border border-dashed border-gray-300 px-3 font-medium text-ink-2 hover:border-solid hover:bg-white", open && "border-solid bg-white")}
          aria-expanded={open}
        >
          <ListFilter className="size-4 text-muted" />
          {t("Filter")}
          {count > 0 && <span className="rounded-full bg-marking px-1.5 text-[11px] tabular-nums text-white">{count}</span>}
        </button>

        {open && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
            <div className="absolute left-0 z-40 mt-1.5 grid w-[min(92vw,560px)] grid-cols-2 gap-4 rounded-xl border border-line bg-white p-4 shadow-[0_16px_36px_-12px_rgba(30,34,42,.28)]">
              <Group title={t("Status")}>
                {states.map((s) => (
                  <Option key={s.id} checked={selected.state.includes(s.id)} onChange={() => toggle("state", s.id)}>
                    <StateIcon group={s.group} color={s.color} /> {s.name}
                  </Option>
                ))}
              </Group>
              <Group title={t("Priority")}>
                {priorityOrder.map((p) => (
                  <Option key={p} checked={selected.priority.includes(p)} onChange={() => toggle("priority", p)}>
                    <PriorityIcon priority={p} /> {t(priorityLabels[p])}
                  </Option>
                ))}
              </Group>
              <Group title={t("Assignee")}>
                {members.map((m) => (
                  <Option key={m.id} checked={selected.assignee.includes(m.id)} onChange={() => toggle("assignee", m.id)}>
                    <Avatar name={m.display_name} src={m.avatar_url} /> {m.display_name}
                  </Option>
                ))}
              </Group>
              <Group title={t("Label")}>
                {labels.map((l) => (
                  <Option key={l.id} checked={selected.label.includes(l.id)} onChange={() => toggle("label", l.id)}>
                    <span className="size-2 rounded-full" style={{ backgroundColor: l.color }} /> {l.name}
                  </Option>
                ))}
              </Group>
            </div>
          </>
        )}
      </div>

      {(Object.keys(selected) as FilterKey[])
        .filter((key) => selected[key].length > 0)
        .map((key) => (
          <span key={key} className="inline-flex h-10 items-center gap-1.5 rounded-[12px] border border-line bg-white px-3 text-[13px]">
            <span className="text-muted">{titles[key]}</span>
            {selected[key].map(names[key]).join(", ")}
            <button onClick={() => clear(key)} className="ml-0.5 text-faint hover:text-ink" aria-label={t("Clear {key}", { key: titles[key] })}>
              <X className="size-3.5" />
            </button>
          </span>
        ))}
      {count > 1 && (
        <button onClick={() => clear()} className="text-[13px] text-muted hover:text-ink">
          {t("Clear all")}
        </button>
      )}

      {actions && <div className="ml-auto flex items-center gap-1">{actions}</div>}
    </div>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1.5 px-1.5 text-[11.5px] font-semibold uppercase tracking-[0.08em] text-faint">{title}</p>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

function Option({ checked, onChange, children }: { checked: boolean; onChange: () => void; children: React.ReactNode }) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 rounded-lg px-1.5 py-1.5 text-sm hover:bg-gray-100">
      <input type="checkbox" checked={checked} onChange={onChange} className="size-4 accent-[#d9532b]" />
      {children}
    </label>
  );
}
