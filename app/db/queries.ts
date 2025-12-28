import { queryOptions } from "@tanstack/react-query";
import type { Device } from "@/lib/hooks/use-date-and-device";
import { createClient } from "@/lib/supabase/client";
import type { Screenshot } from "@/lib/types/screenshot";

export const urlsQuery = queryOptions({
  queryKey: ["urls-with-lang"] as const,
  queryFn: async () => {
    const supabase = createClient();
    const { data, error } = await supabase.rpc("get_unique_urls_with_lang");

    if (error) throw error;

    return data as { url: string; language: string }[];
  },
});

export const screenshotDaysQuery = queryOptions({
  queryKey: ["screenshot-days"] as const,
  queryFn: async () => {
    const supabase = createClient();
    const { data, error } = await supabase.rpc("get_screenshot_days");

    if (error) {
      throw error;
    }
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
      const supabase = createClient();
      const startOfDay = `${date}T00:00:00.000Z`;
      const endOfDay = `${date}T23:59:59.999Z`;

      const { data, error } = await supabase
        .from("screenshots")
        .select("*")
        .gte("captured_at", startOfDay)
        .lte("captured_at", endOfDay)
        .eq("device", device)
        .in("url", urls)
        .order("captured_at", { ascending: false });

      if (error) throw error;
      return data as Screenshot[];
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
      const supabase = createClient();

      const start = new Date(date);
      start.setHours(0, 0, 0, 0);

      const end = new Date(date);
      end.setHours(23, 59, 59, 999);

      const { data, error } = await supabase
        .from("screenshots")
        .select("*")
        .eq("url", url)
        .eq("device", device)
        .gte("captured_at", start.toISOString())
        .lte("captured_at", end.toISOString())
        .order("captured_at", { ascending: false });

      if (error) throw error;
      return data as Screenshot[];
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
      const supabase = createClient();

      if (!date) {
        throw new Error("date is required");
      }

      const day = new Date(date);

      const startOfDay = new Date(day);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(day);
      endOfDay.setHours(23, 59, 59, 999);

      const { data, error } = await supabase
        .from("screenshots")
        .select("*")
        .eq("url", url)
        .eq("device", device)
        .gte("captured_at", startOfDay.toISOString())
        .lte("captured_at", endOfDay.toISOString())
        .order("captured_at", { ascending: false });

      if (error) throw error;
      return data as Screenshot[];
    },
  });

export const screenshotsForUrlQuery = (url: string) =>
  queryOptions({
    queryKey: ["screenshots-by-url", url] as const,
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("screenshots")
        .select("*")
        .eq("url", url)
        .order("captured_at", { ascending: false });

      if (error) throw error;
      return data as Screenshot[];
    },
    enabled: !!url,
  });
