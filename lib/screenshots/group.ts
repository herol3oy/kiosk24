import type { Screenshot } from "@/lib/types/screenshot";

export function groupScreenshotsByUrl(screenshots: Screenshot[]) {
  return screenshots.reduce(
    (acc, screenshot) => {
      if (!acc[screenshot.url]) {
        acc[screenshot.url] = [];
      }
      acc[screenshot.url].push(screenshot);
      return acc;
    },
    {} as Record<string, Screenshot[]>,
  );
}
