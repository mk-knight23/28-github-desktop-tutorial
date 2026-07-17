import { ImageResponse } from "next/og";
import { SITE_NAME } from "@/lib/site";

/**
 * Static Open Graph image, generated at build time by next/og (Satori). No
 * external service and no network fetch — it draws the blueprint card from
 * inline markup only. Applied site-wide via the app/ file convention.
 */

export const alt = `${SITE_NAME} — an engineer's blueprint for Git`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#0B1220",
          backgroundImage:
            "linear-gradient(rgba(240,80,50,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(240,80,50,0.07) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          padding: "72px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <svg width="52" height="52" viewBox="0 0 24 24" fill="none">
            <circle cx="6" cy="6" r="3" fill="#F05032" />
            <circle cx="6" cy="18" r="3" fill="#F05032" />
            <circle cx="18" cy="12" r="3" fill="#38BDF8" />
            <path d="M6 9v6M6 15c0-5 4-3 8-3" stroke="#F05032" strokeWidth="2" fill="none" />
          </svg>
          <span
            style={{
              fontSize: "30px",
              fontWeight: 700,
              letterSpacing: "0.18em",
              color: "#E6ECF8",
              textTransform: "uppercase",
            }}
          >
            {SITE_NAME}
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div
            style={{
              fontSize: "78px",
              fontWeight: 900,
              fontStyle: "italic",
              color: "#E6ECF8",
              lineHeight: 1.05,
              textTransform: "uppercase",
              letterSpacing: "-0.02em",
              maxWidth: "980px",
            }}
          >
            Learn Git by seeing it
          </div>
          <div style={{ fontSize: "34px", color: "#9BA8BF", maxWidth: "900px", lineHeight: 1.35 }}>
            Simulate commands on a visual branch graph before you run them. It never executes a
            single command.
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ height: "8px", width: "8px", borderRadius: "9999px", backgroundColor: "#F05032" }} />
          <span style={{ fontSize: "26px", color: "#64748B" }}>
            gitflow.mkazi.live · Open source · Local-first
          </span>
        </div>
      </div>
    ),
    { ...size },
  );
}
