"use client";

import { useQuery } from "@tanstack/react-query";
import { Maximize2 } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";
import {
  ReactCompareSlider,
  ReactCompareSliderImage,
} from "react-compare-slider";
import { ScreenshotPickerCard } from "@/components/compare/screenshot-picker-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  applyDateChange,
  applyShotChange,
  applyUrlChange,
  type CompareSelection,
  emptySelection,
} from "@/lib/compare/selection";
import { useDateAndDevice } from "@/lib/hooks/use-date-and-device";
import type { Screenshot } from "@/lib/types/screenshot";
import {
  screenshotDaysQuery,
  screenshotsForUrlAndDateQuery,
} from "../db/queries";

export default function ComparePage() {
  const { device } = useDateAndDevice();

  const [left, setLeft] = useState<CompareSelection>(emptySelection);
  const [right, setRight] = useState<CompareSelection>(emptySelection);

  const daysQuery = useQuery(screenshotDaysQuery);
  const availableDays = daysQuery.data ?? [];

  const shots1Query = useQuery({
    ...screenshotsForUrlAndDateQuery(left.url, left.date, device),
    enabled: Boolean(left.url && left.date && device),
    placeholderData: [] as Screenshot[],
  });

  const shots2Query = useQuery({
    ...screenshotsForUrlAndDateQuery(right.url, right.date, device),
    enabled: Boolean(right.url && right.date && device),
    placeholderData: [] as Screenshot[],
  });

  const shots1Enabled = Boolean(left.url && left.date && device);
  const shots2Enabled = Boolean(right.url && right.date && device);

  const daysErrorMessage =
    daysQuery.isError && daysQuery.error
      ? daysQuery.error instanceof Error
        ? daysQuery.error.message
        : "Unknown error"
      : null;

  const shots1ErrorMessage =
    shots1Query.isError && shots1Query.error
      ? shots1Query.error instanceof Error
        ? shots1Query.error.message
        : "Unknown error"
      : null;

  const shots2ErrorMessage =
    shots2Query.isError && shots2Query.error
      ? shots2Query.error instanceof Error
        ? shots2Query.error.message
        : "Unknown error"
      : null;

  const shots1: Screenshot[] = shots1Query.data ?? [];
  const shots2: Screenshot[] = shots2Query.data ?? [];

  const shot1 = useMemo(
    () => shots1.find((s) => s.id === left.shotId),
    [shots1, left.shotId],
  );
  const shot2 = useMemo(
    () => shots2.find((s) => s.id === right.shotId),
    [shots2, right.shotId],
  );

  const isMobileMode = device === "mobile";

  const shot1Url = shot1?.screenshot_url || null;
  const shot2Url = shot2?.screenshot_url || null;

  const hasFailure =
    shot1?.job_status === "failed" || shot2?.job_status === "failed";
  const failureMessage = hasFailure
    ? shot1?.job_status === "failed" && shot2?.job_status === "failed"
      ? "Both screenshots failed to generate."
      : shot1?.job_status === "failed"
        ? "The first screenshot failed to generate."
        : "The second screenshot failed to generate."
    : "";

  const hasBothImages = Boolean(shot1Url && shot2Url);
  const singleImageUrl = shot1Url || shot2Url;
  const needsSecondSelection = Boolean(singleImageUrl && !hasBothImages);

  const view: "error" | "compare" | "single" | "empty" = hasFailure
    ? "error"
    : hasBothImages
      ? "compare"
      : singleImageUrl
        ? "single"
        : "empty";

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[320px_1fr]">
      <aside className="space-y-6" aria-label="Compare selection">
        {daysQuery.isLoading ? (
          <p className="text-sm text-muted-foreground">
            Loading available days…
          </p>
        ) : daysErrorMessage ? (
          <p className="text-sm text-red-500">
            Failed to load available days: {daysErrorMessage}
          </p>
        ) : null}

        <div className="space-y-4">
          <div className="space-y-2">
            <ScreenshotPickerCard
              title="First Screenshot"
              url={left.url}
              onUrlChange={(v) => setLeft(applyUrlChange(v))}
              date={left.date}
              onDateChange={(v) => setLeft((prev) => applyDateChange(prev, v))}
              availableDays={availableDays}
              screenshots={shots1}
              selectedId={left.shotId}
              onSelect={(id) => setLeft((prev) => applyShotChange(prev, id))}
            />
            {shots1Enabled && shots1Query.isFetching ? (
              <p className="text-sm text-muted-foreground">
                Loading screenshots…
              </p>
            ) : shots1Enabled && shots1ErrorMessage ? (
              <p className="text-sm text-red-500">
                Failed to load screenshots: {shots1ErrorMessage}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <ScreenshotPickerCard
              title="Second Screenshot"
              url={right.url}
              onUrlChange={(v) => setRight(applyUrlChange(v))}
              date={right.date}
              onDateChange={(v) => setRight((prev) => applyDateChange(prev, v))}
              availableDays={availableDays}
              screenshots={shots2}
              selectedId={right.shotId}
              onSelect={(id) => setRight((prev) => applyShotChange(prev, id))}
            />
            {shots2Enabled && shots2Query.isFetching ? (
              <p className="text-sm text-muted-foreground">
                Loading screenshots…
              </p>
            ) : shots2Enabled && shots2ErrorMessage ? (
              <p className="text-sm text-red-500">
                Failed to load screenshots: {shots2ErrorMessage}
              </p>
            ) : null}
          </div>
        </div>
      </aside>

      <section className="min-w-0" aria-label="Comparison result">
        {(() => {
          switch (view) {
            case "error":
              return (
                <Card className="border-muted bg-card/50 backdrop-blur-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-center text-red-500">
                      Unable to Compare
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-center text-muted-foreground">
                      {failureMessage}
                    </p>
                  </CardContent>
                </Card>
              );
            case "compare":
              if (!shot1Url || !shot2Url) return null;
              return (
                <Card className="overflow-hidden border-muted bg-card/50 backdrop-blur-sm">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Maximize2 className="h-4 w-4 text-primary" />
                        Comparison
                      </CardTitle>
                      <p className="text-xs text-muted-foreground">
                        Drag the slider to compare
                      </p>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div
                      className={`overflow-hidden rounded-lg bg-muted/20 ${
                        isMobileMode ? "h-[70vh]" : ""
                      }`}
                    >
                      <ReactCompareSlider
                        style={{ height: isMobileMode ? "70vh" : undefined }}
                        itemOne={
                          <ReactCompareSliderImage
                            src={shot1Url}
                            style={{ height: "100%", objectFit: "contain" }}
                          />
                        }
                        itemTwo={
                          <ReactCompareSliderImage
                            src={shot2Url}
                            style={{ height: "100%", objectFit: "contain" }}
                          />
                        }
                      />
                    </div>
                  </CardContent>
                </Card>
              );
            case "single":
              if (!singleImageUrl) return null;
              return (
                <Card className="overflow-hidden border-muted bg-card/50 backdrop-blur-sm">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Maximize2 className="h-4 w-4 text-primary" />
                        Comparison
                      </CardTitle>
                      {needsSecondSelection ? (
                        <p className="text-xs text-muted-foreground">
                          Select the other screenshot to compare
                        </p>
                      ) : null}
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-hidden rounded-lg bg-muted/20">
                      <div
                        className={`relative w-full ${
                          isMobileMode ? "h-[70vh]" : "min-h-80"
                        }`}
                      >
                        <Image
                          src={singleImageUrl}
                          alt="Selected screenshot"
                          fill
                          sizes="100vw"
                          className="object-contain"
                          priority
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            default:
              return (
                <Card className="overflow-hidden border-muted bg-card/50 backdrop-blur-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2">
                      <Maximize2 className="h-4 w-4 text-primary" />
                      Comparison
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-hidden rounded-lg bg-muted/20">
                      <div className="grid min-h-80 w-full place-items-center p-6">
                        <div className="w-full max-w-md rounded-lg border border-dashed border-muted-foreground/40 bg-background/40 p-6 text-center">
                          <p className="text-sm font-medium">
                            Nothing to compare yet
                          </p>
                          <p className="mt-2 text-sm text-muted-foreground">
                            Select URL, date, and time for at least one
                            screenshot.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
          }
        })()}
      </section>
    </div>
  );
}
