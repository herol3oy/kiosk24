import { useState } from 'preact/hooks';
import { useQuery, QueryClientProvider } from '@tanstack/preact-query';
import { queryClient } from '../libs/queryClient';
import type { UrlEntry } from "../../../../libs/shared/src/types";
import ScreenshotCarousel from './ScreenshotCarousel';

interface HistoryGridProps {
    date: string;
    device: string;
    cdn: string;
}

export default function HistoryGridWrapper(props: HistoryGridProps) {
    return (
        <QueryClientProvider client={queryClient}>
            <HistoryGridInner {...props} />
        </QueryClientProvider>
    );
}

function getUrlMeta(url: string) {
    const { hostname } = new URL(url);
    const cleanHost = hostname.replace(/^www\./, "");
    const favicon = `https://www.google.com/s2/favicons?domain=${url}&sz=32`;

    return { cleanHost, favicon };
}

function HistoryGridInner({ date, device, cdn }: HistoryGridProps) {
    const [expandedUrls, setExpandedUrls] = useState<string[]>([]);

    const { data: urls = [], isLoading, isError } = useQuery({
        queryKey: ['urls', date, device],
        queryFn: async () => {
            const res = await fetch('/api/urls');
            if (!res.ok) throw new Error('Network response was not ok');
            return res.json() as Promise<UrlEntry[]>;
        }
    });

    const toggleUrlExpansion = (url: string) => {
        setExpandedUrls((prev) =>
            prev.includes(url) ? prev.filter((u) => u !== url) : [...prev, url]
        );
    };

    if (isError) {
        return (
            <div className="p-10 text-center">
                <div className="inline-block px-4 py-3 text-red-700 bg-red-50 rounded-lg border border-red-100">
                    Failed to load history. Please try refreshing the page.
                </div>
            </div>
        );
    }

    return (
        <div className="w-full p-4 space-y-6 pb-20 max-w-5xl mx-auto">
            {urls.map((entry) => {
                const url = entry.url;
                const isExpanded = expandedUrls.includes(url);
                const { cleanHost, favicon } = getUrlMeta(url);
                const panelId = `carousel-panel-${cleanHost.replace(/[^a-zA-Z0-9]/g, '-')}`;

                return (
                    <article 
                        key={url} 
                        className="bg-white rounded-xl border border-gray-200 shadow-sm transition-shadow hover:shadow-md overflow-hidden"
                    >
                        <header 
                            className="group flex flex-wrap items-center justify-between gap-4 p-4 bg-gray-50/50 cursor-pointer hover:bg-gray-100/80 transition-colors focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-inset"
                            onClick={() => toggleUrlExpansion(url)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    toggleUrlExpansion(url);
                                }
                            }}
                            role="button"
                            tabIndex={0}
                            aria-expanded={isExpanded}
                            aria-controls={panelId}
                        >
                            <div className="flex items-center gap-3">
                                {favicon && (
                                    <img
                                        src={favicon}
                                        alt=""
                                        loading="lazy"
                                        className="h-6 w-6 rounded-sm bg-white p-0.5 shadow-sm"
                                        onError={(e) => ((e.currentTarget as HTMLImageElement).style.opacity = "0")}
                                    />
                                )}
                                <div className="flex items-center gap-1.5">
                                    <h2 className="text-lg font-semibold text-gray-800 m-0 group-hover:text-blue-700 transition-colors">
                                        {cleanHost}
                                    </h2>
                                    <a
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded p-1 transition-colors"
                                        aria-label={`Visit ${cleanHost} (opens in a new tab)`}
                                        onClick={(e) => e.stopPropagation()}
                                        onKeyDown={(e) => e.stopPropagation()}
                                    >
                                        <span aria-hidden="true" className="text-sm font-bold">↗</span>
                                    </a>
                                </div>
                            </div>

                            <div className="ml-auto flex items-center gap-2 text-sm font-medium text-gray-600">
                                <span className="hidden sm:inline-block">
                                    {isExpanded ? 'Hide' : 'View'}
                                </span>
                                <svg 
                                    className={`w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} 
                                    fill="none" 
                                    stroke="currentColor" 
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </header>

                        {isExpanded && (
                            <div 
                                id={panelId}
                                className="p-4 border-t border-gray-100 bg-white"
                            >
                                <ScreenshotCarousel
                                    url={url}
                                    date={date}
                                    device={device}
                                    cdn={cdn}
                                />
                            </div>
                        )}
                    </article>
                );
            })}
        </div>
    );
}