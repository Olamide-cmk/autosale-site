import { Search } from "lucide-react";
import { brands, type CarListing } from "@/data/listings";
import { Input } from "@/components/ui/input";
import { useLocale } from "@/i18n/locale-context";
import type { TranslationKey } from "@/i18n/translations";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type Filters = {
  q: string;
  brand: string;
  minYear: string;
  maxPrice: string;
  maxMileage: string;
  sort: string;
};

export const defaultFilters: Filters = {
  q: "",
  brand: "all",
  minYear: "all",
  maxPrice: "all",
  maxMileage: "all",
  sort: "newest",
};

const priceOptions: { value: string; key: TranslationKey }[] = [
  { value: "all", key: "filters.allPrices" },
  { value: "50000", key: "filters.priceUpTo50k" },
  { value: "100000", key: "filters.priceUpTo100k" },
  { value: "150000", key: "filters.priceUpTo150k" },
  { value: "250000", key: "filters.priceUpTo250k" },
];

const yearOptions: { value: string; key: TranslationKey }[] = [
  { value: "all", key: "filters.allYears" },
  { value: "2023", key: "filters.year2023" },
  { value: "2020", key: "filters.year2020" },
  { value: "2015", key: "filters.year2015" },
  { value: "0", key: "filters.yearBefore2015" },
];

const mileageOptions: { value: string; key: TranslationKey }[] = [
  { value: "all", key: "filters.allMileages" },
  { value: "10000", key: "filters.mileageUnder10k" },
  { value: "25000", key: "filters.mileageUnder25k" },
  { value: "50000", key: "filters.mileageUnder50k" },
];

export const sortOptionKeys: { value: string; key: TranslationKey }[] = [
  { value: "newest", key: "filters.sortNewest" },
  { value: "price-asc", key: "filters.sortPriceAsc" },
  { value: "price-desc", key: "filters.sortPriceDesc" },
  { value: "mileage-asc", key: "filters.sortMileageAsc" },
  { value: "year-desc", key: "filters.sortYearDesc" },
];

function parseMileage(mileage: string): number {
  const digits = mileage.replace(/[^\d]/g, "");
  return digits ? Number(digits) : 0;
}

export function ListingFilters({
  filters,
  onChange,
}: {
  filters: Filters;
  onChange: (next: Filters) => void;
}) {
  const { t } = useLocale();
  const set = <K extends keyof Filters>(key: K, value: Filters[K]) =>
    onChange({ ...filters, [key]: value });

  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <div className="grid gap-3 md:grid-cols-[1.2fr_0.9fr_0.9fr_0.9fr_0.9fr_1fr]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={filters.q}
            onChange={(e) => set("q", e.target.value)}
            placeholder={t("filters.searchPlaceholder")}
            className="pl-9"
            aria-label={t("filters.search")}
          />
        </div>

        <Select value={filters.brand} onValueChange={(v) => set("brand", v)}>
          <SelectTrigger aria-label={t("filters.brand")}>
            <SelectValue placeholder={t("filters.brand")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("filters.allBrands")}</SelectItem>
            {brands.map((m) => (
              <SelectItem key={m} value={m}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.minYear} onValueChange={(v) => set("minYear", v)}>
          <SelectTrigger aria-label={t("filters.year")}>
            <SelectValue placeholder={t("filters.year")} />
          </SelectTrigger>
          <SelectContent>
            {yearOptions.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {t(o.key)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.maxPrice} onValueChange={(v) => set("maxPrice", v)}>
          <SelectTrigger aria-label={t("filters.price")}>
            <SelectValue placeholder={t("filters.price")} />
          </SelectTrigger>
          <SelectContent>
            {priceOptions.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {t(o.key)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.maxMileage} onValueChange={(v) => set("maxMileage", v)}>
          <SelectTrigger aria-label={t("filters.mileage")}>
            <SelectValue placeholder={t("filters.mileage")} />
          </SelectTrigger>
          <SelectContent>
            {mileageOptions.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {t(o.key)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.sort} onValueChange={(v) => set("sort", v)}>
          <SelectTrigger aria-label={t("filters.sortBy")}>
            <SelectValue placeholder={t("filters.sortBy")} />
          </SelectTrigger>
          <SelectContent>
            {sortOptionKeys.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {t(o.key)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

export function applyFilters(items: CarListing[], filters: Filters): CarListing[] {
  const result = items.filter((item) => {
    if (filters.q) {
      const q = filters.q.toLowerCase();
      const haystack = `${item.brand} ${item.model} ${item.title}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    if (filters.brand !== "all" && item.brand !== filters.brand) return false;
    if (filters.minYear !== "all") {
      const minYear = Number(filters.minYear);
      if (minYear === 0) {
        if (item.year >= 2015) return false;
      } else if (item.year < minYear) {
        return false;
      }
    }
    if (filters.maxPrice !== "all" && item.price > Number(filters.maxPrice)) return false;
    if (filters.maxMileage !== "all" && parseMileage(item.mileage) > Number(filters.maxMileage)) return false;
    return true;
  });

  switch (filters.sort) {
    case "price-asc":
      return [...result].sort((a, b) => a.price - b.price);
    case "price-desc":
      return [...result].sort((a, b) => b.price - a.price);
    case "mileage-asc":
      return [...result].sort((a, b) => parseMileage(a.mileage) - parseMileage(b.mileage));
    case "year-desc":
      return [...result].sort((a, b) => b.year - a.year);
    case "newest":
    default:
      return [...result].sort((a, b) => (b.listedAt ?? "").localeCompare(a.listedAt ?? ""));
  }
}
