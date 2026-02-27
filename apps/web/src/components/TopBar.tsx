interface TopBarProps {
	currentPath: string;
	currentUrl: string;
}

export default function TopBar({ currentPath }: TopBarProps) {
	const navLinks = [
		{ name: "History", href: "/" },
		{ name: "Latest", href: "/latest" },
		{ name: "Compare", href: "/compare" },
		{ name: "Status", href: "/status" },
		{
			name: "GitHub",
			href: "https://github.com/herol3oy/kiosk24",
			external: true,
		},
	];

	const isActive = (href: string) =>
		href === "/" ? currentPath === "/" : currentPath.startsWith(href);

	return (
		<header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md">
			<div className="mx-auto max-w-7xl py-3 px-4 sm:px-6 lg:px-8">
				<div className="flex h-16 items-center justify-between gap-4">
					<div className="flex shrink-0 items-center">
						<a
							href="/"
							className="group flex items-center gap-2"
							aria-label="KIOSK24 Home"
						>
							<img
								src="/kiosk24-logo.svg"
								alt="KIOSK24"
								className="h-14 w-auto"
							/>
						</a>
					</div>

					<nav
						aria-label="Main navigation"
						className="flex overflow-x-auto py-2 no-scrollbar"
					>
						<ul className="flex flex-nowrap items-center gap-1.5 rounded-xl bg-slate-100/80 p-1.5">
							{navLinks.map((link) => {
								const active = isActive(link.href);

								return (
									<li key={link.name} className="shrink-0">
										<a
											href={link.href}
											target={link.external ? "_blank" : undefined}
											rel={link.external ? "noopener noreferrer" : undefined}
											aria-current={active ? "page" : undefined}
											className={`flex items-center gap-1 px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
												active
													? "bg-white text-blue-700 shadow-sm ring-1 ring-slate-200/50"
													: "text-slate-600 hover:bg-slate-200/50 hover:text-slate-900"
											}`}
										>
											{link.name}
											{link.external && (
												<svg
													className="h-3.5 w-3.5"
													fill="none"
													viewBox="0 0 24 24"
													stroke="currentColor"
													strokeWidth={2}
													aria-hidden="true"
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
													/>
												</svg>
											)}
										</a>
									</li>
								);
							})}
						</ul>
					</nav>
				</div>
			</div>
		</header>
	);
}
