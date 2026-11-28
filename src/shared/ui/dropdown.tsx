"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { translate } from "@/shared/lib/i18n";

export interface DropdownOption<T extends string> {
  value: T;
  label: string;
  icon?: React.ReactNode;
  hint?: string;
}

interface DropdownProps<T extends string> {
  value: T | null;
  options: DropdownOption<T>[];
  onChange?: (value: T) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  variant?: "field" | "inline" | "ghost";
  prefix?: string;
  align?: "left" | "right";
  className?: string;
  ariaLabel?: string;
}

export function Dropdown<T extends string>({
  value,
  options,
  onChange,
  placeholder = translate("Select…"),
  searchPlaceholder,
  variant = "field",
  prefix,
  align = "left",
  className,
  ariaLabel,
}: DropdownProps<T>) {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<T | null>(value);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const root = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === current);
  const filtered = useMemo(
    () => options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase())),
    [options, query],
  );

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const choose = (option: DropdownOption<T>) => {
    setCurrent(option.value);
    onChange?.(option.value);
    setOpen(false);
    setQuery("");
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") return setOpen(false);
    if (!open && (e.key === "Enter" || e.key === " " || e.key === "ArrowDown")) {
      e.preventDefault();
      setActive(0);
      return setOpen(true);
    }
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && filtered[active]) {
      e.preventDefault();
      choose(filtered[active]);
    }
  };

  const trigger = {
    field: "h-11 w-full justify-between rounded-[10px] border border-line bg-white px-3.5 text-[15px]",
    inline: "min-h-9 w-full rounded-lg px-2 -ml-2 hover:bg-gray-100",
    ghost: "h-9 rounded-[9px] px-2.5 text-muted hover:bg-gray-100",
  }[variant];

  return (
    <div ref={root} className={cn("relative", variant !== "ghost" && "w-full", className)} onKeyDown={onKeyDown}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex items-center gap-2 text-left text-ink transition-shadow",
          trigger,
          open && variant !== "ghost" && "bg-gray-100 ring-[1.5px] ring-marking",
        )}
      >
        {prefix && <span className="text-muted">{prefix}</span>}
        {selected?.icon}
        <span className={cn("truncate", prefix ? "font-medium text-ink" : "", !selected && "text-faint")}>
          {selected?.label ?? placeholder}
        </span>
        {variant !== "inline" && <ChevronDown className="ml-auto size-4 shrink-0 text-faint" />}
      </button>

      {open && (
        <div
          role="listbox"
          className={cn(
            "absolute z-40 mt-1.5 w-56 rounded-xl border border-line bg-white p-1.5 shadow-[0_16px_36px_-12px_rgba(30,34,42,.28)]",
            align === "right" ? "right-0" : "left-0",
          )}
        >
          {options.length > 6 || searchPlaceholder ? (
            <input
              autoFocus
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActive(0);
              }}
              placeholder={searchPlaceholder ?? translate("Search…")}
              className="mb-1 w-full border-b border-line-soft px-2 pb-2 pt-1 text-sm outline-none placeholder:text-faint"
            />
          ) : null}
          {filtered.length === 0 && <p className="px-2 py-2 text-sm text-faint">{translate("Nothing found")}</p>}
          {filtered.map((option, i) => (
            <button
              key={option.value}
              type="button"
              role="option"
              aria-selected={option.value === current}
              onMouseEnter={() => setActive(i)}
              onClick={() => choose(option)}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-lg px-2 py-[7px] text-left text-sm text-ink",
                i === active && "bg-gray-100",
              )}
            >
              {option.icon}
              <span className="truncate">{option.label}</span>
              {option.value === current ? (
                <Check className="ml-auto size-4 shrink-0" />
              ) : (
                option.hint && <span className="ml-auto text-xs text-faint">{option.hint}</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
