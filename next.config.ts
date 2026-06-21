import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ["better-sqlite3", "@opennextjs/cloudflare", "drizzle-orm/d1"],
};

export default nextConfig;
