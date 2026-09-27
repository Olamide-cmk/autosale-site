import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  MapPin,
  Heart,
  CheckCircle2,
  AlertTriangle,
  Gauge,
  Fuel,
  Cog,
  CreditCard,
  Zap,
  Car,
} from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ListingCard } from "@/components/ListingCard";
import { ContactSellerForm } from "@/components/ContactSellerForm";
import { Badge } from "@/components/ui/badge";
import { formatUsd, listings as seedListings, fromSubmittedListing, type CarListing } from "@/data/listings";
import { useFavorites } from "@/context/favorites-context";
import { useLocale } from "@/i18n/locale-context";
import { colorSwatch } from "@/lib/color-swatch";
import { getSubmittedListingByIdFn, getPurchasedListingIdsFn } from "@/server-fns";

export const Route = createFileRoute("/listings/$listingId")({
  loader: async ({ params }) => {
    const seedMatch = seedListings.find((l) => l.id === params.listingId);
    if (seedMatch) return { listing: seedMatch };

    const submitted = await getSubmittedListingByIdFn({ data: { id: params.listingId } });
    if (submitted) return { listing: fromSubmittedListing(submitted) };

    throw notFound();
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Annonce introuvable — AutoSale" }, { name: "robots", content: "noindex" }] };
    }
    const { listing } = loaderData;
    const description = `${listing.mileage} · ${listing.fuelType} · ${listing.location}. Prix : ${formatUsd(listing.price)}.`;
    return {
      meta: [
        { title: `${listing.title} — AutoSale` },
        { name: "description", content: description },
        { property: "og:title", content: `${listing.title} — AutoSale` },
        { property: "og:description", content: description },
        { property: "og:image", content: listing.images[0] },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:image", content: listing.images[0] },
      ],
    };
  },
  component: ListingDetail,
});

