"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { findConfirmedERFacility } from "@/lib/hospital-directory";

export type SearchLocation = {
  id: string;
  name: string;
  context: string;
  label: string;
  longitude: number;
  latitude: number;
  isHospital: boolean;
};

type SearchState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "results"; results: SearchLocation[] }
  | { status: "empty" }
  | { status: "error" };

type PhotonFeature = {
  geometry?: { type?: string; coordinates?: unknown };
  properties?: Record<string, unknown>;
};

type LocationSearchProps = {
  onSelect: (location: SearchLocation) => void;
};

const PHOTON_URL = "https://photon.komoot.io/api/";
const PILOT_BOUNDS = "77.45,12.93,77.76,13.20";
const MIN_QUERY_LENGTH = 2;
const MIN_REQUEST_INTERVAL_MS = 1000;

function asText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function toSearchLocation(feature: PhotonFeature, index: number): SearchLocation | null {
  const properties = feature.properties;
  const coordinates = feature.geometry?.coordinates;
  if (!properties || !Array.isArray(coordinates) || coordinates.length < 2) return null;

  const longitude = Number(coordinates[0]);
  const latitude = Number(coordinates[1]);
  if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) return null;

  const name = asText(properties.name) || asText(properties.street);
  if (!name) return null;
  const addressParts = [
    [asText(properties.housenumber), asText(properties.street)].filter(Boolean).join(" "),
    asText(properties.suburb),
    asText(properties.district),
    asText(properties.city),
    asText(properties.state)
  ].filter((part, partIndex, all) => part && part !== name && all.indexOf(part) === partIndex);
  const context = addressParts.join(", ");
  const providerId = [asText(properties.osm_type), asText(properties.osm_id)].filter(Boolean).join("-");

  return {
    id: providerId || `${longitude.toFixed(5)}-${latitude.toFixed(5)}-${index}`,
    name,
    context,
    label: [name, context].filter(Boolean).join(", "),
    longitude,
    latitude,
    isHospital: [
      `${asText(properties.osm_key)} ${asText(properties.osm_value)}`,
      asText(properties.healthcare),
      asText(properties.amenity)
    ].some((value) => /(^|\s)(hospital|healthcare hospital)(\s|$)/i.test(value))
  };
}

