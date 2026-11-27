import { isAxiosError } from 'axios'
import { z } from 'zod'
import { errorText } from '@/shared/lib/errors'

const planningFields = z.object({
  name: z.string().trim().min(1, 'Enter a name.').max(255),
  description: z.string().trim().max(10000),
  start_date: z.union([z.iso.date(), z.literal('')]),
})

const optionalDate = z.union([z.iso.date(), z.literal('')])

export const cycleSchema = planningFields.extend({ end_date: optionalDate }).refine(
  ({ start_date, end_date }) => !start_date || !end_date || start_date <= end_date,
  { path: ['end_date'], message: 'End date must be on or after the start date.' },
)

export const moduleSchema = planningFields.extend({
  target_date: optionalDate,
  lead_id: z.string(),
  status: z.enum(['backlog', 'in_progress', 'paused', 'completed', 'cancelled']),
}).refine(
  ({ start_date, target_date }) => !start_date || !target_date || start_date <= target_date,
  { path: ['target_date'], message: 'Target date must be on or after the start date.' },
)

export const toApiDate = (value: string, endOfDay = false) =>
  value ? `${value}T${endOfDay ? '23:59:59.999' : '00:00:00.000'}Z` : null

export const planningErrorText = (error: unknown, fallback: string) =>
  errorText(isAxiosError(error) ? error.response?.data : error, fallback)
