import { isAxiosError } from 'axios'
import { z } from 'zod'
import { errorText } from '@/shared/lib/errors'

export const projectSettingsSchema = z.object({
  name: z.string().trim().min(1, 'Enter a project name').max(100, 'Use at most 100 characters'),
  description: z.string().trim().max(500, 'Use at most 500 characters'),
  lead_id: z.union([z.literal(''), z.uuid('Select a workspace member')]),
})

export const createProjectSchema = projectSettingsSchema.extend({
  identifier: z.string().trim().toUpperCase()
    .min(1, 'Enter a project identifier')
    .max(10, 'Use at most 10 characters')
    .regex(/^[A-Z0-9]+$/, 'Use letters and digits only'),
})

export const projectRoles = ['admin', 'member', 'viewer'] as const

export function projectErrorText(error: unknown, fallback: string) {
  return errorText(isAxiosError(error) ? error.response?.data : undefined, fallback)
}

export function projectSettingsHref(slug: string, id: string) {
  return `/w/${encodeURIComponent(slug)}/p/${encodeURIComponent(id)}/settings`
}
