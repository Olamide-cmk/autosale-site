import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import { z } from "zod";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ListingCard } from "@/components/ListingCard";
import { ListingFilters, applyFilters, defaultFilters, type Filters } from "@/components/ListingFilters";
import { Pagination } from "@/components/Pagination";
import { useAllListings } from "@/hooks/use-all-listings";
import { useLocale } from "@/i18n/locale-context";
import { brands } from "@/data/listings";

const PAGE_SIZE = 12;

const searchSchema = z.object({
  q: z.string().optional().catch(undefined),
  brand: z.string().optional().catch(undefined),
  minYear: z.string().optional().catch(undefined),
  maxPrice: z.string().optional().catch(undefined),
  maxMileage: z.string().optional().catch(undefined),
  sort: z.string().optional().catch(undefined),
  page: z.number().int().positive().optional().catch(undefined),
});

export const Route = createFileRoute("/shop")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Shop — AutoSale" },
      { name: "description", content: "Toutes les voitures disponibles à la vente sur AutoSale." },
    ],
  }),
  component: Shop,
});

function Shop() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const { t } = useLocale();
  const { listings } = useAllListings();

  const filters: Filters = {
    q: search.q ?? defaultFilters.q,
    brand: search.brand ?? defaultFilters.brand,
    minYear: search.minYear ?? defaultFilters.minYear,
    maxPrice: search.maxPrice ?? defaultFilters.maxPrice,
    maxMileage: search.maxMileage ?? defaultFilters.maxMileage,
    sort: search.sort ?? defaultFilters.sort,
  };
  const page = search.page ?? 1;

  function setFilters(next: Filters) {
    navigate({
      search: (prev) => ({
        ...prev,
        q: next.q || undefined,
        brand: next.brand !== "all" ? next.brand : undefined,
        minYear: next.minYear !== "all" ? next.minYear : undefined,
        maxPrice: next.maxPrice !== "all" ? next.maxPrice : undefined,
        maxMileage: next.maxMileage !== "all" ? next.maxMileage : undefined,
        sort: next.sort !== defaultFilters.sort ? next.sort : undefined,
        page: undefined,
      }),
      replace: true,
    });
  }

  function setPage(next: number) {
    navigate({ search: (prev) => ({ ...prev, page: next > 1 ? next : undefined }) });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // The sidebar filters by brand (marque) — not by body style, which is a
  // vehicle characteristic shown on each listing's own page instead.
  function selectBrand(brand: string | undefined) {
    navigate({ search: (prev) => ({ ...prev, brand, page: undefined }), replace: true });
  }

  const available = useMemo(() => listings.filter((l) => l.status === "available"), [listings]);
  const availableBrands = useMemo(
    () => brands.filter((b) => available.some((l) => l.brand === b)),
    [available],
  );

  const filtered = useMemo(() => {
    const byFilters = applyFilters(available, filters);
    // Featured items surface first within the current view, per spec 4.3.
    return [...byFilters].sort((a, b) => Number(b.featured) - Number(a.featured));
  }, [available, filters]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const clampedPage = Math.min(page, pageCount);
  const pageItems = filtered.slice((clampedPage - 1) * PAGE_SIZE, clampedPage * PAGE_SIZE);

  useEffect(() => {
    if (page > pageCount) setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageCount]);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main id="main-content">
        {/* Compact banner — small, not oversized, just enough to frame the page */}
        <section className="border-b bg-navy py-8 text-white">
          <div className="container-page">
            <span className="eyebrow text-white/50">{t("nav.shop")}</span>
            <h1 className="mt-1 text-3xl font-bold">{t("shop.heroTitle")}</h1>
          </div>
        </section>

        <div className="container-page py-8">
          <ListingFilters filters={filters} onChange={setFilters} />

          <div className="mt-8 grid gap-8 lg:grid-cols-[220px_1fr]">
            {/* Brand sidebar — brands are the real categories; body style
                (Coupé, Break…) is a characteristic shown on each listing. */}
            <aside className="h-fit space-y-1 lg:sticky lg:top-24">
              <h2 className="eyebrow mb-2">{t("shop.categoriesTitle")}</h2>
              <button
                type="button"
                onClick={() => selectBrand(undefined)}
                className={`block w-full rounded-md px-3 py-2 text-left text-sm font-semibold transition-colors ${
                  !filters.brand || filters.brand === "all" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                }`}
              >
                {t("shop.allCategories")}
              </button>
              {availableBrands.map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => selectBrand(b)}
                  className={`block w-full rounded-md px-3 py-2 text-left text-sm font-semibold transition-colors ${
                    filters.brand === b ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                  }`}
                >
                  {b}
                </button>
              ))}
              <Link
                to="/vedette"
                className="mt-2 block w-full rounded-md px-3 py-2 text-left text-sm font-semibold text-accent hover:bg-accent/10"
              >
                ★ {t("nav.featured")}
              </Link>
            </aside>

            {/* Results */}
            <div>
              <p className="text-sm text-muted-foreground" aria-live="polite">
                {filtered.length} {t("home.resultCount")}
              </p>

              {pageItems.length > 0 ? (
                <>
                  <div className="mt-4 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                    {pageItems.map((listing) => (
                      <ListingCard key={listing.id} listing={listing} />
                    ))}
                  </div>
                  <Pagination page={clampedPage} pageCount={pageCount} onChange={setPage} />
                </>
              ) : (
                <div className="mt-10 rounded-xl border border-dashed p-12 text-center text-muted-foreground">
                  {t("home.noResults")}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
