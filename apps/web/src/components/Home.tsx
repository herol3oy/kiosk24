import { useMemo, useState } from "preact/hooks";
import DatePicker from "./DatePicker";
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

	const languageNames = useMemo(
		() => new Intl.DisplayNames(["en"], { type: "language" }),
		[],
	);

	const updateUrl = (newLangs: string[]) => {
		const newUrl = new URL(window.location.href);
		newUrl.searchParams.delete("lang");
		newLangs.forEach((l) => {
			newUrl.searchParams.append("lang", l);
		});
		window.history.replaceState(null, "", newUrl.toString());
	};

	const toggleLang = (lang: string, e: Event) => {
		e.preventDefault();
		const newLangs = selectedLangs.includes(lang)
			? selectedLangs.filter((l) => l !== lang)
			: [...selectedLangs, lang];

		setSelectedLangs(newLangs);
		updateUrl(newLangs);
	};

	const clearLangs = (e: Event) => {
		e.preventDefault();
		setSelectedLangs([]);
		updateUrl([]);
	};

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
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-2 rounded-2xl shadow-sm border border-slate-200">
				{languages.length > 0 && (
					<div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full md:w-auto px-2 py-1">
						<span className="text-xs font-semibold text-slate-400 uppercase tracking-widest shrink-0">
							Language
						</span>

						<div className="flex flex-wrap items-center gap-2">
							<button
								type="button"
								onClick={clearLangs}
								className={`inline-flex items-center justify-center px-4 py-1.5 text-sm font-medium rounded-full transition-all duration-200 ${
									selectedLangs.length === 0
										? "bg-slate-800 text-white shadow-md"
										: "bg-slate-100 text-slate-600 hover:bg-slate-200"
								}`}
							>
								All
							</button>

							<div className="h-5 w-px bg-slate-200 hidden sm:block mx-1" />

							{languages.map((lang) => {
								const isSelected = selectedLangs.includes(lang);

								return (
									<button
										type="button"
										key={lang}
										onClick={(e) => toggleLang(lang, e)}
										className={`inline-flex items-center justify-center px-4 py-1.5 text-sm font-medium rounded-full border transition-all duration-200 ${
											isSelected
												? "bg-blue-50 border-blue-200 text-blue-700 shadow-sm ring-1 ring-blue-500"
												: "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
										}`}
									>
										{isSelected && (
											<svg
												className="w-3.5 h-3.5 mr-1.5 text-blue-600"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
												aria-hidden="true"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth="3"
													d="M5 13l4 4L19 7"
												/>
											</svg>
										)}
										{languageNames.of(lang) || lang}
									</button>
								);
							})}
						</div>
					</div>
				)}

				<div className="shrink-0 px-2 pb-2 md:pb-0 relative z-10 w-full md:w-auto flex justify-end">
					<DatePicker
						initialDate={currentDate}
						availableDates={availableDates}
					/>
				</div>
			</div>

			<div className="space-y-4 mt-8">
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
