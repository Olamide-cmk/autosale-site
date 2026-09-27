import { describe, it, expect } from "vitest";
import { formatUsd, listings, maskPhone, fromSubmittedListing } from "./listings";

describe("formatUsd", () => {
  it("formats whole-dollar USD amounts", () => {
    expect(formatUsd(132000)).toBe("$132,000");
  });
});

describe("maskPhone", () => {
  it("keeps only the last two digits visible", () => {
    expect(maskPhone("+1 512 555 0142")).toBe("••• ••• •42");
  });
});

describe("dataset integrity", () => {
  it("every listing has a unique id and at least 1 image", () => {
    const ids = new Set(listings.map((l) => l.id));
    expect(ids.size).toBe(listings.length);
    for (const listing of listings) {
      expect(listing.images.length).toBeGreaterThanOrEqual(1);
    }
  });

  it("sold listings have a soldAt date and available ones don't", () => {
    for (const listing of listings) {
      if (listing.status === "sold") expect(listing.soldAt).toBeTruthy();
      else expect(listing.soldAt).toBeUndefined();
    }
  });

  it("includes at least one featured, available listing", () => {
    expect(listings.some((l) => l.featured && l.status === "available")).toBe(true);
  });
});

describe("fromSubmittedListing", () => {
  it("adapts a server-submitted listing into the shared CarListing shape", () => {
    const adapted = fromSubmittedListing({
      id: "listing_abc",
      title: "2024 Toyota Corolla",
      brand: "Toyota",
      model: "Corolla",
      year: 2024,
      price: 22000,
      mileage: "5 000 km",
      fuelType: "Essence",
      transmission: "Automatique",
      location: "Paris",
      description: "Voiture familiale bien entretenue.",
      images: [],
      sellerName: "Jean Dupont",
      sellerPhone: "+33 6 12 34 56 78",
      sellerEmail: "jean@example.com",
      status: "available",
      createdAt: "2026-08-30T00:00:00Z",
    });

    expect(adapted.id).toBe("listing_abc");
    expect(adapted.description).toEqual(["Voiture familiale bien entretenue."]);
    expect(adapted.images.length).toBeGreaterThan(0); // falls back to a placeholder image
    expect(adapted.featured).toBe(false);
  });
});
