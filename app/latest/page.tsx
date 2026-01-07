"use client";

import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { withCdnCgiImage } from "@/lib/cdn-cgi-image";
import { formatDateTimeShort24, formatTime24 } from "@/lib/datetime/format";
import { useDateAndDevice } from "@/lib/hooks/use-date-and-device";
import type { Screenshot } from "@/lib/types/screenshot";
import { latestScreenshotsPerUrlAndDeviceQuery } from "../db/queries";

export default function LatestPage() {
  const { device } = useDateAndDevice();

  const latestScreenshotsQuery = useQuery(
    latestScreenshotsPerUrlAndDeviceQuery,
  );

  const filtered: Screenshot[] = (latestScreenshotsQuery.data ?? []).filter(
    (s: Screenshot) => s.device === device,
  );

  const isDesktop = device === "desktop";

  return (
    <div className="min-w-0">
      <section className="" aria-label="Latest screenshots">
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
                      className={`relative overflow-hidden rounded-2xl border border-muted bg-muted/10 shadow-sm ${
                        isDesktop ? "aspect-video" : "aspect-9/16"
                      }`}
                    >
                      <Image
                        src={
                          screenshot.screenshot_url
                            ? withCdnCgiImage(screenshot.screenshot_url, {
                                width: 1200,
                                quality: 75,
                                format: "auto",
                              })
                            : ""
                        }
                        alt={`${device} screenshot ${screenshot.id}`}
                        fill
                        className="object-cover"
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

                      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-linear-to-t from-background/90 to-transparent" />
                      <div className="absolute inset-x-0 bottom-0 p-3">
                        <div className="min-w-0">
                          <p
                            className="truncate text-xs font-medium"
                            title={screenshot.url}
                          >
                            {screenshot.url}
                          </p>
                          <p
                            className="text-xs text-muted-foreground"
                            title={formatDateTimeShort24(
                              screenshot.captured_at,
                            )}
                          >
                            {formatTime24(screenshot.captured_at)}
                          </p>
                        </div>
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
