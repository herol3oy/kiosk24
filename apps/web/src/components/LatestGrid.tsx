import { useQuery, QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../libs/queryClient'; 
import type { ScreenshotEntry } from "../../../../libs/shared/src/types";

const isProd = import.meta.env.PROD;
const baseUrl = '/api'
const cdn = isProd ? "https://cdn.kiosk24.site" : import.meta.env.PUBLIC_API_URL;

interface Props {
    device: "mobile" | "desktop";
}

export default function LatestGridWrapper(props: Props) {
    return (
        <QueryClientProvider client={queryClient}>
            <LatestGridInner {...props} />
        </QueryClientProvider>
    );
}

function LatestGridInner({ device }: Props) {
    const isDesktop = device === "desktop";

    const { data: items = [], isLoading, isError } = useQuery({
        queryKey: ['latest'], 
        queryFn: async () => {
            const res = await fetch(`${baseUrl}/latest`);
            if (!res.ok) throw new Error('Network response was not ok');
            return res.json() as Promise<ScreenshotEntry[]>;
        }
    });

    if (isLoading) {
        return (
            <div className="flex justify-center py-20">
                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center py-32 text-red-400">
                <p className="text-lg">Failed to load latest screenshots.</p>
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-32 text-gray-400">
                <p className="text-lg">No latest screenshots found.</p>
            </div>
        );
    }

    return (
        <div className={`grid gap-6 ${
            isDesktop 
                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5" 
                : "grid-cols-2 md:grid-cols-3 lg:grid-cols-5"
        }`}>
            {items.map((item) => {
                let hostname = item.url;
                try { hostname = new URL(item.url).hostname.replace("www.", ""); } catch (e) {}
                const favicon = `https://www.google.com/s2/favicons?domain=${item.url}&sz=64`;

                return (
                    <article key={item.id || item.r2_key} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow flex flex-col">
                        <div className="px-3 py-2 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                            <div className="flex items-center gap-2 overflow-hidden">
                                <img src={favicon} alt="fav icon" loading="lazy" className="w-4 h-4 opacity-70" />
                                <h3 className="text-xs font-bold text-gray-700 truncate" title={item.url}>{hostname}</h3>
                            </div>
                            <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">{item.language}</span>
                        </div>

                        <div className={`relative bg-gray-100 border-b border-gray-100 group ${isDesktop ? "aspect-16/10" : "aspect-9/16"}`}>
                            {item.job_status === 'failed' ? (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-red-400">
                                    <span className="text-2xl mb-2">⚠️</span>
                                    <span className="text-xs font-semibold uppercase tracking-wide">Failed</span>
                                </div>
                            ) : (
                                <img
                                    src={`${cdn}/${item.r2_key}`}
                                    alt={`Screenshot of ${hostname}`}
                                    loading="lazy"
                                    decoding="async"
                                    className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                                />
                            )}
                            <a 
                                href={item.job_status === 'ok' ? `${cdn}/${item.r2_key}` : item.url} 
                                target="_blank" 
                                rel="noreferrer"
                                className="absolute inset-0"
                                aria-label="View screenshot"
                            ></a>
                        </div>

                        <div className="px-3 py-2 bg-white flex justify-between items-center text-[10px] text-gray-400 font-mono">
                            <time dateTime={item.created_at}>
                                {new Date(item.created_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </time>
                        </div>
                    </article>
                );
            })}
        </div>
    );
}