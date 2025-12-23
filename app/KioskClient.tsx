"use client";

import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Iceland } from "next/font/google";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  ReactCompareSlider,
  ReactCompareSliderImage,
} from "react-compare-slider";
import { DayPicker } from "react-day-picker";
import { FreeMode, Mousewheel } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/free-mode";
import "react-day-picker/dist/style.css";

import type { Screenshot } from "./queries";
import { activeDatesOptions, screenshotsOptions } from "./queries";

// --- ICONS & STYLES ---

const geistSans = Iceland({
  variable: "--font-iceland-sans",
  weight: "400",
});

const Icons = {
  Monitor: ({ className }: { className?: string }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <title>icon</title>
      <rect width="20" height="14" x="2" y="3" rx="2" />
      <line x1="8" x2="16" y1="21" y2="21" />
      <line x1="12" x2="12" y1="17" y2="21" />
    </svg>
  ),
  Smartphone: ({ className }: { className?: string }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <title>icon</title>
      <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
      <path d="M12 18h.01" />
    </svg>
  ),
  Split: ({ className }: { className?: string }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <title>icon</title>
      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
      <line x1="12" x2="12" y1="3" y2="21" />
    </svg>
  ),
  Calendar: ({ className }: { className?: string }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <title>icon</title>
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  ),
  ChevronDown: ({ className }: { className?: string }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <title>icon</title>
      <path d="m6 9 6 6 6-6" />
    </svg>
  ),
};

const DEFAULT_SITES = ["theguardian.com", "bbc.com", "aljazeera.com"];

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function optimizedImage(url: string, width = 600) {
  return url.replace("/upload/", `/upload/f_auto,q_auto,w_${width}/`);
}

