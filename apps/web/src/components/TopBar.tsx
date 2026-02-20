import DatePicker from "./DatePicker";

interface TopBarProps {
    currentPath: string;
    currentUrl: string;
}

export default function TopBar({ currentPath, currentUrl }: TopBarProps) {
    const navLinks = [
        { name: "History", href: "/" },
        { name: "Latest", href: "/latest" },
        { name: "Compare", href: "/compare" },
    ];

    let urlObj;
    try {
        urlObj = new URL(currentUrl);
    } catch (e) {
        urlObj = new URL("http://localhost");
    }

    const deviceParam = urlObj.searchParams.get("device");
    const dateParam = urlObj.searchParams.get("date");
    const isDesktop = deviceParam !== "mobile";

    const isDashboard = currentPath.includes("/dashboard");
    const isLatest = currentPath.includes("/latest");
    const isCompare = currentPath.includes("/compare");

    const showDatePicker = !isLatest && !isDashboard && !isCompare;
    const showDeviceToggle = !isDashboard && !isCompare;

    const today = new Date().toISOString().split("T")[0];
    const currentDate = dateParam || today;

    function getToggleLink(targetDevice: "mobile" | "desktop") {
        const newUrl = new URL(currentUrl);
        newUrl.searchParams.set("device", targetDevice);
        return newUrl.pathname + newUrl.search;
    }

    return (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="w-full px-4 sm:px-6 py-3 flex items-center justify-between">

                <div className="flex items-center gap-8">
                    <a href="/" className="group flex items-center gap-2 text-xl font-bold tracking-tight text-gray-900">
                        <div className="flex items-center bg-blue-600 text-white px-2 py-1 rounded-md text-sm font-bold shadow-sm transition-all duration-300 ease-out group-hover:bg-blue-700">
                            <span>KIOSK24</span>
                        </div>
                    </a>

                    <nav className="hidden md:flex gap-1 bg-gray-100/50 p-1 rounded-lg">
                        {navLinks.map((link) => {
                            const isActive = link.href === "/"
                                ? currentPath === "/"
                                : currentPath.startsWith(link.href);

                            return (
                                <a
                                    key={link.name}
                                    href={link.href}
                                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${isActive
                                        ? "bg-white shadow-sm text-blue-600"
                                        : "text-gray-500 hover:text-gray-900"
                                        }`}
                                >
                                    {link.name}
                                </a>
                            );
                        })}
                    </nav>
                </div>

                <div className="flex items-center gap-4">
                    {showDatePicker && (
                        <div className="relative">
                            <DatePicker initialDate={currentDate} />
                        </div>
                    )}

                    {showDeviceToggle && (
                        <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200">
                            <a
                                href={getToggleLink("desktop")}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${isDesktop
                                    ? "bg-white shadow-sm text-blue-600"
                                    : "text-gray-500 hover:text-gray-700"
                                    }`}
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                Desktop
                            </a>
                            <a
                                href={getToggleLink("mobile")}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${!isDesktop
                                    ? "bg-white shadow-sm text-blue-600"
                                    : "text-gray-500 hover:text-gray-700"
                                    }`}
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                                Mobile
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}