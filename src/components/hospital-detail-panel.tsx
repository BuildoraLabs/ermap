import type {
  EmergencyCapability,
  OwnershipCategory,
  VerifiedValue
} from "@/lib/hospital-directory";
import type { MapHospital } from "@/components/map-view";

type HospitalDetailPanelProps = {
  hospital: MapHospital;
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

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function hasSourcedValue<T>(item: VerifiedValue<T> | undefined): item is VerifiedValue<T> {
  return Boolean(
    item
    && item.verificationStatus === "verified"
    && item.lastVerified.trim()
    && item.sourceUrls.length > 0
    && item.sourceUrls.every((url) => url.startsWith("https://"))
  );
}

function formatPhone(value: string) {
  return value.replace(/[^+\d]/g, "");
}

function SourceAndDate<T>({ item }: { item: VerifiedValue<T> }) {
  return (
    <small className="detail-source">
      Source: {item.sourceUrls.map((url, index) => (
        <span key={url}>
          {index > 0 && "; "}
          <a href={url} target="_blank" rel="noreferrer">{item.sourceUrls.length > 1 ? `Official source ${index + 1}` : "Official hospital source"}</a>
        </span>
      ))}
      {" · verified "}{formatDate(item.lastVerified)}
    </small>
  );
}

function CallAction({ phone, label }: { phone: string; label: string }) {
  const normalizedPhone = formatPhone(phone);
  if (normalizedPhone.length < 7) return null;

  return <a className="call-hospital-action" href={`tel:${normalizedPhone}`}>{label}</a>;
}

export default function HospitalDetailPanel({ hospital, onClose }: HospitalDetailPanelProps) {
  const enrichment = hospital.enrichment;
  const officialName = hasSourcedValue(enrichment?.hospitalName) ? enrichment.hospitalName : undefined;
  const locality = hasSourcedValue(enrichment?.locality) ? enrichment.locality : undefined;
  const address = hasSourcedValue(enrichment?.address) ? enrichment.address : undefined;
  const website = hasSourcedValue(enrichment?.officialWebsite) ? enrichment.officialWebsite : undefined;
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
    officialName?.lastVerified,
    locality?.lastVerified,
    address?.lastVerified,
    website?.lastVerified,
    generalPhone?.lastVerified,
    emergencyPhone?.lastVerified,
    ownership?.lastVerified,
    ...Object.values(enrichment?.emergencyDetails ?? {}).flatMap((item) =>
      hasSourcedValue(item) ? [item.lastVerified] : []
    ),
    erBeds?.lastVerified
  ].filter((date): date is string => Boolean(date?.trim()));
  const lastVerified = verifiedDates
    .sort((left, right) => new Date(right).getTime() - new Date(left).getTime())[0];

  return (
    <section className="hospital-detail" aria-labelledby="hospital-detail-title">
      <div className="detail-header">
        <div className="detail-title-wrap">
          <p className="detail-provider-label">{enrichment ? "OFFICIAL DETAILS · SOURCE MATCHED" : "MAP LISTING · OPENFREEMAP"}</p>
          <h2 id="hospital-detail-title">{officialName?.value ?? hospital.name}</h2>
          {officialName && officialName.value !== hospital.name && <p className="map-provider-name">Map label: {hospital.name}</p>}
          <p className="hospital-locality">{locality?.value ?? hospital.locality ?? "Locality unavailable"}</p>
          {ownership && (
            <>
              <div className={`ownership-badge ownership-${ownership.value}`}><strong>{ownershipLabels[ownership.value]}</strong></div>
              <SourceAndDate item={ownership} />
            </>
          )}
        </div>
        <button className="detail-close" type="button" onClick={onClose} aria-label="Close hospital details">×</button>
      </div>

      {address && (
        <div className="official-address">
          <span>{address.value}</span>
          <SourceAndDate item={address} />
        </div>
      )}
      {website && <p className="official-website"><a href={website.value} target="_blank" rel="noreferrer">Official hospital website ↗</a><SourceAndDate item={website} /></p>}
      {lastVerified && <p className="last-verified">Last verified {formatDate(lastVerified)}</p>}

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
          {emergencyFields.map((field) => {
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

      <section className="detail-section" aria-labelledby="hospital-phone-title">
        <div className="detail-section-heading">
          <span className="detail-section-icon phone-section-icon" aria-hidden="true">☎</span>
          <div><p className="eyebrow">GENERAL CONTACT</p><h3 id="hospital-phone-title">Hospital phone</h3></div>
        </div>
        {generalPhone ? (
          <div className="phone-row">
            <div><a className="hospital-phone-number" href={`tel:${formatPhone(generalPhone.value)}`}>{generalPhone.value}</a><SourceAndDate item={generalPhone} /></div>
            <CallAction phone={generalPhone.value} label="Call hospital" />
          </div>
        ) : <p className="section-empty">Information unavailable.</p>}
        {emergencyPhone && (
          <div className="phone-row emergency-phone-row">
            <div><strong className="phone-label">Emergency department phone</strong><a className="hospital-phone-number" href={`tel:${formatPhone(emergencyPhone.value)}`}>{emergencyPhone.value}</a><SourceAndDate item={emergencyPhone} /></div>
            <CallAction phone={emergencyPhone.value} label="Call emergency department" />
          </div>
        )}
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
    </section>
  );
}
