import { useState, useRef } from 'preact/hooks';
import { useQuery, useMutation, QueryClientProvider } from '@tanstack/preact-query';
import { queryClient } from '../libs/queryClient';

interface UrlEntry {
    id: string;
    url: string;
    language: string;
    created_at: string;
}

export default function DashboardWrapper() {
    return (
        <QueryClientProvider client={queryClient}>
            <Dashboard />
        </QueryClientProvider>
    );
}

function Dashboard() {
    const [formError, setFormError] = useState<string | null>(null);
    const formRef = useRef<HTMLFormElement>(null);

    const { data: urls = [], isLoading, isError } = useQuery({
        queryKey: ['urls'],
        queryFn: async () => {
            const res = await fetch('/api/urls');
            if (!res.ok) throw new Error('Failed to fetch');
            return res.json() as Promise<UrlEntry[]>;
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(`/api/urls/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete');
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['urls'] }),
    });

    const addMutation = useMutation({
        mutationFn: async (formData: { url: string; language: string }) => {
            const res = await fetch('/api/urls', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                const err = await res.json() as { error?: string };
                throw new Error(err.error || 'Failed to create');
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['urls'] });
            setFormError(null);
            formRef.current?.reset();
        },
        onError: (err) => {
            if (err instanceof Error) {
                setFormError(err.message);
            } else {
                setFormError("An unexpected error occurred");
            }
        },
    });

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this URL?')) {
            deleteMutation.mutate(id);
        }
    };

    const handleSubmit = (e: Event) => {
        e.preventDefault();

        const formData = new FormData(e.currentTarget as HTMLFormElement);

        addMutation.mutate({
            url: formData.get('url') as string,
            language: formData.get('language') as string,
        });
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="mt-1 text-sm text-gray-500">Manage the URLs and languages tracked by your kiosk.</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
                <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                    <h2 className="text-base font-semibold text-gray-900">Add New URL</h2>
                </div>
                <div className="p-6">
                    <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
                        <div className="grow">
                            <label htmlFor="url" className="sr-only">URL</label>
                            <input
                                type="url"
                                name="url"
                                id="url"
                                placeholder="https://example.com"
                                required
                                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-4 py-2.5 border"
                            />
                        </div>
                        <div className="w-full sm:w-32"> 
                            <label htmlFor="language" className="sr-only">Language</label>
                            <input
                                type="text"
                                name="language"
                                id="language"
                                placeholder="Lang (fa, en)"
                                required
                                maxLength={5}
                                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-4 py-2.5 border"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={addMutation.isPending}
                            className="inline-flex justify-center items-center px-6 py-2.5 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {addMutation.isPending ? (
                                <span>Adding...</span>
                            ) : (
                                <>
                                    <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                                    </svg>
                                    Add
                                </>
                            )}
                        </button>
                    </form>
                    {formError && (
                        <p className="mt-2 text-sm text-red-600">{formError}</p>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
                    <h3 className="text-base font-semibold text-gray-900">Monitored URLs</h3>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {urls.length} items
                    </span>
                </div>

                <ul className="divide-y divide-gray-200">
                    {isLoading && (
                        <li className="p-12 text-center text-gray-500">Loading data...</li>
                    )}

                    {isError && (
                        <li className="p-12 text-center text-red-500">Error loading data.</li>
                    )}

                    {!isLoading && urls.length === 0 && (
                        <li className="p-12 text-center flex flex-col items-center text-gray-400">
                            <span className="text-sm">No URLs found. Add one above.</span>
                        </li>
                    )}

                    {urls.map((item) => {
                        let hostname = item.url;
                        try { hostname = new URL(item.url).hostname; } catch (e) { }
                        const favicon = `https://www.google.com/s2/favicons?domain=${item.url}&sz=32`;

                        return (
                            <li key={item.id} className="hover:bg-gray-50 transition-colors duration-150">
                                <div className="px-6 py-4 flex items-center justify-between">
                                    <div className="flex items-center min-w-0 gap-4">
                                        <img src={favicon} alt="" className="h-8 w-8 rounded bg-gray-100 p-0.5" />
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-blue-600 truncate">
                                                <a href={item.url} target="_blank" rel="noreferrer" className="hover:underline">{hostname}</a>
                                            </p>
                                            <p className="text-xs text-gray-500 truncate">{item.url}</p>
                                        </div>
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 uppercase tracking-wide border border-gray-200">
                                            {item.language}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        disabled={deleteMutation.isPending}
                                        className="text-gray-400 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition-all"
                                        title="Delete"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                        </svg>
                                    </button>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </div>
    );
}