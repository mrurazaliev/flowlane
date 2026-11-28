import { cn } from "@/shared/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md";

const variants: Record<Variant, string> = {
  primary: "bg-asphalt text-white hover:bg-asphalt-2 dark:bg-marking dark:text-asphalt dark:hover:bg-[#f5c451]",
  secondary: "border border-line bg-white text-ink hover:bg-gray-50",
  ghost: "text-muted hover:bg-gray-100 hover:text-ink",
  danger: "bg-red-600 text-white hover:bg-red-700",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-[13px] rounded-lg",
  md: "h-9 px-3.5 text-sm rounded-[9px]",
};

export function buttonClasses(variant: Variant = "primary", size: Size = "md", className?: string) {
  return cn(
    "inline-flex items-center justify-center gap-1.5 font-medium whitespace-nowrap transition-colors",
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
        dark ? "border-[#4a515d] text-faint" : "border-line text-faint",
      )}
    >
      {children}
    </span>
  );
}
