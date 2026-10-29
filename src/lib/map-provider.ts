const defaultStyleUrl = "https://tiles.openfreemap.org/styles/positron";

/** Reject malformed or insecure configured styles before passing them to MapLibre. */
export function resolveMapStyleUrl(configuredValue?: string): string | null {
  const candidate = configuredValue?.trim() || defaultStyleUrl;

  try {
    const url = new URL(candidate);
    if (url.protocol !== "https:" || url.username || url.password) return null;
    return url.toString();
  } catch {
    return null;
  }
}

export const mapProvider = {
  styleUrl: resolveMapStyleUrl(process.env.NEXT_PUBLIC_MAP_STYLE_URL),
};

/**
 * Approximate OSM campus-area framing only. It is not a destination coordinate
 * and is never used to draw a campus marker or to claim LASU verification.
 */
export const campusViewport = {
  center: [3.19996, 6.47379] as [longitude: number, latitude: number],
  zoom: 15.2,
};
