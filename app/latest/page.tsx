"use client";

import { useQuery } from "@tanstack/react-query";
import { Clock, ExternalLink, Images } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FullscreenScreenshotDialog } from "@/components/screenshots/fullscreen-screenshot-dialog";
import { SiteFavicon } from "@/components/site-favicon";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { withCdnCgiImage } from "@/lib/cdn-cgi-image";
import { formatDateTimeShort24, formatTime24 } from "@/lib/datetime/format";
import { useDateAndDevice } from "@/lib/hooks/use-date-and-device";
import type { Screenshot } from "@/lib/types/screenshot";
import { latestScreenshotsPerUrlAndDeviceQuery } from "../db/queries";

export default function LatestPage() {
  const { device } = useDateAndDevice();

  const [today, setToday] = useState<Date | null>(null);

  useEffect(() => {
    setToday(new Date());
  }, []);

  const todayLabel = today
    ? new Intl.DateTimeFormat(undefined, {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "2-digit",
      }).format(today)
    : "";

  const latestScreenshotsQuery = useQuery(
    latestScreenshotsPerUrlAndDeviceQuery,
  );

  const filtered: Screenshot[] = (latestScreenshotsQuery.data ?? []).filter(
    (s: Screenshot) => s.device === device,
  );

  const isDesktop = device === "desktop";

  return (
    <div className="min-w-0">
      <header className="mb-4 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-lg font-semibold">Latest screenshots</h1>
          <p className="text-sm text-muted-foreground">
            Click a screenshot to open it full-screen.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="shrink-0">
            {todayLabel ? `Today: ${todayLabel}` : "Today"}
          </Badge>
          <Badge variant="secondary" className="shrink-0 tabular-nums">
            {filtered.length} total
          </Badge>
        </div>
      </header>

      <section aria-label="Latest screenshots">
        <Card className="border-muted bg-card/50 backdrop-blur-sm">
          <CardContent className="p-0">
            <div className="relative h-[70vh] bg-muted/20">
              {filtered.length === 0 ? (
                <div className="grid h-full place-items-center p-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    No screenshots available for {device}.
                  </p>
                </div>
              ) : (
                <div
                  className={`grid gap-6 overflow-auto px-6 py-6 ${
                    isDesktop
                      ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
                      : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4"
                  }`}
                >
                  {filtered.map((screenshot, index) => (
                    <div
                      key={screenshot.id}
                      className="overflow-hidden rounded-2xl border border-muted bg-muted/10 shadow-sm"
                    >
                      {screenshot.job_status === "failed" ||
                      !screenshot.screenshot_url ? (
                        <div
                          className={`grid place-items-center text-center ${
                            isDesktop ? "aspect-video" : "aspect-9/16"
                          }`}
                        >
                          <Images className="h-10 w-10 text-muted-foreground/40" />
                          <p className="mt-2 px-4 text-sm text-muted-foreground">
                            Screenshot is not available
                          </p>
                        </div>
                      ) : (
                        <FullscreenScreenshotDialog
                          url={screenshot.url}
                          screenshots={[screenshot]}
                          initialIndex={0}
                        >
                          <button
                            type="button"
                            className={`group relative block w-full cursor-zoom-in overflow-hidden ${
                              isDesktop ? "aspect-video" : "aspect-9/16"
                            }`}
                            aria-label={`Open screenshot for ${screenshot.url}`}
                          >
                            <Image
                              src={withCdnCgiImage(screenshot.screenshot_url, {
                                width: 1200,
                                quality: 75,
                                format: "auto",
                              })}
                              alt={`${device} screenshot ${screenshot.id}`}
                              fill
                              className="object-cover transition-transform duration-200 group-hover:scale-[1.02]"
                              sizes={
                                isDesktop
                                  ? "(max-width: 1280px) 50vw, 33vw"
                                  : "(max-width: 768px) 33vw, 25vw"
                              }
                              priority={index < 2}
                              unoptimized
                              placeholder="blur"
                              blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mN89x8AAuEB74Y0o2cAAAAASUVORK5CYII="
                            />
                          </button>
                        </FullscreenScreenshotDialog>
                      )}

                      <div className="flex items-start justify-between gap-2 border-t border-muted/60 p-3">
                        <Badge
                          asChild
                          variant="outline"
                          className="min-w-0 bg-muted/20 hover:bg-muted/35"
                        >
                          <Link
                            href={`https://${screenshot.url}`}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="flex min-w-0 max-w-full items-center gap-1 truncate px-2.5 py-1 text-[11px] font-semibold"
                            title={screenshot.url}
                          >
                            <SiteFavicon
                              url={screenshot.url}
                              size={14}
                              className="shrink-0 rounded-sm"
                              hideOnError
                            />
                            <span className="truncate">{screenshot.url}</span>
                            <ExternalLink className="h-3 w-3 shrink-0 opacity-70" />
                          </Link>
                        </Badge>

                        <Badge
                          variant="secondary"
                          className="shrink-0 px-2.5 py-1 text-[11px] font-semibold tabular-nums"
                          title={formatDateTimeShort24(screenshot.captured_at)}
                        >
                          <Clock className="h-3 w-3 opacity-70" />
                          {formatTime24(screenshot.captured_at)}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
