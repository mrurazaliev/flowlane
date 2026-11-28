"use client";

import { Download, File, FileImage, Paperclip, Trash2 } from "lucide-react";
import type { Attachment } from "@/shared/api/types";
import { useT } from "@/shared/lib/i18n";
import { formatFileSize } from "@/shared/lib/utils";

/**
 * D1.15 Файлы задачи.
 * Позже: POST .../attachments → ссылка для загрузки → файл грузится по ней (с прогрессом).
 * Если загрузка упала — сразу DELETE .../attachments/:id.
 */
export function Attachments({ attachments }: { attachments: Attachment[] }) {
  const t = useT();
  return (
    <section className="mt-8">
      <div className="mb-2.5 flex items-center gap-2.5">
        <h3 className="text-[15px] font-semibold">{t("Files")}</h3>
        {attachments.length > 0 && <span className="text-[13px] tabular-nums text-muted">{attachments.length}</span>}
      </div>

      <div className="flex flex-wrap gap-2.5">
        {attachments.map((file) => {
          const Icon = file.mime_type.startsWith("image/") ? FileImage : File;
          return (
            <div key={file.id} className="group flex items-center gap-2.5 rounded-[10px] border border-line bg-white py-2 pl-3 pr-2">
              <Icon className="size-[18px] shrink-0 text-muted" />
              <div className="min-w-0">
                <p className="truncate text-[13.5px]">{file.file_name}</p>
                <p className="text-xs text-muted">
                  {formatFileSize(file.file_size)}, {file.uploaded_by.display_name}
                </p>
              </div>
              <div className="ml-1 flex opacity-60 group-hover:opacity-100">
                <button className="rounded p-1 text-muted hover:bg-gray-100 hover:text-ink" aria-label={t("Download")}>
                  <Download className="size-4" />
                </button>
                <button className="rounded p-1 text-muted hover:bg-red-50 hover:text-red-600" aria-label={t("Delete")}>
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
          );
        })}

        <label className="flex cursor-pointer items-center gap-2 rounded-[10px] border-[1.5px] border-dashed border-gray-300 px-3.5 py-2.5 text-[13.5px] text-muted hover:border-asphalt hover:text-ink">
          <Paperclip className="size-4" />
          {t("Drop files or browse")}
          <input type="file" className="hidden" />
        </label>
      </div>
    </section>
  );
}
