// ---------------------------------------------------------------------------
// Cloudflare D1 implementation of the store. Same shapes/functions as
// json-store.ts, backed by real SQL instead of an in-memory + JSON file.
// Used automatically whenever a "DB" binding is present (i.e. when deployed
// to Cloudflare Workers with the migration in migrations/0001_init.sql
// applied and the binding declared — see vite.config.ts and README).
// ---------------------------------------------------------------------------

import { randomBytes } from "node:crypto";
import type { ListingStatus } from "@/data/listings";
import type { D1Database } from "./d1-types";
import type {
  StoredListing,
  StoredContactMessage,
  StoredPurchase,
} from "./store-types";

function id(prefix: string) {
  return `${prefix}_${randomBytes(9).toString("base64url")}`;
}

function rowToListing(row: Record<string, unknown>): StoredListing {
  return {
    id: row["id"] as string,
    title: row["title"] as string,
    brand: row["brand"] as string,
    model: row["model"] as string,
    year: row["year"] as number,
    price: row["price"] as number,
    mileage: row["mileage"] as string,
    fuelType: row["fuelType"] as string,
    transmission: row["transmission"] as string,
    location: row["location"] as string,
    description: row["description"] as string,
    images: JSON.parse((row["images"] as string) || "[]") as string[],
    sellerName: row["sellerName"] as string,
    sellerPhone: row["sellerPhone"] as string,
    sellerEmail: row["sellerEmail"] as string,
    status: row["status"] as ListingStatus,
    createdAt: row["createdAt"] as string,
  };
}

// --- listings ----------------------------------------------------------------

export async function createListing(
  db: D1Database,
  input: Omit<StoredListing, "id" | "createdAt" | "status">,
): Promise<StoredListing> {
  const listing: StoredListing = {
    ...input,
    id: id("listing"),
    status: "available",
    createdAt: new Date().toISOString(),
  };
  await db
    .prepare(
      `INSERT INTO listings
        (id, title, brand, model, year, price, mileage, fuelType, transmission, location, description, images, sellerName, sellerPhone, sellerEmail, status, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      listing.id,
      listing.title,
      listing.brand,
      listing.model,
      listing.year,
      listing.price,
      listing.mileage,
      listing.fuelType,
      listing.transmission,
      listing.location,
      listing.description,
      JSON.stringify(listing.images),
      listing.sellerName,
      listing.sellerPhone,
      listing.sellerEmail,
      listing.status,
      listing.createdAt,
    )
    .run();
  return listing;
}

export async function getSubmittedListings(db: D1Database): Promise<StoredListing[]> {
  const { results } = await db.prepare(`SELECT * FROM listings ORDER BY createdAt DESC`).all();
  return results.map((r) => rowToListing(r as Record<string, unknown>));
}

// --- contact messages --------------------------------------------------------

export async function addContactMessage(
  db: D1Database,
  input: Omit<StoredContactMessage, "id" | "createdAt">,
): Promise<StoredContactMessage> {
  const message: StoredContactMessage = {
    ...input,
    id: id("msg"),
    createdAt: new Date().toISOString(),
  };
  await db
    .prepare(
      `INSERT INTO contact_messages (id, listingId, name, email, phone, message, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(message.id, message.listingId, message.name, message.email, message.phone, message.message, message.createdAt)
    .run();
  return message;
}

// --- purchases -----------------------------------------------------------------

export async function recordPurchase(
  db: D1Database,
  listingId: string,
  buyerName: string,
  buyerEmail: string,
  amount: number,
  cardLast4: string,
): Promise<StoredPurchase> {
  const purchase: StoredPurchase = {
    id: id("purchase"),
    listingId,
    buyerName,
    buyerEmail,
    amount,
    cardLast4,
    createdAt: new Date().toISOString(),
  };
  await db
    .prepare(
      `INSERT INTO purchases (id, listingId, buyerName, buyerEmail, amount, cardLast4, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(purchase.id, purchase.listingId, purchase.buyerName, purchase.buyerEmail, purchase.amount, purchase.cardLast4, purchase.createdAt)
    .run();

  // If this listing was published through the site (not a seed listing), we
  // own its row and can mark it sold for real.
  await db.prepare(`UPDATE listings SET status = 'sold' WHERE id = ?`).bind(listingId).run();

  return purchase;
}

export async function getPurchasedListingIds(db: D1Database): Promise<string[]> {
  const { results } = await db.prepare(`SELECT DISTINCT listingId FROM purchases`).all<{ listingId: string }>();
  return results.map((r) => r.listingId);
}

export async function getPurchaseForListing(db: D1Database, listingId: string): Promise<StoredPurchase | undefined> {
  const row = await db.prepare(`SELECT * FROM purchases WHERE listingId = ? LIMIT 1`).bind(listingId).first();
  return row ? (row as StoredPurchase) : undefined;
}

// --- hearts / auto-vedette -----------------------------------------------------

export async function incrementHeartCount(db: D1Database, listingId: string): Promise<number> {
  await db
    .prepare(
      `INSERT INTO heart_counts (listingId, count) VALUES (?, 1)
       ON CONFLICT(listingId) DO UPDATE SET count = count + 1`,
    )
    .bind(listingId)
    .run();
  const row = await db
    .prepare(`SELECT count FROM heart_counts WHERE listingId = ?`)
    .bind(listingId)
    .first<{ count: number }>();
  return row?.count ?? 1;
}

export async function getAutoFeaturedListingIds(db: D1Database, threshold = 3): Promise<string[]> {
  const { results } = await db
    .prepare(`SELECT listingId FROM heart_counts WHERE count >= ?`)
    .bind(threshold)
    .all<{ listingId: string }>();
  return results.map((r) => r.listingId);
}

// --- newsletter ------------------------------------------------------------------

export async function addNewsletterSignup(db: D1Database, email: string): Promise<{ alreadySubscribed: boolean }> {
  const lower = email.toLowerCase();
  const existing = await db.prepare(`SELECT email FROM newsletter WHERE email = ?`).bind(lower).first();
  if (existing) return { alreadySubscribed: true };
  await db.prepare(`INSERT INTO newsletter (email) VALUES (?)`).bind(lower).run();
  return { alreadySubscribed: false };
}
