/** Map provider settings live here so the interface can switch providers without UI edits. */
export const mapProvider = {
  styleUrl:
    process.env.NEXT_PUBLIC_MAP_STYLE_URL ??
    "https://tiles.openfreemap.org/styles/positron",
};

/** Approximate view center from the mapped LASU university feature in OpenStreetMap. */
export const campusViewport = {
  center: [3.19996, 6.47379] as [longitude: number, latitude: number],
  zoom: 15.2,
};
