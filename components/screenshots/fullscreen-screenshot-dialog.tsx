"use client";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from "@radix-ui/react-dialog";
import { ChevronLeft, ChevronRight, Images, X } from "lucide-react";
import Image from "next/image";
import * as React from "react";
import { SiteFavicon } from "@/components/site-favicon";
import { DialogHeader } from "@/components/ui/dialog";
import { withCdnCgiImage } from "@/lib/cdn-cgi-image";
import { formatDateTimeShort24 } from "@/lib/datetime/format";
import type { Screenshot } from "@/lib/types/screenshot";

export function FullscreenScreenshotDialog({
  url,
  screenshots,
  initialIndex,
  children,
}: {
  url: string;
  screenshots: Screenshot[];
  initialIndex: number;
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(initialIndex);

  const active = screenshots[activeIndex];
  const canPrev = activeIndex > 0;
  const canNext = activeIndex < screenshots.length - 1;

  const goPrev = React.useCallback(() => {
    setActiveIndex((i) => Math.max(0, i - 1));
  }, []);

  const goNext = React.useCallback(() => {
    setActiveIndex((i) => Math.min(screenshots.length - 1, i + 1));
  }, [screenshots.length]);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) setActiveIndex(initialIndex);
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogPortal>
        <DialogContent className="fixed inset-0 z-50 max-w-none w-screen h-screen p-0 border-none shadow-none bg-black/95 gap-0 flex flex-col focus:outline-none data-[state=open]:slide-in-from-bottom-0">
          <DialogHeader className="absolute top-0 left-0 right-0 z-50 p-4 bg-linear-to-b from-black/80 to-transparent flex flex-row items-start justify-between">
            <DialogTitle className="flex flex-col gap-1 text-left text-white">
              <span className="flex items-center gap-2 max-w-[80vw]">
                <SiteFavicon
                  url={url}
                  size={18}
                  className="h-4 w-4 rounded border border-muted bg-muted"
                />
                <span className="font-mono text-lg truncate">{url}</span>
              </span>
              <span className="text-sm font-normal text-white/70">
                {active
                  ? formatDateTimeShort24(active.captured_at)
                  : "Screenshot"}
              </span>
            </DialogTitle>

            <DialogClose className="rounded-full bg-white/10 p-2 hover:bg-white/20 text-white transition-colors">
              <X className="h-5 w-5" />
              <span className="sr-only">Close</span>
            </DialogClose>
          </DialogHeader>

          <div className="relative flex-1 w-full h-full min-h-0 flex items-center justify-center p-4">
            <button
              type="button"
              onClick={goPrev}
              disabled={!canPrev}
              aria-label="Previous screenshot"
              className="absolute left-4 top-1/2 -translate-y-1/2 z-50 rounded-full bg-black/10 p-3 text-white transition-colors hover:bg-white/20 disabled:opacity-40 disabled:pointer-events-none"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>

            <button
              type="button"
              onClick={goNext}
              disabled={!canNext}
              aria-label="Next screenshot"
              className="absolute right-4 top-1/2 -translate-y-1/2 z-50 rounded-full bg-black/10 p-3 text-white transition-colors hover:bg-white/20 disabled:opacity-40 disabled:pointer-events-none"
            >
              <ChevronRight className="h-6 w-6" />
            </button>

            {active?.job_status === "failed" || !active?.screenshot_url ? (
              <div className="grid place-items-center text-center">
                <Images className="h-12 w-12 text-white/30" />
                <p className="mt-3 text-base text-white/70">
                  Screenshot is not available
                </p>
              </div>
            ) : (
              <Image
                src={withCdnCgiImage(active.screenshot_url, {
                  width: 1920,
                  quality: 75,
                  format: "auto",
                })}
                alt={`Screenshot of ${url}`}
                fill
                className="object-contain"
                unoptimized
                placeholder="blur"
                blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mN89x8AAuEB74Y0o2cAAAAASUVORK5CYII="
              />
            )}
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
