import { queryOptions } from "@tanstack/react-query";
import {
  getScreenshotDays,
  getScreenshotsForDateDeviceUrls,
  getScreenshotsForUrl,
  getScreenshotsForUrlAndDate,
  getScreenshotsForUrlDateDevice,
  getUniqueUrlsWithLang,
} from "@/app/actions";
import type { Device } from "@/lib/hooks/use-date-and-device";

export const urlsQuery = queryOptions({
  queryKey: ["urls-with-lang"] as const,
  queryFn: async () => {
    return await getUniqueUrlsWithLang();
  },
});

export const screenshotDaysQuery = queryOptions({
  queryKey: ["screenshot-days"] as const,
  queryFn: async () => {
    const data = await getScreenshotDays();
    return (data || []).map(
      (dateString: string) => new Date(`${dateString}T00:00:00`),
    );
  },
});

export const screenshotsQuery = (
  date: string,
  device: string,
  urls: string[],
) =>
  queryOptions({
    queryKey: ["screenshots", { date, device, urls }] as const,
    queryFn: async () => {
      return await getScreenshotsForDateDeviceUrls(date, device, urls);
    },
    enabled: urls.length > 0,
  });

export const screenshotsForUrlDateDeviceQuery = (
  url: string,
  date: Date,
  device: Device,
) =>
  queryOptions({
    queryKey: ["screenshots", url, date.toDateString(), device] as const,
    enabled: Boolean(url),
    queryFn: async () => {
      return await getScreenshotsForUrlDateDevice(
        url,
        date.toISOString(),
        device,
      );
    },
  });

export const screenshotsForUrlAndDateQuery = (
  url: string,
  date: string | null,
  device: Device,
) =>
  queryOptions({
    queryKey: ["screenshots", url, date, device] as const,
    enabled: !!url && !!date,
    queryFn: async () => {
      if (!date) {
        throw new Error("date is required");
      }

      return await getScreenshotsForUrlAndDate(url, date, device);
    },
  });

export const screenshotsForUrlQuery = (url: string) =>
  queryOptions({
    queryKey: ["screenshots-by-url", url] as const,
    queryFn: async () => {
      return await getScreenshotsForUrl(url);
    },
    enabled: !!url,
  });
