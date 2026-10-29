"use client";

import { useEffect, useRef, useState } from "react";
import type {
  ErrorEvent as MapLibreErrorEvent,
  Map as MapLibreMap,
  Marker,
} from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { campusViewport, mapProvider } from "../src/lib/map-provider";
import type {
  CampusPlace,
  VerifiedCampusPlace,
} from "../src/lib/campus-places";

type MapState = "loading" | "ready" | "error";
type MapErrorKind = "tile" | "style" | "degraded";

/**
 * MapLibre bubbles tile/source errors with sourceId and often tile metadata.
 * Those failures can leave a usable but incomplete map. Errors without that
 * metadata during initial style loading indicate that the map cannot start.
 */
export function classifyMapError(
  event: { sourceId?: unknown; tile?: unknown },
  styleLoaded: boolean,
): MapErrorKind {
  if (
    (typeof event.sourceId === "string" && event.sourceId.length > 0) ||
    event.tile !== undefined
  ) {
    return "tile";
  }

  return styleLoaded ? "degraded" : "style";
}

export default function MapView({ verifiedPlaces = [], selectedPlace, onSelect, onLocation }: {
  verifiedPlaces: VerifiedCampusPlace[];
  selectedPlace: CampusPlace | null;
  onSelect: (place: CampusPlace) => void;
  onLocation: (coordinates: { longitude: number; latitude: number }) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const userMarkerRef = useRef<Marker | null>(null);
  const [mapState, setMapState] = useState<MapState>(mapProvider.styleUrl ? "loading" : "error");
  const [mapError, setMapError] = useState(
    mapProvider.styleUrl ? "" : "The map style URL must be a valid HTTPS URL.",
  );
  const [mapNotice, setMapNotice] = useState("");

  useEffect(() => {
    let disposed = false;
    let map: MapLibreMap | undefined;
    let styleLoaded = false;
    let tileFailureCount = 0;
    const styleUrl = mapProvider.styleUrl;
    if (!styleUrl) return;

    import("maplibre-gl").then(({ Map, NavigationControl, setWorkerUrl }) => {
      if (disposed || !containerRef.current) return;
      const workerUrl =
        process.env.NODE_ENV === "development"
          ? new URL("maplibre-gl/dist/maplibre-gl-worker-dev.mjs", import.meta.url)
          : new URL("maplibre-gl/dist/maplibre-gl-worker.mjs", import.meta.url);
      setWorkerUrl(workerUrl.toString());
      map = new Map({ container: containerRef.current, style: styleUrl, center: campusViewport.center, zoom: campusViewport.zoom, attributionControl: { compact: true } });
      mapRef.current = map;
      map.addControl(new NavigationControl({ showCompass: false }), "top-right");
      const onStyleLoad = () => {
        if (disposed) return;
        styleLoaded = true;
        setMapState("ready");
      };
      map.on("load", () => {
        if (disposed) return;
        if (verifiedPlaces.length > 0) {
          map?.addSource("campus-places", { type: "geojson", data: { type: "FeatureCollection", features: verifiedPlaces.map((place) => ({ type: "Feature" as const, properties: { id: place.id, name: place.name }, geometry: { type: "Point" as const, coordinates: [place.coordinates.longitude, place.coordinates.latitude] } })) } });
          map?.addLayer({ id: "campus-place-circles", type: "circle", source: "campus-places", paint: { "circle-radius": 8, "circle-color": "#26735c", "circle-stroke-width": 3, "circle-stroke-color": "#ffffff" } });
          map?.addLayer({ id: "campus-place-labels", type: "symbol", source: "campus-places", layout: { "text-field": ["get", "name"], "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"], "text-size": 11, "text-offset": [0, 1.5], "text-anchor": "top" }, paint: { "text-color": "#23453b", "text-halo-color": "#ffffff", "text-halo-width": 1.5 } });
          map?.on("click", "campus-place-circles", (event) => {
            const id = event.features?.[0]?.properties?.id;
            const place = verifiedPlaces.find((candidate) => candidate.id === id);
            if (place) onSelect(place);
          });
          map?.on("mouseenter", "campus-place-circles", () => { if (map) map.getCanvas().style.cursor = "pointer"; });
          map?.on("mouseleave", "campus-place-circles", () => { if (map) map.getCanvas().style.cursor = ""; });
        }
      });
      const onMapError = (
        event: MapLibreErrorEvent & { sourceId?: unknown; tile?: unknown },
      ) => {
        if (disposed) return;

        const errorKind = classifyMapError(event, styleLoaded);
        if (errorKind === "tile") {
          tileFailureCount += 1;
          if (tileFailureCount >= 3) {
            setMapNotice(
              "Several map tile requests have failed. The map remains interactive, but some areas may be missing. Check your connection or map provider.",
            );
          }
          return;
        }

        if (errorKind === "style") {
          setMapError("The map style could not be loaded. Check your connection and map provider settings.");
          setMapState("error");
          return;
        }

        setMapNotice(
          "The map reported a rendering error. Some map content may be missing; the map may still be usable.",
        );
      };
      map.on("style.load", onStyleLoad);
      map.on("error", onMapError);
    }).catch(() => {
      if (!disposed) {
        setMapError("The map could not start in this browser. Check WebGL support and reload the page.");
        setMapState("error");
      }
    });

    return () => { disposed = true; userMarkerRef.current?.remove(); map?.remove(); mapRef.current = null; };
    // Map is initialized once; selected place updates are handled in the following effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || mapState !== "ready" || selectedPlace?.verificationStatus !== "verified") return;
    map.flyTo({ center: [selectedPlace.coordinates.longitude, selectedPlace.coordinates.latitude], zoom: 17, duration: 700 });
  }, [selectedPlace, mapState]);

  function locateUser(event: Event) {
    const coordinates = (event as CustomEvent<{ longitude: number; latitude: number }>).detail;
    if (coordinates) {
      mapRef.current?.flyTo({ center: [coordinates.longitude, coordinates.latitude], zoom: 16, duration: 700 });
      if (mapRef.current) {
        const element = document.createElement("span");
        element.className = "user-position-marker";
        element.setAttribute("aria-label", "Your current location");
        element.setAttribute("role", "img");
        userMarkerRef.current?.remove();
        import("maplibre-gl").then(({ Marker }) => {
          if (!mapRef.current) return;
          userMarkerRef.current = new Marker({ element, anchor: "center" }).setLngLat([coordinates.longitude, coordinates.latitude]).addTo(mapRef.current);
        });
      }
      onLocation(coordinates);
    }
  }

  // The toolbar obtains permission and dispatches a position only after success.
  useEffect(() => {
    window.addEventListener("lasu-locate", locateUser);
    return () => window.removeEventListener("lasu-locate", locateUser);
  });

  return (
    <div className="map-frame">
      <div ref={containerRef} className="map-canvas" aria-label="Map centered on LASU Ojo campus" role="application" />
      {mapState === "loading" && <div className="map-state" role="status"><span className="spinner"/><strong>Loading campus map</strong><span>Connecting to the map service…</span></div>}
      {mapState === "ready" && verifiedPlaces.length === 0 && <div className="map-pending" role="status"><span className="pending-icon">⌖</span><strong>Campus map data pending</strong><span>No LASU-verified destination coordinates are available yet. Provisional listings remain searchable, but are not shown as pins.</span></div>}
      {mapNotice && mapState !== "error" && (
        <div
          className="map-degraded"
          role="status"
          aria-live="polite"
          style={{
            position: "absolute",
            zIndex: 3,
            bottom: 12,
            left: 12,
            width: "calc(100% - 24px)",
            maxWidth: 380,
            display: "grid",
            gap: 4,
            padding: "10px 12px",
            border: "1px solid #e4e8df",
            borderRadius: 10,
            background: "rgb(255 255 255 / 96%)",
            color: "#58645b",
            boxShadow: "0 5px 20px rgb(26 49 34 / 11%)",
            fontSize: 11,
            lineHeight: 1.45,
          }}
        >
          <strong style={{ color: "#354239", fontSize: 12 }}>
            Map may be incomplete
          </strong>
          <span>{mapNotice}</span>
        </div>
      )}
      {mapState === "error" && <div className="map-state map-error" role="alert"><span className="map-error-icon">!</span><strong>Map unavailable</strong><span>{mapError || "The map style or tile service could not load."}</span><a href="https://openfreemap.org/quick_start/" target="_blank" rel="noreferrer">Map provider setup</a></div>}
    </div>
  );
}
