"use client";

import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, Images } from "lucide-react";
import Image from "next/image";
import * as React from "react";
import { FullscreenScreenshotDialog } from "@/components/screenshots/fullscreen-screenshot-dialog";
import { SiteFavicon } from "@/components/site-favicon";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { withCdnCgiImage } from "@/lib/cdn-cgi-image";
import { formatTime24 } from "@/lib/datetime/format";
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
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
  });
  const [canScrollPrev, setCanScrollPrev] = React.useState(false);
  const [canScrollNext, setCanScrollNext] = React.useState(false);

  React.useEffect(() => {
    if (!emblaApi) return;

    const api = emblaApi;

    function updateNavState() {
      setCanScrollPrev(api.canScrollPrev());
      setCanScrollNext(api.canScrollNext());
    }

    updateNavState();
    api.on("select", updateNavState);
    api.on("reInit", updateNavState);

    return () => {
      api.off("select", updateNavState);
      api.off("reInit", updateNavState);
    };
  }, [emblaApi]);

  React.useEffect(() => {
    if (!emblaApi) return;

    if (screenshots.length <= 1) {
      setCanScrollPrev(false);
      setCanScrollNext(false);
      return;
    }

    emblaApi.reInit();
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi, screenshots.length]);

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

          {screenshots.length > 1 ? (
            <div className="ml-auto flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => emblaApi?.scrollPrev()}
                disabled={!canScrollPrev}
                aria-label="Previous screenshot"
              >
                <ChevronLeft />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => emblaApi?.scrollNext()}
                disabled={!canScrollNext}
                aria-label="Next screenshot"
              >
                <ChevronRight />
              </Button>
            </div>
          ) : null}
        </header>

        {screenshots.length > 0 ? (
          <div className="w-full rounded-lg border border-muted bg-muted/20">
            <div ref={emblaRef} className="overflow-hidden">
              <div className="flex gap-4 p-4">
                {screenshots.map((screenshot) => (
                  <div key={screenshot.id} className="shrink-0">
                    {screenshot.job_status === "failed" ? (
                      <figure className="w-80 space-y-2">
                        <figcaption className="pl-1 text-xs text-muted-foreground">
                          {formatTime24(screenshot.captured_at)}
                        </figcaption>
                        <div className="grid h-40 w-80 place-items-center rounded-lg border border-dashed border-muted bg-muted/20 text-center">
                          <Images className="h-8 w-8 text-muted-foreground/40" />
                          <p className="mt-2 text-sm text-muted-foreground">
                            Screenshot is not available
                          </p>
                        </div>
                      </figure>
                    ) : screenshot.screenshot_url ? (
                      <figure className="w-80 space-y-2">
                        <figcaption className="pl-1 text-xs text-muted-foreground">
                          {formatTime24(screenshot.captured_at)}
                        </figcaption>
                        <FullscreenScreenshotDialog
                          url={screenshot.url}
                          screenshots={screenshots}
                          initialIndex={screenshots.findIndex(
                            (s) => s.id === screenshot.id,
                          )}
                        >
                          <div
                            className={`relative w-80 overflow-hidden rounded-lg border border-muted shadow-sm transition-shadow duration-200 hover:shadow-md group cursor-zoom-in ${
                              device === "mobile" ? "h-40" : ""
                            }`}
                          >
                            <Image
                              src={withCdnCgiImage(screenshot.screenshot_url, {
                                width: 800,
                                quality: 75,
                                format: "auto",
                              })}
                              alt={`Screenshot of ${screenshot.url}`}
                              width={800}
                              height={450}
                              className={
                                device === "mobile"
                                  ? "h-full w-full object-contain transition-transform duration-200 group-hover:scale-105"
                                  : "h-auto w-full transition-transform duration-200 group-hover:scale-105"
                              }
                              unoptimized
                              placeholder="blur"
                              blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mN89x8AAuEB74Y0o2cAAAAASUVORK5CYII="
                            />
                          </div>
                        </FullscreenScreenshotDialog>
                      </figure>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          </div>
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
