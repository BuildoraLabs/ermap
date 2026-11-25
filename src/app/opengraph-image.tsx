import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "ERMap emergency department discovery for North Bengaluru";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "72px",
        background: "linear-gradient(135deg, #f4f7f2 0%, #e9f3ed 100%)",
        color: "#172922",
        fontFamily: "Arial, sans-serif"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "46px" }}>
          <div style={{ width: "68px", height: "68px", borderRadius: "22px", background: "#087e67", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "29px", fontWeight: 800 }}>ER</div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "32px", fontWeight: 800 }}>ERMap</span>
            <span style={{ color: "#537363", fontSize: "17px", letterSpacing: "3px" }}>NORTH BENGALURU</span>
          </div>
        </div>
        <div style={{ fontSize: "64px", lineHeight: 1.08, fontWeight: 800, maxWidth: "930px" }}>Find emergency departments with clarity.</div>
        <div style={{ marginTop: "28px", color: "#537363", fontSize: "25px" }}>Published information · No hospital rankings · Not medical advice</div>
      </div>
    ),
    size
  );
}
