import { cn } from "@/shared/lib/utils";

export function LogoMark({ className, light = false }: { className?: string; light?: boolean }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden className={cn("size-[28px] shrink-0", className)}>
      <rect width="32" height="32" rx="8" fill={light ? "#f6f1e7" : "#1b2238"} />
      <path d="M9 11.5h10M9 16h14M9 20.5h8" stroke={light ? "#1b2238" : "#f6f1e7"} strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="23" cy="11.5" r="2" fill="#d9532b" />
    </svg>
  );
}

export function Logo({ withText = true, light = false, className }: { withText?: boolean; light?: boolean; className?: string }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <LogoMark light={light} />
      {withText && (
        <span className={cn("font-serif text-[21px] font-semibold tracking-tight", light ? "text-[#f6f1e7]" : "text-ink")}>Flowlane</span>
      )}
    </div>
  );
}
