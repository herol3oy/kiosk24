import { useQuery, QueryClientProvider } from "@tanstack/preact-query";
import { queryClient } from "../libs/queryClient";
import type { ComponentChildren } from "preact";
import { useEffect, useState } from "preact/hooks";

interface SelectGroupProps {
    num: number;
    labelTxt: string;
    value: string | null;
    disabled: boolean;
    onChange: (val: string) => void;
    children: ComponentChildren;
}

interface Screenshot {
    id?: string;
    r2_key: string;
    url: string;
    job_status: string;
    created_at: string;
    language?: string;
}

interface PanelData {
    dates: string[];
    hours: number[];
    screenshot: Screenshot | null;
}

interface ComparePanelProps {
    side: "left" | "right";
    baseUrl: string;
    cdn: string;
    url: string | null;
    date: string | null;
    hour: string | null;
}

const getUrlMeta = (url: string) => {
    try {
        const cleanHost = new URL(url).hostname.replace(/^www\./, "");
        return {
            cleanHost,
            favicon: `https://www.google.com/s2/favicons?domain=${url}&sz=32`,
        };
    } catch {
        return { cleanHost: url, favicon: "" };
    }
};

const updateUrlParams = (
    setKey: string,
    setVal: string,
    deleteKeys: string[],
) => {
    const urlObj = new URL(window.location.href);

    if (setVal) {
        urlObj.searchParams.set(setKey, setVal);
    } else {
        urlObj.searchParams.delete(setKey);
    }

    for (const key of deleteKeys) {
        urlObj.searchParams.delete(key);
    }

    window.location.href = urlObj.toString();
};

async function fetchPanelData(
    baseUrl: string,
    urlParam: string | null,
    dateParam: string | null,
    hourParam: string | null,
): Promise<PanelData> {
    const data: PanelData = { dates: [], hours: [], screenshot: null };
    if (!urlParam) return data;

    try {
        const datesRes = await fetch(
            `${baseUrl}/available-dates?url=${encodeURIComponent(urlParam)}`,
        );
        if (datesRes.ok) data.dates = await datesRes.json();

        if (!dateParam) return data;

        const shotsRes = await fetch(
            `${baseUrl}/screenshots?url=${encodeURIComponent(urlParam)}&date=${dateParam}&device=desktop`,
        );
        if (shotsRes.ok) {
            const shots: Screenshot[] = await shotsRes.json();
            const hourMap = new Map<number, Screenshot>();

            shots.forEach((shot) => {
                const h = new Date(shot.created_at).getHours();
                if (!hourMap.has(h)) hourMap.set(h, shot);
            });

            data.hours = Array.from(hourMap.keys()).sort((a, b) => a - b);
            if (hourParam) {
                data.screenshot = hourMap.get(parseInt(hourParam, 10)) || null;
            }
        }
    } catch (err) {
        console.error("Error fetching panel data:", err);
    }
    return data;
}

export default function ComparePanelWrapper(props: ComparePanelProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div className="w-full p-4 space-y-6 pb-20 max-w-5xl mx-auto">
                {[1].map(i => (
                    <div key={i} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden h-32 animate-pulse" />
                ))}
            </div>
        );
    }
    return (
        <QueryClientProvider client={queryClient}>
            <ComparePanel {...props} />
        </QueryClientProvider>
    );
}

