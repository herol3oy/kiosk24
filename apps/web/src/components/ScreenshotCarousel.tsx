import { useCallback, useEffect, useState } from "preact/hooks";
import useEmblaCarousel from "embla-carousel-react";
import type { EmblaCarouselType } from "embla-carousel";
import type { ScreenshotEntry } from "../../../../libs/shared/src/types";
import { useQuery } from '@tanstack/preact-query';

interface Props {
  url: string;
  date: string;
  device: string;
  cdn: string;
}

export default function ScreenshotCarousel({ url, date, device, cdn }: Props) {
  const { data: group = [], isLoading, isError } = useQuery({
    queryKey: ['screenshots', url, date, device],
    queryFn: async () => {
      const res = await fetch(`/api/screenshots?url=${encodeURIComponent(url)}&date=${date}&device=${device}`);
      if (!res.ok) throw new Error('Network response was not ok');
      return res.json() as Promise<ScreenshotEntry[]>;
    }
  });

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
  });

  const [prevDisabled, setPrevDisabled] = useState(true);
  const [nextDisabled, setNextDisabled] = useState(true);

  const onSelect = useCallback((api: EmblaCarouselType) => {
    setPrevDisabled(!api.canScrollPrev());
    setNextDisabled(!api.canScrollNext());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect(emblaApi);
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  const slideWidth = device === "desktop" ? "w-72" : "w-40";
  const aspectRatio = device === "desktop" ? "aspect-[16/10]" : "aspect-[9/16]";

  if (isLoading) {
    return (
      <div className="flex gap-4 overflow-hidden py-2">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={`flex-none animate-pulse bg-gray-100 rounded-xl border border-gray-100 ${slideWidth} ${aspectRatio}`}
          />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 text-sm text-red-700 bg-red-50 rounded-lg border border-red-100 inline-block">
        Failed to load screenshots.
      </div>
    );
  }

  if (group.length === 0) {
    return (
      <div className="p-4 text-sm text-gray-500 bg-gray-50 rounded-lg border border-gray-100 inline-block">
        No snapshots found for this URL.
      </div>
    );
  }

  return (
    <section
      className="w-full py-2"
      aria-roledescription="carousel"
      aria-label="Screenshots"
    >
      <div className="overflow-hidden w-full" ref={emblaRef}>
        <div className="flex">
          {group.map((item, i) => {
            const dateFormatted = new Date(item.created_at).toLocaleString([], {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div
                key={item.id || i}
                className={`flex-[0_0_auto] pr-4 ${slideWidth}`}
                role="group"
                aria-roledescription="slide"
              >
                <article className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow flex flex-col group">

                  {item.job_status === "ok" ? (
                    <a
                      href={`${cdn}/${item.r2_key}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`relative bg-gray-50 block overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-500 ${aspectRatio}`}
                      aria-label={`View full screenshot from ${dateFormatted}`}
                    >
                      <img
                        src={`${cdn}/${item.r2_key}`}
                        loading="lazy"
                        decoding="async"
                        className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                        alt={`Screenshot taken on ${dateFormatted}`}
                      />
                    </a>
                  ) : (
                    <div className={`relative bg-red-50 flex flex-col items-center justify-center text-red-400 border-b border-red-100 ${aspectRatio}`}>
                      <span className="text-xl mb-1" aria-hidden="true">⚠️</span>
                      <span className="text-[10px] font-semibold uppercase tracking-wide">
                        Failed
                      </span>
                    </div>
                  )}

                  <div className="px-3 py-2 bg-white flex justify-between items-center text-[10px] text-gray-500 font-mono">
                    <time dateTime={item.created_at}>
                      {dateFormatted}
                    </time>
                  </div>
                </article>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        <button
          onClick={() => emblaApi?.scrollPrev()}
          disabled={prevDisabled}
          aria-label="Previous slide"
          className="p-2 text-gray-600 bg-white border border-gray-200 rounded-full shadow-sm hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all disabled:opacity-40 disabled:pointer-events-none"
        >
          ⇽
        </button>

        <button
          onClick={() => emblaApi?.scrollNext()}
          disabled={nextDisabled}
          aria-label="Next slide"
          className="p-2 text-gray-600 bg-white border border-gray-200 rounded-full shadow-sm hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all disabled:opacity-40 disabled:pointer-events-none"
        >
          ⇾
        </button>
      </div>
    </section>
  );
}