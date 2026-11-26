import { cn } from "@/shared/lib/utils";

/** Логотип: жёлтый квадрат с разметкой полосы */
export function LogoMark({ className }: { className?: string }) {
  return (
    <span className={cn("relative inline-block size-[26px] shrink-0 overflow-hidden rounded-[7px] bg-marking", className)}>
      <span className="absolute left-1/2 top-[3px] h-1.5 w-[2.5px] -translate-x-1/2 rounded bg-asphalt" />
      <span className="absolute left-1/2 top-[14px] h-1.5 w-[2.5px] -translate-x-1/2 rounded bg-asphalt" />
    </span>
  );
}

export function Logo({ withText = true, light = false, className }: { withText?: boolean; light?: boolean; className?: string }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <LogoMark />
      {withText && (
        <span className={cn("text-[17px] font-semibold tracking-tight", light ? "text-white" : "text-ink")}>Flowlane</span>
      )}
    </div>
  );
}
