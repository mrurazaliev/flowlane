import { CircleAlert } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { translate } from "@/shared/lib/i18n";

const fieldBase =
  "w-full rounded-[10px] border border-line bg-white px-3.5 text-[15px] text-ink placeholder:text-faint transition-shadow " +
  "focus:border-asphalt focus:outline-none focus:ring-[3px] focus:ring-marking-soft";

const fieldError = "border-red-400 focus:border-red-500 focus:ring-red-100";

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("mb-1.5 block text-[13.5px] font-medium text-ink", className)} {...props} />;
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export function Input({ className, invalid, ...props }: InputProps) {
  return <input className={cn(fieldBase, "h-11", invalid && fieldError, className)} {...props} />;
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export function Textarea({ className, invalid, ...props }: TextareaProps) {
  return <textarea className={cn(fieldBase, "min-h-24 py-2.5 leading-relaxed", invalid && fieldError, className)} {...props} />;
}

/** Нативный select — только для простых форм. Для свойств задачи используйте <Dropdown> */
export function Select({ className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn(fieldBase, "h-11 pr-8", className)} {...props} />;
}

/** Сообщение об ошибке под полем (позже сюда пойдут ошибки Zod) */
export function FieldError({ children }: { children?: React.ReactNode }) {
  if (!children) return null;
  // Сообщения Zod пишем по-английски, а переводим здесь — в одном месте для всех форм
  return <p className="mt-1.5 text-[13px] text-red-600">{typeof children === "string" ? translate(children) : children}</p>;
}

export function FieldHint({ children }: { children: React.ReactNode }) {
  return <p className="mt-1.5 text-[13px] text-muted">{children}</p>;
}

/** Плашка ошибки над формой (ошибки от API: errorText(error)) */
export function ErrorBanner({ children }: { children?: React.ReactNode }) {
  if (!children) return null;
  return (
    <div className="flex items-center gap-2 rounded-[10px] bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
      <CircleAlert className="size-4 shrink-0" />
      {typeof children === "string" ? translate(children) : children}
    </div>
  );
}
