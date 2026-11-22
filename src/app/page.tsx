"use client";

import { useCallback, useState } from "react";
import HospitalDetailPanel from "@/components/hospital-detail-panel";
import LocationSearch, { type SearchLocation } from "@/components/location-search";
import MapView, { type MapHospital } from "@/components/map-view";

const conditions = [
  { name: "Trauma", icon: "+" },
  { name: "Cardiac", icon: "♡" },
  { name: "Stroke", icon: "⌁" },
  { name: "Neurosurgery", icon: "◉" },
  { name: "Fall / Injury", icon: "↘", help: "Includes a fall at home" },
  { name: "Child", icon: "⌣" },
  { name: "Maternity", icon: "✳" }
];
const ownershipOptions = ["All", "Government", "Private", "Trust / Charitable"];

export default function Home() {
  const [activeConditions, setActiveConditions] = useState<string[]>([]);
  const [ownership, setOwnership] = useState("All");
  const [selectedHospital, setSelectedHospital] = useState<MapHospital | null>(null);
  const [searchLocation, setSearchLocation] = useState<SearchLocation | null>(null);

  const handleHospitalSelect = useCallback((hospital: MapHospital) => {
    setSelectedHospital(hospital);
  }, []);

  const handleSearchSelect = useCallback((location: SearchLocation) => {
    setSelectedHospital(null);
    setSearchLocation(location);
  }, []);

  function toggleCondition(condition: string) {
    setActiveConditions((current) => current.includes(condition)
      ? current.filter((item) => item !== condition)
      : [...current, condition]);
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#home" aria-label="ERMap home">
          <span className="brand-mark" aria-hidden="true"><span /></span>
          <span><strong>ERMap</strong><small>NORTH BENGALURU</small></span>
        </a>
        <div className="topbar-note"><span className="live-dot" /> A clearer way to find care</div>
        <a className="about-link" href="#trust-note">How ERMap works <span aria-hidden="true">↗</span></a>
      </header>

      <section className="workspace" id="home" aria-label="Emergency care discovery">
        <div className="map-column">
          <div className="map-toolbar">
            <LocationSearch onSelect={handleSearchSelect} />
            <button className="location-button" type="button" aria-label="Location services are not available yet" title="Location services are not available yet">
              <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="7.5" /><circle cx="12" cy="12" r="2.5" /><path d="M12 2v2m0 16v2M2 12h2m16 0h2" /></svg>
            </button>
          </div>

          <div className="filter-row" aria-label="Map filters">
            <span className="filter-label">CARE FOR</span>
            {conditions.map((condition) => (
              <button
                key={condition.name}
                type="button"
                className={`filter-chip ${activeConditions.includes(condition.name) ? "is-active" : ""}`}
                aria-pressed={activeConditions.includes(condition.name)}
                aria-label={condition.help ? `${condition.name}: ${condition.help}` : condition.name}
                title={condition.help}
                onClick={() => toggleCondition(condition.name)}
              >
                <span className={`condition-icon icon-${condition.name.toLowerCase().replace(/[^a-z]+/g, "-")}`} aria-hidden="true">{condition.icon}</span>
                {condition.name}
              </button>
            ))}
          </div>
          <p className="filter-disclaimer">Choose care needs to filter verified listings when available. Filters do not confirm a facility offers a service. Fall / Injury includes falls at home.</p>

          <div className="map-frame">
            <MapView onHospitalSelect={handleHospitalSelect} searchLocation={searchLocation} />
            <div className="map-area-label"><span className="area-pulse" /> PILOT AREA <span className="area-divider">/</span> NORTH BENGALURU</div>
          </div>
          <p className="map-footnote"><span className="info-icon">i</span> Map labels are from OpenFreeMap and are not ERMap-verified facility records.</p>
        </div>

        <aside className="care-panel" aria-label="Emergency actions and directory filters">
          <div className="panel-heading">
            <p className="eyebrow">NORTH BENGALURU PILOT</p>
            <h1>Find care.<br /><em>With clarity.</em></h1>
            <p className="panel-intro">Explore the area and narrow your search. Facility details will appear here as they are verified.</p>
          </div>

          <section className="emergency-card" aria-labelledby="emergency-heading">
            <div className="emergency-heading"><span className="emergency-symbol" aria-hidden="true">!</span><div><p className="eyebrow">NEED HELP NOW?</p><h2 id="emergency-heading">Call emergency services</h2></div></div>
            <div className="call-actions">
              <a href="tel:112"><span>112</span><small>Emergency</small><b aria-hidden="true">↗</b></a>
              <a href="tel:108"><span>108</span><small>Ambulance</small><b aria-hidden="true">↗</b></a>
            </div>
            <p className="emergency-note">If someone may be in immediate danger, call first.</p>
          </section>

          <section className="ownership-section" aria-labelledby="ownership-heading">
            <div className="section-title-row"><h2 id="ownership-heading">Facility ownership</h2><span>FILTER</span></div>
            <div className="ownership-options" role="group" aria-label="Filter by facility ownership">
              {ownershipOptions.map((option) => (
                <button type="button" key={option} aria-pressed={ownership === option} className={ownership === option ? "selected" : ""} onClick={() => setOwnership(option)}>{option}</button>
              ))}
            </div>
          </section>

          {selectedHospital ? (
            <HospitalDetailPanel hospital={selectedHospital} onClose={() => setSelectedHospital(null)} />
          ) : (
            <section className="results-empty" aria-live="polite">
              <div className="empty-icon" aria-hidden="true"><svg viewBox="0 0 48 48"><path d="M24 42s14-12.5 14-24a14 14 0 1 0-28 0c0 11.5 14 24 14 24Z" /><circle cx="24" cy="18" r="4.5" /><path d="M18 31h12" /></svg></div>
              <h2>No ERMap-verified facilities yet</h2>
              <p>Basemap hospital labels are supplied by OpenFreeMap. ERMap will list verified facility details here when available.</p>
              <div className="result-count"><span className="result-dot" /> 0 verified facilities <span className="count-separator">·</span> North Bengaluru</div>
            </section>
          )}

          <div className="trust-note" id="trust-note"><span aria-hidden="true">✳</span><p><strong>Information, not medical advice.</strong><br />Details can change. Call a facility before travelling.</p></div>
        </aside>
      </section>

      <footer className="page-footer"><span>ERMap <span className="footer-dot">·</span> Emergency care, with clarity.</span><span>In an emergency, call <strong>112</strong> or <strong>108</strong> first.</span></footer>
    </main>
  );
}
