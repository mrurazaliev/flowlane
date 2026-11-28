import { translate } from "@/shared/lib/i18n";

export type ApiErrorCode =
  | "BAD_REQUEST"
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "GONE"
  | "RATE_LIMITED"
  | "INTERNAL_ERROR";

export interface ApiErrorBody {
  error: { code: ApiErrorCode; message: string; details?: unknown };
}

const fallbackTexts: Record<ApiErrorCode, string> = {
  BAD_REQUEST: "The request is invalid.",
  VALIDATION_ERROR: "Please check the highlighted fields.",
  UNAUTHORIZED: "Please log in again.",
  FORBIDDEN: "You don't have permission to do this.",
  NOT_FOUND: "Not found.",
  CONFLICT: "This already exists.",
  GONE: "This link has expired.",
  RATE_LIMITED: "Too many attempts. Please wait a moment.",
  INTERNAL_ERROR: "Something went wrong on the server. Please try again.",
};

export function isApiError(value: unknown): value is ApiErrorBody {
  return (
    typeof value === "object" &&
    value !== null &&
    "error" in value &&
    typeof (value as ApiErrorBody).error?.code === "string"
  );
}

export function errorText(value: unknown, fallback = "Something went wrong. Please try again."): string {
  if (!isApiError(value)) return translate(fallback);
  const { code, message } = value.error;
  if (code === "INTERNAL_ERROR" || code === "RATE_LIMITED" || !message) {
    return translate(fallbackTexts[code] ?? fallback);
  }
  return translate(message);
}
