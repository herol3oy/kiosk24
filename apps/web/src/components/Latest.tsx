import { QueryClientProvider, useQuery } from "@tanstack/preact-query";
import { useEffect, useMemo, useState } from "preact/hooks";
import { queryClient } from "../libs/queryClient";
import LanguageFilter from "./LanguageFilter";
import LatestGrid, { type LatestScreenshotItem } from "./LatestGrid";

interface Props {
	initialData: LatestScreenshotItem[] | null;
	initialError: string | null;
	cdn: string;
	initialDevice: string;
	languages: string[];
	initialLangParams: string[];
}

function LatestInner({
	initialData,
	initialError,
	cdn,
	initialDevice,
	languages,
	initialLangParams,
}: Props) {
	const [device, setDevice] = useState(initialDevice);
	const [selectedLangs, setSelectedLangs] =
		useState<string[]>(initialLangParams);

	useEffect(() => {
		const url = new URL(window.location.href);
		if (device === "mobile") {
			url.searchParams.set("device", device);
		} else {
			url.searchParams.delete("device");
		}
		window.history.replaceState(null, "", url.toString());
	}, [device]);

	const filteredData = useMemo(() => {
		if (!initialData) return null;
		if (selectedLangs.length === 0) return initialData;
		return initialData.filter((item) => selectedLangs.includes(item.language));
	}, [initialData, selectedLangs]);

	const { data, error, isLoading } = useQuery({
		queryKey: ["latest", device],
		queryFn: async () => {
			const res = await fetch(`/api/latest?device=${device}`);
			if (!res.ok) throw new Error("Failed to fetch latest screenshots");
			return (await res.json()) as LatestScreenshotItem[];
		},
		initialData:
			device === initialDevice && initialData ? initialData : undefined,
	});

	const displayData =
		selectedLangs.length === 0 ? data || filteredData : filteredData || data;
	const displayError = error ? (error as Error).message : initialError;

	return (
		<div className="space-y-6">
			<h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
				News in the Last Hour
			</h1>

			<div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-2 rounded-2xl shadow-sm border border-slate-200">
				<LanguageFilter
					languages={languages}
					initialLangParams={initialLangParams}
					onChange={setSelectedLangs}
				/>

				<div className="shrink-0 px-2 pb-2 md:pb-0 relative z-10 w-full md:w-auto flex justify-end">
					<div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-sm">
						<button
							type="button"
							onClick={() => setDevice("desktop")}
							className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
								device === "desktop"
									? "bg-white shadow-sm text-blue-700 ring-1 ring-slate-200/50"
									: "text-slate-500 hover:text-slate-800 hover:bg-slate-200/50"
							}`}
						>
							Desktop
						</button>
						<button
							type="button"
							onClick={() => setDevice("mobile")}
							className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
								device === "mobile"
									? "bg-white shadow-sm text-blue-700 ring-1 ring-slate-200/50"
									: "text-slate-500 hover:text-slate-800 hover:bg-slate-200/50"
							}`}
						>
							Mobile
						</button>
					</div>
				</div>
			</div>

			<div
				className={`transition-opacity duration-300 ${isLoading ? "opacity-60 pointer-events-none" : "opacity-100"}`}
			>
				<LatestGrid
					data={displayData || null}
					error={displayError}
					cdn={cdn}
					isDesktop={device === "desktop"}
				/>
			</div>
		</div>
	);
}

export default function Latest(props: Props) {
	return (
		<QueryClientProvider client={queryClient}>
			<LatestInner {...props} />
		</QueryClientProvider>
	);
}
