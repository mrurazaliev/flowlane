// Dev 1. Позже: useQuery({ queryKey: queryKeys.me, queryFn: () => GET /auth/me })
import { currentUser } from "@/shared/api/mocks";

export function useMe() {
  return { data: currentUser, isLoading: false as const, error: null };
}
