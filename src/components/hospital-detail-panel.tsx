import type { MapHospital } from "@/components/map-view";

type HospitalDetailPanelProps = {
  hospital: MapHospital;
  onClose: () => void;
};

const unverifiedFields = [
  ["24/7 emergency status", "Needs confirmation"],
  ["Trauma capability", "Needs confirmation"],
  ["Cardiac capability", "Needs confirmation"],
  ["Stroke capability", "Needs confirmation"],
  ["Published hospital phone", "Needs confirmation"],
  ["ER holding beds", "Needs confirmation"],
  ["Verification date", "Needs confirmation"],
  ["Patient experience", "Needs confirmation"]
];

export default function HospitalDetailPanel({ hospital, onClose }: HospitalDetailPanelProps) {
  const hasLocation = Number.isFinite(hospital.longitude) && Number.isFinite(hospital.latitude);
  const directionsUrl = hasLocation
    ? `https://www.google.com/maps/dir/?api=1&destination=${hospital.latitude},${hospital.longitude}`
    : undefined;

  return (
    <section className="hospital-detail" aria-labelledby="hospital-detail-title">
      <div className="detail-header">
        <div className="detail-title-wrap">
          <p className="eyebrow">MAP PROVIDER LISTING</p>
          <h2 id="hospital-detail-title">{hospital.name}</h2>
          <p className="provider-caveat">Provider information only · Not verified by ERMap</p>
        </div>
        <button className="detail-close" type="button" onClick={onClose} aria-label="Close hospital details">×</button>
      </div>

      <div className="provider-location">
        <div className="provider-location-icon" aria-hidden="true">⌖</div>
        <div className="provider-location-copy">
          <strong>Map location</strong>
          <span>OpenFreeMap · {hospital.latitude.toFixed(5)}, {hospital.longitude.toFixed(5)}</span>
        </div>
        {directionsUrl && <a className="directions-action" href={directionsUrl} target="_blank" rel="noreferrer">Directions <span aria-hidden="true">↗</span></a>}
      </div>

      <div className="verification-heading">
        <div><p className="eyebrow">ERMAP DIRECTORY</p><h3>Details to confirm</h3></div>
        <span>UNVERIFIED</span>
      </div>
      <dl className="verification-list">
        {unverifiedFields.map(([label, value]) => (
          <div className="verification-row" key={label}>
            <dt>{label}{label === "ER holding beds" && <small>ER holding only · ICU/CCU excluded</small>}</dt>
            <dd><span className="needs-confirmation-dot" />{value}</dd>
          </div>
        ))}
      </dl>

      <p className="provider-disclaimer">The name and map location above come from the map provider. They are not an ERMap-verified facility record. Confirm details directly before travelling.</p>
    </section>
  );
}
