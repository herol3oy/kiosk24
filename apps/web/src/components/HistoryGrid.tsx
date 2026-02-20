import { useState, useCallback, useEffect } from 'preact/hooks';
import { useQuery, QueryClientProvider } from '@tanstack/preact-query';
import useEmblaCarousel from "embla-carousel-react";
import type { EmblaCarouselType } from "embla-carousel";
import { queryClient } from '../libs/queryClient';
import type { UrlEntry, ScreenshotEntry } from "../../../../libs/shared/src/types";
import type { ComponentChildren } from 'preact';

interface BaseProps {
    date: string;
    device: string;
    cdn: string;
}

interface CarouselProps extends BaseProps {
    url: string;
}

interface CarouselButtonProps {
    onClick: () => void;
    disabled: boolean;
    label: string;
    icon: string;
}

const getUrlMeta = (url: string) => {
    const cleanHost = new URL(url).hostname.replace(/^www\./, "");
    return { cleanHost, favicon: `https://www.google.com/s2/favicons?domain=${url}&sz=32` };
};

const buildImageUrls = (cdn: string, key: string, thumbWidth: number) => ({
    full: cdn.includes("localhost") ? `${cdn}/${key}` : `${cdn}/cdn-cgi/image/width=1600,quality=60,format=auto/${key}`,
    thumb: cdn.includes("localhost") ? `${cdn}/${key}` : `${cdn}/cdn-cgi/image/width=${thumbWidth},quality=50,fit=cover,format=auto/${key}`,
});

const StatusMessage = ({ isError, children }: { isError?: boolean; children: ComponentChildren }) => (
    <div className={`p-4 text-sm rounded-lg border inline-block ${isError ? 'text-red-700 bg-red-50 border-red-100' : 'text-gray-500 bg-gray-50 border-gray-100'}`}>
        {children}
    </div>
);

const CarouselButton = ({ onClick, disabled, label, icon }: CarouselButtonProps) => (
    <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-label={label}
        className="p-2 text-gray-600 bg-white border border-gray-200 rounded-full shadow-sm hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all disabled:opacity-40 disabled:pointer-events-none"
    >
        <span className="block w-5 h-5 text-xl font-bold leading-5">{icon}</span>
    </button>
);

const dateFormatter = new Intl.DateTimeFormat([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

export default function HistoryGridWrapper(props: BaseProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div className="w-full p-4 space-y-6 pb-20 max-w-5xl mx-auto">
                {[1, 2, 3].map(i => (
                    <div key={i} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden h-32 animate-pulse" />
                ))}
            </div>
        );
    }

    return (
        <QueryClientProvider client={queryClient}>
            <HistoryGridInner {...props} />
        </QueryClientProvider>
    );
}

function HistoryGridInner({ date, device, cdn }: BaseProps) {
    const [expandedUrls, setExpandedUrls] = useState<string[]>([]);

    const { data: urls = [], isError } = useQuery({
        queryKey: ['urls', date, device],
        queryFn: async () => {
            const res = await fetch('/api/urls');
            if (!res.ok) throw new Error('Network response was not ok');
            return res.json() as Promise<UrlEntry[]>;
        }
    });

    const toggleExpansion = (url: string) => setExpandedUrls(prev =>
        prev.includes(url) ? prev.filter(u => u !== url) : [...prev, url]
    );

    if (isError) return <div className="p-10 text-center"><StatusMessage isError>Failed to load history. Please refresh.</StatusMessage></div>;

    return (
        <div className="w-full p-4 space-y-6 pb-20 max-w-5xl mx-auto">
            {urls.map(({ id, url }) => {
                const { cleanHost, favicon } = getUrlMeta(url);
                const panelId = `panel-${cleanHost.replace(/[^a-zA-Z0-9]/g, '-')}`;
                const isExpanded = expandedUrls.includes(url);

                return (
                    <article key={id} className="bg-white rounded-xl border border-gray-200 shadow-sm transition-shadow hover:shadow-md overflow-hidden">
                        <header className="border-b border-gray-100">
                            <button
                                type="button"
                                onClick={() => toggleExpansion(url)}
                                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), toggleExpansion(url))}
                                aria-expanded={isExpanded}
                                aria-controls={panelId}
                                className="w-full group flex flex-wrap items-center justify-between gap-4 p-4 bg-gray-50/50 cursor-pointer hover:bg-gray-100/80 transition-colors text-left"
                            >
                                <div className="flex items-center gap-3">
                                    <img src={favicon} alt="" loading="lazy" className="h-6 w-6 rounded-sm bg-white p-0.5 shadow-sm" onError={e => (e.currentTarget.style.opacity = "0")} />
                                    <div className="flex items-center gap-1.5">
                                        <h2 className="text-lg font-semibold text-gray-800 m-0 group-hover:text-blue-700 transition-colors">{cleanHost}</h2>
                                        <a
                                            href={url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-gray-400 hover:text-blue-600 p-1 transition-colors inline-flex items-center"
                                            onClick={e => e.stopPropagation()}
                                        >
                                            <span className="sr-only">Visit {cleanHost} website (opens in new tab)</span>
                                            <span aria-hidden="true" className="text-sm font-bold">↗</span>
                                        </a>
                                    </div>
                                </div>
                                <div className="text-sm font-medium text-gray-600">
                                    <span className="hidden sm:inline-block mr-2">{isExpanded ? "Hide" : "View"} snapshots</span>
                                    <span className="text-base text-gray-400" aria-hidden="true">{isExpanded ? "⯅" : "⯆"}</span>
                                </div>
                            </button>
                        </header>

                        <div
                            id={panelId}
                            className={`border-t border-gray-100 bg-white transition-all ${isExpanded ? 'block' : 'hidden'}`}
                        >
                            <div className="p-4">
                                {isExpanded && <ScreenshotCarousel url={url} date={date} device={device} cdn={cdn} />}
                            </div>
                        </div>
                    </article>
                );
            })}
        </div>
    );
}

