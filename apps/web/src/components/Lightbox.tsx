import { useCallback, useEffect, useState } from "preact/hooks";

export interface LightboxImage {
	src: string;
	alt: string;
	title: string;
	url: string;
	date: string;
	badge?: string;
}

interface LightboxProps {
	images: LightboxImage[];
	initialIndex: number;
	isOpen: boolean;
	onClose: () => void;
}

export default function Lightbox({
	images,
	initialIndex,
	isOpen,
	onClose,
}: LightboxProps) {
	const [currentIndex, setCurrentIndex] = useState(initialIndex);

	useEffect(() => {
		if (isOpen) setCurrentIndex(initialIndex);
	}, [isOpen, initialIndex]);

	const handleNext = useCallback(
		(e?: Event) => {
			e?.stopPropagation();
			setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
		},
		[images.length],
	);

	const handlePrev = useCallback(
		(e?: Event) => {
			e?.stopPropagation();
			setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
		},
		[images.length],
	);

	useEffect(() => {
		if (!isOpen) return;

		document.body.style.overflow = "hidden";

		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
			if (e.key === "ArrowRight") handleNext();
			if (e.key === "ArrowLeft") handlePrev();
		};

		window.addEventListener("keydown", handleKeyDown);

		return () => {
			document.body.style.overflow = "";
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, [isOpen, onClose, handleNext, handlePrev]);

	if (!isOpen || images.length === 0) return null;

	const currentImage = images[currentIndex];

	return (
		<div
			className="fixed inset-0 z-100 flex flex-col items-center justify-center transition-opacity"
			role="dialog"
			aria-modal="true"
		>
			<button
				type="button"
				className="absolute inset-0 w-full h-full bg-black/95 backdrop-blur-sm z-0 cursor-default focus:outline-none"
				onClick={onClose}
				aria-label="Close Lightbox"
				tabIndex={-1}
			/>

			<div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start z-10 pointer-events-none">
				<div className="px-3 py-1.5 bg-black/50 text-white/90 rounded-full text-xs font-semibold tracking-wide border border-white/10 pointer-events-auto">
					{currentIndex + 1} / {images.length}
				</div>

				<button
					type="button"
					onClick={(e) => {
						e.stopPropagation();
						onClose();
					}}
					className="p-2 text-white/70 hover:text-white bg-black/40 hover:bg-black/60 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 pointer-events-auto"
					aria-label="Close Lightbox"
				>
					<svg
						className="w-6 h-6 sm:w-8 sm:h-8"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<title>Close</title>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth="2"
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</button>
			</div>

			<div className="relative z-10 flex items-center justify-center w-full h-full max-w-7xl px-12 sm:px-16 py-16 pointer-events-none">
				<img
					src={currentImage.src}
					alt={currentImage.alt}
					className="max-h-full max-w-full object-contain drop-shadow-2xl animate-in fade-in zoom-in duration-200 pointer-events-auto"
				/>
			</div>

			{images.length > 1 && (
				<>
					<button
						type="button"
						onClick={handlePrev}
						className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-3 text-white/70 hover:text-white bg-black/40 hover:bg-black/60 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 z-10"
						aria-label="Previous image"
					>
						<svg
							className="w-8 h-8 sm:w-10 sm:h-10"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<title>Previous</title>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								d="M15 19l-7-7 7-7"
							/>
						</svg>
					</button>
					<button
						type="button"
						onClick={handleNext}
						className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-3 text-white/70 hover:text-white bg-black/40 hover:bg-black/60 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 z-10"
						aria-label="Next image"
					>
						<svg
							className="w-8 h-8 sm:w-10 sm:h-10"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<title>Next</title>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								d="M9 5l7 7-7 7"
							/>
						</svg>
					</button>
				</>
			)}

			<div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 bg-linear-to-t from-black/80 to-transparent flex justify-center pointer-events-none z-10">
				<div className="bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-2xl p-4 sm:px-6 flex flex-col sm:flex-row items-center gap-3 sm:gap-6 shadow-2xl max-w-3xl w-full pointer-events-auto animate-in slide-in-from-bottom-4">
					<div className="flex-1 min-w-0 text-center sm:text-left flex flex-col items-center sm:items-start">
						<div className="flex items-center gap-2 mb-1">
							<h3 className="text-white font-bold text-lg truncate">
								{currentImage.title}
							</h3>
							<a
								href={currentImage.url}
								target="_blank"
								rel="noopener noreferrer"
								className="text-blue-400 hover:text-blue-300 p-1"
								title={`Visit ${currentImage.title}`}
							>
								<svg
									className="w-4 h-4"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<title>External Link</title>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
										d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
									/>
								</svg>
							</a>
						</div>
						<p className="text-slate-400 text-sm font-medium">
							{currentImage.date}
						</p>
					</div>

					{currentImage.badge && (
						<div className="shrink-0 px-3 py-1.5 rounded-lg bg-white/10 border border-white/5 text-white/90 text-xs font-bold tracking-wider uppercase">
							{currentImage.badge}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
