export function buildUrl(
  baseUrl: string,
  path: string,
  params?: Record<string, string>,
): string {
  let url = path;

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url = url.replace(`:${key}`, encodeURIComponent(value));
    }
  }

  // Extract origin from baseUrl (protocol + host + port)
  const origin = getOriginFromUrl(baseUrl);

  // Ensure path starts with /
  const normalizedPath = url.startsWith("/") ? url : `/${url}`;

  return `${origin}${normalizedPath}`;
}

export function getOriginFromUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.origin;
  } catch {
    // If URL parsing fails, try to extract origin manually
    const match = url.match(/^(https?:\/\/[^/]+)/);
    return match ? match[1] : url;
  }
}

export function buildUrlWithQuery(
  baseUrl: string,
  path: string,
  query: Record<string, string | number>,
): string {
  const origin = getOriginFromUrl(baseUrl);
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(query)) {
    searchParams.set(key, String(value));
  }

  const queryString = searchParams.toString();
  const url = `${origin}${normalizedPath}`;
  return queryString ? `${url}?${queryString}` : url;
}

export function extractPathFromUrl(url: string): string {
  const urlObj = new URL(url, "http://localhost");
  return urlObj.pathname;
}

export function mergeQueryParams(
  existingQuery: Record<string, string>,
  newParams: Record<string, string | number>,
): Record<string, string> {
  const merged: Record<string, string> = { ...existingQuery };

  for (const [key, value] of Object.entries(newParams)) {
    merged[key] = String(value);
  }

  return merged;
}
