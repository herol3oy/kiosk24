import { createClient } from "@supabase/supabase-js";
import { queryOptions } from "@tanstack/react-query";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "",
);

export type Screenshot = {
  id: number;
  url: string;
  captured_at: string;
  cloudinary_url: string | null;
  job_status: "ok" | "failed";
  device: "desktop" | "mobile";
};

export const activeDatesOptions = queryOptions({
  queryKey: ["activeDates"],
  queryFn: async (): Promise<string[]> => {
    const { data, error } = await supabase.rpc<string>("get_screenshot_days");

    if (error) throw error;
    if (!data) return [];

    return data;
  },
});

export const screenshotsOptions = (date: Date, deviceMode: string) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const startIso = start.toISOString();

  return queryOptions({
    queryKey: ["screenshots", startIso, deviceMode],
    queryFn: async () => {
      const end = new Date(start);
      end.setDate(end.getDate() + 1);

      const { data, error } = await supabase
        .from("screenshots")
        .select("*")
        .eq("job_status", "ok")
        .eq("device", deviceMode)
        .gte("captured_at", start.toISOString())
        .lt("captured_at", end.toISOString())
        .order("url")
        .order("captured_at");

      if (error) throw error;
      return data as Screenshot[];
    },
  });
};
