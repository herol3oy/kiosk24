"use client";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import Image from "next/image";
import type { ReactNode } from "react";
import { SiteFavicon } from "@/components/site-favicon";
import { DialogHeader } from "@/components/ui/dialog";

export function FullscreenScreenshotDialog({
  url,
  capturedAtLabel,
  imageUrl,
  children,
}: {
  url: string;
  capturedAtLabel: string;
  imageUrl: string;
  children: ReactNode;
}) {
  return (
    <Dialog>
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
                {capturedAtLabel}
              </span>
            </DialogTitle>

            <DialogClose className="rounded-full bg-white/10 p-2 hover:bg-white/20 text-white transition-colors">
              <X className="h-5 w-5" />
              <span className="sr-only">Close</span>
            </DialogClose>
          </DialogHeader>

          <div className="relative flex-1 w-full h-full min-h-0 flex items-center justify-center p-4">
            <Image
              src={imageUrl}
              alt={`Screenshot of ${url}`}
              fill
              className="object-contain"
              priority
              quality={100}
              placeholder="blur"
              blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mN89x8AAuEB74Y0o2cAAAAASUVORK5CYII="
            />
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
