"use client";

import { usePathname } from "next/navigation";
import { Settings, Users } from "lucide-react";
import { SidebarLink } from "@/shared/layout/sidebar-link";
import { useT } from "@/shared/lib/i18n";

export function WorkspaceNav({ workspaceSlug }: { workspaceSlug: string }) {
  const t = useT();
  const pathname = usePathname();
  const links = [
    { href: `/w/${workspaceSlug}/members`, label: t("Members"), icon: Users },
    { href: `/w/${workspaceSlug}/settings`, label: t("Settings"), icon: Settings },
  ];

  return (
    <>
      {links.map(({ href, label, icon: Icon }) => (
        <SidebarLink key={href} href={href} active={pathname === href}>
          <Icon className="size-4 text-side-faint" />
          {label}
        </SidebarLink>
      ))}
    </>
  );
}
