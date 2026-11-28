'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { isAxiosError } from 'axios'
import { CheckCheck } from 'lucide-react'
import { IncomingInvites } from '@/features/workspaces'
import type { NotificationType } from '@/shared/api/types'
import { errorText } from '@/shared/lib/errors'
import { cn, formatDate } from '@/shared/lib/utils'
import { Avatar } from '@/shared/ui/avatar'
import { Button } from '@/shared/ui/button'
import { ErrorBanner } from '@/shared/ui/form'
import { EmptyState, PageHeader } from '@/shared/ui/page'
import { Tabs } from '@/shared/ui/tabs'
import {
  useMarkAllNotificationsRead, useMarkNotificationRead, useNotifications,
  type NotificationFilter, type NotificationItem,
} from '../api'

const texts: Record<NotificationType, string> = {
  issue_assigned: 'assigned you to',
  comment_added: 'commented on',
  mentioned: 'mentioned you in',
}

function notificationError(error: unknown, fallback: string) {
  return errorText(isAxiosError(error) ? error.response?.data : undefined, fallback)
}

export function NotificationList() {
  const { workspaceSlug } = useParams<{ workspaceSlug: string }>()
  const router = useRouter()
  const [filter, setFilter] = useState<NotificationFilter>('all')
  const [actionError, setActionError] = useState('')
  const notificationsQuery = useNotifications(workspaceSlug, filter)
  const readMutation = useMarkNotificationRead(workspaceSlug)
  const readAllMutation = useMarkAllNotificationsRead(workspaceSlug)
  const notifications = notificationsQuery.data?.pages.flatMap((page) => page.data) ?? []
  const unreadCount = notificationsQuery.data?.pages[0]?.unread_count
  const totalCount = filter === 'all' && notificationsQuery.isSuccess && !notificationsQuery.hasNextPage
    ? notifications.length
    : undefined
  const busy = readMutation.isPending || readAllMutation.isPending

  async function handleOpenNotification(notification: NotificationItem) {
    if (busy) return
    setActionError('')
    try {
      const item = notification.is_read ? notification : await readMutation.mutateAsync(notification.id)
      if (item.issue && item.issue_id) {
        const slug = encodeURIComponent(workspaceSlug)
        const projectId = encodeURIComponent(item.issue.project_id)
        const issueId = encodeURIComponent(item.issue_id)
        router.push(`/w/${slug}/p/${projectId}/issues/${issueId}`)
      }
    } catch (error) {
      setActionError(notificationError(error, 'Could not mark the notification as read.'))
    }
  }

  async function handleReadAll() {
    if (busy || !unreadCount) return
    setActionError('')
    try {
      await readAllMutation.mutateAsync()
    } catch (error) {
      setActionError(notificationError(error, 'Could not mark all notifications as read.'))
    }
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 md:px-7">
      <PageHeader
        title="Notifications"
        actions={
          <Button variant="secondary" disabled={!unreadCount || busy} onClick={() => void handleReadAll()}>
            <CheckCheck className="size-4" />
            {readAllMutation.isPending ? 'Marking as read…' : 'Mark all as read'}
          </Button>
        }
      />

      <IncomingInvites className="mb-6 max-w-3xl" />

      <Tabs
        className="mb-4"
        value={filter}
        onChange={setFilter}
        tabs={[
          { value: 'all', label: 'All', count: totalCount },
          { value: 'unread', label: 'Unread', count: unreadCount },
        ]}
      />

      <div className="max-w-3xl space-y-3">
        {actionError && <div role="alert"><ErrorBanner>{actionError}</ErrorBanner></div>}

        {notificationsQuery.isPending && (
          <p role="status" className="text-sm text-muted">Loading notifications…</p>
        )}
        {notificationsQuery.isError && !notificationsQuery.isFetchNextPageError && (
          <div className="space-y-2">
            <div role="alert"><ErrorBanner>{notificationError(notificationsQuery.error, 'Could not load notifications.')}</ErrorBanner></div>
            <Button variant="secondary" disabled={notificationsQuery.isFetching} onClick={() => void notificationsQuery.refetch()}>
              Try again
            </Button>
          </div>
        )}
        {notificationsQuery.isSuccess && notifications.length === 0 && (
          <EmptyState title={filter === 'unread' ? 'No unread task notifications' : 'No task notifications yet'} />
        )}

        {notifications.length > 0 && (
          <ul className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white">
            {notifications.map((notification) => {
              const { issue, actor, is_read, created_at, type, id } = notification
              return (
                <li key={id}>
                  <button
                    type="button"
                    disabled={busy || (is_read && (!issue || !notification.issue_id))}
                    aria-busy={readMutation.isPending && readMutation.variables === id}
                    onClick={() => void handleOpenNotification(notification)}
                    className={cn('flex w-full items-start gap-3 px-4 py-3 text-left enabled:hover:bg-gray-50', !is_read && 'bg-indigo-50/40')}
                  >
                    <Avatar name={actor.display_name} src={actor.avatar_url} size="md" />
                    <div className="min-w-0 flex-1 text-sm">
                      <p className="text-gray-700">
                        <span className="font-medium text-gray-900">{actor.display_name}</span> {texts[type]}{' '}
                        {issue ? (
                          <span className="font-medium text-indigo-600">
                            {issue.project_identifier}-{issue.sequence_id} · {issue.title}
                          </span>
                        ) : 'a task'}
                      </p>
                      <p className="mt-0.5 text-xs text-gray-400">{formatDate(created_at)}</p>
                    </div>
                    {!is_read && <span className="mt-2 size-2 shrink-0 rounded-full bg-indigo-600" aria-label="Unread" />}
                  </button>
                </li>
              )
            })}
          </ul>
        )}

        {notificationsQuery.isFetchNextPageError && (
          <div role="alert"><ErrorBanner>{notificationError(notificationsQuery.error, 'Could not load more notifications.')}</ErrorBanner></div>
        )}
        {notificationsQuery.hasNextPage && (
          <Button variant="secondary" disabled={busy || notificationsQuery.isFetching} onClick={() => void notificationsQuery.fetchNextPage()}>
            {notificationsQuery.isFetchingNextPage ? 'Loading…' : 'Load more'}
          </Button>
        )}
      </div>
    </div>
  )
}
