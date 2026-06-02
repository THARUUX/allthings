export function getBaseUrl(): URL {
  const raw = process.env.NEXT_PUBLIC_PLATFORM_URL || "https://allthings.com";
  const url = raw.startsWith('http://') || raw.startsWith('https://') ? raw : `https://${raw}`;
  return new URL(url);
}
