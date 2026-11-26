import { CircleAlert } from "lucide-react";
import { cn } from "@/shared/lib/utils";

const fieldBase =
  "w-full rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 " +
  "focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20";

const fieldError = "border-red-400 focus:border-red-500 focus:ring-red-500/20";

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("mb-1.5 block text-sm font-medium text-gray-700", className)} {...props} />;
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export function Input({ className, invalid, ...props }: InputProps) {
  return <input className={cn(fieldBase, "h-10", invalid && fieldError, className)} {...props} />;
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export function Textarea({ className, invalid, ...props }: TextareaProps) {
  return <textarea className={cn(fieldBase, "min-h-24 py-2", invalid && fieldError, className)} {...props} />;
}

export function Select({ className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn(fieldBase, "h-10 pr-8", className)} {...props} />;
}

/** Сообщение об ошибке под полем (позже сюда пойдут ошибки Zod) */
export function FieldError({ children }: { children?: React.ReactNode }) {
  if (!children) return null;
  return <p className="mt-1 text-xs text-red-600">{children}</p>;
}

export function FieldHint({ children }: { children: React.ReactNode }) {
  return <p className="mt-1 text-xs text-gray-500">{children}</p>;
}

/** Красная плашка ошибки над формой (ошибки от API: error.message) */
export function ErrorBanner({ children }: { children?: React.ReactNode }) {
  if (!children) return null;
  return (
    <div className="flex items-center gap-2 rounded-md bg-red-50 px-3 py-2.5 text-sm text-red-700">
      <CircleAlert className="size-4 shrink-0" />
      {children}
    </div>
  );
}
