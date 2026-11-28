export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-serif text-[34px] font-semibold leading-tight tracking-tight text-ink">{title}</h1>
        {description && <p className="mt-1.5 text-[15px] text-muted">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 gap-2">{actions}</div>}
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="space-y-4 p-7">
      <div className="h-8 w-56 animate-pulse rounded-lg bg-line-soft" />
      <div className="h-4 w-80 animate-pulse rounded bg-line-soft" />
      <div className="grid gap-3 pt-4 md:grid-cols-3">
        {[1, 2, 3].map((n) => (
          <div key={n} className="h-36 animate-pulse rounded-xl bg-white" />
        ))}
      </div>
    </div>
  );
}

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="rounded-[16px] border-[1.5px] border-dashed border-gray-300 bg-[repeating-linear-gradient(135deg,transparent_0_10px,color-mix(in_oklab,var(--color-line)_45%,transparent)_10px_11px)] px-6 py-12 text-center">
      <p className="font-serif text-lg font-semibold text-ink">{title}</p>
      {description && <p className="mx-auto mt-1 max-w-sm text-muted">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
