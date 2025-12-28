import { useMemo } from "react";

export type UrlWithLanguage = {
  url: string;
  language: string;
};

export function useUrlLanguageFilter({
  urlsWithLang,
  selectedLanguages,
}: {
  urlsWithLang: UrlWithLanguage[];
  selectedLanguages: string[];
}) {
  return useMemo(() => {
    const languagesSet = new Set<string>();
    const allUrlsSet = new Set<string>();
    const selectedLanguagesSet = new Set<string>(selectedLanguages);
    const allowedUrlsSet = new Set<string>();

    for (const row of urlsWithLang) {
      if (row?.language) languagesSet.add(row.language);
      if (row?.url) allUrlsSet.add(row.url);

      if (selectedLanguagesSet.size > 0 && row?.url && row?.language) {
        if (selectedLanguagesSet.has(row.language)) {
          allowedUrlsSet.add(row.url);
        }
      }
    }

    const languages = Array.from(languagesSet).sort();
    const allUrls = Array.from(allUrlsSet).sort();
    const filteredUrls =
      selectedLanguagesSet.size === 0
        ? allUrls
        : allUrls.filter((url) => allowedUrlsSet.has(url));

    const filteredUrlsSet =
      selectedLanguagesSet.size === 0 ? allUrlsSet : allowedUrlsSet;

    return { languages, filteredUrls, filteredUrlsSet };
  }, [urlsWithLang, selectedLanguages]);
}
