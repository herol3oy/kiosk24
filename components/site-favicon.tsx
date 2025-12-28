"use client";

import Image from "next/image";

export function SiteFavicon({
  url,
  size = 16,
  className,
  hideOnError = false,
}: {
  url: string;
  size?: number;
  className?: string;
  hideOnError?: boolean;
}) {
  return (
    <Image
      src={`https://www.google.com/s2/favicons?domain=${url}&sz=${Math.max(
        16,
        size * 4,
      )}`}
      alt={`${url} favicon`}
      width={size}
      height={size}
      className={className}
      onError={
        hideOnError
          ? (e) => {
              e.currentTarget.style.display = "none";
            }
          : undefined
      }
    />
  );
}
