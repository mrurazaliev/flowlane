import { LayoutGrid } from "lucide-react";
import { cn } from "@/shared/lib/utils";

export function Logo({ withText = true, className }: { withText?: boolean; className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="flex size-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
        <LayoutGrid className="size-4" />
      </span>
      {withText && <span className="text-lg font-semibold text-gray-900">Flowlane</span>}
    </div>
  );
}
