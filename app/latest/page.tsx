import { createClient } from "@/lib/supabase/client";
import LatestClient from "./LatestClient";

export default async function LatestPage() {
  const supabase = createClient();

  const { data, error } = await supabase.rpc(
    "latest_screenshots_per_url_and_device",
  );

  if (error || !data) {
    console.error(error);
    return <p>Error loading screenshots</p>;
  }

  return <LatestClient screenshots={data} />;
}
