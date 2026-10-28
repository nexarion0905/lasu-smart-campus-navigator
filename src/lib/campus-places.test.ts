import { describe, expect, it } from "vitest";
import { campusPlaces, searchCampusPlaces } from "./campus-places";

describe("campus place data", () => {
  it("contains uniquely identified places with source and verification metadata", () => {
    const ids = campusPlaces.map((place) => place.id);

    expect(new Set(ids).size).toBe(ids.length);
    for (const place of campusPlaces) {
      expect(place.name.length).toBeGreaterThan(0);
      expect(place.category.length).toBeGreaterThan(0);
      expect(place.coordinates.longitude).toBeGreaterThanOrEqual(-180);
      expect(place.coordinates.longitude).toBeLessThanOrEqual(180);
      expect(place.coordinates.latitude).toBeGreaterThanOrEqual(-90);
      expect(place.coordinates.latitude).toBeLessThanOrEqual(90);
      expect(place.verificationStatus).toBe("provisional");
      expect(place.source.url).toMatch(/^https:\/\//);
      expect(place.source.recordId).toBeTruthy();
    }
  });
});

describe("searchCampusPlaces", () => {
  it("returns all places for an empty or whitespace-only query", () => {
    expect(searchCampusPlaces("")).toHaveLength(campusPlaces.length);
    expect(searchCampusPlaces("   ")).toHaveLength(campusPlaces.length);
  });

  it("matches place names and categories without case sensitivity", () => {
    expect(searchCampusPlaces("LAGOS state").map((place) => place.id)).toContain(campusPlaces[0].id);
    expect(searchCampusPlaces("academic").map((place) => place.id)).toContain(campusPlaces[1].id);
  });

  it("trims queries and includes descriptions in the search", () => {
    expect(searchCampusPlaces("  campus feature  ")).toHaveLength(1);
    expect(searchCampusPlaces("building entrance")).toHaveLength(1);
  });

  it("returns an empty list when there is no match", () => {
    expect(searchCampusPlaces("library")).toEqual([]);
  });
});
