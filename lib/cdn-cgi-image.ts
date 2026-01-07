export type CdnCgiImageOptions = {
  width: number;
  quality?: number;
  format?: "auto" | "webp" | "avif" | "jpg" | "png";
};

function buildTransformSegment({
  width,
  quality = 75,
  format = "auto",
}: CdnCgiImageOptions) {
  const safeWidth = Math.max(1, Math.round(width));
  const safeQuality = Math.min(100, Math.max(1, Math.round(quality)));
  return `w=${safeWidth},q=${safeQuality},f=${format}`;
}

export function withCdnCgiImage(
  inputUrl: string,
  options: CdnCgiImageOptions,
): string {
  const trimmed = inputUrl.trim();
  if (!trimmed) return inputUrl;

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return inputUrl;
  }

  if (url.hostname === "www.google.com") return inputUrl;

  if (url.pathname.startsWith("/cdn-cgi/image/")) return url.toString();

  const transform = buildTransformSegment(options);
  url.pathname = `/cdn-cgi/image/${transform}${url.pathname}`;
  return url.toString();
}
