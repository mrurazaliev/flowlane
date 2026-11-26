import Link from "next/link";
import { cn } from "@/shared/lib/utils";

/**
 * Ссылка в тёмном сайдбаре. Активная — с жёлтой разметкой слева.
 * Используют фичи, которые вставляют свои ссылки в слоты AppShell.
 */
export function SidebarLink({
  href,
  active,
  children,
  className,
}: {
  href: string;
  active?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "relative flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors",
        active ? "bg-asphalt-2 text-white" : "text-[#c9cdd4] hover:bg-asphalt-2/60 hover:text-white",
        active &&
          "before:absolute before:-left-3 before:bottom-2 before:top-2 before:w-[3px] before:rounded-r before:bg-marking",
        className,
      )}
    >
      {children}
    </Link>
  );
}
