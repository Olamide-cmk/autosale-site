import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import { z } from "zod";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ListingCard } from "@/components/ListingCard";
import { ListingFilters, applyFilters, defaultFilters, type Filters } from "@/components/ListingFilters";
import { Pagination } from "@/components/Pagination";
import { useAllListings } from "@/hooks/use-all-listings";
import { useLocale } from "@/i18n/locale-context";

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

export const Route = createFileRoute("/vedette")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Vedette — AutoSale" },
      { name: "description", content: "Les voitures vedettes AutoSale, toutes catégories confondues." },
    ],
  }),
  component: Vedette,
});

function Vedette() {
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
      search: {
        q: next.q || undefined,
        brand: next.brand !== "all" ? next.brand : undefined,
        minYear: next.minYear !== "all" ? next.minYear : undefined,
        maxPrice: next.maxPrice !== "all" ? next.maxPrice : undefined,
        maxMileage: next.maxMileage !== "all" ? next.maxMileage : undefined,
        sort: next.sort !== defaultFilters.sort ? next.sort : undefined,
        page: undefined,
      },
      replace: true,
    });
  }

  function setPage(next: number) {
    navigate({ search: (prev) => ({ ...prev, page: next > 1 ? next : undefined }) });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const featuredListings = useMemo(
    () => listings.filter((l) => l.status === "available" && l.featured),
    [listings],
  );
  const filtered = useMemo(() => applyFilters(featuredListings, filters), [featuredListings, filters]);
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
      <main id="main-content" className="container-page py-10">
        <h1 className="text-4xl font-bold">{t("nav.featured")}</h1>

        <div className="mt-6">
          <ListingFilters filters={filters} onChange={setFilters} />
        </div>

        <div className="mt-6 flex items-end justify-between">
          <p className="text-sm text-muted-foreground" aria-live="polite">
            {filtered.length} {t("home.resultCount")}
          </p>
        </div>

        {pageItems.length > 0 ? (
          <>
            <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
      </main>
      <SiteFooter />
    </div>
  );
}
