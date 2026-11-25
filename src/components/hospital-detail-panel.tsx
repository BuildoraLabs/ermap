import type {
  EmergencyCapability,
  OwnershipCategory,
  VerifiedValue
} from "@/lib/hospital-directory";
import type { MapHospital } from "@/components/map-view";
import { formatDateDisplay, formatPhoneDisplay, isReverificationDue, phoneHref } from "@/lib/display-format";

type HospitalDetailPanelProps = {
  hospital: MapHospital;
  distance?: number;
  onClose: () => void;
};

const ownershipLabels: Record<OwnershipCategory, string> = {
  government: "GOVERNMENT",
  private: "PRIVATE",
  trust_charitable: "TRUST / CHARITABLE"
};

const emergencyFields: EmergencyCapability[] = [
  "24/7 emergency department",
  "Trauma",
  "Cardiac",
  "Stroke",
  "Orthopaedic",
  "Child / Paediatric emergency care",
  "Maternity emergency care"
];

function hasSourcedValue<T>(item: VerifiedValue<T> | undefined): item is VerifiedValue<T> {
  return Boolean(
    item
    && typeof item === "object"
    && item.verificationStatus === "verified"
    && typeof item.lastVerified === "string"
    && item.lastVerified.trim()
    && Number.isFinite(Date.parse(`${item.lastVerified}T00:00:00Z`))
    && hasDisplayValue(item.value)
    && Array.isArray(item.sourceUrls)
    && item.sourceUrls.length > 0
    && item.sourceUrls.every((url) => typeof url === "string" && url.startsWith("https://"))
  );
}

function hasDisplayValue(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") {
    const normalized = value.trim();
    return normalized.length > 0 && !/^(unavailable|not available)$/i.test(normalized);
  }
  if (typeof value === "number") return Number.isFinite(value);
  return true;
}

function SourceAndDate<T>({ item }: { item: VerifiedValue<T> }) {
  return (
    <small className="detail-source">
      Source: {item.sourceUrls.map((url, index) => (
        <span key={url}>
          {index > 0 && "; "}
          <a href={url} target="_blank" rel="noreferrer">{item.sourceUrls.length > 1 ? `Published source ${index + 1}` : "Published source"}</a>
        </span>
      ))}
      {" · verified "}{formatDateDisplay(item.lastVerified)}{isReverificationDue(item.lastVerified) ? " · Re-verification due" : ""}
    </small>
  );
}

function CallAction({ phone, label }: { phone: string; label: string }) {
  const normalizedPhone = phoneHref(phone);
  if (normalizedPhone.length < 7) return null;

  return <a className="call-hospital-action" href={`tel:${normalizedPhone}`}>{label}</a>;
}

