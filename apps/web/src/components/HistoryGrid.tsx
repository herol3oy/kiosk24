import { useMemo } from 'preact/hooks';
import { useQuery, QueryClientProvider } from '@tanstack/preact-query';
import { queryClient } from '../libs/queryClient';
import type { ScreenshotEntry } from "../../../../libs/shared/src/types";
import ScreenshotCarousel from './ScreenshotCarousel';

interface HistoryGridProps {
    date: string;
    device: string;
    baseUrl: string;
    cdn: string;
}

export default function HistoryGridWrapper(props: HistoryGridProps) {
    return (
        <QueryClientProvider client={queryClient}>
            <HistoryGridInner {...props} />
        </QueryClientProvider>
    );
}

function HistoryGridInner({ date, device, baseUrl, cdn }: HistoryGridProps) {
    const { data: items = [], isLoading, isError } = useQuery({
        queryKey: ['screenshots', date, device],
        queryFn: async () => {
            const res = await fetch(`${baseUrl}/screenshots?date=${date}&device=${device}`);
            if (!res.ok) throw new Error('Network response was not ok');
            return res.json() as Promise<ScreenshotEntry[]>;
        }
    });

    const groupedItems = useMemo(() => {
        return items.reduce((acc, item) => {
            if (!acc[item.url]) acc[item.url] = [];
            acc[item.url].push(item);
            return acc;
        }, {} as Record<string, ScreenshotEntry[]>);
    }, [items]);

    const sortedUrls = useMemo(() => {
        return Object.keys(groupedItems).sort();
    }, [groupedItems]);

    if (isLoading) return <div className="p-10 text-center text-gray-500">Loading history...</div>;
    if (isError) return <div className="p-10 text-center text-red-500">Error loading data.</div>;

    return (
        <div className="w-full p-4 space-y-8 pb-20">
            {sortedUrls.map((url) => {
                const group = groupedItems[url];
                if (!group) return null;

                const { hostname } = new URL(url);
                const cleanHost = hostname.replace(/^www\./, "");
                const favicon = `https://www.google.com/s2/favicons?domain=${url}&sz=32`;

                return (
                    <div key={url} className="border-b border-gray-200 pb-8 last:border-0">
                        <header className="sticky top-0 z-10 mb-4 flex items-center gap-3 border-b border-gray-50 bg-white/95 py-2 backdrop-blur">
                            {favicon && (
                                <img
                                    src={favicon}
                                    alt=""
                                    loading="lazy"
                                    className="h-5 w-5 opacity-80"
                                    onError={(e) => ((e.currentTarget as HTMLImageElement).style.opacity = "0")}
                                />
                            )}

                            <h2 className="text-lg font-bold text-gray-800">
                                <a href={url} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 hover:underline">
                                    {cleanHost}
                                </a>
                            </h2>
                            <span className="ml-auto rounded-full bg-gray-100 px-2 py-0.5 text-xs font-mono text-gray-400">
                                {group.length} snapshots
                            </span>
                        </header>

                        <div className="flex flex-wrap gap-4">
                            <ScreenshotCarousel group={group} device={device} cdn={cdn} />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}