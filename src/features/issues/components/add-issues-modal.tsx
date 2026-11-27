'use client'

import { useCallback, useId, useState } from 'react'
import { Search } from 'lucide-react'
import { useProject } from '@/shared/api/lookups'
import { Button } from '@/shared/ui/button'
import { ErrorBanner } from '@/shared/ui/form'
import { PriorityIcon } from '@/shared/ui/issue-icons'
import { Modal } from '@/shared/ui/modal'
import { useGetIssuesQuery, type IssueFilters } from '../api'

interface AddIssuesModalProps {
  onClose: () => void
  title: string
  hint?: string
  workspaceSlug: string
  projectId: string
  filter: IssueFilters
  action: 'add' | 'remove'
  onConfirm: (issueIds: [string, ...string[]]) => void
  pending: boolean
  error?: string
}

export function AddIssuesModal({
  onClose, title, hint, workspaceSlug, projectId, filter, action, onConfirm, pending, error,
}: AddIssuesModalProps) {
  const { data: project } = useProject(workspaceSlug, projectId)
  const isAdding = action === 'add'
  const projectIssues = useGetIssuesQuery(workspaceSlug, projectId, {}, { allPages: true, enabled: isAdding })
  const linkedIssues = useGetIssuesQuery(workspaceSlug, projectId, filter, { allPages: true })
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<string[]>([])
  const inputGroup = useId()
  const close = useCallback(() => {
    if (!pending) onClose()
  }, [pending, onClose])

  const isLoading = linkedIssues.isLoading || (isAdding && projectIssues.isLoading)
  const failed = linkedIssues.isError || (isAdding && projectIssues.isError)
  const linkedIds = new Set(linkedIssues.data?.map((issue) => issue.id))
  const issues = isAdding
    ? (projectIssues.data ?? []).filter((issue) => !linkedIds.has(issue.id))
    : linkedIssues.data ?? []
  const term = search.trim().toLowerCase()
  const visible = issues.filter((issue) =>
    (project?.identifier + '-' + issue.sequence_id + ' ' + issue.title).toLowerCase().includes(term),
  )
  const eligibleIds = new Set(issues.map((issue) => issue.id))
  const [first, ...rest] = selected.filter((id) => eligibleIds.has(id))

  function selectIssue(id: string, checked: boolean) {
    setSelected((current) => {
      if (!isAdding) return [id]
      return checked ? [...current, id] : current.filter((item) => item !== id)
    })
  }

  return (
    <Modal
      open
      onClose={close}
      title={title}
      className="max-w-xl"
      footer={
        <>
          <Button variant="secondary" onClick={close} disabled={pending}>Cancel</Button>
          <Button
            variant={isAdding ? 'primary' : 'danger'}
            disabled={!first || pending || isLoading || failed}
            onClick={() => first && onConfirm([first, ...rest])}
          >
            {pending ? 'Saving…' : isAdding ? 'Add selected' : 'Remove task'}
          </Button>
        </>
      }
    >
      {error && <div className="mb-3" role="alert"><ErrorBanner>{error}</ErrorBanner></div>}
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
        <input
          aria-label="Search tasks"
          placeholder="Search tasks…"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="h-10 w-full rounded-md border border-gray-200 pl-9 pr-3 text-sm focus:border-indigo-500 focus:outline-none"
        />
      </div>

      <ul className="mt-3 max-h-72 divide-y divide-gray-100 overflow-y-auto rounded-lg border border-gray-200">
        {isLoading && <li className="p-4 text-center text-sm text-muted">Loading tasks…</li>}
        {failed && <li role="alert" className="p-4 text-center text-sm text-red-600">Could not load tasks.</li>}
        {!isLoading && !failed && visible.length === 0 && (
          <li className="p-4 text-center text-sm text-muted">No matching tasks</li>
        )}
        {!isLoading && !failed && visible.map((issue) => (
          <li key={issue.id}>
            <label className="flex cursor-pointer items-center gap-3 px-4 py-2.5 hover:bg-gray-50">
              <input
                name={inputGroup}
                type={isAdding ? 'checkbox' : 'radio'}
                className="size-4 accent-indigo-600"
                disabled={pending}
                checked={selected.includes(issue.id)}
                onChange={(event) => selectIssue(issue.id, event.target.checked)}
              />
              <span className="w-16 text-xs font-medium text-gray-500">
                {project?.identifier}-{issue.sequence_id}
              </span>
              <span className="flex-1 truncate text-sm text-gray-900">{issue.title}</span>
              <PriorityIcon priority={issue.priority} />
            </label>
          </li>
        ))}
      </ul>

      {hint && <p className="mt-3 text-xs text-gray-500">{hint}</p>}
    </Modal>
  )
}
