import { useState } from "react";
import { useSearchParams } from "next/navigation";

export function useUrlSearch() {
  const urlQuery = useSearchParams().get("q") ?? "";
  const [search, setSearch] = useState(urlQuery);
  const [lastUrlQuery, setLastUrlQuery] = useState(urlQuery);

  if (urlQuery !== lastUrlQuery) {
    setLastUrlQuery(urlQuery);
    setSearch(urlQuery);
  }

  return [search, setSearch] as const;
}
