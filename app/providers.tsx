"use client";
import { QueryClientProvider } from "@tanstack/react-query";
import type * as React from "react";
import { getQueryClient } from "@/app/get-query-client";
import { DateAndDeviceProvider } from "@/lib/hooks/use-date-and-device";

export default function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <DateAndDeviceProvider>{children}</DateAndDeviceProvider>
    </QueryClientProvider>
  );
}
