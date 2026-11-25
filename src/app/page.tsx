"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import HospitalDetailPanel from "@/components/hospital-detail-panel";
import LocationSearch, { type SearchLocation } from "@/components/location-search";
import MapView, { type MapHospital } from "@/components/map-view";
import {
  confirmedERFacilities,
  distanceMeters,
  type ConfirmedERFacility,
  type EmergencyCapability,
  type OwnershipCategory
} from "@/lib/hospital-directory";
import { formatPhoneDisplay, isReverificationDue, phoneHref } from "@/lib/display-format";

const conditions = [
  { name: "Trauma", icon: "+", capability: "Trauma" as EmergencyCapability },
  { name: "Cardiac", icon: "\u2665", capability: "Cardiac" as EmergencyCapability },
  { name: "Stroke", icon: "\u25CE", capability: "Stroke" as EmergencyCapability },
  { name: "Orthopaedic", icon: "\u25C7", help: "Emergency assessment of fractures, suspected fractures, bone, joint and musculoskeletal injuries", capability: "Orthopaedic" as EmergencyCapability },
  { name: "Fall / Injury", icon: "\u2198", help: "Includes falls at home", capability: "Trauma" as EmergencyCapability },
  { name: "Child", icon: "\u25CF", capability: "Child / Paediatric emergency care" as EmergencyCapability },
  { name: "Maternity", icon: "\u2733", capability: "Maternity emergency care" as EmergencyCapability }
];
const ownershipOptions = ["All", "Government", "Private", "Trust / Charitable"];
const ownershipKey: Record<string, OwnershipCategory | undefined> = {
  Government: "government",
  Private: "private",
  "Trust / Charitable": "trust_charitable"
};

type UserPoint = { longitude: number; latitude: number };

function formatDistance(meters: number) {
  return `${(meters / 1000).toFixed(1)} km straight-line distance`;
}

function facilityAsMapHospital(id: string): MapHospital | undefined {
  const facility = confirmedERFacilities.find((entry) => entry.id === id);
  if (!facility) return;
  return {
    name: facility.data.hospitalName.value,
    locality: facility.data.locality.value,
    longitude: facility.mapLocation[0],
    latitude: facility.mapLocation[1],
    erConfirmed: true,
    facilityId: facility.id,
    enrichment: facility.data
  };
}

type FacilityDisplayEntry = {
  facility: ConfirmedERFacility;
  distance?: number;
};

