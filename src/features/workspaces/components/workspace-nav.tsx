"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings, Users } from "lucide-react";
import { cn } from "@/shared/lib/utils";

/** Ссылки workspace в сайдбаре: участники и настройки */
export function WorkspaceNav({ workspaceSlug }: { workspaceSlug: string }) {
  const pathname = usePathname();
  const links = [
    { href: `/w/${workspaceSlug}/members`, label: "Members", icon: Users },
    { href: `/w/${workspaceSlug}/settings`, label: "Settings", icon: Settings },
  ];

  return (
    <>
      {links.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className={cn(
            "flex items-center gap-2.5 rounded-md px-2 py-2 text-sm",
            pathname === href ? "bg-indigo-50 font-medium text-indigo-700" : "text-gray-700 hover:bg-gray-100",
          )}
        >
          <Icon className="size-4" />
          {label}
        </Link>
      ))}
    </>
  );
}
