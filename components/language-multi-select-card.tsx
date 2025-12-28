"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";

export function LanguageMultiSelectCard({
  languages,
  selectedLanguages,
  onToggleLanguage,
  title = "Languages",
  isLoading = false,
}: {
  languages: string[];
  selectedLanguages: string[];
  onToggleLanguage: (language: string, checked: boolean) => void;
  title?: string;
  isLoading?: boolean;
}) {
  const displayNames = new Intl.DisplayNames(["en"], { type: "language" });

  const getLanguageLabel = (code: unknown) => {
    if (typeof code !== "string") return "";

    const trimmed = code.trim();
    if (!trimmed) return "";

    try {
      const canonical = Intl.getCanonicalLocales(trimmed)[0] ?? trimmed;
      return displayNames.of(canonical) ?? trimmed;
    } catch {
      return trimmed;
    }
  };

  const safeLanguages = languages
    .filter((lang) => typeof lang === "string")
    .map((lang) => lang.trim())
    .filter(Boolean);

  return (
    <Card className="border-muted bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-base">
          {title}
          <span className="ml-2 text-xs font-normal text-muted-foreground">
            ({languages.length})
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-48">
          <ul className="space-y-2 pr-4">
            {isLoading ? (
              <li className="text-xs text-muted-foreground text-center py-4">
                Loading languages…
              </li>
            ) : safeLanguages.length > 0 ? (
              safeLanguages.map((lang) => (
                <li
                  key={lang}
                  className="flex items-center gap-2 rounded-md p-2 transition-colors hover:bg-muted/50"
                >
                  <Checkbox
                    id={`lang-${lang}`}
                    checked={selectedLanguages.includes(lang)}
                    onCheckedChange={(checked) =>
                      onToggleLanguage(lang, checked as boolean)
                    }
                  />
                  <label
                    htmlFor={`lang-${lang}`}
                    className="flex-1 cursor-pointer truncate text-xs text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {getLanguageLabel(lang) || lang}
                  </label>
                </li>
              ))
            ) : (
              <li className="text-xs text-muted-foreground text-center py-4">
                No languages available
              </li>
            )}
          </ul>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
