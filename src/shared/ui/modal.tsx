"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { translate } from "@/shared/lib/i18n";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])';

/** Модалка: закрывается по Esc и клику на фон, фокус не уходит за её пределы (F2.4) */
export function Modal({ open, onClose, title, icon, children, footer, className }: ModalProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const box = ref.current;
    // Фокус на первое поле (или на саму модалку)
    const first = box?.querySelector<HTMLElement>("input,textarea,select") ?? box;
    first?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") return onClose();
      if (e.key !== "Tab" || !box) return;
      const items = Array.from(box.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (items.length === 0) return;
      const firstItem = items[0];
      const lastItem = items[items.length - 1];
      if (e.shiftKey && document.activeElement === firstItem) {
        e.preventDefault();
        lastItem.focus();
      } else if (!e.shiftKey && document.activeElement === lastItem) {
        e.preventDefault();
        firstItem.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      previous?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <div className="absolute inset-0 bg-asphalt/45" onClick={onClose} />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={cn(
          "relative w-full max-w-lg rounded-t-2xl bg-white shadow-[0_24px_60px_-20px_rgba(30,34,42,.45)] outline-none sm:rounded-2xl",
          className,
        )}
      >
        <div className="flex items-center justify-between px-6 pt-5">
          <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight text-ink">
            {icon}
            {title}
          </h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-faint hover:bg-gray-100 hover:text-ink" aria-label={translate("Close")}>
            <X className="size-5" />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-line-soft px-6 py-4">{footer}</div>}
      </div>
    </div>
  );
}
