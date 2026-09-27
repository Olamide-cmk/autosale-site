// ---------------------------------------------------------------------------
// Storage dispatcher: picks the real backend automatically per call.
//
//   - Cloudflare D1 (d1-store.ts) when a "DB" binding is present — i.e. when
//     deployed to Cloudflare Workers with migrations/0001_init.sql applied
//     and the binding declared in vite.config.ts / wrangler config. This is
//     real, durable, multi-request persistence.
//   - Local JSON file (json-store.ts) otherwise — `npm run dev`, a
//     self-hosted Node deployment, or a Cloudflare Worker with no D1 binding
//     configured yet (in which case it only persists for the lifetime of a
//     single in-flight request — see json-store.ts).
//
// Every exported function here has the exact same signature regardless of
// backend, so callers (server-fns.ts) never need to know which one is
// active. See README.md → "Database (Cloudflare D1)" for setup steps.
// ---------------------------------------------------------------------------

import { getD1 } from "./d1-types";
import * as jsonStore from "./json-store";
import * as d1Store from "./d1-store";
import type { StoredListing, StoredContactMessage, StoredPurchase } from "./store-types";

export type { StoredListing, StoredContactMessage, StoredPurchase };

// --- listings ----------------------------------------------------------------

export async function createListing(
  input: Omit<StoredListing, "id" | "createdAt" | "status">,
): Promise<StoredListing> {
  const db = getD1();
  return db ? d1Store.createListing(db, input) : jsonStore.createListing(input);
}

export async function getSubmittedListings(): Promise<StoredListing[]> {
  const db = getD1();
  return db ? d1Store.getSubmittedListings(db) : jsonStore.getSubmittedListings();
}

// --- contact messages --------------------------------------------------------

export async function addContactMessage(
  input: Omit<StoredContactMessage, "id" | "createdAt">,
): Promise<StoredContactMessage> {
  const db = getD1();
  return db ? d1Store.addContactMessage(db, input) : jsonStore.addContactMessage(input);
}

// --- purchases -----------------------------------------------------------------
//
// IMPORTANT: no real payment processor is involved. Card details are never
// stored — only the last 4 digits, purely for display on a confirmation
// screen. This exists to demonstrate the purchase flow end-to-end, not to
// process real money. Wire in a real processor (Stripe, etc.) before
// accepting real transactions.

export async function recordPurchase(
  listingId: string,
  buyerName: string,
  buyerEmail: string,
  amount: number,
  cardLast4: string,
): Promise<StoredPurchase> {
  const db = getD1();
  return db
    ? d1Store.recordPurchase(db, listingId, buyerName, buyerEmail, amount, cardLast4)
    : jsonStore.recordPurchase(listingId, buyerName, buyerEmail, amount, cardLast4);
}

/** IDs of every listing ever purchased — including seed/demo listings whose
 * status lives in static data and can't be mutated directly. The frontend
 * treats a seed listing as sold once its id shows up here. */
export async function getPurchasedListingIds(): Promise<string[]> {
  const db = getD1();
  return db ? d1Store.getPurchasedListingIds(db) : jsonStore.getPurchasedListingIds();
}

export async function getPurchaseForListing(listingId: string): Promise<StoredPurchase | undefined> {
  const db = getD1();
  return db ? d1Store.getPurchaseForListing(db, listingId) : jsonStore.getPurchaseForListing(listingId);
}

// --- hearts / auto-vedette -----------------------------------------------------
//
// Per the spec: a listing is featured either because we manually flagged it
// (CarListing.featured in the seed data / StoredListing), or automatically
// once it collects 3 favorite "hearts" from visitors. There are no accounts,
// so hearts are tracked globally per listing (not per user) — the client
// guards against a single browser inflating the count by only contributing
// once per listing (see favorites-context.tsx).

export async function incrementHeartCount(listingId: string): Promise<number> {
  const db = getD1();
  return db ? d1Store.incrementHeartCount(db, listingId) : jsonStore.incrementHeartCount(listingId);
}

export async function getAutoFeaturedListingIds(threshold = 3): Promise<string[]> {
  const db = getD1();
  return db ? d1Store.getAutoFeaturedListingIds(db, threshold) : jsonStore.getAutoFeaturedListingIds(threshold);
}

// --- newsletter ------------------------------------------------------------------

export async function addNewsletterSignup(email: string): Promise<{ alreadySubscribed: boolean }> {
  const db = getD1();
  return db ? d1Store.addNewsletterSignup(db, email) : jsonStore.addNewsletterSignup(email);
}
