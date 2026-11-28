'use client'

import { usePathname } from 'next/navigation'
import { Bell } from 'lucide-react'
import { SidebarLink } from '@/shared/layout/sidebar-link'
import { useT } from "@/shared/lib/i18n";
import { useNotificationCount } from '../api'

export function NotificationsLink({ workspaceSlug }: { workspaceSlug: string }) {
  const t = useT();
  const pathname = usePathname()
  const href = `/w/${workspaceSlug}/notifications`
  const { data: unreadCount = 0 } = useNotificationCount(workspaceSlug)

  return (
    <SidebarLink href={href} active={pathname === href}>
      <Bell className="size-4 text-[#8c93a0]" />
      <span className="flex-1">{t("Notifications")}</span>
      {unreadCount > 0 && (
        <span className="rounded-full bg-marking px-1.5 text-xs font-semibold tabular-nums text-asphalt">{unreadCount}</span>
      )}
    </SidebarLink>
  )
}
