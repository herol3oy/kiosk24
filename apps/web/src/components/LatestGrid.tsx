import { useState } from "preact/hooks";
import Lightbox from "./Lightbox";

export interface LatestScreenshotItem {
	url: string;
	r2_key: string | null;
	job_status: string;
	language: string;
	created_at: string;
}

interface LatestGridProps {
	data: LatestScreenshotItem[] | null;
	error: string | null;
	cdn: string;
	isDesktop: boolean;
}

export default function LatestGrid({
	data,
	error,
	cdn,
	isDesktop,
}: LatestGridProps) {
	const [lightboxOpen, setLightboxOpen] = useState(false);
	const [lightboxIndex, setLightboxIndex] = useState(0);

	const thumbWidth = isDesktop ? 600 : 400;

	const gridClass = isDesktop
		? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3"
		: "grid-cols-2 md:grid-cols-3 lg:grid-cols-5";

	const aspectClass = isDesktop ? "aspect-16/10" : "aspect-9/16";

	const buildImageUrls = (
		cdnUrl: string,
		key: string | null,
		width: number,
	) => ({
		full: cdnUrl.includes("localhost")
			? `${cdnUrl}/${key}`
			: `${cdnUrl}/cdn-cgi/image/width=1600,quality=60,format=auto/${key}`,
		thumb: cdnUrl.includes("localhost")
			? `${cdnUrl}/${key}`
			: `${cdnUrl}/cdn-cgi/image/width=${width},quality=50,fit=cover,format=auto/${key}`,
	});

	const getHostname = (url: string) => {
		try {
			return new URL(url).hostname.replace("www.", "");
		} catch {
			return url;
		}
	};

	if (error) {
		return (
			<div className="flex flex-col items-center justify-center py-20 px-4 text-center rounded-2xl border-2 border-dashed border-red-200 bg-red-50 max-w-7xl mx-auto">
				<div className="rounded-full bg-red-100 p-3 mb-3 text-red-500">
					<svg
						className="w-8 h-8"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<title>Error</title>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth="2"
							d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
						/>
					</svg>
				</div>
				<p className="text-base text-red-800 font-medium">{error}</p>
			</div>
		);
	}

	if (!data) return null;

	const validScreenshots = data.filter((item) => item.job_status === "ok");
	const lightboxImages = validScreenshots.map((item) => ({
		src: buildImageUrls(cdn, item.r2_key, thumbWidth).full,
		alt: `Screenshot of ${getHostname(item.url)}`,
		title: getHostname(item.url),
		url: item.url,
		date: new Date(item.created_at).toLocaleString([], {
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		}),
		badge: item.language,
	}));

	return (
		<>
			<div className={`grid gap-6 max-w-7xl mx-auto ${gridClass}`}>
				{data.map((item) => {
					const hostname = getHostname(item.url);
					const favicon = `https://www.google.com/s2/favicons?domain=${item.url}&sz=64`;
					const isOk = item.job_status === "ok";
					const images = buildImageUrls(cdn, item.r2_key, thumbWidth);

					const validIndex = validScreenshots.findIndex(
						(s) => s.url === item.url && s.language === item.language,
					);

					return (
						<article
							key={item.url + item.language}
							className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col group/card"
						>
							<div className="px-3 py-2.5 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between">
								<div className="flex items-center gap-2.5 overflow-hidden">
									<div className="p-1 bg-white rounded-md shadow-sm border border-slate-100 shrink-0">
										<img
											src={favicon}
											alt=""
											loading="lazy"
											className="w-3.5 h-3.5"
										/>
									</div>
									<h3
										className="text-xs font-bold text-slate-700 truncate"
										title={item.url}
									>
										{hostname}
									</h3>
								</div>
								<span className="shrink-0 px-2 py-0.5 rounded-full bg-slate-200/50 text-slate-600 font-semibold text-[10px] tracking-wider uppercase border border-slate-200/50">
									{item.language}
								</span>
							</div>

							<div
								className={`relative bg-slate-100 border-b border-slate-100 group ${aspectClass}`}
							>
								{!isOk ? (
									<div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 bg-slate-50">
										<svg
											className="w-8 h-8 mb-2 text-red-400"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<title>Error</title>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth="2"
												d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
											/>
										</svg>
										<span className="text-xs font-bold uppercase tracking-wider text-slate-500">
											Failed
										</span>
									</div>
								) : (
									<>
										<img
											src={images.thumb}
											srcSet={
												isDesktop
													? `${images.thumb} 1x, ${images.full} 2x`
													: undefined
											}
											alt={`Screenshot of ${hostname}`}
											loading="lazy"
											decoding="async"
											className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-700 group-hover/card:scale-105"
										/>
										<div className="absolute inset-0 bg-black/0 group-hover/card:bg-black/5 transition-colors duration-300 pointer-events-none" />
									</>
								)}

								{isOk ? (
									<button
										type="button"
										onClick={(e) => {
											e.preventDefault();
											setLightboxIndex(validIndex);
											setLightboxOpen(true);
										}}
										className="absolute inset-0 w-full h-full cursor-zoom-in focus:outline-none focus:ring-2 focus:ring-blue-500 z-10"
										aria-label={`View screenshot of ${hostname} in lightbox`}
									>
										<span className="sr-only">
											View screenshot of {hostname}
										</span>
									</button>
								) : (
									<a
										href={item.url}
										target="_blank"
										rel="noreferrer"
										className="absolute inset-0 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 z-10"
										aria-label={`Visit site ${hostname} (opens in new tab)`}
									>
										<span className="sr-only">Visit site {hostname}</span>
									</a>
								)}
							</div>

							<div className="px-4 py-2.5 bg-white flex justify-between items-center text-[11px] text-slate-400 font-medium">
								<time
									dateTime={item.created_at}
									className="flex items-center gap-1.5"
								>
									<svg
										className="w-3.5 h-3.5"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<title>Created At</title>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth="2"
											d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
										/>
									</svg>
									{new Date(item.created_at).toLocaleString([], {
										month: "short",
										day: "numeric",
										hour: "2-digit",
										minute: "2-digit",
									})}
								</time>
							</div>
						</article>
					);
				})}
			</div>

			<Lightbox
				images={lightboxImages}
				initialIndex={lightboxIndex}
				isOpen={lightboxOpen}
				onClose={() => setLightboxOpen(false)}
			/>
		</>
	);
}
