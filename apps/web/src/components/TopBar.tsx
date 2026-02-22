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
        <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
            <div className="flex items-center justify-between px-4 py-3 sm:px-6">

                <div className="flex flex-col items-center gap-3 w-full sm:flex-row sm:items-center sm:justify-between">

                    <a
                        href="/"
                        className="text-xl font-bold tracking-tight text-gray-900"
                        aria-label="KIOSK24 Home"
                    >
                        <span className="rounded-md bg-blue-600 px-2 py-1 text-sm font-bold text-white transition hover:bg-blue-700">
                            KIOSK24
                        </span>
                    </a>

                    <nav aria-label="Main navigation" className="w-full sm:w-auto">
                        <ul className="flex flex-wrap justify-center sm:justify-start gap-1 rounded-lg bg-gray-100/50 p-1">
                            {navLinks.map((link) => {
                                const active = isActive(link.href);

                                return (
                                    <li key={link.name}>
                                        <a
                                            href={link.href}
                                            aria-current={active ? "page" : undefined}
                                            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${active
                                                    ? "bg-white text-blue-600 shadow-sm"
                                                    : "text-gray-500 hover:text-gray-900"
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