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
  erAvailability: VerifiedValue<boolean>;
  emergency24x7: VerifiedValue<boolean>;
  generalPhone?: VerifiedValue<string>;
  emergencyPhone?: VerifiedValue<string>;
  ownership?: VerifiedValue<OwnershipCategory>;
  emergencyDetails?: Partial<Record<EmergencyCapability, VerifiedValue<boolean>>>;
  erHoldingBeds?: VerifiedValue<number>;
};

export type ConfirmedERFacility = {
  id: string;
  aliases: string[];
  mapLocation: [longitude: number, latitude: number];
  mapLocationSourceUrl: string;
  localityOrder: number;
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

const aster = "https://www.asterhospitals.in/hospitals/aster-cmi-bangalore";
const manipalHebbal = "https://www.manipalhospitals.com/hebbal/";
const baptistContact = "https://bbh.org.in/contact/";
const baptistEmergency = "https://bbh.org.in/specialities/emergency-medicine/";
const ramaiahEmergency = "https://msrmc.ac.in/hospital/clinical-services/broad-specialities/emergency-medicine";
const ramaiahContact = "https://msrmh.com/contact-us-ms-ramaiah-memorial-hospital/";
const manipalYelahanka = "https://www.manipalhospitals.com/yelahanka/about-us/";
const manipalYelahankaEmergency = "https://www.manipalhospitals.com/yelahanka/specialities/accident-and-emergency-care/";

// Records are curated from published official sources. Coordinates are used only
// for map placement and exact branch matching; the map source does not establish ER status.
export const confirmedERFacilities: ConfirmedERFacility[] = [
  {
    id: "aster-cmi-hebbal",
    aliases: ["aster cmi hospital", "aster cmi", "aster cmi bangalore"],
    mapLocation: [77.5916451215744, 13.054557804651793],
    mapLocationSourceUrl: "https://www.openstreetmap.org/?mlat=13.0545578&mlon=77.5916451#map=17/13.0545578/77.5916451",
    localityOrder: 1,
    matchRadiusMeters: 180,
    data: {
      hospitalName: verified("Aster CMI Hospital", aster),
      locality: verified("Hebbal, Bengaluru", aster),
      address: verified("No. 43/2, New Airport Road, NH 44, Sahakar Nagar, Hebbal, Bengaluru, Karnataka 560092", aster),
      officialWebsite: verified(aster, aster),
      erAvailability: verified(true, "https://www.asterhospitals.in/hospitals/aster-cmi-bangalore/specialities/emergency-medicine"),
      emergency24x7: verified(true, "https://www.asterhospitals.in/hospitals/aster-cmi-bangalore/specialities/emergency-medicine"),
      generalPhone: verified("080-4342-0100", aster),
      emergencyPhone: verified("080-4647-4647", "https://www.asterhospitals.in/hospitals/aster-cmi-bangalore/specialities/emergency-medicine/services/department-of-emergency-medicine-services?page=1"),
      ownership: verified("private", "https://www.asterhospitals.in/sites/default/files/2026-04/BMW%20Annual%20Returns%202025.pdf"),
      emergencyDetails: {
        Trauma: verified(true, "https://www.asterhospitals.in/hospitals/aster-cmi-bangalore/specialities/emergency-medicine/services/department-of-emergency-medicine-services?page=1"),
        Cardiac: verified(true, "https://www.asterhospitals.in/hospitals/aster-cmi-bangalore/specialities/emergency-medicine/services/department-of-emergency-medicine-services?page=1"),
        Stroke: verified(true, "https://www.asterhospitals.in/hospitals/aster-cmi-bangalore/specialities/emergency-medicine/services/department-of-emergency-medicine-services?page=1"),
        Orthopaedic: verified(true, "https://www.asterhospitals.in/hospitals/aster-cmi-bangalore/specialities/emergency-medicine/services/department-of-emergency-medicine-services?page=1"),
        "Child / Paediatric emergency care": verified(true, "https://www.asterhospitals.in/hospitals/aster-cmi-bangalore/specialities/emergency-medicine"),
      }
    }
  },
  {
    id: "manipal-hebbal",
    aliases: ["manipal hospital", "manipal hospital hebbal", "manipal hospitals hebbal"],
    mapLocation: [77.59386599063873, 13.050962443985256],
    mapLocationSourceUrl: "https://www.openstreetmap.org/?mlat=13.0509624&mlon=77.5938660#map=17/13.0509624/77.5938660",
    localityOrder: 1,
    matchRadiusMeters: 140,
    data: {
      hospitalName: verified("Manipal Hospital Hebbal", "https://www.manipalhospitals.com/hebbal/"),
      locality: verified("Hebbal, Bengaluru", "https://www.manipalhospitals.com/hebbal/contact-us/"),
      address: verified("Kirloskar Business Park, Bellary Road, Hebbal, Bengaluru, Karnataka 560024", "https://www.manipalhospitals.com/hebbal/contact-us/"),
      officialWebsite: verified(manipalHebbal, manipalHebbal),
      erAvailability: verified(true, "https://www.manipalhospitals.com/hebbal/specialities/accident-and-emergency-care/accident-and-emergency/"),
      emergency24x7: verified(true, "https://www.manipalhospitals.com/hebbal/contact-us/"),
      generalPhone: verified("1800 102 5555", "https://www.manipalhospitals.com/hebbal/contact-us/"),
      emergencyPhone: verified("080-22221111", "https://www.manipalhospitals.com/hebbal/contact-us/"),
      ownership: verified("private", "https://www.manipalhospitals.com/hebbal/about-us/", "https://www.manipalhospitals.com/uploads/documents/Annual-Report_FY%2725.pdf"),
      emergencyDetails: {
        Trauma: verified(true, "https://www.manipalhospitals.com/hebbal/specialities/accident-and-emergency-care/accident-and-emergency/"),
        Cardiac: verified(true, "https://www.manipalhospitals.com/hebbal/specialities/accident-and-emergency-care/accident-and-emergency/"),
        Stroke: verified(true, "https://www.manipalhospitals.com/hebbal/specialities/accident-and-emergency-care/accident-and-emergency/"),
        Orthopaedic: verified(true, "https://www.manipalhospitals.com/hebbal/specialities/accident-and-emergency-care/accident-and-emergency/"),
        "Child / Paediatric emergency care": verified(true, "https://www.manipalhospitals.com/hebbal/specialities/accident-and-emergency-care/accident-and-emergency/"),
        "Maternity emergency care": verified(true, "https://www.manipalhospitals.com/hebbal/specialities/accident-and-emergency-care/accident-and-emergency/")
      }
    }
  },
  {
    id: "manipal-yelahanka",
    aliases: ["manipal hospital north", "manipal hospital yelahanka", "manipal hospitals yelahanka"],
    mapLocation: [77.6033446, 13.107448],
    mapLocationSourceUrl: "https://www.openstreetmap.org/?mlat=13.107448&mlon=77.6033446#map=17/13.107448/77.6033446",
    localityOrder: 3,
    matchRadiusMeters: 220,
    data: {
      hospitalName: verified("Manipal Hospital Yelahanka", manipalYelahanka),
      locality: verified("Venkatala, Yelahanka, Bengaluru", manipalYelahanka),
      address: verified("Sy No 23/3, Next to Brigade Honda Showroom, Venkatala Village, Yelahanka Hobli, Bengaluru North Taluk, Bengaluru 560064", manipalYelahanka),
      officialWebsite: verified("https://www.manipalhospitals.com/yelahanka/", manipalYelahanka),
      erAvailability: verified(true, manipalYelahankaEmergency),
      emergency24x7: verified(true, manipalYelahankaEmergency, manipalYelahanka),
      generalPhone: verified("1800 102 5555", manipalYelahanka),
      ownership: verified("private", "https://www.manipalhospitals.com/yelahanka/about-us/", "https://www.manipalhospitals.com/uploads/documents/Annual-Report_FY%2725.pdf"),
      emergencyDetails: {
        Trauma: verified(true, manipalYelahankaEmergency),
        Cardiac: verified(true, manipalYelahankaEmergency),
        Stroke: verified(true, manipalYelahankaEmergency),
        Orthopaedic: verified(true, manipalYelahankaEmergency),
        "Child / Paediatric emergency care": verified(true, manipalYelahankaEmergency)
      }
    }
  },
  {
    id: "bangalore-baptist-hebbal",
    aliases: ["baptist hospital", "bangalore baptist hospital", "baptist hospital hebbal"],
    mapLocation: [77.591043, 13.0346791],
    mapLocationSourceUrl: "https://www.openstreetmap.org/?mlat=13.0346791&mlon=77.591043#map=17/13.0346791/77.591043",
    localityOrder: 1,
    matchRadiusMeters: 260,
    data: {
      hospitalName: verified("Bangalore Baptist Hospital", baptistContact),
      locality: verified("Hebbal, Bengaluru", baptistContact),
      address: verified("Bellary Road, Hebbal, Bengaluru, Karnataka 560024", baptistContact),
      officialWebsite: verified("https://bbh.org.in/", "https://bbh.org.in/"),
      erAvailability: verified(true, baptistEmergency),
      emergency24x7: verified(true, baptistEmergency),
      generalPhone: verified("080-22024700", baptistContact),
      emergencyPhone: verified("8880408040", "https://bbh.org.in/patients/"),
      ownership: verified("trust_charitable", "https://bbh.org.in/about/"),
      emergencyDetails: {}
    }
  },
  {
    id: "ramaiah-memorial",
    aliases: ["ramaiah memorial hospital", "ms ramaiah memorial hospital", "ramaiah hospital"],
    mapLocation: [77.5697318, 13.0282201],
    mapLocationSourceUrl: "https://www.openstreetmap.org/?mlat=13.0282201&mlon=77.5697318#map=17/13.0282201/77.5697318",
    localityOrder: 4,
    matchRadiusMeters: 240,
    data: {
      hospitalName: verified("Ramaiah Memorial Hospital", ramaiahContact),
      locality: verified("MS Ramaiah Nagar, Bengaluru", ramaiahContact),
      address: verified("New BEL Road, M S Ramaiah Nagar, Bengaluru, Karnataka 560054", ramaiahContact),
      officialWebsite: verified("https://msrmh.com/", "https://msrmh.com/"),
      erAvailability: verified(true, ramaiahEmergency),
      emergency24x7: verified(true, ramaiahEmergency),
      generalPhone: verified("080-6215-3300", ramaiahContact),
      emergencyPhone: verified("1800-123-1133", ramaiahContact, ramaiahEmergency),
      ownership: verified("trust_charitable", "https://www.msrmc.ac.in/uploads/naac/Organogram-Modified.pdf", "https://msrmh.com/about-ms-ramaiah-hospital/"),
      emergencyDetails: {
        Trauma: verified(true, ramaiahEmergency),
        Cardiac: verified(true, ramaiahEmergency),
        Stroke: verified(true, ramaiahEmergency),
        "Child / Paediatric emergency care": verified(true, ramaiahEmergency),
        "Maternity emergency care": verified(true, ramaiahEmergency)
      }
    }
  },
  {
    id: "regal-hospital-hegde-nagar",
    aliases: ["regal hospital", "regal hospital north bengaluru"],
    mapLocation: [77.6347174, 13.0830463],
    mapLocationSourceUrl: "https://www.openstreetmap.org/?mlat=13.0830463&mlon=77.6347174#map=17/13.0830463/77.6347174",
    localityOrder: 2,
    matchRadiusMeters: 220,
    data: {
      hospitalName: verified("Regal Hospital", "https://regalhospital.com/contact-us/"),
      locality: verified("Hegde Nagar, North Bengaluru", "https://regalhospital.com/contact-us/"),
      address: verified("No. 30, CMR Complex, Chokkanahalli Hegdenagar Main Road, Devin Paradise Enclave, Tirumanahalli, Bengaluru, Karnataka 560064", "https://regalhospital.com/contact-us/"),
      officialWebsite: verified("https://regalhospital.com/", "https://regalhospital.com/"),
      erAvailability: verified(true, "https://regalhospital.com/accident-and-emergency/"),
      emergency24x7: verified(true, "https://regalhospital.com/accident-and-emergency/"),
      generalPhone: verified("+91 888 404 8888", "https://regalhospital.com/contact-us/"),
      emergencyPhone: verified("+91 89046 53388", "https://regalhospital.com/accident-and-emergency/"),
      ownership: verified("private", "https://regalhospital.com/contact-us/"),
      emergencyDetails: {
        Trauma: verified(true, "https://regalhospital.com/accident-and-emergency/"),
        Cardiac: verified(true, "https://regalhospital.com/best-cardiology-hospital-bangalore/"),
        Stroke: verified(true, "https://regalhospital.com/accident-and-emergency/")
      }
    }
  }
];

// Government hospital contact published in the Government of India's ORS
// directory. It is listed separately because the available source does not
// confirm emergency department hours or services, so it must not receive an ER pin.
export const publicHospitalContacts = [
  {
    id: "general-hospital-yelahanka",
    name: "General Hospital Yelahanka",
    locality: "Old Town Yelahanka, Bengaluru North",
    address: "General Hospital Yelahanka, Old Town, Yelahanka, Bengaluru North 560064",
    phone: "0802-8563885",
    ownership: "government" as const,
    emergencyStatus: "Emergency department hours and services: call to confirm",
    phoneSource: "https://ors.nic.in/nodal_officer_list.html",
    facilitySource: "https://kla.kar.nic.in/council/Replies/unstarred/10032025/usq482%2810032025%29.pdf",
    lastVerified: verifiedOn
  }
];

function normalizeName(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

export function distanceMeters([longitude, latitude]: [number, number], [otherLongitude, otherLatitude]: [number, number]) {
  const radians = Math.PI / 180;
  const x = (longitude - otherLongitude) * radians * Math.cos(((latitude + otherLatitude) / 2) * radians);
  const y = (latitude - otherLatitude) * radians;
  return Math.sqrt(x * x + y * y) * 6_371_000;
}

export function findConfirmedERFacility(name: string, coordinates: [number, number]) {
  const normalizedName = normalizeName(name);
  return confirmedERFacilities.find(({ aliases, mapLocation, matchRadiusMeters }) =>
    aliases.some((alias) => normalizeName(alias) === normalizedName)
    && distanceMeters(coordinates, mapLocation) <= matchRadiusMeters
  );
}

export function findHospitalEnrichment(name: string, coordinates: [number, number]) {
  const facility = findConfirmedERFacility(name, coordinates);
  return facility?.data.erAvailability.value === true ? facility.data : undefined;
}
