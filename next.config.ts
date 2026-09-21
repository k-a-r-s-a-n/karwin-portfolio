import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // The HTML document must never be served stale — during active
        // development a cached page shows old code that no longer exists.
        // Hashed /_next assets keep their own immutable caching.
        source: "/",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, max-age=0, must-revalidate",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
