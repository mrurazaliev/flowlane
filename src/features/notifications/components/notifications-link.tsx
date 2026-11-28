'use client'

import { usePathname } from 'next/navigation'
import { Bell } from 'lucide-react'
import { useInvites } from '@/features/workspaces'
import { SidebarLink } from '@/shared/layout/sidebar-link'
import { useNotificationCount } from '../api'

/** D2.15 Колокольчик со счётчиком (слот в сайдбаре). */
export function NotificationsLink({ workspaceSlug }: { workspaceSlug: string }) {
  const pathname = usePathname()
  const href = `/w/${workspaceSlug}/notifications`
  const { data: notificationCount = 0 } = useNotificationCount(workspaceSlug)
  const { data: invites = [] } = useInvites()
  const unreadCount = notificationCount + invites.length

  return (
    <SidebarLink href={href} active={pathname === href}>
      <Bell className="size-4 text-[#8c93a0]" />
      <span className="flex-1">Notifications</span>
      {unreadCount > 0 && (
        <span className="rounded-full bg-marking px-1.5 text-xs font-semibold tabular-nums text-asphalt">{unreadCount}</span>
      )}
    </SidebarLink>
  )
}
