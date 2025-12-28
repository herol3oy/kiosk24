import { createClient } from "@/lib/supabase/server";
import HomeClient from "./home-client";

type UrlWithLanguage = { url: string; language: string };

export default async function Home() {
  const supabase = await createClient();

  const [urlsResult, daysResult] = await Promise.all([
    supabase.rpc("get_unique_urls_with_lang"),
    supabase.rpc("get_screenshot_days"),
  ]);

  return (
    <HomeClient
      initialUrlsWithLang={(urlsResult.data ?? []) as UrlWithLanguage[]}
      initialDayStrings={(daysResult.data ?? []) as string[]}
      urlsError={urlsResult.error?.message}
      daysError={daysResult.error?.message}
    />
  );
}
