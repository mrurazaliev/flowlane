import { cn, initials } from "@/shared/lib/utils";

const palette = ["#5B6B8C", "#B5654A", "#4E8A73", "#8A6AA8", "#A0763A", "#4F7FA8"];

/** Цвет аватара зависит от имени — у одного человека всегда один цвет */
function colorFor(name: string) {
  let sum = 0;
  for (const ch of name) sum += ch.charCodeAt(0);
  return palette[sum % palette.length];
}

interface AvatarProps {
  name: string;
  src?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = { sm: "size-6 text-[10px]", md: "size-8 text-xs", lg: "size-14 text-lg" };

export function Avatar({ name, src, size = "sm", className }: AvatarProps) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={name} title={name} className={cn("shrink-0 rounded-full object-cover", sizes[size], className)} />;
  }

  return (
    <span
      title={name}
      style={{ backgroundColor: colorFor(name) }}
      className={cn(
        "inline-grid shrink-0 place-items-center rounded-full text-center font-semibold tracking-tight text-white",
        sizes[size],
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}

/** Несколько аватаров внахлёст */
export function AvatarStack({ names, max = 4 }: { names: string[]; max?: number }) {
  const shown = names.slice(0, max);
  const rest = names.length - shown.length;
  return (
    <div className="flex">
      {shown.map((name) => (
        <Avatar key={name} name={name} size="md" className="-ml-1 ring-2 ring-white first:ml-0" />
      ))}
      {rest > 0 && (
        <span className="-ml-1 inline-grid size-8 place-items-center rounded-full bg-gray-100 text-xs font-medium text-muted ring-2 ring-white">
          +{rest}
        </span>
      )}
    </div>
  );
}
