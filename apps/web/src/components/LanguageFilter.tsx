import { useMemo, useState } from "preact/hooks";

interface LanguageFilterProps {
	languages: string[];
	initialLangParams: string[];
	onChange?: (selectedLangs: string[]) => void;
}

export default function LanguageFilter({
	languages,
	initialLangParams,
	onChange,
}: LanguageFilterProps) {
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
		onChange?.(newLangs);
	};

	const clearLangs = (e: Event) => {
		e.preventDefault();
		setSelectedLangs([]);
		updateUrl([]);
		onChange?.([]);
	};

	if (languages.length === 0) return null;

	return (
		<div className="flex flex-col sm:flex-row sm:items-center gap-3 px-2">
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
	);
}
