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
	];

	const isActive = (href: string) =>
		href === "/" ? currentPath === "/" : currentPath.startsWith(href);

	return (
		<header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="flex h-16 items-center justify-between gap-4">
					<div className="flex shrink-0 items-center">
						<a
							href="/"
							className="group flex items-center gap-2"
							aria-label="KIOSK24 Home"
						>
							<span className="rounded-lg bg-linear-to-tr from-blue-700 to-blue-500 px-3 py-1.5 text-sm font-bold tracking-wide text-white shadow-sm transition-transform group-hover:scale-105">
								KIOSK24
							</span>
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
											aria-current={active ? "page" : undefined}
											className={`flex items-center px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
												active
													? "bg-white text-blue-700 shadow-sm ring-1 ring-slate-200/50"
													: "text-slate-600 hover:bg-slate-200/50 hover:text-slate-900"
											}`}
										>
											{link.name}
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
