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
      className="flex items-center gap-2.5 rounded-[9px] bg-asphalt-2 px-2.5 py-2 font-medium text-white transition-colors hover:bg-[#353b47]"
    >
      <span className="grid size-6 place-items-center rounded-md bg-[#3d4552] text-xs">{name[0]?.toUpperCase()}</span>
      <span className="flex-1 truncate">{name}</span>
      <ChevronsUpDown className="size-4 text-faint" />
    </Link>
  )
}
