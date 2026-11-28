'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { isAxiosError } from 'axios'
import { CheckCheck } from 'lucide-react'
import type { Notification, NotificationType } from '@/shared/api/types'
import { errorText } from '@/shared/lib/errors'
import { cn, formatDate } from '@/shared/lib/utils'
import { Avatar } from '@/shared/ui/avatar'
import { Button } from '@/shared/ui/button'
import { ErrorBanner } from '@/shared/ui/form'
import { EmptyState, PageHeader } from '@/shared/ui/page'
import { Tabs } from '@/shared/ui/tabs'
import {
  useFindNotificationProject, useMarkAllNotificationsRead, useMarkNotificationRead, useNotifications,
  type NotificationFilter,
} from '../api'
import { useT } from "@/shared/lib/i18n";

const texts: Record<NotificationType, string> = {
  issue_assigned: 'assigned you to',
  comment_added: 'commented on',
  mentioned: 'mentioned you in',
}

function notificationError(error: unknown, fallback: string) {
  return errorText(isAxiosError(error) ? error.response?.data : undefined, fallback)
}

export function NotificationList() {
  const t = useT();
  const { workspaceSlug } = useParams<{ workspaceSlug: string }>()
  const router = useRouter()
  const [filter, setFilter] = useState<NotificationFilter>('all')
  const [actionError, setActionError] = useState('')
  const notificationsQuery = useNotifications(workspaceSlug, filter)
  const readMutation = useMarkNotificationRead(workspaceSlug)
  const readAllMutation = useMarkAllNotificationsRead(workspaceSlug)
  const findProject = useFindNotificationProject(workspaceSlug)
  const notifications = notificationsQuery.data?.pages.flatMap((page) => page.data) ?? []
  const unreadCount = notificationsQuery.data?.pages[0]?.unread_count
  const totalCount = filter === 'all' && notificationsQuery.isSuccess && !notificationsQuery.hasNextPage
    ? notifications.length
    : undefined
  const busy = readMutation.isPending || readAllMutation.isPending || findProject.isPending

  async function handleOpenNotification(notification: Notification) {
    if (busy) return
    setActionError('')
    try {
      if (!notification.is_read) await readMutation.mutateAsync(notification.id)
    } catch (error) {
      setActionError(notificationError(error, t("Could not mark the notification as read.")))
      return
    }

    if (!notification.issue_id) return
    try {
      const projectId = await findProject.mutateAsync(notification.issue_id)
      if (!projectId) {
        setActionError(t("This task is no longer available."))
        return
      }
      const slug = encodeURIComponent(workspaceSlug)
      router.push(`/w/${slug}/p/${encodeURIComponent(projectId)}/issues/${encodeURIComponent(notification.issue_id)}`)
    } catch (error) {
      setActionError(notificationError(error, t("Could not open the task.")))
    }
  }

  async function handleReadAll() {
    if (busy || !unreadCount) return
    setActionError('')
    try {
      await readAllMutation.mutateAsync()
    } catch (error) {
      setActionError(notificationError(error, t("Could not mark all notifications as read.")))
    }
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 md:px-7">
      <PageHeader
        title={t("Notifications")}
        actions={
          <Button variant="secondary" disabled={!unreadCount || busy} onClick={() => void handleReadAll()}>
            <CheckCheck className="size-4" />
            {readAllMutation.isPending ? t("Marking as read…") : t("Mark all as read")}
          </Button>
        }
      />

      <Tabs
        className="mb-4"
        value={filter}
        onChange={setFilter}
        tabs={[
          { value: 'all', label: t("All"), count: totalCount },
          { value: 'unread', label: t("Unread"), count: unreadCount },
        ]}
      />

      <div className="max-w-3xl space-y-3">
        {actionError && <div role="alert"><ErrorBanner>{actionError}</ErrorBanner></div>}

        {notificationsQuery.isPending && (
          <p role="status" className="text-sm text-muted">{t("Loading notifications…")}</p>
        )}
        {notificationsQuery.isError && !notificationsQuery.isFetchNextPageError && (
          <div className="space-y-2">
            <div role="alert"><ErrorBanner>{notificationError(notificationsQuery.error, t("Could not load notifications."))}</ErrorBanner></div>
            <Button variant="secondary" disabled={notificationsQuery.isFetching} onClick={() => void notificationsQuery.refetch()}>
              {t("Try again")}
            </Button>
          </div>
        )}
        {notificationsQuery.isSuccess && notifications.length === 0 && (
          <EmptyState title={filter === 'unread' ? t("No unread task notifications") : t("No task notifications yet")} />
        )}

        {notifications.length > 0 && (
          <ul className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white">
            {notifications.map((notification) => {
              const { actor, is_read, created_at, type, id, issue_id } = notification
              return (
                <li key={id}>
                  <button
                    type="button"
                    disabled={busy || (is_read && !issue_id)}
                    aria-busy={(readMutation.isPending && readMutation.variables === id) ||
                      (findProject.isPending && findProject.variables === issue_id)}
                    onClick={() => void handleOpenNotification(notification)}
                    className={cn('flex w-full items-start gap-3 px-4 py-3 text-left enabled:hover:bg-gray-50', !is_read && 'bg-indigo-50/40')}
                  >
                    <Avatar name={actor.display_name} src={actor.avatar_url} size="md" />
                    <div className="min-w-0 flex-1 text-sm">
                      <p className="text-gray-700">
                        <span className="font-medium text-gray-900">{actor.display_name}</span> {t(texts[type])}{' '}
                        {t('a task')}
                      </p>
                      <p className="mt-0.5 text-xs text-gray-400">{formatDate(created_at)}</p>
                    </div>
                    {!is_read && <span className="mt-2 size-2 shrink-0 rounded-full bg-indigo-600" aria-label={t("Unread")} />}
                  </button>
                </li>
              )
            })}
          </ul>
        )}

        {notificationsQuery.isFetchNextPageError && (
          <div role="alert"><ErrorBanner>{notificationError(notificationsQuery.error, t("Could not load more notifications."))}</ErrorBanner></div>
        )}
        {notificationsQuery.hasNextPage && (
          <Button variant="secondary" disabled={busy || notificationsQuery.isFetching} onClick={() => void notificationsQuery.fetchNextPage()}>
            {notificationsQuery.isFetchingNextPage ? t("Loading…") : t("Load more")}
          </Button>
        )}
      </div>
    </div>
  )
}
