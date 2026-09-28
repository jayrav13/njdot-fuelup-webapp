import type { MetadataRoute } from "next";

// An internal tool for NJDOT staff: keep it out of search engines (as before).
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", disallow: "/" } };
}
