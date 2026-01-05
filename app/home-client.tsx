"use client";

import { useQueries } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { Images } from "lucide-react";
import { useMemo, useState } from "react";
import { screenshotsForUrlAndDateQuery } from "@/app/db/queries";
import { LanguageMultiSelectCard } from "@/components/language-multi-select-card";
import { ScreenshotDayPicker } from "@/components/screenshot-day-picker";
import { UrlScreenshotStrip } from "@/components/screenshots/url-screenshot-strip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UrlMultiSelectCard } from "@/components/url-multi-select-card";
import { useDateAndDevice } from "@/lib/hooks/use-date-and-device";
import {
  type UrlWithLanguage,
  useUrlLanguageFilter,
} from "@/lib/hooks/use-url-language-filter";
import { groupScreenshotsByUrl } from "@/lib/screenshots/group";

export default function HomeClient({
  initialUrlsWithLang,
  initialDayStrings,
  urlsError,
  daysError,
}: {
  initialUrlsWithLang: UrlWithLanguage[];
  initialDayStrings: string[];
  urlsError?: string;
  daysError?: string;
}) {
  const { date, setDate, device } = useDateAndDevice();

  const [selectedUrls, setSelectedUrls] = useState<string[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);

  const parsedDate = date ? parseISO(date) : undefined;

  const availableDays = useMemo(
    () => initialDayStrings.map((d) => new Date(`${d}T00:00:00`)),
    [initialDayStrings],
  );

  const { languages, filteredUrls, filteredUrlsSet } = useUrlLanguageFilter({
    urlsWithLang: initialUrlsWithLang,
    selectedLanguages,
  });

  const activeSelectedUrls = useMemo(
    () => selectedUrls.filter((url) => filteredUrlsSet.has(url)),
    [selectedUrls, filteredUrlsSet],
  );

  const screenshotQueries = useQueries({
    queries: activeSelectedUrls.map((url) => ({
      ...screenshotsForUrlAndDateQuery(url, date, device),
      enabled: Boolean(date && device),
    })),
  });

  const anyScreenshotLoading = screenshotQueries.some((q) => q.isLoading);
  const screenshotErrors = screenshotQueries
    .map((q) => q.error)
    .filter(Boolean) as Error[];

  const screenshots = screenshotQueries.flatMap((query) => query.data ?? []);
  const groupedScreenshots = groupScreenshotsByUrl(screenshots);

  const handleCheckedChange = (url: string, checked: boolean) => {
    setSelectedUrls((prev) =>
      checked
        ? Array.from(new Set([url, ...prev]))
        : prev.filter((u) => u !== url),
    );
  };

  const handleLanguageCheckedChange = (language: string, checked: boolean) => {
    setSelectedLanguages((prev) =>
      checked
        ? [language, ...prev.filter((l) => l !== language)]
        : prev.filter((l) => l !== language),
    );
  };

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setDate(format(selectedDate, "yyyy-MM-dd"));
    }
  };

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[320px_1fr]">
      <aside className="space-y-4">
        {urlsError && (
          <p className="text-sm text-destructive">
            Failed to load URLs: {urlsError}
          </p>
        )}
        {daysError && (
          <p className="text-sm text-destructive">
            Failed to load available days: {daysError}
          </p>
        )}

        <ScreenshotDayPicker
          selected={parsedDate}
          onSelect={handleDateSelect}
          availableDays={availableDays}
        />

        <UrlMultiSelectCard
          urls={filteredUrls}
          selectedUrls={selectedUrls}
          onToggleUrl={handleCheckedChange}
        />

        <LanguageMultiSelectCard
          languages={languages}
          selectedLanguages={selectedLanguages}
          onToggleLanguage={handleLanguageCheckedChange}
          isLoading={false}
        />
      </aside>

      <section className="min-w-0" aria-label="Screenshots">
        <Card className="border-muted bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <Images className="h-5 w-5 text-primary" />
              Screenshots
            </CardTitle>
          </CardHeader>
          <CardContent>
            {screenshotErrors.length > 0 && (
              <p className="mb-4 text-sm text-destructive">
                Failed to load some screenshots.
              </p>
            )}
            {anyScreenshotLoading && (
              <p className="mb-4 text-sm text-muted-foreground">
                Loading screenshots…
              </p>
            )}

            {activeSelectedUrls.length > 0 ? (
              <div className="space-y-8">
                {activeSelectedUrls.map((url) => (
                  <UrlScreenshotStrip
                    key={url}
                    url={url}
                    screenshots={groupedScreenshots[url] || []}
                    device={device}
                    showSeparator={url !== activeSelectedUrls.at(-1)}
                  />
                ))}
              </div>
            ) : (
              <div className="grid h-96 w-full place-items-center text-center">
                <Images className="h-12 w-12 text-muted-foreground/40" />
                <p className="mt-3 text-muted-foreground">
                  Select a URL from the sidebar to view screenshots
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
