import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/dashboard/",
          "/profile/",
          "/settings/",
          "/admin/",
          "/reports/",
          "/subscriptions/",
          "/billing/",
          "/session-management/",
        ],
      },
    ],
    sitemap: "https://arama.app/sitemap.xml",
  };
}
