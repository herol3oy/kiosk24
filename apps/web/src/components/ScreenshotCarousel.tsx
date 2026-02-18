import { useCallback, useEffect, useState } from "react";
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
              <div
                className={`relative rounded-lg overflow-hidden border bg-gray-100 ${device === "desktop"
                  ? "aspect-16/10"
                  : "aspect-9/16"
                  }`}
              >
                {item.job_status === "ok" ? (
                  <a
                    href={`${cdn}/${item.r2_key}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img
                      src={`${cdn}/${item.r2_key}`}
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover"
                      alt=""
                    />
                  </a>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-red-50 text-red-500 text-xs">
                    Failed
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2 mt-3">
        <button
          onClick={() => emblaApi?.scrollPrev()}
          disabled={prevDisabled}
          className="px-3 py-1 text-xs bg-gray-200 rounded disabled:opacity-40"
        >
          ⇽
        </button>
        <button
          onClick={() => emblaApi?.scrollNext()}
          disabled={nextDisabled}
          className="px-3 py-1 text-xs bg-gray-200 rounded disabled:opacity-40"
        >
          ⇾
        </button>
      </div>
    </section>
  );
}
