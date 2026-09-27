import { Link } from "@tanstack/react-router";
import { Heart, Gauge, Fuel, MapPin } from "lucide-react";
import { formatUsd, type CarListing } from "@/data/listings";
import { useFavorites } from "@/context/favorites-context";
import { useLocale } from "@/i18n/locale-context";
import { Badge } from "@/components/ui/badge";

export function ListingCard({ listing, priority }: { listing: CarListing; priority?: boolean }) {
  const { isFavorited, toggleFavorite } = useFavorites();
  const { t } = useLocale();
  const favorited = isFavorited(listing.id);
  const isSold = listing.status === "sold";

  return (
    <Link
      to="/listings/$listingId"
      params={{ listingId: listing.id }}
      className="card-hover group block overflow-hidden rounded-xl border bg-card shadow-sm hover:card-hover-active"
    >
      <div className="relative aspect-[3/2] overflow-hidden bg-muted">
        <img
          src={listing.images[0]}
          alt={listing.title}
          width={1200}
          height={800}
          loading={priority ? undefined : "lazy"}
          className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 ${
            isSold ? "grayscale-[0.3]" : ""
          }`}
        />
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleFavorite(listing.id);
          }}
          aria-label={favorited ? t("listingCard.removeFav") : t("listingCard.addFav")}
          aria-pressed={favorited}
          className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-black/60"
        >
          <Heart className={`size-4 ${favorited ? "fill-accent text-accent" : ""}`} />
        </button>
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {isSold ? (
            <Badge className="bg-navy text-white">{t("listingCard.sold")}</Badge>
          ) : (
            <Badge className="bg-accent text-accent-foreground">{t("listingCard.available")}</Badge>
          )}
          {listing.featured && !isSold && <Badge variant="secondary">{t("listingCard.featured")}</Badge>}
        </div>
      </div>
      <div className="p-4">
        <h3 className="truncate text-lg font-semibold leading-tight text-foreground">
          {listing.year} {listing.brand} {listing.model}
        </h3>
        {listing.category && (
          <Badge variant="outline" className="mt-1.5 text-[11px] font-medium text-muted-foreground">
            {listing.category}
          </Badge>
        )}
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Gauge className="size-3.5" /> {listing.mileage}
          </span>
          <span className="flex items-center gap-1">
            <Fuel className="size-3.5" /> {listing.fuelType}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="size-3.5" /> {listing.location}
          </span>
        </div>

        <div className="mt-4 flex items-center justify-between border-t pt-3">
          <span className="text-xl font-bold text-foreground">{formatUsd(listing.price)}</span>
          <span className="text-sm font-semibold text-primary">{t("listingCard.viewListing")}</span>
        </div>
      </div>
    </Link>
  );
}
