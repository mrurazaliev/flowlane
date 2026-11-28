'use client'

import Link from 'next/link'
import { ChevronsUpDown } from 'lucide-react'
import { useWorkspace } from '../api';

export function WorkspaceSwitcher({ workspaceSlug }: { workspaceSlug: string }) {
  const { data: workspace } = useWorkspace(workspaceSlug)
  const name = workspace?.name ?? workspaceSlug

  return (
    <Link
      href="/workspaces"
      className="flex items-center gap-2.5 rounded-[12px] border border-line bg-side-active px-2.5 py-2.5 font-semibold text-ink shadow-[0_1px_0_var(--color-line)] transition-colors hover:border-gray-300"
    >
      <span className="grid size-8 place-items-center rounded-[8px] bg-sage text-xs font-bold text-white">{name[0]?.toUpperCase()}</span>
      <span className="flex-1 truncate">{name}</span>
      <ChevronsUpDown className="size-4 text-faint" />
    </Link>
  )
}
