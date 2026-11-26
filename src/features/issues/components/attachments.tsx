import { Download, File, FileImage, Trash2, Upload } from "lucide-react";
import type { Attachment } from "@/shared/api/types";
import { formatDate, formatFileSize } from "@/shared/lib/utils";

/**
 * Файлы задачи.
 * Позже: POST /attachments возвращает ссылку для загрузки → отправляем файл по ней.
 */
export function Attachments({ attachments }: { attachments: Attachment[] }) {
  return (
    <div>
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
        Attachments <span className="text-gray-400">({attachments.length})</span>
      </h3>

      {attachments.length > 0 && (
        <ul className="mb-3 space-y-2">
          {attachments.map((file) => {
            const Icon = file.mime_type.startsWith("image/") ? FileImage : File;
            return (
              <li key={file.id} className="flex items-center gap-3 rounded-lg border border-gray-200 px-3 py-2">
                <Icon className="size-5 shrink-0 text-indigo-500" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900">{file.file_name}</p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(file.file_size)} · {file.uploaded_by.display_name} · {formatDate(file.created_at)}
                  </p>
                </div>
                <button className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700" aria-label="Download">
                  <Download className="size-4" />
                </button>
                <button className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600" aria-label="Delete">
                  <Trash2 className="size-4" />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <label className="flex cursor-pointer flex-col items-center gap-1 rounded-lg border border-dashed border-gray-300 px-4 py-5 text-center hover:border-indigo-400 hover:bg-indigo-50/40">
        <Upload className="size-5 text-gray-400" />
        <span className="text-sm text-gray-600">
          Drop files here or <span className="font-medium text-indigo-600">browse</span>
        </span>
        <input type="file" className="hidden" />
      </label>
    </div>
  );
}
