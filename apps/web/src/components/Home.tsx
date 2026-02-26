import { useMemo, useState } from "preact/hooks";
import DatePicker from "./DatePicker";
import LanguageFilter from "./LanguageFilter";
import UrlRow from "./UrlRow";

interface UrlData {
	url: string;
	language: string;
}

interface HomeProps {
	initialUrls: UrlData[];
	languages: string[];
	availableDates: string[];
	currentDate: string;
	initialLangParams: string[];
	currentDevice: string;
	cdn: string;
	error: string | null;
}

export default function Home({
	initialUrls,
	languages,
	availableDates,
	currentDate,
	initialLangParams,
	currentDevice,
	cdn,
	error,
}: HomeProps) {
	const [selectedLangs, setSelectedLangs] =
		useState<string[]>(initialLangParams);

	const filteredUrls = useMemo(() => {
		if (selectedLangs.length === 0) return initialUrls;
		return initialUrls.filter((u) => selectedLangs.includes(u.language));
	}, [initialUrls, selectedLangs]);

	if (error) {
		return (
			<div className="flex flex-col gap-1 p-5 bg-red-50 border-l-4 border-red-500 rounded-r-xl text-red-800 shadow-sm">
				<h2 className="text-sm font-bold uppercase tracking-wide text-red-600">
					Notice
				</h2>
				<p className="text-base">{error}</p>
			</div>
		);
	}

	return (
		<>
			<h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-6">
				Today’s Snapshot Timeline
			</h1>

			<div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-2 rounded-2xl shadow-sm border border-slate-200">
				<LanguageFilter
					languages={languages}
					initialLangParams={initialLangParams}
					onChange={setSelectedLangs}
				/>

				<div className="shrink-0 relative z-10 w-full md:w-auto flex justify-end">
					<DatePicker
						initialDate={currentDate}
						availableDates={availableDates}
					/>
				</div>
			</div>

			<div className="space-y-4 mt-8">
				<p className="text-sm font-medium text-slate-500">
					{filteredUrls.length} {filteredUrls.length === 1 ? "URL" : "URLs"}
				</p>

				{filteredUrls.length === 0 ? (
					<div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50">
						<div className="rounded-full bg-slate-100 p-3 mb-3">
							<svg
								className="w-6 h-6 text-slate-400"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<title>No URLs Found</title>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
								/>
							</svg>
						</div>
						<h3 className="text-sm font-medium text-slate-900">
							No URLs found
						</h3>
						<p className="text-sm text-slate-500 mt-1">
							Try adjusting your language filters or selecting a different date.
						</p>
					</div>
				) : (
					<div className="grid gap-4">
						{filteredUrls.map((u) => (
							<UrlRow
								key={u.url}
								url={u.url}
								initialDevice={currentDevice}
								date={currentDate}
								cdn={cdn}
							/>
						))}
					</div>
				)}
			</div>
		</>
	);
}
