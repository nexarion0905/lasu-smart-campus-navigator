"use client";

import { useMemo, useState } from "react";
import MapView from "@/components/map-view";
import {
  campusPlaces,
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
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.5" stroke="currentColor" strokeWidth="1.8"/><path d="m16 16 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>;
}

function PlaceCard({ place, active, onSelect }: { place: CampusPlace; active: boolean; onSelect: () => void }) {
  return (
    <button className={`place-card ${active ? "place-card-active" : ""}`} onClick={onSelect} aria-pressed={active}>
      <span className="place-symbol"><PinIcon /></span>
      <span className="place-copy">
        <span className="place-heading">{place.name}<span className={`status-pill status-${place.verificationStatus}`}>{place.verificationStatus === "verified" ? "LASU verified" : place.verificationStatus === "illustrative" ? "Illustrative" : "Provisional"}</span></span>
        <span className="place-meta">{place.category} <span aria-hidden="true">·</span> OSM source</span>
      </span>
      <svg className="place-arrow" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="m7 4 6 6-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
    </button>
  );
}

export default function Navigator() {
  const [query, setQuery] = useState("");
  const [selectedPlace, setSelectedPlace] = useState<CampusPlace | null>(campusPlaces[0]);
  const [locationMessage, setLocationMessage] = useState("");
  const results = useMemo(() => searchCampusPlaces(query), [query]);

  function locateMe() {
    setLocationMessage("");
    if (!navigator.geolocation) {
      setLocationMessage("Location is not available in this browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coordinates = { longitude: position.coords.longitude, latitude: position.coords.latitude };
        window.dispatchEvent(new CustomEvent("lasu-locate", { detail: coordinates }));
        setLocationMessage("Your location is shown on the map.");
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) setLocationMessage("Location permission was denied. You can still browse and search places.");
        else if (error.code === error.TIMEOUT) setLocationMessage("Location took too long to respond. Please try again.");
        else setLocationMessage("We could not get your location. You can still browse and search places.");
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#home" aria-label="LASU Navigator home">
          <span className="brand-mark"><PinIcon /></span>
          <span className="brand-type"><strong>LASU</strong><span>campus navigator</span></span>
        </a>
        <div className="topbar-right"><span className="live-dot"/><span>Ojo campus</span><span className="topbar-divider"/><span className="phase-label">FOUNDATION</span></div>
      </header>

      <section className="welcome-strip" id="home">
        <div><p className="eyebrow">FIND YOUR WAY</p><h1>Explore LASU, with confidence.</h1><p className="intro-copy">Search mapped campus places and discover your surroundings.</p></div>
        <div className="data-note"><span className="note-icon">i</span><span>Place details are provisional and need LASU confirmation.</span></div>
      </section>

      <div className="workspace">
        <aside className="sidebar" aria-label="Campus destinations">
          <div className="search-box">
            <SearchIcon />
            <label className="sr-only" htmlFor="destination-search">Search campus destinations</label>
            <input id="destination-search" type="search" placeholder="Where do you want to go?" value={query} onChange={(event) => setQuery(event.target.value)} />
            <kbd>/</kbd>
          </div>
          <div className="list-heading"><span>Campus places</span><span className="result-count">{results.length} {results.length === 1 ? "place" : "places"}</span></div>
          <div className="place-list" aria-live="polite">
            {results.length ? results.map((place) => <PlaceCard key={place.id} place={place} active={selectedPlace?.id === place.id} onSelect={() => setSelectedPlace(place)} />) : (
              <div className="empty-state"><span className="empty-search"><SearchIcon /></span><strong>No places found</strong><span>Try another name or category.</span></div>
            )}
          </div>
          {selectedPlace && <section className="destination-details" aria-labelledby="destination-title">
            <div className="details-kicker">SELECTED DESTINATION</div>
            <div className="details-title-row"><h2 id="destination-title">{selectedPlace.name}</h2><span className={`status-pill status-${selectedPlace.verificationStatus}`}>{selectedPlace.verificationStatus === "verified" ? "LASU verified" : selectedPlace.verificationStatus === "illustrative" ? "Illustrative" : "Provisional"}</span></div>
            <p>{selectedPlace.description}</p>
            <div className="details-source">Source: <a href={selectedPlace.source.url} target="_blank" rel="noreferrer">{selectedPlace.source.name}</a> <span>· {selectedPlace.source.recordId}</span></div>
          </section>}
          <div className="sidebar-footer"><span className="footer-check">✓</span><span>Building a more reliable campus map, one confirmed place at a time.</span></div>
        </aside>

        <section className="map-section" aria-label="Interactive campus map">
          <div className="map-toolbar"><div className="map-caption"><span className="map-caption-icon"><PinIcon /></span><span><strong>LASU Ojo</strong><small>Campus area</small></span></div><button className="location-button" onClick={locateMe}><span className="location-target">◎</span><span>My location</span></button></div>
          <div className="map-container"><MapView places={campusPlaces} selectedPlace={selectedPlace} onSelect={setSelectedPlace} onLocation={() => setLocationMessage("Your current location is shown on the map.")} /></div>
          {locationMessage && <div role="status" className="location-message"><span>{locationMessage}</span><button aria-label="Dismiss location message" onClick={() => setLocationMessage("")}>×</button></div>}
          <div className="map-legend"><span className="legend-dot"/>Provisional place<span className="legend-separator"/><span className="legend-outline"/>Campus reference</div>
        </section>
      </div>

      <footer className="bottom-note"><span>LASU Smart Campus Navigator</span><span>Place data is provisional · No routes or live campus conditions</span><span>Map data © OpenStreetMap</span></footer>
    </main>
  );
}
