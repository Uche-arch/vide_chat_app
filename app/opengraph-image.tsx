import { ImageResponse } from "next/og";

export const alt = "Campus Connect · Random video chat";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 24,
          background: "linear-gradient(135deg, #0a0a0a 0%, #262626 100%)",
          color: "#ffffff",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 999,
              background: "#10b981",
            }}
          />
          <div style={{ fontSize: 84, fontWeight: 700, letterSpacing: -2 }}>
            Connect For Fun
          </div>
        </div>
        <div style={{ fontSize: 36, color: "#a3a3a3" }}>
          Meet someone new on video. One tap.
        </div>
      </div>
    ),
    { ...size },
  );
}