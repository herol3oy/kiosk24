import type { ScreenshotEntry } from "../../../../libs/shared/src/types";
import { useQuery, QueryClientProvider } from '@tanstack/preact-query';
import { queryClient } from '../libs/queryClient';
import { useEffect, useState } from 'preact/hooks';

interface Props {
    device: "mobile" | "desktop";
    baseUrl: string;
    cdn: string;
}

const buildImageUrls = (cdn: string, key: string, thumbWidth: number) => ({
    full: cdn.includes("localhost") ? `${cdn}/${key}` : `${cdn}/cdn-cgi/image/width=1600,quality=60,format=auto/${key}`,
    thumb: cdn.includes("localhost") ? `${cdn}/${key}` : `${cdn}/cdn-cgi/image/width=${thumbWidth},quality=50,fit=cover,format=auto/${key}`,
});

export default function LatestGridWrapper(props: Props) {
    return (
        <QueryClientProvider client={queryClient}>
            <LatestGridInner {...props} />
        </QueryClientProvider>
    );
}

function LatestGridInner({ device, baseUrl, cdn }: Props) {
    const [mounted, setMounted] = useState(false);
    const isDesktop = device === "desktop";
    const thumbWidth = isDesktop ? 600 : 400;
    const gridClass = isDesktop
        ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"
        : "grid-cols-2 md:grid-cols-3 lg:grid-cols-5";

    const { data: items = [], isLoading, isError } = useQuery({
        queryKey: ['latest'],
        queryFn: async () => {
            const res = await fetch(`${baseUrl}/latest`);
            if (!res.ok) throw new Error('Network response was not ok');
            return res.json() as Promise<ScreenshotEntry[]>;
        }
    });

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted || isLoading) {
        return (
            <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
        );
    }

    if (isError) {
        return <StatusMessage text="Failed to load latest screenshots." isError />;
    }

    if (items.length === 0) {
        return <StatusMessage text="No latest screenshots found." />;
    }

    const getHostname = (url: string) => {
        try {
            return new URL(url).hostname.replace("www.", "");
        } catch {
            return url;
        }
    };

    return (
        <div className={`grid gap-6 ${gridClass}`}>
            {items.map((item) => {
                const hostname = getHostname(item.url);
                const favicon = `https://www.google.com/s2/favicons?domain=${item.url}&sz=64`;
                const isOk = item.job_status === 'ok';
                const images = buildImageUrls(cdn, item.r2_key, thumbWidth);
                const linkHref = isOk ? images.full : item.url;
                const aspectClass = isDesktop ? "aspect-16/10" : "aspect-9/16";

                return (
                    <article key={item.id || item.r2_key} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow flex flex-col">
                        <div className="px-3 py-2 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                            <div className="flex items-center gap-2 overflow-hidden">
                                <img src={favicon} alt="" loading="lazy" className="w-4 h-4 opacity-70" />
                                <h3 className="text-xs font-bold text-gray-700 truncate" title={item.url}>{hostname}</h3>
                            </div>
                            <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">{item.language}</span>
                        </div>

                        <div className={`relative bg-gray-100 border-b border-gray-100 group ${aspectClass}`}>
                            {!isOk ? (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-red-400">
                                    <span className="text-2xl mb-2" aria-hidden="true">⚠️</span>
                                    <span className="text-xs font-semibold uppercase tracking-wide">Failed</span>
                                </div>
                            ) : (
                                <img
                                    src={images.thumb}
                                    srcSet={isDesktop ? `${images.thumb} 1x, ${images.full} 2x` : undefined}
                                    alt={`Screenshot of ${hostname}`}
                                    loading="lazy"
                                    decoding="async"
                                    className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                                />
                            )}
                            <a
                                href={linkHref}
                                target="_blank"
                                rel="noreferrer"
                                className="absolute inset-0 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                aria-label={`View ${isOk ? 'screenshot' : 'site'} of ${hostname} (opens in new tab)`}
                            >
                                <span className="sr-only">
                                    View {isOk ? 'screenshot' : 'site'} of {hostname}
                                </span>
                            </a>
                        </div>

                        <div className="px-3 py-2 bg-white flex justify-between items-center text-[10px] text-gray-400 font-mono">
                            <time dateTime={item.created_at}>
                                {new Date(item.created_at).toLocaleString([], {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </time>
                        </div>
                    </article>
                );
            })}
        </div>
    );
}

function StatusMessage({ text, isError = false }: { text: string; isError?: boolean }) {
    return (
        <div className={`flex flex-col items-center justify-center py-32 ${isError ? 'text-red-400' : 'text-gray-400'}`}>
            <p className="text-lg">{text}</p>
        </div>
    );
}