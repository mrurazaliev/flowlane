import { cn } from "@/shared/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md";

const variants: Record<Variant, string> = {
  primary: "bg-marking text-white shadow-[inset_0_-2px_0_var(--color-marking-dark)] hover:bg-marking-dark",
  secondary: "border border-line bg-white text-ink hover:border-gray-300 hover:bg-gray-50",
  ghost: "text-muted hover:bg-gray-100 hover:text-ink",
  danger: "bg-red-600 text-white hover:bg-red-700",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-[13px] rounded-[9px]",
  md: "h-9 px-4 text-sm rounded-[10px]",
};

export function buttonClasses(variant: Variant = "primary", size: Size = "md", className?: string) {
  return cn(
    "inline-flex items-center justify-center gap-1.5 font-semibold whitespace-nowrap transition-colors",
    "disabled:pointer-events-none disabled:opacity-50",
    variants[variant],
    sizes[size],
    className,
  );
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export function Button({ variant, size, className, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={buttonClasses(variant, size, className)} {...props} />;
}

export function Kbd({ children, dark = true }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <span
      className={cn(
        "ml-1 rounded border px-1.5 text-[11px] leading-4",
        dark ? "border-white/35 text-white/75" : "border-line text-faint",
      )}
    >
      {children}
    </span>
  );
}
