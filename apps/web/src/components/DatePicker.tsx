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

            <span
                aria-hidden="true"
                className="absolute inset-y-0 left-2 flex items-center text-gray-500 text-sm leading-none pointer-events-none"
            >
                &#128466;
            </span>
        </div>
    );
}