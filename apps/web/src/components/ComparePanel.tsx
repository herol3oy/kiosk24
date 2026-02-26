import type { UrlEntry } from "@kiosk24/shared";
import { QueryClientProvider, useQuery } from "@tanstack/preact-query";
import type { ComponentChildren } from "preact";
import { useEffect, useState } from "preact/hooks";
import { queryClient } from "../libs/queryClient";

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
	device: string | null;
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
	deviceParam: string | null,
): Promise<PanelData> {
	const data: PanelData = { dates: [], hours: [], screenshot: null };
	if (!urlParam) return data;

	try {
		const datesRes = await fetch(
			`${baseUrl}/available-dates?url=${encodeURIComponent(urlParam)}`,
		);
		if (datesRes.ok) data.dates = await datesRes.json();

		if (!dateParam) return data;

		const device = deviceParam || "mobile";
		const shotsRes = await fetch(
			`${baseUrl}/screenshots?url=${encodeURIComponent(urlParam)}&date=${dateParam}&device=${encodeURIComponent(
				device,
			)}`,
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
			<div className="w-full h-full min-h-[500px]">
				<div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-full animate-pulse flex flex-col">
					<div className="h-12 border-b border-slate-100 bg-slate-50/80 w-full" />
					<div className="flex flex-1">
						<div className="w-64 border-r border-slate-100 bg-slate-50/30 hidden md:block" />
						<div className="flex-1 bg-slate-50/50" />
					</div>
				</div>
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
	device,
}: ComparePanelProps) {
	const isLeft = side === "left";
	const label = isLeft ? "Left View" : "Right View";
	const paramPrefix = side[0];

	const theme = isLeft
		? { dot: "bg-blue-500 shadow-blue-500/50", hover: "hover:text-blue-600" }
		: {
				dot: "bg-indigo-500 shadow-indigo-500/50",
				hover: "hover:text-indigo-600",
			};

	const { data: allUrls = [], isLoading: urlsLoading } = useQuery<UrlEntry[]>({
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
		queryKey: [side, url, date, hour, device],
		queryFn: () => fetchPanelData(baseUrl, url, date, hour, device),
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
			<div className="space-y-1.5">
				<label
					htmlFor={selectId}
					className="text-[10px] uppercase tracking-wider font-bold text-slate-500 pl-1"
				>
					{num}. {labelTxt}
				</label>

				<select
					id={selectId}
					className="panel-select w-full bg-white border border-slate-300 text-slate-900 text-sm rounded-xl px-3 py-2.5 shadow-sm disabled:opacity-60 disabled:bg-slate-50 disabled:cursor-not-allowed focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer"
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
		<section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full transition-all">
			<div className="px-4 py-3.5 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between">
				<div className="flex items-center gap-2.5">
					<span
						className={`w-2.5 h-2.5 rounded-full shadow-sm ${theme.dot}`}
					></span>
					<h3 className="text-sm font-bold text-slate-800">{label}</h3>
				</div>
				{url && (
					<span className="shrink-0 px-2.5 py-0.5 rounded-full bg-slate-200/50 text-slate-600 font-semibold text-[10px] tracking-wider uppercase border border-slate-200/50 truncate max-w-37.5 sm:max-w-50">
						{getUrlMeta(url).cleanHost}
					</span>
				)}
			</div>

			<div className="flex flex-col md:flex-row h-full overflow-hidden">
				<div className="p-4 md:w-64 md:border-r border-b md:border-b-0 border-slate-100 bg-slate-50/40 flex flex-col gap-5 shrink-0 overflow-y-auto custom-scrollbar">
					<SelectGroup
						num={1}
						labelTxt="Select URL"
						value={url}
						disabled={urlsLoading}
						onChange={(val: string) =>
							updateUrlParams(`${paramPrefix}_url`, val, [
								`${paramPrefix}_device`,
								`${paramPrefix}_date`,
								`${paramPrefix}_hour`,
							])
						}
					>
						<option value="">
							{urlsLoading ? "Loading..." : "Select URL"}
						</option>
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
						<div className="mt-auto pt-5 border-t border-slate-200/60 text-[11px] text-slate-500 space-y-1.5 flex flex-col">
							<p className="flex justify-between">
								<span>Status:</span>
								<span
									className={`font-semibold capitalize ${data.screenshot.job_status === "ok" ? "text-emerald-600" : "text-red-500"}`}
								>
									{data.screenshot.job_status}
								</span>
							</p>
							<p className="flex justify-between flex-wrap gap-1">
								<span>Captured:</span>
								<span className="font-mono text-slate-700">
									{new Date(data.screenshot.created_at).toLocaleString([], {
										month: "short",
										day: "numeric",
										hour: "2-digit",
										minute: "2-digit",
									})}
								</span>
							</p>
						</div>
					)}
				</div>

				<div className="flex-1 relative bg-slate-100/50 min-h-75 md:min-h-0 flex items-center justify-center overflow-hidden">
					{!data.screenshot ? (
						<div className="text-center p-8 flex flex-col items-center">
							<div className="flex items-center justify-center w-14 h-14 rounded-full bg-slate-200/50 text-slate-400 mb-4 shadow-sm">
								<svg
									className="w-6 h-6"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<title>Desktop View</title>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
										d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
									></path>
								</svg>
							</div>
							<p className="text-sm text-slate-500 font-medium">
								Select options from the left
								<br />
								to load a snapshot.
							</p>
						</div>
					) : data.screenshot.job_status === "failed" ? (
						<div className="flex flex-col items-center justify-center text-slate-500">
							<svg
								className="w-10 h-10 mb-3 text-red-400"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<title>Desktop View</title>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
								></path>
							</svg>
							<span className="text-xs font-bold uppercase tracking-wider">
								Screenshot Failed
							</span>
						</div>
					) : (
						<div className="flex flex-col w-full h-full bg-white">
							<div className="flex-1 relative overflow-auto custom-scrollbar group/img">
								<img
									src={`${cdn}/${data.screenshot.r2_key}`}
									className="w-full h-auto object-contain"
									alt={`${label} Screenshot`}
								/>
								<a
									href={`${cdn}/${data.screenshot.r2_key}`}
									target="_blank"
									rel="noreferrer"
									className={`absolute top-4 right-4 bg-white/90 backdrop-blur hover:bg-white p-2.5 rounded-xl shadow-md text-slate-500 ${theme.hover} transition-all duration-200 opacity-0 group-hover/img:opacity-100 scale-95 group-hover/img:scale-100 ring-1 ring-slate-900/5`}
									title="Open full image in new tab"
								>
									<svg
										className="w-4 h-4"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<title>Open full image in new tab</title>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth="2"
											d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
										></path>
									</svg>
								</a>
							</div>

							<div className="shrink-0 border-t border-slate-100 bg-slate-50/80 p-3 flex justify-center items-center">
								<div className="flex items-center p-1 bg-slate-200/50 rounded-xl shadow-inner border border-slate-200/60">
									<button
										type="button"
										onClick={() =>
											updateUrlParams(`${paramPrefix}_device`, "desktop", [])
										}
										className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
											!device || device === "desktop"
												? "bg-white text-slate-800 shadow-sm ring-1 ring-slate-200/50"
												: "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
										}`}
									>
										<svg
											className="w-4 h-4"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<title>Desktop View</title>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth="2"
												d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
											></path>
										</svg>
										Desktop
									</button>
									<button
										type="button"
										onClick={() =>
											updateUrlParams(`${paramPrefix}_device`, "mobile", [])
										}
										className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
											device === "mobile"
												? "bg-white text-slate-800 shadow-sm ring-1 ring-slate-200/50"
												: "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
										}`}
									>
										<svg
											className="w-4 h-4"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<title>Mobile View</title>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth="2"
												d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
											></path>
										</svg>
										Mobile
									</button>
								</div>
							</div>
						</div>
					)}
				</div>
			</div>
		</section>
	);
}
