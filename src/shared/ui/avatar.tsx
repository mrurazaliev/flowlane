import { cn, initials } from "@/shared/lib/utils";

interface AvatarProps {
  name: string;
  src?: string | null;
  size?: "sm" | "md";
  className?: string;
}

export function Avatar({ name, src, size = "sm", className }: AvatarProps) {
  const sizeClass = size === "sm" ? "size-6 text-[10px]" : "size-8 text-xs";

  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={name} title={name} className={cn("rounded-full object-cover", sizeClass, className)} />;
  }

  return (
    <span
      title={name}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-indigo-100 font-semibold text-indigo-700",
        sizeClass,
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}