function ComparePanel({
    side,
    baseUrl,
    cdn,
    url,
    date,
    hour,
}: ComparePanelProps) {
    const isLeft = side === "left";
    const label = isLeft ? "Left View" : "Right View";
    const paramPrefix = side[0];

    const theme = isLeft
        ? { dot: "bg-blue-500", hover: "hover:text-blue-600" }
        : { dot: "bg-purple-500", hover: "hover:text-purple-600" };

    const { data: allUrls = [], isLoading: urlsLoading } = useQuery<
        { id: string; url: string; language: string }[]
    >({
        queryKey: ["allUrls", baseUrl],
        queryFn: async () => {
            try {
                const res = await fetch(`${baseUrl}/urls`);
                const json = (await res.ok) ? await res.json() : [];
                return Array.isArray(json) ? json : [];
            } catch {
                return [];
            }
        },
    });

    const { data = { dates: [], hours: [], screenshot: null } } = useQuery({
        queryKey: [side, url, date, hour],
        queryFn: () => fetchPanelData(baseUrl, url, date, hour),
    });

    const SelectGroup = ({
        num,
        labelTxt,
        value,
        disabled,
        onChange,
        children,
    }: SelectGroupProps) => {
        const selectId = `select-${num}`;

        return (
            <div className="space-y-1">
                <label
                    htmlFor={selectId}
                    className="text-[10px] uppercase tracking-wider font-bold text-gray-400"
                >
                    {num}. {labelTxt}
                </label>

                <select
                    id={selectId}
                    className="panel-select w-full bg-white border border-gray-200 text-gray-700 text-sm rounded-lg p-2.5 shadow-sm disabled:opacity-50"
                    value={value || ""}
                    disabled={disabled}
                    onChange={(e) => onChange((e.target as HTMLSelectElement).value)}
                >
                    {children}
                </select>
            </div>
        );
    };

    return (
        <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-full">
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${theme.dot}`}></span>
                    <h3 className="text-sm font-bold text-gray-700">{label}</h3>
                </div>
                {url && (
                    <span className="text-[10px] font-mono text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                        {getUrlMeta(url).cleanHost}
                    </span>
                )}
            </div>

            <div className="flex flex-col md:flex-row h-full">
                <div className="p-4 md:w-64 md:border-r border-b md:border-b-0 border-gray-100 bg-gray-50/30 flex flex-col gap-4 shrink-0">
                    <SelectGroup
                        num={1}
                        labelTxt="Select URL"
                        value={url}
                        disabled={urlsLoading}
                        onChange={(val: string) => updateUrlParams(`${paramPrefix}_url`, val, [`${paramPrefix}_date`, `${paramPrefix}_hour`])}
                    >
                        <option value="">{urlsLoading ? "Loading..." : "Select URL"}</option>
                        {allUrls.map((u) => {
                            const { cleanHost } = getUrlMeta(u.url);
                            return (
                                <option key={u.id} value={u.url}>
                                    {cleanHost}
                                </option>
                            );
                        })}
                    </SelectGroup>

                    <SelectGroup
                        num={2}
                        labelTxt="Select Date"
                        value={date}
                        disabled={!url}
                        onChange={(val: string) =>
                            updateUrlParams(`${paramPrefix}_date`, val, [
                                `${paramPrefix}_hour`,
                            ])
                        }
                    >
                        <option value="">Select Date</option>
                        {data.dates.map((d) => (
                            <option key={d} value={d}>
                                {d}
                            </option>
                        ))}
                    </SelectGroup>

                    <SelectGroup
                        num={3}
                        labelTxt="Select Hour"
                        value={hour}
                        disabled={!date}
                        onChange={(val: string) =>
                            updateUrlParams(`${paramPrefix}_hour`, val, [])
                        }
                    >
                        <option value="">Select Hour</option>
                        {data.hours.map((h) => (
                            <option key={h} value={h}>
                                {h}:00
                            </option>
                        ))}
                    </SelectGroup>

                    {data.screenshot && (
                        <div className="mt-auto pt-4 border-t border-gray-200 text-[10px] text-gray-400 space-y-1">
                            <p>
                                Status: <span>{data.screenshot.job_status}</span>
                            </p>
                            <p>
                                Captured:{" "}
                                <span className="font-mono">
                                    {new Date(data.screenshot.created_at).toLocaleString()}
                                </span>
                            </p>
                        </div>
                    )}
                </div>

                <div className="flex-1 relative bg-gray-100/50 min-h-100 flex items-center justify-center group overflow-hidden">
                    {!data.screenshot ? (
                        <div className="text-center p-8">
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 text-gray-300 mb-3 text-3xl">
                                ⏳
                            </div>
                            <p className="text-sm text-gray-400">
                                Select options from the left
                                <br />
                                to load snapshot.
                            </p>
                        </div>
                    ) : data.screenshot.job_status === "failed" ? (
                        <div className="flex flex-col items-center justify-center text-red-400">
                            <span className="text-4xl mb-2">⚠️</span>
                            <span className="text-sm font-bold uppercase tracking-wide">
                                Screenshot Failed
                            </span>
                        </div>
                    ) : (
                        <div className="w-full h-full relative overflow-auto custom-scrollbar">
                            <img
                                src={`${cdn}/${data.screenshot.r2_key}`}
                                className="w-full h-auto object-contain shadow-sm"
                                alt={`${label} Screenshot`}
                            />
                            <a
                                href={`${cdn}/${data.screenshot.r2_key}`}
                                target="_blank"
                                rel="noreferrer"
                                className={`absolute top-2 right-2 bg-white/90 hover:bg-white p-1.5 rounded shadow-sm text-gray-600 ${theme.hover} transition-colors opacity-0 group-hover:opacity-100`}
                                title="Open in new tab"
                            >
                                ↗️
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
