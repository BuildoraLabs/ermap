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
    && item.verificationStatus === "verified"
    && item.lastVerified.trim()
    && item.sourceUrls.length > 0
    && item.sourceUrls.every((url) => url.startsWith("https://"))
  );
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
      {" · verified "}{formatDateDisplay(item.lastVerified)}
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
  const directionsUrl = hasLocation
    ? `https://www.google.com/maps/dir/?api=1&destination=${hospital.latitude},${hospital.longitude}`
    : undefined;
  const verifiedDates = [
    enrichment?.erAvailability?.lastVerified,
    enrichment?.emergency24x7?.lastVerified,
    officialName?.lastVerified,
    locality?.lastVerified,
    address?.lastVerified,
    generalPhone?.lastVerified,
    emergencyPhone?.lastVerified,
    ownership?.lastVerified,
    ...Object.values(enrichment?.emergencyDetails ?? {}).flatMap((item) =>
      hasSourcedValue(item) ? [item.lastVerified] : []
    ),
    erBeds?.lastVerified
  ].filter((date): date is string => Boolean(date?.trim()));
  const lastVerified = enrichment?.lastVerified ?? verifiedDates
    .sort((left, right) => new Date(right).getTime() - new Date(left).getTime())[0];

  return (
    <section className="hospital-detail" aria-labelledby="hospital-detail-title">
      <div className="detail-header">
        <div className="detail-title-wrap">
          <p className="detail-provider-label">{erStatus === "confirmed" ? "ERMAP PUBLISHED RECORD" : "MAP-PROVIDER INFORMATION"}</p>
          <h2 id="hospital-detail-title">{officialName?.value ?? hospital.name}</h2>
          {officialName && officialName.value !== hospital.name && <p className="map-provider-name">Map label: {hospital.name}</p>}
          <p className="hospital-locality">{locality?.value ?? hospital.locality ?? "Locality unavailable"}</p>
          <div className={`er-status-badge er-status-${erStatus}`}>
            <strong>{erStatus === "confirmed" ? "CONFIRMED ER" : "ER availability not confirmed"}</strong>
            {erStatus === "confirmed" && erAvailability && <SourceAndDate item={erAvailability} />}
          </div>
          {distance !== undefined && <p className="facility-distance">{(distance / 1000).toFixed(1)} km straight-line distance from your location</p>}
          {ownership && (
            <>
              <div className={`ownership-badge ownership-${ownership.value}`}><strong>{ownershipLabels[ownership.value]}</strong></div>
              <SourceAndDate item={ownership} />
            </>
          )}
        </div>
        <button className="detail-close" type="button" onClick={onClose} aria-label="Close hospital details">×</button>
      </div>

      <section className="contact-priority" aria-label="Hospital contact numbers">
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
              <strong className="phone-label">General hospital contact</strong>
              <a className="hospital-phone-number" href={`tel:${phoneHref(generalPhone.value)}`}>{formatPhoneDisplay(generalPhone.value)}</a>
              <SourceAndDate item={generalPhone} />
              <small className="phone-routing-note">Published contact number; hours are not implied. {emergencyPhone ? "" : "Ask to be connected to casualty / emergency."}</small>
            </div>
            <CallAction phone={generalPhone.value} label="Call hospital" />
          </div>
        ) : <p className="section-empty phone-unavailable">General hospital contact: Information unavailable.</p>}
        {!emergencyPhone && !generalPhone && <p className="emergency-number-unavailable">No separate emergency department number published.</p>}
      </section>

      {address && (
        <div className="official-address">
          <span>{address.value}</span>
          <SourceAndDate item={address} />
        </div>
      )}
      {lastVerified && <p className="last-verified">Last verified {formatDateDisplay(lastVerified)}{isReverificationDue(lastVerified) && <strong className="reverification-due">Re-verification due</strong>}</p>}

      <div className="provider-location">
        <div className="provider-location-icon" aria-hidden="true">⌖</div>
        <div className="provider-location-copy">
          <strong>Map location</strong>
          <span>OpenFreeMap · {hospital.latitude.toFixed(5)}, {hospital.longitude.toFixed(5)}</span>
        </div>
        {directionsUrl && <a className="directions-action" href={directionsUrl} target="_blank" rel="noreferrer">Directions <span aria-hidden="true">↗</span></a>}
      </div>

      <section className="detail-section" aria-labelledby="emergency-details-title">
        <div className="detail-section-heading">
          <span className="detail-section-icon emergency-section-icon" aria-hidden="true">+</span>
          <div><p className="eyebrow">EMERGENCY CARE</p><h3 id="emergency-details-title">Emergency services</h3></div>
        </div>
        <div className="emergency-facts">
        <div className="emergency-hours-row"><span>24/7 emergency department</span>{hasSourcedValue(enrichment?.emergency24x7) && enrichment.emergency24x7.value ? <strong className="fact-yes">Published as 24/7</strong> : <strong className="fact-confirm">Call to confirm</strong>}{hasSourcedValue(enrichment?.emergency24x7) && <SourceAndDate item={enrichment.emergency24x7} />}</div>
        {hasSourcedValue(enrichment?.emergencyScopeNote) && <p className="emergency-scope-note">{enrichment.emergencyScopeNote.value} <SourceAndDate item={enrichment.emergencyScopeNote} /></p>}
        {emergencyFields.filter((field) => field !== "24/7 emergency department").map((field) => {
            const fieldValue = enrichment?.emergencyDetails?.[field];
            const capability = hasSourcedValue(fieldValue) ? fieldValue : undefined;

            return (
              <div className="emergency-fact" key={field}>
                <span>{field}</span>
                {capability ? (
                  <>
                    <strong className={capability.value ? "fact-yes" : "fact-no"}>{capability.value ? "Available" : "Not available"}</strong>
                    <SourceAndDate item={capability} />
                  </>
                ) : <strong className="fact-confirm">Call to confirm</strong>}
              </div>
            );
          })}
        </div>
      </section>

      <section className="detail-section" aria-labelledby="er-beds-title">
        <div className="detail-section-heading">
          <span className="detail-section-icon beds-section-icon" aria-hidden="true">▤</span>
          <div><p className="eyebrow">BED INFORMATION</p><h3 id="er-beds-title">ER holding beds</h3></div>
        </div>
        {erBeds ? (
          <div className="bed-count">
            <strong>{erBeds.value}</strong><span>ER holding beds</span>
            <SourceAndDate item={erBeds} />
          </div>
        ) : <p className="section-empty">Information unavailable.</p>}
        <p className="bed-separation-note">ER holding beds are separate from ICU and CCU beds. Reported counts are not live availability.</p>
      </section>

      <p className="provider-disclaimer">Call the hospital to confirm emergency services and current availability before travelling.</p>
      <a className="report-error-link" href="mailto:replace-me@example.com?subject=ERMap%20error%20report">Report an error</a>
    </section>
  );
}
