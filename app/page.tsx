import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient } from "@/app/get-query-client";
import { KioskClient } from "./KioskClient";
import { activeDatesOptions, screenshotsOptions } from "./queries";

export default async function Home() {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery(activeDatesOptions);

  const today = new Date();
  await queryClient.prefetchQuery(screenshotsOptions(today, "desktop"));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <KioskClient />
    </HydrationBoundary>
  );
}
