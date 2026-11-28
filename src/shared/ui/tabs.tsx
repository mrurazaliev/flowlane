"use client";

import { cn } from "@/shared/lib/utils";

interface TabsProps<T extends string> {
  tabs: { value: T; label: string; count?: number }[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

export function Tabs<T extends string>({ tabs, value, onChange, className }: TabsProps<T>) {
  return (
    <div role="tablist" className={cn("flex gap-6 border-b border-line", className)}>
      {tabs.map((tab) => (
        <button
          key={tab.value}
          role="tab"
          aria-selected={value === tab.value}
          onClick={() => onChange(tab.value)}
          className={cn(
            "-mb-px border-b-2 pb-2.5 font-medium transition-colors",
            value === tab.value ? "border-marking text-ink" : "border-transparent text-muted hover:text-ink",
          )}
        >
          {tab.label}
          {tab.count !== undefined && <span className="ml-1.5 tabular-nums text-faint">{tab.count}</span>}
        </button>
      ))}
    </div>
  );
}
