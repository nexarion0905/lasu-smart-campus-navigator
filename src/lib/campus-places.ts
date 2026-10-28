export type PlaceCategory = "Campus" | "Academic";
export type VerificationStatus = "verified" | "provisional" | "illustrative";

export interface CampusPlace {
  id: string;
  name: string;
  category: PlaceCategory;
  coordinates: { longitude: number; latitude: number };
  description: string;
  verificationStatus: VerificationStatus;
  source: { name: string; url: string; recordId: string; accessedOn: string };
}

// OSM-sourced features are useful for the first search/map milestone but are not
// endorsed by LASU. Confirm them with the university before marking them verified.
export const campusPlaces: CampusPlace[] = [
  {
    id: "lasu-main-campus-osm-591396726",
    name: "Lagos State University, Ojo",
    category: "Campus",
    coordinates: { longitude: 3.19996, latitude: 6.47379 },
    description:
      "The mapped university campus area. This point represents the campus feature, not a building entrance.",
    verificationStatus: "provisional",
    source: {
      name: "OpenStreetMap via Mapcarta",
      url: "https://mapcarta.com/W591396726",
      recordId: "way/591396726",
      accessedOn: "2026-10-28",
    },
  },
  {
    id: "lasu-school-transport-osm-1347307291",
    name: "School of Transport and Logistics",
    category: "Academic",
    coordinates: { longitude: 3.19805, latitude: 6.4743 },
    description:
      "A mapped school building associated with LASU. Its name and exact location need university confirmation.",
    verificationStatus: "provisional",
    source: {
      name: "OpenStreetMap via Mapcarta",
      url: "https://mapcarta.com/W1347307291",
      recordId: "way/1347307291",
      accessedOn: "2026-10-28",
    },
  },
];

export function searchCampusPlaces(
  query: string,
  places: readonly CampusPlace[] = campusPlaces,
): CampusPlace[] {
  const normalizedQuery = query.trim().toLocaleLowerCase();
  if (!normalizedQuery) return [...places];

  return places.filter((place) =>
    [place.name, place.category, place.description].some((value) =>
      value.toLocaleLowerCase().includes(normalizedQuery),
    ),
  );
}
