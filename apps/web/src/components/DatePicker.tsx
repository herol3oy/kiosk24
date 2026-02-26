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
		<div className="relative z-50">
			<input
				ref={inputRef}
				type="text"
				className="bg-gray-50 border border-gray-300 text-gray-700 text-xs rounded-md focus:ring-blue-500 focus:border-blue-500 block pl-8 p-1.5 w-32 cursor-pointer transition-colors hover:bg-white"
				placeholder="Select Date"
			/>

			<span
				aria-hidden="true"
				className="absolute inset-y-0 left-2 flex items-center text-gray-500 text-sm leading-none pointer-events-none"
			>
				&#128466;
			</span>
		</div>
	);
}
