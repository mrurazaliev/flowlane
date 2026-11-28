import Link from "next/link";
import { cn } from "@/shared/lib/utils";

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
        "relative flex items-center gap-2.5 rounded-[10px] px-2.5 py-2 text-[14.5px] transition-colors",
        active ? "bg-side-active font-medium text-ink shadow-[0_0_0_1px_var(--color-line)]" : "text-side-text hover:bg-side-hover hover:text-ink",
        className,
      )}
    >
      {children}
    </Link>
  );
}
