import flatpickr from "flatpickr";
import { useEffect, useRef } from "preact/hooks";
import "flatpickr/dist/flatpickr.min.css";
import { navigate } from "astro:transitions/client";

interface Props {
	initialDate: string;
	availableDates: string[];
}

export default function DatePicker({ initialDate, availableDates }: Props) {
	const inputRef = useRef<HTMLInputElement>(null);
	const fpRef = useRef<flatpickr.Instance | null>(null);

	useEffect(() => {
		if (!inputRef.current || availableDates.length === 0) return;

		if (fpRef.current) {
			fpRef.current.destroy();
		}

		fpRef.current = flatpickr(inputRef.current, {
			defaultDate: initialDate,
			dateFormat: "Y-m-d",
			enable: availableDates,
			disableMobile: true,
			onChange: (_selectedDates, dateStr) => {
				if (!dateStr || dateStr === initialDate) return;

				const currentUrl = new URL(window.location.href);
				currentUrl.searchParams.set("date", dateStr);

				navigate(currentUrl.toString());
			},
		});

		return () => {
			fpRef.current?.destroy();
		};
	}, [availableDates, initialDate]);

	return (
		<div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-sm">
			<div className="relative z-50">
				<input
					ref={inputRef}
					type="text"
					className="bg-white text-slate-700 text-sm font-semibold rounded-lg pl-8 pr-5 py-2 w-auto cursor-pointer transition-all duration-200 hover:bg-slate-50 focus:outline-none"
					placeholder="Select Date"
				/>

				<span
					aria-hidden="true"
					className="absolute inset-y-0 left-2 flex items-center text-slate-400 text-sm leading-none pointer-events-none"
				>
					&#128466;
				</span>
			</div>
		</div>
	);
}
