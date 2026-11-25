import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: { inlineCss: true },
  // Optimised images are content-addressed by URL + width, so they can be cached for a long time.
  images: { formats: ["image/avif", "image/webp"], minimumCacheTTL: 31536000 },
  poweredByHeader: false,
  async headers() {
    return [
      {
        // Static artwork, icons and logos: let browsers keep them for a day and refresh in the
        // background, instead of re-checking every file on every visit.
        source: "/:dir(images|careers-ref)/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }],
      },
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
