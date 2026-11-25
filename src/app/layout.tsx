import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.ermap.in"),
  title: {
    default: "ERMap | North Bengaluru emergency departments",
    template: "%s | ERMap"
  },
  description: "Discover emergency departments across the North Bengaluru pilot area. ERMap shares sourced information and does not rank hospitals or provide medical advice.",
  applicationName: "ERMap",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "/",
    siteName: "ERMap",
    title: "ERMap | North Bengaluru emergency departments",
    description: "Discover emergency departments across the North Bengaluru pilot area. Sourced information, with no hospital rankings or clinical-quality claims.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "ERMap emergency department discovery for North Bengaluru" }]
  },
  twitter: {
    card: "summary_large_image",
    title: "ERMap | North Bengaluru emergency departments",
    description: "Discover emergency departments across the North Bengaluru pilot area.",
    images: ["/opengraph-image"]
  },
  robots: { index: true, follow: true }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#F6F7F4"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
