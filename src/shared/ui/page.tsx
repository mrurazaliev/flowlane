/** Заголовок страницы внутри приложения */
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
        <h1 className="text-[26px] font-semibold leading-tight tracking-tight text-ink">{title}</h1>
        {description && <p className="mt-1 text-muted">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 gap-2">{actions}</div>}
    </div>
  );
}

/** Заглушка, пока страница ждёт параметры URL (fallback для Suspense) */
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

/** Пустое состояние: что здесь будет и что сделать */
export function EmptyState({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="rounded-xl border-[1.5px] border-dashed border-gray-300 bg-white/60 px-6 py-12 text-center">
      <p className="font-medium text-ink">{title}</p>
      {description && <p className="mx-auto mt-1 max-w-sm text-muted">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
