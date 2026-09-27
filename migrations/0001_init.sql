-- AutoSale — Cloudflare D1 schema
-- Apply with: npx wrangler d1 execute autosale-db --file=migrations/0001_init.sql
-- (add --remote to apply to the live database instead of the local emulator)

CREATE TABLE IF NOT EXISTS listings (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  price INTEGER NOT NULL,
  mileage TEXT NOT NULL,
  fuelType TEXT NOT NULL,
  transmission TEXT NOT NULL,
  location TEXT NOT NULL,
  description TEXT NOT NULL,
  images TEXT NOT NULL DEFAULT '[]', -- JSON-encoded string array
  sellerName TEXT NOT NULL,
  sellerPhone TEXT NOT NULL,
  sellerEmail TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'available',
  createdAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS contact_messages (
  id TEXT PRIMARY KEY,
  listingId TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL DEFAULT '',
  message TEXT NOT NULL,
  createdAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS purchases (
  id TEXT PRIMARY KEY,
  listingId TEXT NOT NULL,
  buyerName TEXT NOT NULL,
  buyerEmail TEXT NOT NULL,
  amount INTEGER NOT NULL,
  cardLast4 TEXT NOT NULL,
  createdAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS heart_counts (
  listingId TEXT PRIMARY KEY,
  count INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS newsletter (
  email TEXT PRIMARY KEY
);

CREATE INDEX IF NOT EXISTS idx_contact_messages_listing ON contact_messages(listingId);
CREATE INDEX IF NOT EXISTS idx_purchases_listing ON purchases(listingId);
