import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About and sources",
  description: "How ERMap selects and checks emergency department information for its North Bengaluru pilot, and what Photon receives when you search.",
  alternates: { canonical: "/about" },
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "ERMap",
    title: "About ERMap and its sources",
    description: "ERMap's North Bengaluru pilot coverage, verification approach, sources and search privacy information.",
    url: "/about",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "About ERMap and its North Bengaluru emergency department directory" }]
  }
};

export default function AboutPage() {
  return (
    <main className="about-page">
      <header className="about-header">
        <Link href="/" className="about-brand" aria-label="ERMap home"><span>ER</span><strong>ERMap</strong></Link>
        <Link href="/" className="about-back">Back to emergency directory</Link>
      </header>

      <article className="about-content">
        <p className="eyebrow">PURPOSE, SOURCES & PRIVACY</p>
        <h1>About ERMap</h1>
        <p className="about-lede">ERMap helps people discover emergency departments using published information. It is an information aid, not medical advice.</p>

        <section>
          <h2>What ERMap covers</h2>
          <p>ERMap is starting with a North Bengaluru pilot covering places including Hebbal, HBR Layout, Kalyan Nagar, Yelahanka and Manyata Tech Park. The directory is intended to list emergency departments with published evidence, not every hospital or clinic. A facility that does not appear in the directory may still provide emergency care.</p>
        </section>

        <section>
          <h2>Sources and verification</h2>
          <p>Hospital details are checked against official hospital pages and other relevant published sources, including government publications and public registries. OpenStreetMap is used for map locations and map-provider labels; a map label alone does not verify a hospital record or its emergency services.</p>
          <p>Emergency department availability is included only when a source supports it for the facility. Published phone numbers are attached to the source that supports that number; a shared hospital helpline is identified as shared where applicable, and a branch-specific number is shown separately when one is published. Unknown services or contacts are left unavailable or marked “Call to confirm.”</p>
          <p>ER holding-bed counts are included only when a published source specifically identifies emergency-department or casualty holding beds and provides a reported date. ICU and CCU beds are excluded. A reported count is not live availability, and no count is estimated where a source is unavailable.</p>
          <p>Source links and the date ERMap last checked each field are shown with the relevant hospital information. A date describes the last source check, not a guarantee that the information is still current.</p>
        </section>

        <section>
          <h2>How to use this information</h2>
          <p>ERMap does not rank hospitals or make claims about clinical quality or medical performance. Call a hospital to confirm emergency services and current availability before travelling. In an emergency, call <a href="tel:112">112</a> or <a href="tel:108">108</a> first.</p>
        </section>

        <section id="privacy">
          <h2>Search and privacy</h2>
          <p>When you search for a place, ERMap sends the text you enter to the public Photon geocoding service to find matching place names and addresses. The request also includes a fixed North Bengaluru reference point, pilot-area bounding box, zoom, language and result limit so results can be focused on this pilot.</p>
          <p>The search request does not include the optional device location used by ERMap to calculate straight-line distances. Photon receives the search request over the network and may also receive ordinary connection information needed to serve it. Do not enter sensitive personal or medical information in place search.</p>
          <p>Photon describes its public server as a demo service that may throttle extensive use and has no availability guarantee. In a <a href="https://github.com/komoot/photon/discussions/539" target="_blank" rel="noreferrer">2021 response about request logs</a>, a Photon maintainer said the service keeps request logs for a limited time as needed to operate it. See the <a href="https://github.com/komoot/photon#demo-server" target="_blank" rel="noreferrer">Photon demo-server information</a> and the <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap attribution and copyright page</a>.</p>
        </section>

        <section id="contact" className="about-contact">
          <h2>Contact</h2>
          <p>ERMap contact details are being configured. No email address is currently provided for reports.</p>
        </section>

        <p className="about-footnote">ERMap is not a substitute for emergency services or professional medical advice.</p>
      </article>
      <footer className="about-footer">Developed by <a href="https://x.com/KunalZ57" target="_blank" rel="noopener noreferrer">@KunalZ57</a></footer>
    </main>
  );
}
