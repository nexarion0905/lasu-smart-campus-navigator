import { describe, expect, it } from "vitest";
import {
  campusPlaces,
  getVerifiedCampusPlaces,
  searchCampusPlaces,
  type CampusPlace,
} from "./campus-places";

describe("campus place data", () => {
  it("has unique IDs and labels the sourced starter records provisional", () => {
    const ids = campusPlaces.map((place) => place.id);

    expect(new Set(ids).size).toBe(ids.length);
    expect(campusPlaces.length).toBeGreaterThan(0);
    for (const place of campusPlaces) {
      expect(place.name.length).toBeGreaterThan(0);
      expect(place.category.length).toBeGreaterThan(0);
      expect(place.verificationStatus).toBe("provisional");
      expect(place.source?.url).toMatch(/^https:\/\//);
      expect(place.source?.recordId).toBeTruthy();

      if (place.coordinates) {
        expect(place.coordinates.longitude).toBeGreaterThanOrEqual(-180);
        expect(place.coordinates.longitude).toBeLessThanOrEqual(180);
        expect(place.coordinates.latitude).toBeGreaterThanOrEqual(-90);
        expect(place.coordinates.latitude).toBeLessThanOrEqual(90);
      }
    }
  });

  it("requires coordinates in the verified place type", () => {
    const verifiedPlace: CampusPlace = {
      id: "synthetic-verified-test-place",
      name: "Synthetic Verified Test Place",
      category: "Academic",
      coordinates: { longitude: -122.4194, latitude: 37.7749 },
      description: "Synthetic fixture used only to test verified-place filtering.",
      verificationStatus: "verified",
    };
    const unverifiedPlace: CampusPlace = {
      id: "unverified-place",
      name: "Unverified Place",
      category: "Campus",
      coordinates: null,
      description: "No confirmed location.",
      verificationStatus: "unverified",
    };

    expect(getVerifiedCampusPlaces([verifiedPlace, unverifiedPlace])).toEqual([
      verifiedPlace,
    ]);
    expect(getVerifiedCampusPlaces(campusPlaces)).toEqual([]);
  });
});

describe("searchCampusPlaces", () => {
  it("returns all places for an empty or whitespace-only query", () => {
    expect(searchCampusPlaces("")).toHaveLength(campusPlaces.length);
    expect(searchCampusPlaces("   ")).toHaveLength(campusPlaces.length);
  });

  it("matches place names, categories, and descriptions without case sensitivity", () => {
    expect(searchCampusPlaces("LAGOS state").map((place) => place.id)).toContain(campusPlaces[0].id);
    expect(searchCampusPlaces("academic").map((place) => place.id)).toContain(campusPlaces[1].id);
    expect(searchCampusPlaces("approximate area").map((place) => place.id)).toContain(campusPlaces[0].id);
  });

  it("trims queries and returns an empty list for unmatched or empty data", () => {
    expect(searchCampusPlaces("  transport  ")).toHaveLength(1);
    expect(searchCampusPlaces("library")).toEqual([]);
    expect(searchCampusPlaces("library", [])).toEqual([]);
  });
});