export function KioskClient() {
  const [date, setDate] = useState<Date>(new Date());
  const [visibleUrls, setVisibleUrls] = useState<string[]>(DEFAULT_SITES);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [deviceMode, setDeviceMode] = useState<"desktop" | "mobile">("desktop");

  const { data: activeDatesIso } = useSuspenseQuery(activeDatesOptions);

  const activeDates = activeDatesIso.map((d: string) => new Date(d));

  const { data: screenshots = [], isLoading } = useQuery(
    screenshotsOptions(date, deviceMode),
  );

  const [selectedShot, setSelectedShot] = useState<Screenshot | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isVersusOpen, setIsVersusOpen] = useState(false);
  const [showControls, setShowControls] = useState(true);

  const [leftSite, setLeftSite] = useState<string>("");
  const [leftShot, setLeftShot] = useState<Screenshot | null>(null);
  const [rightSite, setRightSite] = useState<string>("");
  const [rightShot, setRightShot] = useState<Screenshot | null>(null);
  const [showUrls, setShowUrls] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLeftSite("");
    setRightSite("");
    setLeftShot(null);
    setRightShot(null);
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (selectedShot) {
      if (!dialog.open) dialog.showModal();
    } else {
      if (dialog.open) dialog.close();
    }
  }, [selectedShot]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        calendarRef.current &&
        !calendarRef.current.contains(event.target as Node)
      ) {
        setIsCalendarOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const grouped = screenshots.reduce<Record<string, Screenshot[]>>((acc, s) => {
    acc[s.url] = acc[s.url] || [];
    acc[s.url].push(s);
    return acc;
  }, {});

  const uniqueUrls = Object.keys(grouped);

  const toggleUrl = (url: string) => {
    setVisibleUrls((prev) =>
      prev.includes(url) ? prev.filter((u) => u !== url) : [...prev, url],
    );
  };

  const displayedSites = Object.entries(grouped).filter(([url]) =>
    visibleUrls.includes(url),
  );

  const openVersusMode = () => {
    setIsVersusOpen(true);
    setShowControls(true);
    if (uniqueUrls.length >= 2) {
      if (!leftSite) handleLeftSiteChange(uniqueUrls[0]);
      if (!rightSite) handleRightSiteChange(uniqueUrls[1]);
    } else if (uniqueUrls.length === 1) {
      if (!leftSite) handleLeftSiteChange(uniqueUrls[0]);
      if (!rightSite) handleRightSiteChange(uniqueUrls[0]);
    }
  };

  const handleLeftSiteChange = (site: string) => {
    setLeftSite(site);
    const shots = grouped[site];
    if (shots && shots.length > 0) setLeftShot(shots[0]);
  };

  const handleRightSiteChange = (site: string) => {
    setRightSite(site);
    const shots = grouped[site];
    if (shots && shots.length > 0) setRightShot(shots[0]);
  };

  const handleDialogClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) setSelectedShot(null);
  };

  const flatShots = displayedSites.flatMap(([, shots]) => shots);
  const currentIndex = selectedShot
    ? flatShots.findIndex((s) => s.id === selectedShot.id)
    : -1;

  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      setSelectedShot(flatShots[currentIndex - 1]);
    }
  }, [currentIndex, flatShots]);

  const goNext = useCallback(() => {
    if (currentIndex < flatShots.length - 1) {
      setSelectedShot(flatShots[currentIndex + 1]);
    }
  }, [currentIndex, flatShots]);

  useEffect(() => {
    if (!selectedShot) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "Escape") setSelectedShot(null);
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedShot, goPrev, goNext]);

  useEffect(() => {
    const saved = localStorage.getItem("deviceMode");
    if (saved === "desktop" || saved === "mobile") setDeviceMode(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem("deviceMode", deviceMode);
  }, [deviceMode]);

  return (
    <div className="min-h-screen bg-white text-neutral-900 font-sans tracking-tight selection:bg-neutral-200 overflow-hidden">
      {/* --- RESTYLED HEADER --- */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-100 h-14">
        <div className="mx-auto px-4 md:px-6 h-full flex items-center justify-between">
          {/* 1. BRAND */}
          <div className="flex items-center gap-3">
            <h1
              className={`text-base text-black tracking-[0.2em] uppercase ${geistSans.className}`}
            >
              Kiosk24
            </h1>
          </div>

          {/* 2. ACTIONS TOOLBAR */}
          <div className="flex items-center gap-2">
            {/* VERSUS BUTTON */}
            {!isLoading && uniqueUrls.length > 0 && (
              <button
                type="button"
                onClick={openVersusMode}
                title="Open Versus Mode"
                className="
                  group relative flex items-center justify-center
                  h-8 px-3 rounded-md
                  text-xs font-semibold uppercase tracking-wider
                  text-gray-600 hover:text-black hover:bg-gray-100
                  transition-all
                "
              >
                <Icons.Split className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline">Compare</span>
              </button>
            )}

            {/* SEPARATOR */}
            <div className="h-4 w-px bg-gray-200 mx-1" />

            {/* DEVICE TOGGLE */}
            <div className="flex items-center p-1 bg-gray-100 rounded-md">
              <button
                type="button"
                onClick={() => setDeviceMode("desktop")}
                className={`
                  p-1 rounded-sm transition-all
                  ${deviceMode === "desktop" ? "bg-white shadow-sm text-black" : "text-gray-400 hover:text-gray-600"}
                `}
                title="Desktop View"
              >
                <Icons.Monitor className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setDeviceMode("mobile")}
                className={`
                  p-1 rounded-sm transition-all
                  ${deviceMode === "mobile" ? "bg-white shadow-sm text-black" : "text-gray-400 hover:text-gray-600"}
                `}
                title="Mobile View"
              >
                <Icons.Smartphone className="w-3.5 h-3.5 mx-0.5" />
              </button>
            </div>

            {/* DATE PICKER */}
            <div className="relative ml-1" ref={calendarRef}>
              <button
                type="button"
                onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                className={`
                  flex items-center gap-2 h-8 pl-3 pr-2 rounded-md border
                  text-xs font-medium transition-all
                  ${
                    isCalendarOpen
                      ? "border-gray-300 bg-gray-50 text-black"
                      : "border-transparent hover:bg-gray-100 text-gray-600"
                  }
                `}
              >
                <Icons.Calendar className="w-3.5 h-3.5 opacity-70" />
                <span className="font-mono pt-0.5">
                  {format(date, "MMM dd")}
                </span>
                <Icons.ChevronDown
                  className={`w-3 h-3 opacity-40 transition-transform ${isCalendarOpen ? "rotate-180" : ""}`}
                />
              </button>

              {isCalendarOpen && (
                <div className="absolute top-full right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-2xl shadow-gray-200/50 p-3 z-50 animate-in fade-in zoom-in-95 duration-200">
                  <DayPicker
                    mode="single"
                    selected={date}
                    onSelect={(d) => {
                      if (d) {
                        setDate(d);
                        setIsCalendarOpen(false);
                      }
                    }}
                    modifiers={{ hasData: activeDates }}
                    modifiersStyles={{
                      hasData: {
                        fontWeight: "700",
                        textDecoration: "underline",
                        color: "#000",
                      },
                      selected: {
                        backgroundColor: "#000",
                        color: "#fff",
                        borderRadius: "6px",
                      },
                    }}
                    disabled={{ after: new Date() }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto pb-12 space-y-8">
        {!isLoading && uniqueUrls.length > 0 && (
          <div className="sticky top-14 z-30 bg-white/95 backdrop-blur border-b border-gray-50 py-3">
            <button
              type="button"
              onClick={() => setShowUrls((prev) => !prev)}
              className="md:hidden mx-auto mb-3 flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-200 transition"
            >
              {showUrls ? "Hide sources" : "Show sources"}
            </button>
            <div
              className={`transition-all duration-300 overflow-hidden ${showUrls ? "max-h-125 opacity-100" : "max-h-0 opacity-0"} md:max-h-none md:opacity-100`}
            >
              <div className="flex flex-wrap justify-center items-center gap-2 px-4 md:px-6">
                {uniqueUrls.map((url) => {
                  const isActive = visibleUrls.includes(url);
                  return (
                    <button
                      type="button"
                      key={url}
                      onClick={() => toggleUrl(url)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 active:scale-95 whitespace-nowrap ${isActive ? "bg-black text-white shadow-md" : "bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-black"}`}
                    >
                      <Image
                        src={`https://www.google.com/s2/favicons?domain=${url}&sz=64`}
                        alt=""
                        width={16}
                        height={16}
                        className="w-4 h-4 rounded-sm object-contain opacity-90"
                      />
                      <span>{url}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="py-20 text-center text-sm text-gray-400 animate-pulse">
            Syncing timestamps...
          </div>
        )}

        {!isLoading && uniqueUrls.length > 0 && displayedSites.length === 0 && (
          <div className="py-20 text-center text-sm text-gray-400">
            Tap a site above to begin.
          </div>
        )}

        <div className="px-4 md:px-6 space-y-10">
          {displayedSites.map(([url, shots]) => (
            <section
              key={url}
              className="group animate-in fade-in slide-in-from-bottom-4 duration-700"
            >
              <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-2">
                <div className="flex items-center gap-2">
                  <Image
                    src={`https://www.google.com/s2/favicons?domain=${url}&sz=64`}
                    alt=""
                    width={16}
                    height={16}
                    className="w-4 h-4 rounded-sm object-contain"
                  />
                  <h2 className="text-sm font-bold text-black tracking-tight">
                    {url}
                  </h2>
                </div>
                <span className="text-[10px] font-mono text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">
                  {shots.length}
                </span>
              </div>
              <Swiper
                slidesPerView="auto"
                spaceBetween={16}
                freeMode={true}
                grabCursor={true}
                simulateTouch={true}
                mousewheel={{ forceToAxis: true }}
                modules={[FreeMode, Mousewheel]}
                className="pb-4! overflow-visible!"
              >
                {shots.map((shot) => (
                  <SwiperSlide key={shot.id} className="!w-auto">
                    <button
                      type="button"
                      onClick={() => setSelectedShot(shot)}
                      className={`relative w-64 sm:w-72 bg-gray-50 overflow-hidden rounded-md
      transition-transform active:scale-[0.98]
      text-left shadow-sm border border-gray-100
      cursor-pointer select-none
      focus:outline-none focus-visible:ring-2 focus-visible:ring-black
      ${deviceMode === "mobile" ? "aspect-9/16" : "aspect-video"}`}
                    >
                      {shot.cloudinary_url ? (
                        <Image
                          src={optimizedImage(shot.cloudinary_url, 600)}
                          alt=""
                          fill
                          sizes="(max-width: 768px) 70vw, 300px"
                          draggable={false}
                          className="object-contain"
                          loading="lazy"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-300">
                          NO SIGNAL
                        </div>
                      )}

                      <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur px-2 py-1 rounded-sm shadow-sm">
                        <span className="text-[10px] font-bold text-black uppercase tracking-wider font-mono">
                          {formatTime(shot.captured_at)}
                        </span>
                      </div>
                    </button>
                  </SwiperSlide>
                ))}
              </Swiper>
            </section>
          ))}
        </div>
      </main>

      <dialog
        ref={dialogRef}
        onClose={() => setSelectedShot(null)}
        onClick={handleDialogClick}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            setSelectedShot(null);
          }
        }}
        className="w-screen h-screen max-w-none max-h-none m-0 bg-transparent p-0 outline-none
             backdrop:bg-black/95 backdrop:backdrop-blur-sm
             open:animate-in open:fade-in open:zoom-in-95 duration-200"
      >
        {selectedShot && (
          <div className="w-full overflow-hidden h-full flex flex-col items-center justify-between">
            <button
              type="button"
              onClick={() => setSelectedShot(null)}
              className="absolute top-4 right-4 z-50 w-10 h-10 flex items-center justify-center bg-white/10 text-white rounded-full hover:bg-white/20 transition active:scale-90"
            >
              <span className="text-2xl leading-none pb-1">&times;</span>
            </button>
            <button
              type="button"
              onClick={goPrev}
              disabled={currentIndex <= 0}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-40 w-12 h-12 flex items-center justify-center bg-black/40 text-white rounded-full hover:bg-black/60 transition disabled:opacity-20 disabled:pointer-events-none"
            >
              <span className="text-3xl leading-none">&#10094;</span>
            </button>
            <button
              type="button"
              onClick={goNext}
              disabled={currentIndex >= flatShots.length - 1}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-40 w-12 h-12 flex items-center justify-center bg-black/40 text-white rounded-full hover:bg-black/60 transition disabled:opacity-20 disabled:pointer-events-none"
            >
              <span className="text-3xl leading-none">&#10095;</span>
            </button>
            <div className="flex-1 w-full min-h-0 p-4 flex items-center justify-center relative">
              {selectedShot.cloudinary_url && (
                <div className="relative w-full h-full">
                  <Image
                    src={optimizedImage(selectedShot.cloudinary_url, 1600)}
                    alt={selectedShot.url}
                    fill
                    sizes="100vw"
                    priority
                    className="object-contain shadow-2xl rounded"
                  />
                </div>
              )}
            </div>
            <div className="flex-none w-full p-6 text-center text-white/80 bg-linear-to-t from-black/50 to-transparent">
              <div className="flex items-center justify-center gap-2">
                <Image
                  src={`https://www.google.com/s2/favicons?domain=${selectedShot.url}&sz=64`}
                  alt=""
                  width={16}
                  height={16}
                  className="w-4 h-4 rounded-sm object-contain opacity-80"
                />
                <h3 className="text-sm font-bold tracking-widest uppercase">
                  {selectedShot.url}
                </h3>
              </div>
              <p className="text-xs font-mono opacity-70 mt-1">
                {formatTime(selectedShot.captured_at)}
              </p>
            </div>
          </div>
        )}
      </dialog>

      {isVersusOpen && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col animate-in slide-in-from-bottom-10 duration-300">
          <div className="flex-none h-14 border-b border-gray-100 px-4 flex items-center justify-between bg-white z-10">
            <div className="flex items-center gap-4">
              <h2 className="text-sm font-bold uppercase tracking-widest">
                Versus Mode
              </h2>
              <button
                type="button"
                onClick={() => setShowControls(!showControls)}
                className="text-[10px] font-bold uppercase tracking-wide bg-gray-100 px-3 py-1 rounded hover:bg-gray-200 transition"
              >
                {showControls ? "Hide Options" : "Show Options"}
              </button>
            </div>
            <button
              type="button"
              onClick={() => setIsVersusOpen(false)}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition"
            >
              <span className="text-xl leading-none pb-1">&times;</span>
            </button>
          </div>

          <div className="grow flex flex-col md:flex-row h-full overflow-hidden">
            <div className="grow relative bg-gray-50/50 flex items-center justify-center overflow-hidden touch-none p-4">
              {leftShot &&
              rightShot &&
              leftShot.cloudinary_url &&
              rightShot.cloudinary_url ? (
                <div className="relative w-full h-full shadow-2xl rounded-lg overflow-hidden border border-gray-200">
                  <ReactCompareSlider
                    itemOne={
                      <ReactCompareSliderImage
                        src={optimizedImage(leftShot.cloudinary_url, 1600)}
                        alt="Left"
                        style={{
                          objectFit: "contain",
                          width: "100%",
                          height: "100%",
                          backgroundColor: "#f9fafb",
                        }}
                      />
                    }
                    itemTwo={
                      <ReactCompareSliderImage
                        src={optimizedImage(rightShot.cloudinary_url, 1600)}
                        alt="Right"
                        style={{
                          objectFit: "contain",
                          width: "100%",
                          height: "100%",
                          backgroundColor: "#f9fafb",
                        }}
                      />
                    }
                    style={{ height: "100%", width: "100%" }}
                  />
                </div>
              ) : (
                <div className="text-gray-400 text-xs tracking-widest">
                  Select comparison data (Sidebar)
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
