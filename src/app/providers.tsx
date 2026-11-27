"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { loadSavedTheme } from "@/shared/lib/theme";
import { loadSavedLocale } from "@/shared/lib/i18n";


export const Providers = ({children}: { children: React.ReactNode })=>{
    const [queryClient]=useState(()=>new QueryClient())

    // Один раз в браузере: берём сохранённые тему и язык из localStorage
    useEffect(()=>{
        loadSavedTheme()
        loadSavedLocale()
    },[])

    return (
       <QueryClientProvider client={queryClient}>
            {children}
       </QueryClientProvider>

    )
}