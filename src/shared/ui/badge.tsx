import { cn } from "@/shared/lib/utils";

type Tone = "gray" | "marking" | "green" | "amber" | "red" | "blue" | "violet";

const tones: Record<Tone, string> = {
  gray: "bg-gray-100 text-ink-2",
  marking: "bg-marking-soft text-marking-dark dark:text-[#f5a283]",
  green: "bg-[#e1ece4] text-[#3f6b50] dark:bg-[#1f3328] dark:text-[#8fc0a0]",
  amber: "bg-[#f6e9c9] text-[#8a5f0a] dark:bg-[#3a2f17] dark:text-[#e3b65a]",
  red: "bg-[#f8ddd2] text-[#a83a1a] dark:bg-[#3d2620] dark:text-[#f5a283]",
  blue: "bg-[#dfe8f3] text-[#2f5a8e] dark:bg-[#1d2a40] dark:text-[#9bbbe4]",
  violet: "bg-[#ece0f0] text-[#653e75] dark:bg-[#2e2236] dark:text-[#c9a3d8]",
};

export function Badge({ tone = "gray", className, children }: { tone?: Tone; className?: string; children: React.ReactNode }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold", tones[tone], className)}>
      {children}
    </span>
  );
}

export function LabelChip({ name, color }: { name: string; color: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2 py-px text-xs font-medium text-ink-2">
      <span className="size-1.5 rounded-full" style={{ backgroundColor: color }} />
      {name}
    </span>
  );
}
