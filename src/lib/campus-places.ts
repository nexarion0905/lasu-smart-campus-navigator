export type PlaceCategory = "Campus" | "Academic";

export interface PlaceCoordinates {
  longitude: number;
  latitude: number;
}

export interface PlaceSource {
  name: string;
  url: string;
  recordId: string;
  accessedOn: string;
}

interface CampusPlaceBase {
  id: string;
  name: string;
  category: PlaceCategory;
  description: string;
  source?: PlaceSource;
}

export type VerifiedCampusPlace = CampusPlaceBase & {
  coordinates: PlaceCoordinates;
  verificationStatus: "verified";
};

export type ProvisionalCampusPlace = CampusPlaceBase & {
  coordinates: PlaceCoordinates | null;
  verificationStatus: "provisional";
};

export type UnverifiedCampusPlace = CampusPlaceBase & {
  coordinates: null;
  verificationStatus: "unverified";
};

export type CampusPlace =
  | VerifiedCampusPlace
  | ProvisionalCampusPlace
  | UnverifiedCampusPlace;

// These OSM-sourced entries are searchable, but neither LASU has confirmed
// their names nor surveyors have verified that their points match entrances.
// They are intentionally excluded from map markers and map-driven zooming.
export const campusPlaces: CampusPlace[] = [
  {
    id: "lasu-main-campus-osm-591396726",
    name: "Lagos State University, Ojo",
    category: "Campus",
    coordinates: { longitude: 3.19996, latitude: 6.47379 },
    description:
      "An OpenStreetMap campus feature. This is an approximate area reference, not a confirmed entrance or destination pin.",
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
      "An OpenStreetMap building associated with LASU. LASU has not confirmed its name, use, or exact location.",
    verificationStatus: "provisional",
    source: {
      name: "OpenStreetMap via Mapcarta",
      url: "https://mapcarta.com/W1347307291",
      recordId: "way/1347307291",
      accessedOn: "2026-10-28",
    },
  },
];

export function getVerifiedCampusPlaces(
  places: readonly CampusPlace[],
): VerifiedCampusPlace[] {
  return places.filter(
    (place): place is VerifiedCampusPlace =>
      place.verificationStatus === "verified",
  );
}

export function searchCampusPlaces(
  query: string,
  places: readonly CampusPlace[] = campusPlaces,
): CampusPlace[] {
  const normalizedQuery = query.trim().slice(0, 120).toLowerCase();
  if (!normalizedQuery) return [...places];

  return places.filter((place) =>
    [place.name, place.category, place.description].some((value) =>
      value.toLowerCase().includes(normalizedQuery),
    ),
  );
}
