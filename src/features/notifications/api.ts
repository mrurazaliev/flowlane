import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/shared/api/client'
import { queryKeys } from '@/shared/api/queryKeys'
import type { Notification } from '@/shared/api/types'

export type NotificationFilter = 'all' | 'unread'

export type NotificationItem = Notification & {
  issue?: {
    project_id: string
    project_identifier: string
    sequence_id: number
    title: string
  } | null
}

type NotificationsResponse = {
  data: NotificationItem[]
  unread_count: number
  next_cursor: string | null
}

type NotificationParams = { read?: 'false'; cursor?: string; limit: number }

function notificationsUrl(slug: string) {
  return `/workspaces/${encodeURIComponent(slug)}/notifications`
}

async function getNotifications(slug: string, params: NotificationParams, signal: AbortSignal): Promise<NotificationsResponse> {
  const { data } = await api.get<NotificationsResponse>(`${notificationsUrl(slug)}/`, { params, signal })
  return data
}

async function markNotificationRead(slug: string, notificationId: string): Promise<NotificationItem> {
  const { data } = await api.post<NotificationItem>(`${notificationsUrl(slug)}/${encodeURIComponent(notificationId)}/read`)
  return data
}

async function markAllNotificationsRead(slug: string): Promise<{ updated: number }> {
  const { data } = await api.post<{ updated: number }>(`${notificationsUrl(slug)}/read-all`)
  return data
}

export function useNotifications(slug: string, filter: NotificationFilter) {
  return useInfiniteQuery({
    queryKey: [...queryKeys.notifications.all(slug), filter],
    queryFn: ({ pageParam, signal }) => getNotifications(slug, {
      limit: 50,
      ...(filter === 'unread' && { read: 'false' }),
      ...(pageParam && { cursor: pageParam }),
    }, signal),
    initialPageParam: null as string | null,
    getNextPageParam: (page) => page.next_cursor,
    staleTime: 15_000,
    refetchInterval: 30_000,
  })
}

export function useNotificationCount(slug: string) {
  return useQuery({
    queryKey: [...queryKeys.notifications.all(slug), 'count'],
    queryFn: ({ signal }) => getNotifications(slug, { limit: 1 }, signal),
    select: (response) => response.unread_count,
    staleTime: 15_000,
    refetchInterval: 30_000,
  })
}

export function useMarkNotificationRead(slug: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (notificationId: string) => markNotificationRead(slug, notificationId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all(slug) })
    },
  })
}

export function useMarkAllNotificationsRead(slug: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => markAllNotificationsRead(slug),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all(slug) })
    },
  })
}
