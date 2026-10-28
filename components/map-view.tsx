"use client";

import { useEffect, useRef, useState } from "react";
import type { Map as MapLibreMap, Marker } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { campusViewport, mapProvider } from "@/src/lib/map-provider";
import type { CampusPlace } from "@/src/lib/campus-places";

type MapState = "loading" | "ready" | "error";

export default function MapView({ places, selectedPlace, onSelect, onLocation }: {
  places: CampusPlace[];
  selectedPlace: CampusPlace | null;
  onSelect: (place: CampusPlace) => void;
  onLocation: (coordinates: { longitude: number; latitude: number }) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markerRef = useRef<Marker | null>(null);
  const userMarkerRef = useRef<Marker | null>(null);
  const [mapState, setMapState] = useState<MapState>("loading");

  useEffect(() => {
    let disposed = false;
    let map: MapLibreMap | undefined;
    import("maplibre-gl").then(({ Map, Marker, NavigationControl }) => {
      if (disposed || !containerRef.current) return;
      map = new Map({ container: containerRef.current, style: mapProvider.styleUrl, center: campusViewport.center, zoom: campusViewport.zoom, attributionControl: { compact: true } });
      mapRef.current = map;
      map.addControl(new NavigationControl({ showCompass: false }), "top-right");
      map.on("load", () => {
        if (disposed) return;
        map?.addSource("campus-places", { type: "geojson", data: { type: "FeatureCollection", features: places.map((place) => ({ type: "Feature" as const, properties: { id: place.id, name: place.name }, geometry: { type: "Point" as const, coordinates: [place.coordinates.longitude, place.coordinates.latitude] } })) } });
        map?.addLayer({ id: "campus-place-circles", type: "circle", source: "campus-places", paint: { "circle-radius": ["case", ["==", ["get", "id"], selectedPlace?.id ?? ""], 10, 7], "circle-color": "#26735c", "circle-stroke-width": 3, "circle-stroke-color": "#ffffff" } });
        map?.addLayer({ id: "campus-place-labels", type: "symbol", source: "campus-places", layout: { "text-field": ["get", "name"], "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"], "text-size": 11, "text-offset": [0, 1.5], "text-anchor": "top" }, paint: { "text-color": "#23453b", "text-halo-color": "#ffffff", "text-halo-width": 1.5 } });
        map?.on("click", "campus-place-circles", (event) => {
          const id = event.features?.[0]?.properties?.id;
          const place = places.find((candidate) => candidate.id === id);
          if (place) onSelect(place);
        });
        map?.on("mouseenter", "campus-place-circles", () => { if (map) map.getCanvas().style.cursor = "pointer"; });
        map?.on("mouseleave", "campus-place-circles", () => { if (map) map.getCanvas().style.cursor = ""; });
        setMapState("ready");
      });
      map.on("error", () => { if (map && !map.isStyleLoaded()) setMapState("error"); });
      markerRef.current = new Marker({ color: "#d68548", scale: 0.85 }).setLngLat(campusViewport.center).addTo(map);
    }).catch(() => { if (!disposed) setMapState("error"); });

    return () => { disposed = true; markerRef.current?.remove(); userMarkerRef.current?.remove(); map?.remove(); mapRef.current = null; };
    // Map is initialized once; selected place updates are handled in the following effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || mapState !== "ready" || !selectedPlace) return;
    map.flyTo({ center: [selectedPlace.coordinates.longitude, selectedPlace.coordinates.latitude], zoom: 17, duration: 700 });
    markerRef.current?.setLngLat([selectedPlace.coordinates.longitude, selectedPlace.coordinates.latitude]);
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
      {mapState === "error" && <div className="map-state map-error" role="alert"><span className="map-error-icon">!</span><strong>Map unavailable right now</strong><span>Check your connection or map style URL, then reload the page.</span><a href="https://openfreemap.org/quick_start/" target="_blank" rel="noreferrer">Map provider setup</a></div>}
    </div>
  );
}