export default function LocationSearch({ onSelect }: LocationSearchProps) {
  const [query, setQuery] = useState("");
  const [searchState, setSearchState] = useState<SearchState>({ status: "idle" });
  const [activeIndex, setActiveIndex] = useState(0);
  const [searchNow, setSearchNow] = useState(0);
  const [clearFocus, setClearFocus] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastRequestAt = useRef(0);
  const skipSearchFor = useRef<string | null>(null);

  useEffect(() => {
    const trimmedQuery = query.trim();
    if (skipSearchFor.current === trimmedQuery) {
      skipSearchFor.current = null;
      setSearchState({ status: "idle" });
      return;
    }
    skipSearchFor.current = null;

    if (trimmedQuery.length < MIN_QUERY_LENGTH) {
      setSearchState({ status: "idle" });
      return;
    }

    let cancelled = false;
    const waitForRequestSlot = Math.max(0, MIN_REQUEST_INTERVAL_MS - (Date.now() - lastRequestAt.current));
    const delay = searchNow > 0 ? waitForRequestSlot : Math.max(450, waitForRequestSlot);
    const timer = window.setTimeout(async () => {
      setSearchState({ status: "loading" });
      lastRequestAt.current = Date.now();

      try {
        const params = new URLSearchParams({
          q: trimmedQuery,
          lat: "13.075",
          lon: "77.62",
          zoom: "12",
          location_bias_scale: "0.6",
          bbox: PILOT_BOUNDS,
          limit: "6",
          lang: "en"
        });
        const response = await fetch(`${PHOTON_URL}?${params.toString()}`, {
          headers: { Accept: "application/json" }
        });
        if (!response.ok) throw new Error(`Photon search failed: ${response.status}`);

        const payload = await response.json() as { features?: PhotonFeature[] };
        const results = (payload.features ?? [])
          .map(toSearchLocation)
          .filter((result): result is SearchLocation => result !== null);
        if (cancelled) return;

        setActiveIndex(0);
        setSearchState(results.length > 0 ? { status: "results", results } : { status: "empty" });
      } catch {
        if (!cancelled) setSearchState({ status: "error" });
      }
    }, delay);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [query, searchNow]);

  useEffect(() => {
    if (clearFocus > 0) inputRef.current?.focus();
  }, [clearFocus]);

  function selectResult(result: SearchLocation) {
    skipSearchFor.current = result.label;
    setQuery(result.label);
    setSearchState({ status: "idle" });
    onSelect(result);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      setSearchState({ status: "idle" });
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      if (searchState.status === "results") {
        selectResult(searchState.results[activeIndex] ?? searchState.results[0]);
      } else if (query.trim().length >= MIN_QUERY_LENGTH) {
        setSearchNow((value) => value + 1);
      }
      return;
    }

    if (searchState.status !== "results" || !["ArrowDown", "ArrowUp"].includes(event.key)) return;
    event.preventDefault();
    const direction = event.key === "ArrowDown" ? 1 : -1;
    setActiveIndex((current) => (current + direction + searchState.results.length) % searchState.results.length);
  }

  const results = searchState.status === "results" ? searchState.results : [];
  const showDropdown = query.trim().length >= MIN_QUERY_LENGTH && searchState.status !== "idle";

  return (
    <div className="search-field-wrap">
      <div className="search-box">
        <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 4.5 4.5" /></svg>
        <input
          ref={inputRef}
          aria-label="Search hospitals, areas, landmarks or addresses"
          aria-autocomplete="list"
          aria-controls="location-search-results"
          aria-expanded={showDropdown}
          aria-activedescendant={results[activeIndex] ? `location-result-${activeIndex}` : undefined}
          autoComplete="off"
          placeholder="Search hospitals, areas or landmarks"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={handleKeyDown}
        />
        {query ? (
          <button
            className="clear-search"
            type="button"
            aria-label="Clear search"
            onClick={() => {
              setQuery("");
              setSearchState({ status: "idle" });
              setClearFocus((value) => value + 1);
            }}
          >×</button>
        ) : <kbd>Enter</kbd>}
      </div>

      {showDropdown && (
        <div className="search-dropdown" id="location-search-results" role="listbox" aria-label="Map search results">
          {searchState.status === "loading" && <div className="search-state"><span className="search-spinner" />Searching places…</div>}
          {searchState.status === "empty" && <div className="search-state"><strong>No results found</strong><span>Try a nearby locality, landmark or a shorter name.</span></div>}
          {searchState.status === "error" && <div className="search-state search-error"><strong>Search is unavailable</strong><span>Check your connection and try again.</span><button type="button" onClick={() => setSearchNow((value) => value + 1)}>Try again</button></div>}
          {results.map((result, index) => (
            <button
              className={`search-result ${activeIndex === index ? "is-active" : ""}`}
              id={`location-result-${index}`}
              key={result.id}
              role="option"
              aria-selected={activeIndex === index}
              type="button"
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => selectResult(result)}
            >
              <span className="search-result-icon" aria-hidden="true">⌖</span>
              <span className="search-result-copy"><strong>{result.name}</strong><small>{result.context}</small><em>{result.isHospital && !findConfirmedERFacility(result.name, [result.longitude, result.latitude]) ? "ER availability not confirmed · map-provider result" : result.isHospital ? "ERMap confirmed · published source" : "Map search result · not ERMap-verified"}</em></span>
            </button>
          ))}
          <div className="search-attribution">Search via <a href="https://github.com/komoot/photon" target="_blank" rel="noreferrer">Photon</a> · Data © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap contributors</a></div>
        </div>
      )}
    </div>
  );
}
