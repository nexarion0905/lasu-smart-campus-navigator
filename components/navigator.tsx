"use client";

import { useMemo, useState } from "react";
import MapView from "@/components/map-view";
import {
  campusPlaces,
  getVerifiedCampusPlaces,
  searchCampusPlaces,
  type CampusPlace,
} from "@/src/lib/campus-places";

function PinIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="10" r="2.3" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="10.8" cy="10.8" r="6.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="m16 16 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function verificationLabel(status: CampusPlace["verificationStatus"]) {
  if (status === "verified") return "LASU verified";
  if (status === "provisional") return "Provisional";
  return "Unverified";
}

function safeSourceUrl(url: string | undefined) {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" ? parsed.toString() : null;
  } catch {
    return null;
  }
}

function PlaceCard({
  place,
  active,
  onSelect,
}: {
  place: CampusPlace;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      className={`place-card ${active ? "place-card-active" : ""}`}
      onClick={onSelect}
      aria-pressed={active}
    >
      <span className="place-symbol"><PinIcon /></span>
      <span className="place-copy">
        <span className="place-heading">
          {place.name}
          <span className={`status-pill status-${place.verificationStatus}`}>
            {verificationLabel(place.verificationStatus)}
          </span>
        </span>
        <span className="place-meta">
          {place.category} <span aria-hidden="true">·</span> Source-linked listing
        </span>
      </span>
      <svg className="place-arrow" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="m7 4 6 6-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

export default function Navigator() {
  const [query, setQuery] = useState("");
  const [selectedPlace, setSelectedPlace] = useState<CampusPlace | null>(null);
  const [locationMessage, setLocationMessage] = useState("");
  const results = useMemo(() => searchCampusPlaces(query), [query]);
  const verifiedPlaces = useMemo(() => getVerifiedCampusPlaces(campusPlaces), []);

  function locateMe() {
    setLocationMessage("");
    if (!navigator.geolocation) {
      setLocationMessage("Location is not available in this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coordinates = {
          longitude: position.coords.longitude,
          latitude: position.coords.latitude,
        };
        window.dispatchEvent(new CustomEvent("lasu-locate", { detail: coordinates }));
        setLocationMessage("Your current location is shown on the map.");
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setLocationMessage("Location permission was denied. You can still search places.");
        } else if (error.code === error.TIMEOUT) {
          setLocationMessage("Location took too long to respond. Please try again.");
        } else {
          setLocationMessage("We could not get your location. You can still search places.");
        }
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#home" aria-label="LASU Smart Campus Navigator home">
          <span className="brand-mark"><PinIcon /></span>
          <span className="brand-type"><strong>LASU</strong><span>smart campus navigator</span></span>
        </a>
        <div className="topbar-right"><span className="context-icon" aria-hidden="true"><PinIcon /></span><span>Ojo campus</span><span className="topbar-divider"/><span className="phase-label">MILESTONE 1</span></div>
      </header>

      <section className="welcome-strip" id="home">
        <div>
          <p className="eyebrow">CAMPUS EXPLORER</p>
          <h1>Find your way around LASU.</h1>
          <p className="intro-copy">Search campus listings while LASU-verified map data is being prepared.</p>
        </div>
        <div className="data-note" role="note">
          <span className="note-icon">i</span>
          <span>Provisional listings are labelled and are not pinned on the map.</span>
        </div>
      </section>

      <div className="workspace">
        <aside className="sidebar" aria-label="Campus destinations">
          <div className="search-box">
            <SearchIcon />
            <label className="sr-only" htmlFor="destination-search">Search campus destinations</label>
            <input
              id="destination-search"
              type="search"
              maxLength={120}
              placeholder="Search places or categories"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>

          <div className="list-heading">
            <span>Campus places</span>
            <span className="result-count">{results.length} {results.length === 1 ? "result" : "results"}</span>
          </div>

          <div className="place-list" aria-live="polite">
            {results.length > 0 ? results.map((place) => (
              <PlaceCard
                key={place.id}
                place={place}
                active={selectedPlace?.id === place.id}
                onSelect={() => setSelectedPlace(place)}
              />
            )) : (
              <div className="empty-state">
                <span className="empty-search"><SearchIcon /></span>
                <strong>{query.trim() ? "No matching places" : "Campus places are pending"}</strong>
                <span>
                  {campusPlaces.length === 0
                    ? "Verified campus places still need to be added."
                    : "Try another search. Verified LASU places still need to be added."}
                </span>
              </div>
            )}
          </div>

          <section className="destination-details" aria-labelledby="destination-title">
            <div className="details-kicker">SELECTED DESTINATION</div>
            {selectedPlace ? (
              <>
                <div className="details-title-row">
                  <h2 id="destination-title">{selectedPlace.name}</h2>
                  <span className={`status-pill status-${selectedPlace.verificationStatus}`}>
                    {verificationLabel(selectedPlace.verificationStatus)}
                  </span>
                </div>
                <p>{selectedPlace.description}</p>
                {selectedPlace.verificationStatus !== "verified" && (
                  <p className="not-pinned-note">This listing is not LASU-verified, so it is not shown as a map pin.</p>
                )}
                {selectedPlace.source && safeSourceUrl(selectedPlace.source.url) && (
                  <div className="details-source">
                    Source: <a href={safeSourceUrl(selectedPlace.source.url)!} target="_blank" rel="noreferrer">
                      {selectedPlace.source.name}
                    </a> <span>· {selectedPlace.source.recordId}</span>
                  </div>
                )}
              </>
            ) : (
              <p className="selection-prompt">Choose a listing to review its status and source.</p>
            )}
          </section>

          <div className="sidebar-footer">
            <span className="footer-check">✓</span>
            <span>Map pins will appear only after destinations are verified.</span>
          </div>
        </aside>

        <section className="map-section" aria-label="Interactive campus map">
          <div className="map-toolbar">
            <div className="map-caption">
              <span className="map-caption-icon"><PinIcon /></span>
              <span><strong>LASU Ojo area</strong><small>Approximate OSM map view</small></span>
            </div>
            <button className="location-button" onClick={locateMe}>
              <span className="location-target" aria-hidden="true">◎</span><span>My location</span>
            </button>
          </div>
          <div className="map-container">
            <MapView
              verifiedPlaces={verifiedPlaces}
              selectedPlace={selectedPlace}
              onSelect={setSelectedPlace}
              onLocation={() => setLocationMessage("Your current location is shown on the map.")}
            />
          </div>
          {locationMessage && (
            <div role="status" className="location-message">
              <span>{locationMessage}</span>
              <button aria-label="Dismiss location message" onClick={() => setLocationMessage("")}>×</button>
            </div>
          )}
          <div className="map-legend"><span className="legend-outline"/>Only LASU-verified places appear as pins</div>
        </section>
      </div>

      <footer className="bottom-note">
        <span>LASU Smart Campus Navigator</span>
        <span>Campus place verification is pending · No routing or live updates</span>
        <span>Map attribution is provided by the map style</span>
      </footer>
    </main>
  );
}
