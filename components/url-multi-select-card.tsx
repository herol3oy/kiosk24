"use client";

import { Images, X } from "lucide-react";
import { useState } from "react";
import { SiteFavicon } from "@/components/site-favicon";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

export function UrlMultiSelectCard({
  urls,
  selectedUrls,
  onToggleUrl,
  title = "URLs",
}: {
  urls: string[];
  selectedUrls: string[];
  onToggleUrl: (url: string, checked: boolean) => void;
  title?: string;
}) {
  const [urlSearch, setUrlSearch] = useState("");

  const normalizedSearch = urlSearch.trim().toLowerCase();
  const filteredUrls = normalizedSearch
    ? urls.filter((url) => url.toLowerCase().includes(normalizedSearch))
    : urls;

  return (
    <Card className="border-muted bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <Images className="h-4 w-4 text-primary" />
          <span>
            {title}
            <span className="ml-2 text-xs font-normal text-muted-foreground">
              ({urls.length})
            </span>
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative mb-4">
          <Input
            value={urlSearch}
            onChange={(e) => setUrlSearch(e.target.value)}
            placeholder="Search URLs"
            aria-label="Search URLs"
            className="pr-9"
          />
          {urlSearch.length > 0 && (
            <button
              type="button"
              onClick={() => setUrlSearch("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-sm p-1 text-muted-foreground hover:text-foreground"
              aria-label="Clear URL search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <ScrollArea className="h-96">
          <ul className="space-y-2 pr-4">
            {filteredUrls.length > 0 ? (
              filteredUrls.map((url) => (
                <li
                  key={url}
                  className="flex items-center gap-2 p-2 rounded-md hover:bg-muted/50 transition-colors"
                >
                  <Checkbox
                    id={url}
                    checked={selectedUrls.includes(url)}
                    onCheckedChange={(checked) =>
                      onToggleUrl(url, checked as boolean)
                    }
                  />
                  <SiteFavicon
                    url={url}
                    size={16}
                    className="h-4 w-4 rounded border border-muted bg-muted"
                  />
                  <label
                    htmlFor={url}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors truncate cursor-pointer flex-1"
                  >
                    {url}
                  </label>
                </li>
              ))
            ) : (
              <li className="text-xs text-muted-foreground text-center py-4">
                No URLs available
              </li>
            )}
          </ul>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