function ListingDetail() {
  const { listing } = Route.useLoaderData();
  const { t } = useLocale();
  const [activeImage, setActiveImage] = useState(0);
  const [purchased, setPurchased] = useState(false);
  const { isFavorited, toggleFavorite } = useFavorites();
  const favorited = isFavorited(listing.id);

  useEffect(() => {
    let cancelled = false;
    getPurchasedListingIdsFn()
      .then((ids) => {
        if (!cancelled) setPurchased(ids.includes(listing.id));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [listing.id]);

  const isSold = listing.status === "sold" || purchased;

  const related = seedListings
    .filter((l) => l.id !== listing.id && l.status === "available" && l.brand === listing.brand)
    .slice(0, 3);
  const fallbackRelated = seedListings.filter((l) => l.id !== listing.id && l.status === "available").slice(0, 3);
  const relatedListings: CarListing[] = related.length > 0 ? related : fallbackRelated;

  function galleryKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowRight") setActiveImage((i) => (i + 1) % listing.images.length);
    if (e.key === "ArrowLeft") setActiveImage((i) => (i - 1 + listing.images.length) % listing.images.length);
  }

  const specRows: [string, string][] = [
    [t("listing.year"), String(listing.year)],
    [t("listing.brandModel"), `${listing.brand} ${listing.model}`],
    [t("listing.mileage"), listing.mileage],
    [t("listing.fuel"), listing.fuelType],
    [t("listing.transmission"), listing.transmission],
    ...(listing.drivetrain ? ([[t("listing.drivetrain"), listing.drivetrain]] as [string, string][]) : []),
    ...(listing.exteriorColor ? ([[t("listing.extColor"), listing.exteriorColor]] as [string, string][]) : []),
    ...(listing.interiorColor ? ([[t("listing.intColor"), listing.interiorColor]] as [string, string][]) : []),
    ...(listing.vin ? ([[t("listing.vin"), listing.vin]] as [string, string][]) : []),
  ];

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main id="main-content" className="container-page py-8">
        <Link to="/" className="text-sm font-semibold text-primary hover:underline">
          {t("listing.backToListings")}
        </Link>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            {isSold ? (
              <Badge className="bg-navy text-white">{t("listingCard.sold")}</Badge>
            ) : (
              <Badge className="bg-accent text-accent-foreground">{t("listingCard.available")}</Badge>
            )}
            {listing.category && <span className="eyebrow">{listing.category}</span>}
          </div>
          <button
            type="button"
            onClick={() => toggleFavorite(listing.id)}
            className={`flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm font-semibold transition-colors ${
              favorited ? "border-accent bg-accent/10 text-accent" : "hover:border-accent hover:text-accent"
            }`}
          >
            <Heart className={`size-4 ${favorited ? "fill-accent" : ""}`} />
            {favorited ? t("listing.inFavorites") : t("listing.addToFavorites")}
          </button>
        </div>
        <h1 className="mt-2 text-4xl font-bold leading-tight">{listing.title}</h1>
        <p className="mt-1 flex items-center gap-1 text-muted-foreground">
          <MapPin className="size-4" /> {listing.location}
        </p>
        <p className="mt-3 text-3xl font-bold text-primary">{formatUsd(listing.price)}</p>

        <div className="mt-6 grid gap-8 lg:grid-cols-[1.5fr_1fr]">
          {/* Gallery */}
          <div>
            <div
              role="group"
              aria-label={`${t("listing.galleryLabel")} ${activeImage + 1} ${t("listing.galleryOf")} ${listing.images.length}. ${t("listing.galleryHint")}`}
              tabIndex={0}
              onKeyDown={galleryKeyDown}
              className="rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <img
                src={listing.images[activeImage]}
                alt={listing.title}
                width={1400}
                height={933}
                className="aspect-[3/2] w-full rounded-xl border object-cover"
              />
            </div>
            {listing.images.length > 1 && (
              <div className="mt-3 flex gap-2">
                {listing.images.map((image, i) => (
                  <button
                    key={image}
                    type="button"
                    onClick={() => setActiveImage(i)}
                    aria-label={`${t("listing.viewPhoto")} ${i + 1}`}
                    aria-current={i === activeImage}
                    className={`size-2.5 rounded-full transition-colors ${
                      i === activeImage ? "bg-accent" : "bg-border hover:bg-muted-foreground"
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Characteristics — close-up photos when available, icon/swatch otherwise */}
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="relative aspect-square overflow-hidden rounded-lg border bg-card">
                {listing.engineImage ? (
                  <img src={listing.engineImage} alt={t("listing.fuel")} className="absolute inset-0 size-full object-cover" />
                ) : (
                  <div className="flex size-full items-center justify-center bg-primary/10 text-primary">
                    {listing.fuelType.toLowerCase().includes("électr") ? (
                      <Zap className="size-6" />
                    ) : (
                      <Fuel className="size-6" />
                    )}
                  </div>
                )}
              </div>
              <div className="relative aspect-square overflow-hidden rounded-lg border bg-card">
                {listing.rearImage ? (
                  <img src={listing.rearImage} alt={t("listing.category")} className="absolute inset-0 size-full object-cover" />
                ) : (
                  <div className="flex size-full items-center justify-center bg-primary/10 text-primary">
                    <Car className="size-6" />
                  </div>
                )}
              </div>
              {listing.exteriorColor && (
                <div className="relative aspect-square overflow-hidden rounded-lg border bg-card">
                  {listing.images[1] ? (
                    <img src={listing.images[1]} alt={t("listing.extColor")} className="absolute inset-0 size-full object-cover" />
                  ) : (
                    <div className="absolute inset-0" style={{ backgroundColor: colorSwatch(listing.exteriorColor) }} />
                  )}
                </div>
              )}
              {listing.interiorColor ? (
                <div className="relative aspect-square overflow-hidden rounded-lg border bg-card">
                  {listing.steeringWheelImage ? (
                    <img src={listing.steeringWheelImage} alt={t("listing.intColor")} className="absolute inset-0 size-full object-cover" />
                  ) : (
                    <div className="absolute inset-0" style={{ backgroundColor: colorSwatch(listing.interiorColor) }} />
                  )}
                </div>
              ) : (
                <div className="relative aspect-square overflow-hidden rounded-lg border bg-card">
                  <div className="flex size-full items-center justify-center bg-primary/10 text-primary">
                    <Cog className="size-6" />
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            {listing.description.length > 0 && (
              <section className="mt-10 max-w-3xl">
                <h2 className="text-2xl font-bold">{t("listing.about")}</h2>
                <div className="mt-3 space-y-3 text-muted-foreground">
                  {listing.description.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              </section>
            )}

            {/* Highlights & notes */}
            {(listing.highlights.length > 0 || listing.notes.length > 0) && (
              <section className="mt-8 grid gap-6 sm:grid-cols-2">
                {listing.highlights.length > 0 && (
                  <div>
                    <h3 className="flex items-center gap-2 text-lg font-semibold">
                      <CheckCircle2 className="size-4 text-primary" /> {t("listing.highlights")}
                    </h3>
                    <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                      {listing.highlights.map((h) => (
                        <li key={h} className="flex gap-2">
                          <span className="text-primary">•</span> {h}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {listing.notes.length > 0 && (
                  <div>
                    <h3 className="flex items-center gap-2 text-lg font-semibold">
                      <AlertTriangle className="size-4 text-accent" /> {t("listing.notes")}
                    </h3>
                    <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                      {listing.notes.map((n) => (
                        <li key={n} className="flex gap-2">
                          <span className="text-accent">•</span> {n}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>
            )}

            {/* Technical specs */}
            <section className="mt-10">
              <h2 className="text-2xl font-bold">{t("listing.specs")}</h2>
              <dl className="mt-4 grid grid-cols-1 gap-x-8 gap-y-3 rounded-xl border bg-card p-6 sm:grid-cols-2">
                {specRows.map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4 border-b pb-2 text-sm last:border-b-0">
                    <dt className="text-muted-foreground">{k}</dt>
                    <dd className="text-right font-semibold">{v}</dd>
                  </div>
                ))}
              </dl>
            </section>

            {/* Location */}
            <section className="mt-10">
              <h2 className="text-2xl font-bold">{t("listing.location")}</h2>
              <div className="mt-4 flex items-center gap-2 rounded-xl border bg-card p-6">
                <MapPin className="size-5 text-primary" />
                <span className="font-semibold">{listing.location}</span>
              </div>
            </section>
          </div>

          {/* Sidebar: key facts + contact */}
          <aside className="h-fit space-y-6 lg:sticky lg:top-24">
            <div className="rounded-xl border bg-card p-6">
              <span className="eyebrow block">{t("listing.askingPrice")}</span>
              <span className="text-3xl font-bold">{formatUsd(listing.price)}</span>
              <dl className="mt-5 space-y-3 border-t pt-4 text-sm">
                <div className="flex justify-between">
                  <dt className="flex items-center gap-1.5 text-muted-foreground">
                    <Gauge className="size-3.5" /> {t("listing.mileage")}
                  </dt>
                  <dd className="font-semibold">{listing.mileage}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="flex items-center gap-1.5 text-muted-foreground">
                    <Fuel className="size-3.5" /> {t("listing.fuel")}
                  </dt>
                  <dd className="font-semibold">{listing.fuelType}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="flex items-center gap-1.5 text-muted-foreground">
                    <Cog className="size-3.5" /> {t("listing.transmission")}
                  </dt>
                  <dd className="font-semibold">{listing.transmission}</dd>
                </div>
              </dl>
              {isSold && (
                <p className="mt-5 rounded-md bg-muted px-4 py-3 text-sm text-muted-foreground">
                  {t("listing.soldMessage")}
                </p>
              )}
              {!isSold && (
                <Link
                  to="/checkout/$listingId"
                  params={{ listingId: listing.id }}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-md bg-accent px-5 py-2.5 text-sm font-semibold uppercase tracking-wide text-accent-foreground hover:opacity-90"
                >
                  <CreditCard className="size-4" /> {t("listing.buyNow")}
                </Link>
              )}
            </div>

            {!isSold && <ContactSellerForm listing={listing} />}
          </aside>
        </div>

        {/* Related listings */}
        {relatedListings.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-bold">{t("listing.alsoSee")}</h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedListings.map((l) => (
                <ListingCard key={l.id} listing={l} />
              ))}
            </div>
          </section>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
