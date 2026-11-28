"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { Kanban, List } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { useT } from "@/shared/lib/i18n";

export function ViewSwitch() {
  const t = useT();
  const pathname = usePathname();
  const { workspaceSlug, projectId } = useParams<{ workspaceSlug: string; projectId: string }>();
  const base = `/w/${workspaceSlug}/p/${projectId}`;
  const views = [
    { href: `${base}/board`, label: t("Board"), icon: Kanban },
    { href: `${base}/issues`, label: t("List"), icon: List },
  ];

  return (
    <div className="flex h-10 items-center gap-0.5 rounded-[12px] border border-line bg-paper-2 p-1">
      {views.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex h-full items-center gap-1.5 rounded-[9px] px-3 text-[13.5px] font-medium transition-colors",
              active ? "bg-white text-ink shadow-[0_1px_2px_rgba(27,34,56,.12)]" : "text-muted hover:text-ink",
            )}
          >
            <Icon className="size-4" />
            {label}
          </Link>
        );
      })}
    </div>
  );
}
