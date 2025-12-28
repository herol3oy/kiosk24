"use client";

import { Images } from "lucide-react";
import Image from "next/image";
import { FullscreenScreenshotDialog } from "@/components/screenshots/fullscreen-screenshot-dialog";
import { SiteFavicon } from "@/components/site-favicon";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { formatDateTimeShort24, formatTime24 } from "@/lib/datetime/format";
import type { Device } from "@/lib/hooks/use-date-and-device";
import type { Screenshot } from "@/lib/types/screenshot";

export function UrlScreenshotStrip({
  url,
  screenshots,
  device,
  showSeparator,
}: {
  url: string;
  screenshots: Screenshot[];
  device: Device;
  showSeparator?: boolean;
}) {
  const okCount = screenshots.filter((s) => s.job_status === "ok").length;
  const failedCount = screenshots.length - okCount;

  return (
    <>
      <section className="space-y-4" aria-label={url}>
        <header className="flex items-center gap-3 pb-2">
          <div className="h-8 w-1 rounded-full bg-primary" />
          <SiteFavicon
            url={url}
            size={20}
            className="h-4 w-4 rounded border border-muted bg-muted"
          />
          <div>
            <p className="text-sm font-semibold">{url}</p>
            <p className="text-xs text-muted-foreground">
              <span className="text-emerald-500">Available {okCount}</span>
              <span className="mx-1 text-muted-foreground/60">•</span>
              <span className="text-rose-500">Failed {failedCount}</span>
            </p>
          </div>
        </header>

        {screenshots.length > 0 ? (
          <ScrollArea className="w-full rounded-lg border border-muted bg-muted/20">
            <div className="flex space-x-4 p-4 flex-nowrap">
              {screenshots.map((screenshot) => (
                <figure key={screenshot.id} className="shrink-0 space-y-2">
                  <figcaption className="pl-1 text-xs text-muted-foreground">
                    {formatTime24(screenshot.captured_at)}
                  </figcaption>

                  {screenshot.job_status === "failed" ? (
                    <div className="grid h-40 w-80 place-items-center rounded-lg border border-dashed border-muted bg-muted/20 text-center">
                      <Images className="h-8 w-8 text-muted-foreground/40" />
                      <p className="mt-2 text-sm text-muted-foreground">
                        Screenshot is not available
                      </p>
                    </div>
                  ) : screenshot.cloudinary_url ? (
                    <FullscreenScreenshotDialog
                      url={screenshot.url}
                      capturedAtLabel={formatDateTimeShort24(
                        screenshot.captured_at,
                      )}
                      imageUrl={screenshot.cloudinary_url}
                    >
                      <div
                        className={`relative rounded-lg overflow-hidden border border-muted shadow-sm hover:shadow-md transition-shadow duration-200 w-80 group cursor-zoom-in ${
                          device === "mobile" ? "h-40" : ""
                        }`}
                      >
                        <Image
                          src={screenshot.cloudinary_url}
                          alt={`Screenshot of ${screenshot.url}`}
                          width={800}
                          height={450}
                          className={
                            device === "mobile"
                              ? "w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
                              : "w-full h-auto group-hover:scale-105 transition-transform duration-200"
                          }
                          placeholder="blur"
                          blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mN89x8AAuEB74Y0o2cAAAAASUVORK5CYII="
                        />
                      </div>
                    </FullscreenScreenshotDialog>
                  ) : null}
                </figure>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        ) : (
          <div className="grid h-40 w-full place-items-center rounded-lg border border-dashed border-muted bg-muted/20 text-center">
            <Images className="h-8 w-8 text-muted-foreground/40" />
            <p className="mt-2 text-sm text-muted-foreground">
              No screenshots available
            </p>
          </div>
        )}
      </section>

      {showSeparator ? <Separator className="my-4" /> : null}
    </>
  );
}
