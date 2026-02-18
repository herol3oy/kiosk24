import { useQuery, QueryClientProvider } from '@tanstack/preact-query';
import { queryClient } from '../libs/queryClient';
import { navigate } from 'astro:transitions/client';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import { useEffect, useRef } from 'preact/hooks';

const baseUrl = '/api';

interface Props {
    initialDate: string;
}

export default function DatePicker(props: Props) {
    return (
        <QueryClientProvider client={queryClient}>
            <DatePickerInner {...props} />
        </QueryClientProvider>
    );
}

function DatePickerInner({ initialDate }: Props) {
    const inputRef = useRef<HTMLInputElement>(null);
    const fpRef = useRef<flatpickr.Instance | null>(null);

    const { data: availableDates = [] } = useQuery({
        queryKey: ['available-dates'],
        queryFn: async () => {
            const res = await fetch(`${baseUrl}/available-dates`);
            if (!res.ok) return [];
            return res.json() as Promise<string[]>;
        },
        staleTime: 1000 * 60 * 60,
    });

    useEffect(() => {
        if (!inputRef.current || availableDates.length === 0) return;

        if (fpRef.current) fpRef.current.destroy();

        fpRef.current = flatpickr(inputRef.current, {
            defaultDate: initialDate,
            dateFormat: "Y-m-d",
            enable: availableDates,
            disableMobile: true,
            onChange: (selectedDates, dateStr) => {
                if (!dateStr || dateStr === initialDate) return;
                
                const currentUrl = new URL(window.location.href);
                currentUrl.searchParams.set("date", dateStr);
                // Use Astro's client-side router to navigate smoothly
                navigate(currentUrl.toString());
            },
        });

        return () => fpRef.current?.destroy();
    }, [availableDates, initialDate]);

    return (
        <div className="relative">
            <input
                ref={inputRef}
                type="text"
                className="bg-gray-50 border border-gray-300 text-gray-700 text-xs rounded-md focus:ring-blue-500 focus:border-blue-500 block pl-8 p-1.5 w-32 cursor-pointer transition-colors hover:bg-white"
                placeholder="Select Date"
            />
            <svg
                className="w-3 h-3 text-gray-500 absolute left-2.5 top-2 pointer-events-none"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 20 20"
            >
                <path d="M20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4ZM0 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8H0v10Zm5-8h10a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2Z" />
            </svg>
        </div>
    );
}