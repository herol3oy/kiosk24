import { QueryClientProvider, useQuery } from "@tanstack/preact-query";
import type { EmblaCarouselType } from "embla-carousel";
import useEmblaCarousel from "embla-carousel-react";
import type { ComponentChildren } from "preact";
import { useCallback, useEffect, useState } from "preact/hooks";
import type { ScreenshotEntry, UrlEntry } from "../../../../libs/shared/src/types";
import { queryClient } from "../libs/queryClient";
import DatePicker from "./DatePicker";

interface BaseProps { date: string; device: string; cdn: string; }
interface CarouselProps extends BaseProps { url: string; }

const dateFormatter = new Intl.DateTimeFormat([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
const languageNames = new Intl.DisplayNames(['en'], { type: 'language' });

const getUrlMeta = (url: string) => ({
    cleanHost: new URL(url).hostname.replace(/^www\./, ""),
    favicon: `https://www.google.com/s2/favicons?domain=${url}&sz=32`
});

const buildImageUrls = (cdn: string, key: string | null, thumbWidth: number) => {
    const isLocal = cdn.includes("localhost");
    return {
        full: isLocal ? `${cdn}/${key}` : `${cdn}/cdn-cgi/image/w=1600,q=60,f=auto/${key}`,
        thumb: isLocal ? `${cdn}/${key}` : `${cdn}/cdn-cgi/image/w=${thumbWidth},q=50,fit=cover,f=auto/${key}`,
    };
};

const StatusMessage = ({ isError, children }: { isError?: boolean; children: ComponentChildren }) => (
    <div className={`p-4 text-sm rounded-lg border inline-block ${isError ? 'text-red-700 bg-red-50 border-red-100' : 'text-gray-500 bg-gray-50 border-gray-100'}`}>
        {children}
    </div>
);

const CarouselButton = ({ onClick, disabled, label, icon }: { onClick: () => void, disabled: boolean, label: string, icon: string }) => (
    <button
        type="button" onClick={onClick} disabled={disabled} aria-label={label}
        className="p-2 text-gray-600 bg-white border border-gray-200 rounded-full shadow-sm hover:bg-gray-50 hover:text-gray-900 focus:ring-2 focus:ring-blue-500 transition-all disabled:opacity-40 disabled:pointer-events-none"
    >
        <span className="block w-5 h-5 text-xl font-bold leading-5">{icon}</span>
    </button>
);


export default function HistoryGridWrapper(props: BaseProps) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    if (!mounted) {
        return (
            <div className="w-full p-4 space-y-6 pb-20 max-w-5xl mx-auto">
                {[1, 2, 3].map(i => <div key={i} className="bg-white rounded-xl border border-gray-200 h-32 animate-pulse" />)}
            </div>
        );
    }

    return (
        <QueryClientProvider client={queryClient}>
            <HistoryGridInner {...props} />
        </QueryClientProvider>
    );
}

function HistoryGridInner({ date, device: initialDevice, cdn }: BaseProps) {
    const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);

    const { data: languages = [] } = useQuery({
        queryKey: ['languages'],
        queryFn: async () => {
            const res = await fetch('/api/languages');
            if (!res.ok) throw new Error('Failed to fetch languages');
            return await res.json() as string[];
        }
    });

    const { data: urls = [], isError: isErrorUrls, isLoading: isLoadingUrls } = useQuery({
        queryKey: ['urls', date, initialDevice],
        queryFn: async () => {
            const res = await fetch('/api/urls');
            if (!res.ok) throw new Error('Network response failed');
            const data = await res.json() as UrlEntry[];
            return data.sort((a, b) => a.url.localeCompare(b.url));
        }
    });

    if (isErrorUrls) return <div className="p-10 text-center"><StatusMessage isError>Failed to load history. Please refresh.</StatusMessage></div>;

    const isLoading = isLoadingUrls;

    if (isLoading) {
        return (
            <div className="w-full p-4 space-y-6 pb-20 max-w-5xl mx-auto">
                {[1, 2, 3].map(i => <div key={i} className="bg-white rounded-xl border border-gray-200 h-32 animate-pulse" />)}
            </div>
        );
    }

    const filteredUrls = selectedLanguages.length > 0
        ? urls.filter(u => selectedLanguages.includes(u.language))
        : urls;

    return (
        <div className="w-full p-4 space-y-6 pb-20 max-w-5xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 mb-8">
                {languages.length > 0 && (
                    <fieldset className="flex flex-wrap gap-4 items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                        <legend className="px-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                            Filter by Language
                        </legend>
                        <div className="flex items-center">
                            <button
                                type="button"
                                onClick={() => setSelectedLanguages([])}
                                className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${selectedLanguages.length === 0
                                    ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                                    : "bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"}`}
                            >
                                All
                            </button>
                        </div>
                        <div className="h-6 w-px bg-gray-200 mx-1 hidden sm:block"></div>
                        {languages.map(lang => {
                            const isSelected = selectedLanguages.includes(lang);
                            return (
                                <div key={lang} className="flex items-center gap-2 group cursor-pointer">
                                    <div className="relative flex items-center">
                                        <input
                                            type="checkbox"
                                            id={lang}
                                            name="languages"
                                            checked={isSelected}
                                            onChange={() => {
                                                setSelectedLanguages(prev =>
                                                    isSelected
                                                        ? prev.filter(l => l !== lang)
                                                        : [...prev, lang]
                                                );
                                            }}
                                            className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-colors cursor-pointer"
                                        />
                                    </div>
                                    <label
                                        htmlFor={lang}
                                        className={`text-sm font-medium cursor-pointer transition-colors ${isSelected ? "text-blue-700" : "text-gray-600 group-hover:text-gray-900"}`}
                                    >
                                        {languageNames.of(lang) || lang}
                                    </label>
                                </div>
                            );
                        })}
                    </fieldset>
                )}
                <div className="shrink-0">
                    <DatePicker initialDate={date} />
                </div>
            </div>
            {filteredUrls.map(({ id, url }) => {
                return <UrlRow key={id} url={url} initialDevice={initialDevice} date={date} cdn={cdn} />;
            })}
            {filteredUrls.length === 0 && urls.length > 0 && (
                <div className="text-center py-10">
                    <StatusMessage>No URLs found for the selected language.</StatusMessage>
                </div>
            )}
        </div>
    );
}

function UrlRow({ url, initialDevice, date, cdn }: { url: string, initialDevice: string, date: string, cdn: string }) {
    const [device, setDevice] = useState(initialDevice);
    const [isOpen, setIsOpen] = useState(false);
    const { cleanHost, favicon } = getUrlMeta(url);

    const DeviceToggle = ({ type, label }: { type: string, label: string }) => (
        <button
            type="button" onClick={() => setDevice(type)}
            className={`px-3 py-1 text-[10px] sm:text-xs font-semibold rounded-md transition-all ${device === type ? "bg-white shadow-sm text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
        >
            {label}
        </button>
    );

    return (
        <details
            className="group bg-white rounded-xl border border-gray-200 shadow-sm transition-shadow hover:shadow-md overflow-hidden open:shadow-md"
            onToggle={(e) => setIsOpen(e.currentTarget.open)}
        >
            <summary className="list-none cursor-pointer border-b border-gray-100">
                <div className="w-full flex flex-wrap items-center justify-between gap-4 p-4 bg-gray-50/50 group-hover:bg-gray-100/80 transition-colors">
                    <div className="flex items-center gap-3">
                        <img src={favicon} alt="" loading="lazy" className="h-6 w-6 rounded-sm bg-white p-0.5 shadow-sm" onError={e => (e.currentTarget.style.opacity = "0")} />
                        <div className="flex items-center gap-1.5">
                            <h2 className="text-lg font-semibold text-gray-800 m-0 group-hover:text-blue-700">{cleanHost}</h2>
                            <a href={url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-600 p-1" onClick={e => e.stopPropagation()}>
                                <span className="sr-only">Visit {cleanHost}</span><span aria-hidden="true" className="text-sm font-bold">↗</span>
                            </a>
                        </div>
                    </div>
                    <div className="text-sm font-medium text-gray-600 flex items-center gap-4">
                        <span className="hidden sm:inline-block border-l border-gray-200 pl-4">
                            <span className="group-open:hidden">View snapshots</span>
                            <span className="hidden group-open:inline">Hide snapshots</span>
                        </span>
                        <span className="text-base text-gray-400 transition-transform group-open:rotate-180" aria-hidden="true">▼</span>
                    </div>
                </div>
            </summary>

            <div className="border-t border-gray-100 bg-white p-4 space-y-4">
                {isOpen && (
                    <>
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Device View</h3>
                            <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200">
                                <DeviceToggle type="desktop" label="Desktop" />
                                <DeviceToggle type="mobile" label="Mobile" />
                            </div>
                        </div>
                        <ScreenshotCarousel url={url} date={date} device={device} cdn={cdn} />
                    </>
                )}
            </div>
        </details>
    );
}

function ScreenshotCarousel({ url, date, device, cdn }: CarouselProps) {
    const isDesktop = device === "desktop";

    const { data: screenshots = [], isLoading, isError } = useQuery({
        queryKey: ['screenshots', url, date, device],
        queryFn: async () => {
            const res = await fetch(`/api/screenshots?url=${encodeURIComponent(url)}&date=${date}&device=${device}`);
            if (!res.ok) throw new Error('Failed to fetch screenshots');
            return await res.json() as ScreenshotEntry[];
        },
        enabled: true
    });

    const group = screenshots;
    
    const completedCount = group.filter(item => item.job_status === 'ok').length;
    const failedCount = group.filter(item => item.job_status === 'failed').length;

    const [emblaRef, emblaApi] = useEmblaCarousel({ align: "start", containScroll: "trimSnaps" });
    const [prevDisabled, setPrevDisabled] = useState(true);
    const [nextDisabled, setNextDisabled] = useState(true);

    const onSelect = useCallback((api: EmblaCarouselType) => {
        setPrevDisabled(!api.canScrollPrev());
        setNextDisabled(!api.canScrollNext());
    }, []);

    useEffect(() => {
        if (!emblaApi) return;
        onSelect(emblaApi);
        emblaApi.on("select", onSelect).on("reInit", onSelect);
    }, [emblaApi, onSelect]);

    if (isLoading) return <div className="h-40 animate-pulse bg-gray-50 rounded-lg flex items-center justify-center text-gray-400 text-xs">Loading snapshots...</div>;
    if (isError) return <StatusMessage isError>Failed to load snapshots for this device.</StatusMessage>;
    if (!group.length) return <StatusMessage>No snapshots found for this device.</StatusMessage>;

    return (
        <section className="w-full py-2" aria-label="Screenshots">
            <div className="overflow-hidden w-full" ref={emblaRef}>
                <div className="flex">
                    {group.map((item) => {
                        const dateFormatted = dateFormatter.format(new Date(item.created_at));
                        const { full, thumb } = buildImageUrls(cdn, item.r2_key, isDesktop ? 400 : 240);

                        return (
                            <div key={item.id} className={`flex-[0_0_auto] pr-4 ${isDesktop ? "w-72" : "w-40"}`}>
                                <article className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow flex flex-col group">
                                    {item.job_status === "ok" ? (
                                        <a href={full} target="_blank" rel="noopener noreferrer" className={`relative bg-gray-50 block overflow-hidden ${isDesktop ? "aspect-16/10" : "aspect-9/16"}`}>
                                            <img src={thumb} loading="lazy" alt={`Screenshot ${dateFormatted}`} className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105" />
                                        </a>
                                    ) : (
                                        <div className={`relative bg-red-50 flex flex-col items-center justify-center text-red-400 border-b border-red-100 ${isDesktop ? "aspect-16/10" : "aspect-9/16"}`}>
                                            <span className="text-xl mb-1" aria-hidden="true">⚠️</span>
                                            <span className="text-[10px] font-semibold uppercase tracking-wide">Failed</span>
                                        </div>
                                    )}
                                    <div className="px-3 py-2 bg-white flex justify-between items-center text-[10px] text-gray-500 font-mono">
                                        <time dateTime={item.created_at}>{dateFormatted}</time>
                                        <div className="flex items-center gap-1">
                                            <span className={`w-1.5 h-1.5 rounded-full ${item.job_status === 'ok' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                            <span className={`font-bold uppercase ${item.job_status === 'ok' ? 'text-green-600' : 'text-red-600'}`}>{item.job_status}</span>
                                        </div>
                                    </div>
                                </article>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="flex items-center justify-between mt-4">
                <div className="flex gap-4 text-[10px] font-bold uppercase tracking-wider">
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-green-50 text-green-700 border border-green-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                        <span>Completed: {completedCount}</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-red-50 text-red-700 border border-red-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                        <span>Failed: {failedCount}</span>
                    </div>
                </div>

                <div className="flex gap-2">
                    <CarouselButton onClick={() => emblaApi?.scrollPrev()} disabled={prevDisabled} label="Previous slide" icon="❮" />
                    <CarouselButton onClick={() => emblaApi?.scrollNext()} disabled={nextDisabled} label="Next slide" icon="❯" />
                </div>
            </div>
        </section>
    );
}