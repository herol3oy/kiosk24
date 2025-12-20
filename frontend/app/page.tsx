"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

type Screenshot = {
  id: number;
  url: string;
  captured_at: string;
  cloudinary_url: string | null;
  job_status: "ok" | "failed";
};

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function dateToRange(date: string) {
  const start = new Date(`${date}T00:00:00Z`);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  return { start: start.toISOString(), end: end.toISOString() };
}

function optimizedImage(url: string, width = 1440) {
  return url.replace(
    "/upload/",
    `/upload/f_auto,q_auto,w_${width}/`
  );
}


export default function Home() {
  const [date, setDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [screenshots, setScreenshots] = useState<Screenshot[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { start, end } = dateToRange(date);

      const { data } = await supabase
        .from("screenshots")
        .select("*")
        .eq("job_status", "ok")
        .gte("captured_at", start)
        .lt("captured_at", end)
        .order("url")
        .order("captured_at");

      if (data) setScreenshots(data);
      setLoading(false);
    }

    load();
  }, [date]);

  const grouped = screenshots.reduce<Record<string, Screenshot[]>>(
    (acc, s) => {
      acc[s.url] = acc[s.url] || [];
      acc[s.url].push(s);
      return acc;
    },
    {}
  );

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <h1 className="text-lg sm:text-xl font-semibold tracking-tight">
            Kiosk 24/7
          </h1>

          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full sm:w-auto border rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring"
          />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-10">
        {loading && (
          <p className="text-center text-sm text-slate-500">Loading…</p>
        )}

        {!loading && Object.keys(grouped).length === 0 && (
          <p className="text-center text-sm text-slate-500">
            No screenshots for this date.
          </p>
        )}

        {Object.entries(grouped).map(([url, shots]) => (
          <section
            key={url}
            className="bg-white rounded-xl shadow-sm border"
          >
            <div className="px-4 py-3 border-b flex items-center justify-between">
              <h2 className="font-medium text-slate-800">{url}</h2>
              <span className="text-xs text-slate-500">
                {shots.length} shots
              </span>
            </div>

            <div className="p-4 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {shots.map((shot) => (
                <a
                  key={shot.id}
                  href={shot.cloudinary_url ?? "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="group relative rounded-lg overflow-hidden bg-slate-100 aspect-video shadow hover:shadow-md transition"
                >
                  {shot.cloudinary_url && (
                    <img
                      src={optimizedImage(shot.cloudinary_url, 800)}
                      alt={`${url} at ${shot.captured_at}`}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.02] transition-transform"
                      loading="lazy"
                    />
                  )}

                  <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-0.5 rounded">
                    {formatTime(shot.captured_at)}
                  </div>
                </a>
              ))}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}
