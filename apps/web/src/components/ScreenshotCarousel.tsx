import { useCallback, useEffect, useState } from "preact/hooks";
import useEmblaCarousel from "embla-carousel-react";
import type { EmblaCarouselType } from "embla-carousel";
import type { ScreenshotEntry } from "../../../../libs/shared/src/types";

interface Props {
  group: ScreenshotEntry[];
  device: string;
  cdn: string;
}

export default function ScreenshotCarousel({ group, device, cdn }: Props) {
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

  return (
    <section className="w-full">
      <div className="overflow-hidden w-full" ref={emblaRef}>
        <div className="flex">
          {group.map((item, i) => (
            <div
              key={item.id || i}
              className={`flex-[0_0_auto] pr-4 ${device === "desktop" ? "w-72" : "w-40"
                }`}
            >
              <article className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow flex flex-col">

                <div
                  className={`relative bg-gray-100 border-b border-gray-100 group ${device === "desktop" ? "aspect-16/10" : "aspect-9/16"
                    }`}
                >
                  {item.job_status === "ok" ? (
                    <>
                      <img
                        src={`${cdn}/${item.r2_key}`}
                        loading="lazy"
                        decoding="async"
                        className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                        alt=""
                      />
                      <a
                        href={`${cdn}/${item.r2_key}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute inset-0"
                        aria-label="View screenshot"
                      />
                    </>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-red-400 bg-red-50">
                      <span className="text-xl mb-1">⚠️</span>
                      <span className="text-[10px] font-semibold uppercase tracking-wide">
                        Failed
                      </span>
                    </div>
                  )}
                </div>

                <div className="px-3 py-2 bg-white flex justify-between items-center text-[10px] text-gray-400 font-mono">
                  <time dateTime={item.created_at}>
                    {new Date(item.created_at).toLocaleString([], {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </time>
                </div>

              </article>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3 mt-4">
        <button
          onClick={() => emblaApi?.scrollPrev()}
          disabled={prevDisabled}
          className="px-3 py-1.5 text-xs font-medium bg-gray-100 border border-gray-200 rounded-lg hover:bg-gray-200 transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          ⇽
        </button>

        <button
          onClick={() => emblaApi?.scrollNext()}
          disabled={nextDisabled}
          className="px-3 py-1.5 text-xs font-medium bg-gray-100 border border-gray-200 rounded-lg hover:bg-gray-200 transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          ⇾
        </button>
      </div>
    </section>
  );
}
