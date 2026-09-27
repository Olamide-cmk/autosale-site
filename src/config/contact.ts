// ---------------------------------------------------------------------------
// Single site-wide seller contact. AutoSale is operated by one seller, so
// every listing shows the same contact details rather than per-listing
// fictional sellers.
// ---------------------------------------------------------------------------

export const siteContact = {
  name: "Williams DA SILVEIRA",
  phone: "0197229620",
  email: "darwinwilliams322@gmail.com",
  // Company based in Europe (France) — exact city to be confirmed and
  // updated here once decided.
  location: "France",
} as const;

// Free-to-use stock assets for the homepage/about redesign (no video/photo
// capture available for the business yet — replace with real media later).
export const heroVideoUrl = "https://assets.mixkit.co/videos/35540/35540-720.mp4";
export const aboutTrustImage =
  "https://images.unsplash.com/photo-1761014586544-53fe5e1f1e25?auto=format&fit=crop&w=1200&q=80";
export const aboutCarImage =
  "https://images.unsplash.com/photo-1761738217531-44a249d1dc87?auto=format&fit=crop&w=1200&q=80";
