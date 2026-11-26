"use client";

import { usePathname } from "next/navigation";
import { Settings, Users } from "lucide-react";
import { SidebarLink } from "@/shared/layout/sidebar-link";

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
        <SidebarLink key={href} href={href} active={pathname === href}>
          <Icon className="size-4 text-[#8c93a0]" />
          {label}
        </SidebarLink>
      ))}
    </>
  );
}