export default function HospitalDetailPanel({ hospital, distance, onClose }: HospitalDetailPanelProps) {
  const enrichment = hospital.enrichment;
  const erAvailability = hasSourcedValue(enrichment?.erAvailability) && enrichment.erAvailability.value
    ? enrichment.erAvailability
    : undefined;
  const erStatus = hospital.erConfirmed && erAvailability ? "confirmed" : "not-confirmed";
  const officialName = hasSourcedValue(enrichment?.hospitalName) ? enrichment.hospitalName : undefined;
  const displayName = officialName?.value ?? (hasDisplayValue(hospital.name) ? hospital.name : undefined);
  const locality = hasSourcedValue(enrichment?.locality) ? enrichment.locality : undefined;
  const address = hasSourcedValue(enrichment?.address) ? enrichment.address : undefined;
  const generalPhone = hasSourcedValue(enrichment?.generalPhone) ? enrichment.generalPhone : undefined;
  const emergencyPhone = hasSourcedValue(enrichment?.emergencyPhone) ? enrichment.emergencyPhone : undefined;
  const ownership = hasSourcedValue(enrichment?.ownership) ? enrichment.ownership : undefined;
  const erBeds = hasSourcedValue(enrichment?.erHoldingBeds)
    && Number.isInteger(enrichment.erHoldingBeds.value)
    && enrichment.erHoldingBeds.value >= 0
    ? enrichment.erHoldingBeds
    : undefined;
  const hasLocation = Number.isFinite(hospital.longitude) && Number.isFinite(hospital.latitude);
  const displayLocality = locality?.value ?? (hasDisplayValue(hospital.locality) ? hospital.locality : undefined);
  const manipalCentralHelpline = generalPhone?.value.replace(/\D/g, "") === "18001025555"
    && officialName?.value.startsWith("Manipal Hospital");
  const manipalBranch = hospital.facilityId === "manipal-hebbal" ? "Hebbal" : "Yelahanka";
  const emergency24x7 = hasSourcedValue(enrichment?.emergency24x7) ? enrichment.emergency24x7 : undefined;
  const emergencyCapabilities = emergencyFields
    .filter((field) => field !== "24/7 emergency department")
    .flatMap((field) => {
      const capability = enrichment?.emergencyDetails?.[field];
      return hasSourcedValue(capability) ? [{ field, capability }] : [];
    });
  const emergencyScopeNote = hasSourcedValue(enrichment?.emergencyScopeNote) ? enrichment.emergencyScopeNote : undefined;
  const directionsUrl = hasLocation
    ? `https://www.google.com/maps/dir/?api=1&destination=${hospital.latitude},${hospital.longitude}`
    : undefined;

  return (
    <section className="hospital-detail" aria-label="Hospital details">
      <div className="detail-header">
        <div className="detail-title-wrap">
          <p className="detail-provider-label">{erStatus === "confirmed" ? "ERMAP PUBLISHED RECORD" : "MAP-PROVIDER RESULT · ER AVAILABILITY NOT CONFIRMED"}</p>
          {displayName && <h2 id="hospital-detail-title">{displayName}</h2>}
          {officialName && hasDisplayValue(hospital.name) && officialName.value !== hospital.name && <p className="map-provider-name">Map label: {hospital.name}</p>}
          {displayLocality && <p className="hospital-locality">{displayLocality}</p>}
          {distance !== undefined && Number.isFinite(distance) && distance >= 0 && <p className="facility-distance">{(distance / 1000).toFixed(1)} km straight-line distance from your location</p>}
          {ownership && (
            <>
              <div className={`ownership-badge ownership-${ownership.value}`}><strong>{ownershipLabels[ownership.value]}</strong></div>
              <SourceAndDate item={ownership} />
            </>
          )}
        </div>
        <button className="detail-close" type="button" onClick={onClose} aria-label="Close hospital details">×</button>
      </div>

      {(emergencyPhone || generalPhone) && <section className="contact-priority" aria-label="Hospital contact numbers">
        {emergencyPhone ? (
          <div className="phone-row phone-emergency">
            <div>
              <strong className="phone-label">Emergency department phone</strong>
              <a className="hospital-phone-number" href={`tel:${phoneHref(emergencyPhone.value)}`}>{formatPhoneDisplay(emergencyPhone.value)}</a>
              <SourceAndDate item={emergencyPhone} />
            </div>
            <CallAction phone={emergencyPhone.value} label="Call emergency department" />
          </div>
        ) : null}
        {generalPhone ? (
          <div className="phone-row phone-general">
            <div>
              <strong className="phone-label">{manipalCentralHelpline ? "Manipal Hospitals central helpline (shared)" : "General hospital contact"}</strong>
              <a className="hospital-phone-number" href={`tel:${phoneHref(generalPhone.value)}`}>{formatPhoneDisplay(generalPhone.value)}</a>
              <SourceAndDate item={generalPhone} />
              <small className="phone-routing-note">{manipalCentralHelpline ? `Shared helpline; ask for the ${manipalBranch} branch.` : `Published contact number; hours are not implied.${emergencyPhone ? "" : " Ask to be connected to casualty / emergency."}`}</small>
            </div>
            <CallAction phone={generalPhone.value} label="Call hospital" />
          </div>
        ) : null}
      </section>}

      {address && (
        <div className="official-address">
          <span>{address.value}</span>
          <SourceAndDate item={address} />
        </div>
      )}

      {hasLocation && <div className="provider-location">
        <div className="provider-location-icon" aria-hidden="true">⌖</div>
        <div className="provider-location-copy">
          <strong>Map location</strong>
          <span>Coordinates · {hospital.latitude.toFixed(5)}, {hospital.longitude.toFixed(5)}</span>
        </div>
        {directionsUrl && <a className="directions-action" href={directionsUrl} target="_blank" rel="noreferrer">Directions <span aria-hidden="true">↗</span></a>}
      </div>}

      {(emergency24x7 || emergencyCapabilities.length > 0 || emergencyScopeNote) && <section className="detail-section" aria-labelledby="emergency-details-title">
        <div className="detail-section-heading">
          <span className="detail-section-icon emergency-section-icon" aria-hidden="true">+</span>
          <div><p className="eyebrow">EMERGENCY CARE</p><h3 id="emergency-details-title">Emergency services</h3></div>
        </div>
        <div className="emergency-facts">
          {emergency24x7 && <div className="emergency-hours-row"><span>24/7 emergency department</span><strong className={emergency24x7.value ? "fact-yes" : "fact-no"}>{emergency24x7.value ? "Published as 24/7" : "Not published as 24/7"}</strong><SourceAndDate item={emergency24x7} /></div>}
          {emergencyScopeNote && <p className="emergency-scope-note">{emergencyScopeNote.value} <SourceAndDate item={emergencyScopeNote} /></p>}
          {emergencyCapabilities.map(({ field, capability }) => (
            <div className="emergency-fact" key={field}>
              <span>{field}</span>
              <strong className={capability.value ? "fact-yes" : "fact-no"}>{capability.value ? "Available" : "Not offered"}</strong>
              <SourceAndDate item={capability} />
            </div>
          ))}
        </div>
      </section>}

      {erBeds && <section className="detail-section" aria-labelledby="er-beds-title">
        <div className="detail-section-heading">
          <span className="detail-section-icon beds-section-icon" aria-hidden="true">▤</span>
          <div><p className="eyebrow">BED INFORMATION</p><h3 id="er-beds-title">ER holding beds</h3></div>
        </div>
        <div className="bed-count">
          <strong>{erBeds.value}</strong><span>ER holding beds</span>
          <SourceAndDate item={erBeds} />
        </div>
        <p className="bed-separation-note">ER holding beds are separate from ICU and CCU beds. Reported counts are not live availability.</p>
      </section>}

      <p className="provider-disclaimer">Call the hospital to confirm emergency services and current availability before travelling.</p>
      <a className="report-error-link" href="/about#contact">Contact details are being configured</a>
    </section>
  );
}
