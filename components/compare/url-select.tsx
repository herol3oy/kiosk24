"use client";

import { useQuery } from "@tanstack/react-query";
import { urlsQuery } from "@/app/db/queries";
import { SiteFavicon } from "@/components/site-favicon";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function UrlSelect({
  value,
  onValueChange,
  id,
}: {
  value: string;
  onValueChange: (value: string) => void;
  id?: string;
}) {
  const { data: urlsWithLang = [], isLoading } = useQuery(urlsQuery);

  const unique = new Set<string>();
  for (const row of urlsWithLang) {
    if (row?.url) unique.add(row.url);
  }
  const urls = Array.from(unique).sort();

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger id={id} disabled={isLoading}>
        <SelectValue placeholder="Choose a URL" />
      </SelectTrigger>
      <SelectContent>
        {isLoading ? (
          <SelectItem value="loading" disabled>
            Loading URLs…
          </SelectItem>
        ) : urls.length > 0 ? (
          urls.map((url: string) => (
            <SelectItem key={url} value={url}>
              <div className="flex items-center gap-2">
                <SiteFavicon
                  url={url}
                  size={16}
                  className="h-4 w-4 rounded"
                  hideOnError
                />
                {url || "(Empty URL)"}
              </div>
            </SelectItem>
          ))
        ) : (
          <SelectItem value="no-urls" disabled>
            No URLs available
          </SelectItem>
        )}
      </SelectContent>
    </Select>
  );
}
