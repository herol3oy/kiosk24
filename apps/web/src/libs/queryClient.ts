import { QueryClient } from "@tanstack/preact-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 10, 
      gcTime: 1000 * 60 * 60,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});