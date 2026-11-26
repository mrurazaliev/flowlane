import { cn } from "@/shared/lib/utils";

type Tone = "gray" | "marking" | "green" | "amber" | "red" | "blue" | "violet";

const tones: Record<Tone, string> = {
  gray: "bg-gray-100 text-gray-600",
  marking: "bg-marking-soft text-[#7a5a0c]",
  green: "bg-[#e6f3ec] text-[#2b7a53]",
  amber: "bg-[#fbf1dc] text-[#8a6410]",
  red: "bg-[#fbe9e9] text-[#b23434]",
  blue: "bg-[#e9f0fd] text-[#3a64c4]",
  violet: "bg-[#f1ebf7] text-[#6d4f8c]",
};

export function Badge({ tone = "gray", className, children }: { tone?: Tone; className?: string; children: React.ReactNode }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", tones[tone], className)}>
      {children}
    </span>
  );
}

/** Метка задачи: цветная точка + название */
export function LabelChip({ name, color }: { name: string; color: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2 py-px text-xs text-gray-600">
      <span className="size-1.5 rounded-full" style={{ backgroundColor: color }} />
      {name}
    </span>
  );
}
