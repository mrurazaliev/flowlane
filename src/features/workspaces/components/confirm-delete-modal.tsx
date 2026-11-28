"use client";

import { Button } from '@/shared/ui/button'
import { ErrorBanner } from '@/shared/ui/form'
import { useT } from "@/shared/lib/i18n";
import { Modal } from '@/shared/ui/modal'

export function ConfirmDeleteModal({
  title, description, confirmLabel, pending, error, onClose, onConfirm,
}: {
  title: string;
  description: string;
  confirmLabel: string;
  pending: boolean;
  error?: string;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const t = useT();
  return (
    <Modal
      open
      title={title}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" disabled={pending} onClick={onClose}>{t("Cancel")}</Button>
          <Button variant="danger" disabled={pending} onClick={onConfirm}>
            {pending ? t("Please wait…") : confirmLabel}
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <p className="text-sm text-gray-600">{description}</p>
        {error && <div role="alert"><ErrorBanner>{error}</ErrorBanner></div>}
      </div>
    </Modal>
  )
}