function ScreenshotCarousel({ url, date, device, cdn }: CarouselProps) {
    const [mounted, setMounted] = useState(false);
    const isDesktop = device === "desktop";
    const slideWidth = isDesktop ? "w-72" : "w-40";
    const aspectRatio = isDesktop ? "aspect-[16/10]" : "aspect-[9/16]";
    const thumbWidth = isDesktop ? 400 : 240;

    const { data: group = [], isLoading, isError } = useQuery({
        queryKey: ["screenshots", url, date, device],
        queryFn: async () => {
            const res = await fetch(`/api/screenshots?url=${encodeURIComponent(url)}&date=${date}&device=${device}`);
            if (!res.ok) throw new Error("Network error");
            return res.json() as Promise<ScreenshotEntry[]>;
        },
    });

    const [emblaRef, emblaApi] = useEmblaCarousel({ align: "start", containScroll: "trimSnaps" });
    const [prevDisabled, setPrevDisabled] = useState(true);
    const [nextDisabled, setNextDisabled] = useState(true);

    useEffect(() => {
        setMounted(true);
    }, []);

    const onSelect = useCallback((api: EmblaCarouselType) => {
        setPrevDisabled(!api.canScrollPrev());
        setNextDisabled(!api.canScrollNext());
    }, []);

    useEffect(() => {
        if (!emblaApi) return;
        onSelect(emblaApi);
        emblaApi.on("select", onSelect).on("reInit", onSelect);
    }, [emblaApi, onSelect]);

    if (!mounted || isLoading) {
        return (
            <div className="flex gap-4 overflow-hidden py-2">
                {[1, 2, 3].map(i => (
                    <div key={i} className={`flex-none animate-pulse bg-gray-100 rounded-xl border border-gray-100 ${slideWidth} ${aspectRatio}`} />
                ))}
            </div>
        );
    }

    if (isError) return <StatusMessage isError>Failed to load screenshots.</StatusMessage>;
    if (!group.length) return <StatusMessage>No snapshots found for this URL.</StatusMessage>;

    return (
        <section className="w-full py-2" aria-label="Screenshots">
            <div className="overflow-hidden w-full" ref={emblaRef}>
                <div className="flex">
                    {group.map((item, i) => {
                        const dateFormatted = dateFormatter.format(new Date(item.created_at));
                        const { full, thumb } = buildImageUrls(cdn, item.r2_key, thumbWidth);

                        return (
                            <div key={item.id || i} className={`flex-[0_0_auto] pr-4 ${slideWidth}`}>
                                <article className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow flex flex-col group">
                                    {item.job_status === "ok" ? (
                                        <a href={full} target="_blank" rel="noopener noreferrer" className={`relative bg-gray-50 block overflow-hidden ${aspectRatio}`}>
                                            <img
                                                src={thumb}
                                                loading="lazy"
                                                className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                                                alt={`Screenshot ${dateFormatted}`}
                                            />
                                        </a>
                                    ) : (
                                        <div className={`relative bg-red-50 flex flex-col items-center justify-center text-red-400 border-b border-red-100 ${aspectRatio}`}>
                                            <span className="text-xl mb-1" aria-hidden="true">⚠️</span>
                                            <span className="text-[10px] font-semibold uppercase tracking-wide">Failed</span>
                                        </div>
                                    )}
                                    <div className="px-3 py-2 bg-white flex justify-between items-center text-[10px] text-gray-500 font-mono">
                                        <time dateTime={item.created_at}>{dateFormatted}</time>
                                    </div>
                                </article>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="flex gap-2 mt-4">
                <CarouselButton onClick={() => emblaApi?.scrollPrev()} disabled={prevDisabled} label="Previous slide" icon="❮" />
                <CarouselButton onClick={() => emblaApi?.scrollNext()} disabled={nextDisabled} label="Next slide" icon="❯" />
            </div>
        </section>
    );
}