"use client";

import { useEffect } from "react";

/**
 * Last-resort fallback — only renders if the root layout itself throws.
 * Cannot safely depend on the app's normal providers/fonts, so styling is
 * kept inline with the brand's warm emerald palette for resilience.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("آراما — خطای سراسری:", error);
  }, [error]);

  return (
    <html lang="fa" dir="rtl">
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f2f9f4",
          color: "#0c2018",
          fontFamily:
            "Tahoma, 'Segoe UI', system-ui, sans-serif",
          padding: "1.5rem",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "28rem",
            textAlign: "center",
            background: "#ffffff",
            border: "1px solid #d9e9df",
            borderRadius: "2rem",
            padding: "2.5rem 2rem",
            boxShadow: "0 24px 56px -20px rgb(12 32 24 / 0.22)",
          }}
        >
          <div
            aria-hidden
            style={{
              margin: "0 auto 1.25rem",
              width: "3.5rem",
              height: "3.5rem",
              borderRadius: "9999px",
              background:
                "linear-gradient(135deg, #3ac793, #0f9b6a 55%, #0b7a53)",
            }}
          />
          <h1 style={{ fontSize: "1.375rem", fontWeight: 800, margin: 0 }}>
            آراما موقتاً در دسترس نیست
          </h1>
          <p
            style={{
              marginTop: "0.75rem",
              fontSize: "0.9rem",
              lineHeight: 1.8,
              color: "#3d594b",
            }}
          >
            نگران نباش، این مشکل از سمت توست نیست. لطفاً چند لحظه بعد دوباره
            تلاش کن.
          </p>
          <div
            style={{
              marginTop: "2rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
            }}
          >
            <button
              type="button"
              onClick={() => reset()}
              style={{
                cursor: "pointer",
                border: "none",
                borderRadius: "9999px",
                padding: "0.9rem 1.5rem",
                fontSize: "0.9rem",
                fontWeight: 800,
                color: "#ffffff",
                background: "#0b7a53",
              }}
            >
              تلاش دوباره
            </button>
            <a
              href="/"
              style={{
                borderRadius: "9999px",
                padding: "0.9rem 1.5rem",
                fontSize: "0.9rem",
                fontWeight: 700,
                color: "#0c2018",
                border: "1px solid #d9e9df",
                textDecoration: "none",
              }}
            >
              بازگشت به خانه
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
