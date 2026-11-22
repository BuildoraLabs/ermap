export type OwnershipCategory = "government" | "private" | "trust_charitable";

export type EmergencyCapability =
  | "24/7 emergency department"
  | "Trauma"
  | "Cardiac"
  | "Stroke"
  | "Orthopaedic"
  | "Child / Paediatric emergency care"
  | "Maternity emergency care";

export type VerifiedValue<T> = {
  value: T;
  sourceUrls: string[];
  lastVerified: string;
  verificationStatus: "verified";
};

export type HospitalEnrichment = {
  hospitalName: VerifiedValue<string>;
  locality: VerifiedValue<string>;
  address: VerifiedValue<string>;
  officialWebsite: VerifiedValue<string>;
  generalPhone?: VerifiedValue<string>;
  emergencyPhone?: VerifiedValue<string>;
  ownership?: VerifiedValue<OwnershipCategory>;
  emergencyDetails?: Partial<Record<EmergencyCapability, VerifiedValue<boolean>>>;
  erHoldingBeds?: VerifiedValue<number>;
};

type HospitalSourceRecord = {
  aliases: string[];
  mapLocation: [longitude: number, latitude: number];
  matchRadiusMeters: number;
  data: HospitalEnrichment;
};

const verifiedOn = "2026-11-22";
const verified = <T,>(value: T, ...sourceUrls: string[]): VerifiedValue<T> => ({
  value,
  sourceUrls,
  lastVerified: verifiedOn,
  verificationStatus: "verified"
});

// Curated from official hospital sources, then automatically attached only to a
// matching named basemap POI within that facility's map location radius. This
// deliberately does not fetch/scrape map-provider listings at runtime.
const hospitalSourceRecords: HospitalSourceRecord[] = [
  {
    aliases: ["aster cmi hospital", "aster cmi", "aster cmi bangalore"],
    mapLocation: [77.5916451215744, 13.054557804651793],
    matchRadiusMeters: 180,
    data: {
      hospitalName: verified("Aster CMI Hospital", "https://www.asterhospitals.in/hospitals/aster-cmi-bangalore"),
      locality: verified("Hebbal, Bengaluru", "https://www.asterhospitals.in/hospitals/aster-cmi-bangalore"),
      address: verified("No. 43/2, New Airport Road, NH 44, Sahakar Nagar, Hebbal, Bengaluru, Karnataka 560092", "https://www.asterhospitals.in/hospitals/aster-cmi-bangalore"),
      officialWebsite: verified("https://www.asterhospitals.in/hospitals/aster-cmi-bangalore", "https://www.asterhospitals.in/hospitals/aster-cmi-bangalore"),
      generalPhone: verified("080-4342-0100", "https://www.asterhospitals.in/hospitals/aster-cmi-bangalore"),
      emergencyPhone: verified("080-4647-4647", "https://www.asterhospitals.in/hospitals/aster-cmi-bangalore"),
      ownership: verified(
        "private",
        "https://www.asterhospitals.in/sites/default/files/2026-04/BMW%20Annual%20Returns%202025.pdf"
      ),
      emergencyDetails: {
        "24/7 emergency department": verified(true, "https://www.asterhospitals.in/hospitals/aster-cmi-bangalore/specialities/emergency-medicine"),
        Trauma: verified(true, "https://www.asterhospitals.in/hospitals/aster-cmi-bangalore/specialities/orthopaedics/services/trauma-surgery"),
        Cardiac: verified(true, "https://www.asterhospitals.in/aster-cmi-bangalore/cardiac-sciences"),
        Stroke: verified(true, "https://www.asterhospitals.in/hospitals/aster-cmi-bangalore/specialities/emergency-medicine/services/department-of-emergency-medicine-services?page=1"),
        Orthopaedic: verified(true, "https://www.asterhospitals.in/aster-cmi-bangalore/orthopedic-care"),
        "Child / Paediatric emergency care": verified(true, "https://www.asterhospitals.in/hospitals/aster-cmi-bangalore/specialities/paediatrics-neonatology"),
        "Maternity emergency care": verified(true, "https://www.asterhospitals.in/hospitals/aster-cmi-bangalore/specialities/emergency-medicine/services/department-of-emergency-medicine-services?page=1")
      }
    }
  },
  {
    aliases: ["manipal hospital", "manipal hospital hebbal", "manipal hospitals hebbal"],
    mapLocation: [77.59386599063873, 13.050962443985256],
    matchRadiusMeters: 140,
    data: {
      hospitalName: verified("Manipal Hospital Hebbal", "https://www.manipalhospitals.com/hebbal/"),
      locality: verified("Hebbal, Bengaluru", "https://www.manipalhospitals.com/hebbal/contact-us/"),
      address: verified("Kirloskar Business Park, Bellary Road, Hebbal, Bengaluru, Karnataka 560024", "https://www.manipalhospitals.com/hebbal/contact-us/"),
      officialWebsite: verified("https://www.manipalhospitals.com/hebbal/", "https://www.manipalhospitals.com/hebbal/"),
      generalPhone: verified("1800 102 5555", "https://www.manipalhospitals.com/hebbal/contact-us/"),
      emergencyPhone: verified("080-22221111", "https://www.manipalhospitals.com/hebbal/contact-us/"),
      ownership: verified(
        "private",
        "https://www.manipalhospitals.com/hebbal/about-us/",
        "https://www.manipalhospitals.com/uploads/documents/Annual-Report_FY%2725.pdf"
      ),
      emergencyDetails: {
        "24/7 emergency department": verified(
          true,
          "https://www.manipalhospitals.com/hebbal/contact-us/",
          "https://www.manipalhospitals.com/hebbal/specialities/accident-and-emergency-care/accident-and-emergency/"
        ),
        Trauma: verified(true, "https://www.manipalhospitals.com/hebbal/specialities/accident-and-emergency-care/accident-and-emergency/"),
        Cardiac: verified(true, "https://www.manipalhospitals.com/hebbal/specialities/accident-and-emergency-care/accident-and-emergency/"),
        Stroke: verified(true, "https://www.manipalhospitals.com/hebbal/specialities/accident-and-emergency-care/accident-and-emergency/"),
        Orthopaedic: verified(true, "https://www.manipalhospitals.com/hebbal/specialities/accident-and-emergency-care/accident-and-emergency/"),
        "Maternity emergency care": verified(true, "https://www.manipalhospitals.com/hebbal/specialities/accident-and-emergency-care/accident-and-emergency/")
      }
    }
  }
];

function normalizeName(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function distanceMeters([longitude, latitude]: [number, number], [otherLongitude, otherLatitude]: [number, number]) {
  const radians = Math.PI / 180;
  const x = (longitude - otherLongitude) * radians * Math.cos(((latitude + otherLatitude) / 2) * radians);
  const y = (latitude - otherLatitude) * radians;
  return Math.sqrt(x * x + y * y) * 6_371_000;
}

export function findHospitalEnrichment(name: string, coordinates: [number, number]) {
  const normalizedName = normalizeName(name);
  const record = hospitalSourceRecords.find(({ aliases, mapLocation, matchRadiusMeters }) =>
    aliases.some((alias) => normalizeName(alias) === normalizedName)
    && distanceMeters(coordinates, mapLocation) <= matchRadiusMeters
  );

  return record?.data;
}
