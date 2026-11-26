import { Suspense } from "react";
import { NotificationList } from "@/features/notifications";
import { PageSkeleton } from "@/shared/ui/page";

export default function Page() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <NotificationList />
    </Suspense>
  );
}
