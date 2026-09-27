// ---------------------------------------------------------------------------
// Shared shapes used by both storage backends (json-store.ts for local dev,
// d1-store.ts for production on Cloudflare D1) — see store.ts for the
// dispatcher that picks between them.
// ---------------------------------------------------------------------------

import type { ListingStatus } from "@/data/listings";

export type StoredListing = {
  id: string;
  title: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  mileage: string;
  fuelType: string;
  transmission: string;
  location: string;
  description: string;
  images: string[];
  sellerName: string;
  sellerPhone: string;
  sellerEmail: string;
  status: ListingStatus;
  createdAt: string;
};

export type StoredContactMessage = {
  id: string;
  listingId: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  createdAt: string;
};

export type StoredPurchase = {
  id: string;
  listingId: string;
  buyerName: string;
  buyerEmail: string;
  amount: number;
  cardLast4: string;
  createdAt: string;
};