function FacilityDirectoryList({ entries, selectedFacilityId, onSelect }: {
  entries: FacilityDisplayEntry[];
  selectedFacilityId?: string;
  onSelect: (facilityId: string) => void;
}) {
  return (
    <ol className="facility-list">
      {entries.map(({ facility, distance }) => {
        const rawName = facility.data.hospitalName?.value;
        const facilityName = typeof rawName === "string" && rawName.trim() && !/^(unavailable|not available)$/i.test(rawName.trim())
          ? rawName.trim()
          : undefined;
        const rawLocality = facility.data.locality?.value;
        const facilityLocality = typeof rawLocality === "string" && rawLocality.trim() && !/^(unavailable|not available)$/i.test(rawLocality.trim())
          ? rawLocality.trim()
          : undefined;
        const phoneValue = facility.data.generalPhone?.value;
        const phone = phoneValue?.trim() && !/^(unavailable|not available)$/i.test(phoneValue.trim())
          ? facility.data.generalPhone
          : undefined;
        const ownershipName = facility.data.ownership?.value;
        const ownershipLabel = ownershipName === "private" ? "PRIVATE" : ownershipName === "government" ? "GOVERNMENT" : ownershipName === "trust_charitable" ? "TRUST / CHARITABLE" : undefined;
        const selected = selectedFacilityId === facility.id;
        const distanceLabel = distance !== undefined && Number.isFinite(distance) && distance >= 0 ? formatDistance(distance) : undefined;
        const verifiedDate = facility.data.lastVerified;
        const isDateValid = typeof verifiedDate === "string" && Number.isFinite(Date.parse(`${verifiedDate}T00:00:00Z`));
        const reverificationDue = isDateValid && isReverificationDue(verifiedDate);
        const hasPublishedTiming = facility.data.emergency24x7?.value === true || facility.data.emergency24x7?.value === false;
        const hasMetadata = Boolean(ownershipLabel || hasPublishedTiming || reverificationDue);
        return (
          <li key={facility.id}>
            <div className={`facility-card-wrap ${selected ? "is-selected" : ""}`}>
              <button type="button" className={`facility-card ${selected ? "is-selected" : ""}`} onClick={() => onSelect(facility.id)} aria-label={facilityName ? `Open ${facilityName} details` : "Open emergency department details"}>
                <span className="facility-er-symbol">ER</span>
                <span className="facility-copy">{facilityName && <strong>{facilityName}</strong>}{(facilityLocality || distanceLabel) && <small>{facilityLocality}{facilityLocality && distanceLabel ? ` · ${distanceLabel}` : distanceLabel}</small>}{hasMetadata && <span className="facility-meta">{ownershipLabel && <em className={`ownership-text ownership-text-${ownershipName}`}>{ownershipLabel}</em>}{facility.data.emergency24x7?.value === true && <em>24/7 emergency published</em>}{facility.data.emergency24x7?.value === false && <em>Not published as 24/7</em>}{reverificationDue && <em className="reverification-due">Re-verification due</em>}</span>}</span>
              </button>
              {phone && <span className="facility-phone-area"><span className="facility-phone-number">{formatPhoneDisplay(phone.value)}</span><a className="facility-phone" href={`tel:${phoneHref(phone.value)}`} aria-label={`Call general hospital contact${facilityName ? ` for ${facilityName}` : ""}`}>Call hospital</a></span>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export default function Home() {
  const [activeConditions, setActiveConditions] = useState<string[]>([]);
  const [ownership, setOwnership] = useState("All");
  const [selectedHospital, setSelectedHospital] = useState<MapHospital | null>(null);
  const [searchLocation, setSearchLocation] = useState<SearchLocation | null>(null);
  const [userLocation, setUserLocation] = useState<UserPoint | null>(null);
  const [locationState, setLocationState] = useState<"idle" | "loading" | "denied" | "error">("idle");
  const [fitAllRequest, setFitAllRequest] = useState(0);
  const [showAllHospitals, setShowAllHospitals] = useState(false);
  const [directoryPage, setDirectoryPage] = useState(0);
  const carePanelRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (selectedHospital) carePanelRef.current?.scrollTo({ top: 0 });
  }, [selectedHospital]);

  const handleHospitalSelect = useCallback((hospital: MapHospital) => {
    setSelectedHospital(hospital);
  }, []);

  const handleSearchSelect = useCallback((location: SearchLocation) => {
    setSelectedHospital(null);
    setSearchLocation(location);
  }, []);

  const { visibleFacilities, unconfirmedServiceFacilities } = useMemo(() => {
    const selectedOwnership = ownershipKey[ownership];
    const candidates = confirmedERFacilities
      .filter((facility) => !selectedOwnership || facility.data.ownership?.value === selectedOwnership)
      .map((facility) => ({
        facility,
        distance: userLocation
          ? distanceMeters([userLocation.longitude, userLocation.latitude], facility.mapLocation)
          : undefined
      }))
      .sort((left, right) => userLocation
        ? (left.distance ?? Infinity) - (right.distance ?? Infinity)
        : left.facility.localityOrder - right.facility.localityOrder || left.facility.data.hospitalName.value.localeCompare(right.facility.data.hospitalName.value));
    const states = candidates.map((entry) => {
      const values = activeConditions.map((condition) => {
        const requiredCapability = conditions.find((item) => item.name === condition)?.capability;
        return requiredCapability
          ? entry.facility.data.emergencyDetails?.[requiredCapability]?.value
          : undefined;
      });
      return { entry, confirmed: values.every((value) => value === true), hasMissing: values.some((value) => value === undefined), excluded: values.some((value) => value === false) };
    });

    return {
      visibleFacilities: states.filter((state) => state.confirmed).map((state) => state.entry),
      unconfirmedServiceFacilities: states.filter((state) => !state.excluded && !state.confirmed && state.hasMissing).map((state) => state.entry)
    };
  }, [activeConditions, ownership, userLocation]);

  const pageSize = showAllHospitals ? 10 : 6;
  const allDirectoryEntries = [...visibleFacilities, ...unconfirmedServiceFacilities];
  const pageCount = Math.max(1, Math.ceil(allDirectoryEntries.length / pageSize));
  const currentPage = Math.min(directoryPage, pageCount - 1);
  const pageEntries = allDirectoryEntries.slice(currentPage * pageSize, (currentPage + 1) * pageSize);
  const pageConfirmed = pageEntries.filter((entry) => visibleFacilities.some((candidate) => candidate.facility.id === entry.facility.id));
  const pageUnconfirmed = pageEntries.filter((entry) => unconfirmedServiceFacilities.some((candidate) => candidate.facility.id === entry.facility.id));

  function toggleCondition(condition: string) {
    setActiveConditions((current) => current.includes(condition)
      ? current.filter((item) => item !== condition)
      : [...current, condition]);
  }

  function requestLocation() {
    if (!navigator.geolocation) {
      setLocationState("error");
      return;
    }
    setLocationState("loading");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({ longitude: position.coords.longitude, latitude: position.coords.latitude });
        setLocationState("idle");
      },
      (error) => setLocationState(error.code === error.PERMISSION_DENIED ? "denied" : "error"),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#home" aria-label="ERMap home">
          <span className="brand-mark" aria-hidden="true"><span /></span>
          <span><strong>ERMap</strong><small>NORTH BENGALURU</small></span>
        </a>
        <div className="topbar-note"><span className="live-dot" /> Emergency department discovery</div>
        <a className="about-link" href="/about">About &amp; sources <span aria-hidden="true">&rarr;</span></a>
      </header>

      <section className="workspace" id="home" aria-label="Emergency care discovery">
        <div className="map-column">
          <div className="map-toolbar">
            <LocationSearch onSelect={handleSearchSelect} />
            <button className={`location-button ${locationState === "loading" ? "is-loading" : ""}`} type="button" aria-label="Find nearest emergency departments using my location" title="Find nearest emergency departments using my location" onClick={requestLocation} disabled={locationState === "loading"}>
              <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="7.5" /><circle cx="12" cy="12" r="2.5" /><path d="M12 2v2m0 16v2M2 12h2m16 0h2" /></svg>
            </button>
          </div>
          {locationState === "denied" && <p className="location-message" role="status">Location access was denied. Results remain arranged by locality.</p>}
          {locationState === "error" && <p className="location-message" role="status">Location could not be read. You can still browse by locality.</p>}
          {locationState === "idle" && userLocation && <p className="location-message location-success" role="status">Nearest facilities are shown first. Your location stays on this device.</p>}

          <div className="filter-row" aria-label="Filter confirmed emergency departments by care type">
            <span className="filter-label">CARE FOR</span>
            {conditions.map((condition) => (
              <button key={condition.name} type="button" className={`filter-chip ${activeConditions.includes(condition.name) ? "is-active" : ""}`} aria-pressed={activeConditions.includes(condition.name)} aria-label={condition.help ? `${condition.name}: ${condition.help}` : condition.name} title={condition.help} onClick={() => toggleCondition(condition.name)}>
                <span className={`condition-icon icon-${condition.name.toLowerCase().replace(/[^a-z]+/g, "-")}`} aria-hidden="true">{condition.icon}</span>
                {condition.name}
              </button>
            ))}
          </div>
          <p className="filter-disclaimer">Filters include only services published by the hospital. Fall / Injury shows facilities with a published trauma service; call to confirm care for a specific fall.</p>

          <div className="map-frame">
            <MapView onHospitalSelect={handleHospitalSelect} searchLocation={searchLocation} selectedFacilityId={selectedHospital?.facilityId ?? null} fitAllRequest={fitAllRequest} userLocation={userLocation} />
            <div className="map-area-label"><span className="area-pulse" /> PILOT AREA <span className="area-divider">/</span> NORTH BENGALURU</div>
            <div className="map-marker-legend"><span className="legend-er">ER</span> Confirmed emergency departments</div>
          </div>
          <p className="map-footnote"><span className="info-icon">i</span> ER markers use published facility sources. Basemap labels are map-provider information only.</p>
        </div>

        <aside ref={carePanelRef} className="care-panel" aria-label="Emergency actions and ER directory">
          <div className="panel-heading">
            <p className="eyebrow">NORTH BENGALURU PILOT</p>
            <h1>Find emergency care.<br /><em>With clarity.</em></h1>
            <p className="panel-intro">Browse emergency departments with published information. This directory does not rank clinical quality.</p>
          </div>

          <section className="emergency-card" aria-labelledby="emergency-heading">
            <div className="emergency-heading"><span className="emergency-symbol" aria-hidden="true">!</span><div><p className="eyebrow">NEED HELP NOW?</p><h2 id="emergency-heading">Call emergency services</h2></div></div>
            <div className="call-actions">
              <a href="tel:112"><span>112</span><small>Emergency</small><b aria-hidden="true">&rarr;</b></a>
              <a href="tel:108"><span>108</span><small>Ambulance</small><b aria-hidden="true">&rarr;</b></a>
            </div>
            <p className="emergency-note">If someone may be in immediate danger, call first.</p>
          </section>

          {selectedHospital && <HospitalDetailPanel hospital={selectedHospital} distance={userLocation ? distanceMeters([userLocation.longitude, userLocation.latitude], [selectedHospital.longitude, selectedHospital.latitude]) : undefined} onClose={() => setSelectedHospital(null)} />}

          <section className="ownership-section" aria-labelledby="ownership-heading">
            <div className="section-title-row"><h2 id="ownership-heading">Ownership</h2><span>FILTER</span></div>
            <div className="ownership-options" role="group" aria-label="Filter by facility ownership">
              {ownershipOptions.map((option) => <button type="button" key={option} aria-pressed={ownership === option} className={ownership === option ? "selected" : ""} onClick={() => setOwnership(option)}>{option}</button>)}
            </div>
          </section>

          <section className="er-directory" aria-labelledby="directory-heading">
            <div className="directory-heading-row"><div><p className="eyebrow">PUBLISHED ER INFORMATION</p><h2 id="directory-heading">Emergency hospitals</h2></div><span className="directory-count">{allDirectoryEntries.length} confirmed ER {allDirectoryEntries.length === 1 ? "facility" : "facilities"}</span></div>
            <p className="directory-note">Confirmed emergency departments, arranged by locality{userLocation ? " and nearest straight-line distance" : ""}. Services and availability may change.</p>
            <button className="view-all-map" type="button" onClick={() => { setSelectedHospital(null); setFitAllRequest((value) => value + 1); }}>View all on map <span aria-hidden="true">&rarr;</span></button>
            {pageConfirmed.length > 0 && (
              <FacilityDirectoryList entries={pageConfirmed} selectedFacilityId={selectedHospital?.facilityId} onSelect={(id) => setSelectedHospital(facilityAsMapHospital(id) ?? null)} />
            )}
            {pageConfirmed.length === 0 && pageUnconfirmed.length === 0 && (
              <div className="directory-empty" role="status"><strong>No confirmed ER facilities match these filters.</strong><span>Remove a filter to see the available published ER information.</span></div>
            )}
            {activeConditions.length > 0 && pageUnconfirmed.length > 0 && (
              <section className="service-unconfirmed-group" aria-labelledby="service-unconfirmed-heading">
                <h3 id="service-unconfirmed-heading">Service not published: call to confirm</h3>
                <p>These facilities do not have published information for every selected service. Their capabilities are not confirmed.</p>
                <FacilityDirectoryList entries={pageUnconfirmed} selectedFacilityId={selectedHospital?.facilityId} onSelect={(id) => setSelectedHospital(facilityAsMapHospital(id) ?? null)} />
              </section>
            )}
            {allDirectoryEntries.length > 6 && <button className="view-all-hospitals" type="button" onClick={() => { setShowAllHospitals((show) => !show); setDirectoryPage(0); }}>{showAllHospitals ? "Show first 6 hospitals" : "View all emergency hospitals"}</button>}
            {showAllHospitals && pageCount > 1 && <nav className="directory-pagination" aria-label="Emergency hospital pages"><button type="button" disabled={currentPage === 0} onClick={() => setDirectoryPage(currentPage - 1)}>Previous</button><span>Page {currentPage + 1} of {pageCount}</span><button type="button" disabled={currentPage >= pageCount - 1} onClick={() => setDirectoryPage(currentPage + 1)}>Next</button></nav>}
            <p className="directory-data-note">Only facilities with published emergency-care evidence appear here. Map-provider hospital results remain unverified and are not ERMap facility records.</p>
          </section>

          <div className="trust-note" id="trust-note"><span aria-hidden="true">\u2733</span><p><strong>Information, not medical advice.</strong><br />Call the hospital to confirm emergency services and current availability before travelling.</p></div>
        </aside>
      </section>

      <footer className="page-footer"><span>ERMap <span className="footer-dot">&middot;</span> Emergency care, with clarity.</span><span><a href="/about">About &amp; sources</a> · <a href="/about#contact">Contact details being configured</a></span><span>In an emergency, call <strong>112</strong> or <strong>108</strong> first.</span><span className="developer-credit">Developed by <a href="https://x.com/KunalZ57" target="_blank" rel="noopener noreferrer">@KunalZ57</a></span></footer>
    </main>
  );
}
