import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ListingCard } from "@/components/ListingCard";
import { useFavorites } from "@/context/favorites-context";
import { useAllListings } from "@/hooks/use-all-listings";
import { useLocale } from "@/i18n/locale-context";

export const Route = createFileRoute("/favorites")({
  head: () => ({
    meta: [
      { title: "Mes favoris — AutoSale" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Favorites,
});

function Favorites() {
  const { favorites } = useFavorites();
  const { listings } = useAllListings();
  const { t } = useLocale();
  const items = listings.filter((l) => favorites.includes(l.id));

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main id="main-content" className="container-page py-12">
        <h1 className="text-4xl font-bold">{t("favorites.title")}</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">{t("favorites.subtitle")}</p>

        {items.length === 0 ? (
          <div className="mt-10 flex flex-col items-center rounded-xl border border-dashed p-12 text-center">
            <Heart className="size-8 text-muted-foreground" />
            <p className="mt-3 font-semibold">{t("favorites.empty")}</p>
            <p className="mt-1 text-sm text-muted-foreground">{t("favorites.emptyHint")}</p>
            <Link
              to="/"
              className="mt-4 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold uppercase tracking-wide text-primary-foreground hover:opacity-90"
            >
              {t("favorites.browse")}
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
