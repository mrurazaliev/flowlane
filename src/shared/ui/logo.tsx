import { cn } from "@/shared/lib/utils";

/** Логотип: изгиб дороги с жёлтой разметкой в круге — «полоса потока» (flow + lane) */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 34 34" aria-hidden className={cn("size-[26px] shrink-0", className)}>
      <circle cx="17" cy="17" r="17" fill="#f2b630" />
      {/* Сама дорога (асфальт) */}
      <path d="M10 28 C10 18 24 16 24 6" stroke="#0d0f13" strokeWidth="7" strokeLinecap="round" fill="none" />
      {/* Пунктирная разметка по центру дороги */}
      <path d="M10 28 C10 18 24 16 24 6" stroke="#f2b630" strokeWidth="1.6" strokeDasharray="3 3" fill="none" />
    </svg>
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
