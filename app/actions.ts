"use server";

import type { Device } from "@/lib/hooks/use-date-and-device";

import { createClient } from "@/lib/supabase/server";
import type { Screenshot } from "@/lib/types/screenshot";

export async function getUniqueUrlsWithLang() {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_unique_urls_with_lang");

  if (error) throw error;
  return (data ?? []) as { url: string; language: string }[];
}

export async function getScreenshotDays() {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_screenshot_days");

  if (error) throw error;
  return (data ?? []) as string[];
}

export async function getScreenshotsForDateDeviceUrls(
  date: string,
  device: string,
  urls: string[],
) {
  if (!date) throw new Error("date is required");
  if (!device) throw new Error("device is required");
  if (urls.length === 0) return [] as Screenshot[];

  const supabase = await createClient();
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
  return (data ?? []) as Screenshot[];
}

export async function getScreenshotsForUrlDateDevice(
  url: string,
  dateIso: string,
  device: Device,
) {
  if (!url) throw new Error("url is required");
  if (!dateIso) throw new Error("date is required");

  const supabase = await createClient();

  const day = new Date(dateIso);
  const start = new Date(day);
  start.setHours(0, 0, 0, 0);

  const end = new Date(day);
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
  return (data ?? []) as Screenshot[];
}

export async function getScreenshotsForUrlAndDate(
  url: string,
  date: string,
  device: Device,
) {
  if (!url) throw new Error("url is required");
  if (!date) throw new Error("date is required");

  const supabase = await createClient();

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
  return (data ?? []) as Screenshot[];
}

export async function getScreenshotsForUrl(url: string) {
  if (!url) throw new Error("url is required");

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("screenshots")
    .select("*")
    .eq("url", url)
    .order("captured_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as Screenshot[];
}

export async function getLatestScreenshotsPerUrlAndDevice() {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc(
    "latest_screenshots_per_url_and_device",
  );

  if (error) throw error;
  return (data ?? []) as Screenshot[];
}
