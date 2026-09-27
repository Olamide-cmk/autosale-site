import { describe, it, expect } from "vitest";
import { applyFilters, defaultFilters } from "./ListingFilters";
import { listings } from "@/data/listings";

const available = listings.filter((l) => l.status === "available");

describe("applyFilters", () => {
  it("returns everything when filters are default (sorted, no filtering out)", () => {
    expect(applyFilters(available, defaultFilters).length).toBe(available.length);
  });

  it("filters by free-text query across brand/model/title", () => {
    const result = applyFilters(available, { ...defaultFilters, q: "porsche" });
    expect(result.every((l) => l.brand.toLowerCase().includes("porsche"))).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it("filters by brand", () => {
    const result = applyFilters(available, { ...defaultFilters, brand: "BMW" });
    expect(result.every((l) => l.brand === "BMW")).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it("filters by max price", () => {
    const result = applyFilters(available, { ...defaultFilters, maxPrice: "50000" });
    expect(result.every((l) => l.price <= 50000)).toBe(true);
  });

  it("filters by max mileage", () => {
    const result = applyFilters(available, { ...defaultFilters, maxMileage: "10000" });
    for (const l of result) {
      const digits = Number(l.mileage.replace(/[^\d]/g, ""));
      expect(digits).toBeLessThanOrEqual(10000);
    }
  });

  it("sorts by price ascending", () => {
    const result = applyFilters(available, { ...defaultFilters, sort: "price-asc" });
    for (let i = 1; i < result.length; i++) {
      expect(result[i]!.price).toBeGreaterThanOrEqual(result[i - 1]!.price);
    }
  });

  it("sorts by price descending", () => {
    const result = applyFilters(available, { ...defaultFilters, sort: "price-desc" });
    for (let i = 1; i < result.length; i++) {
      expect(result[i]!.price).toBeLessThanOrEqual(result[i - 1]!.price);
    }
  });

  it("sorts by year descending (newest first)", () => {
    const result = applyFilters(available, { ...defaultFilters, sort: "year-desc" });
    for (let i = 1; i < result.length; i++) {
      expect(result[i]!.year).toBeLessThanOrEqual(result[i - 1]!.year);
    }
  });

  it("combines multiple filters", () => {
    const result = applyFilters(available, { ...defaultFilters, brand: "Ford", minYear: "2015" });
    expect(result.every((l) => l.brand === "Ford" && l.year >= 2015)).toBe(true);
  });
});
