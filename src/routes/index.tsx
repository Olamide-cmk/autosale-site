import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ShieldCheck,
  BadgeCheck,
  Truck,
  Star,
  BookOpen,
  CarFront,
  CreditCard,
  CheckCircle2,
} from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { useAllListings } from "@/hooks/use-all-listings";
import { useLocale } from "@/i18n/locale-context";
import { heroVideoUrl } from "@/config/contact";
import { brands } from "@/data/listings";
import { subscribeNewsletterFn } from "@/server-fns";
import type { TranslationKey } from "@/i18n/translations";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AutoSale — Vente de voitures d'exception à prix fixe" },
      {
        name: "description",
        content: "Découvrez des voitures neuves d'exception vendues directement par notre société, à prix fixe.",
      },
      { property: "og:title", content: "AutoSale — Vente de voitures d'exception à prix fixe" },
      {
        property: "og:description",
        content: "Des véhicules neufs, vendus à prix fixe, sans enchère.",
      },
    ],
  }),
  component: Home,
});

const trustItems: { icon: typeof ShieldCheck; title: TranslationKey; text: TranslationKey }[] = [
  { icon: ShieldCheck, title: "home.trust1.title", text: "home.trust1.text" },
  { icon: BadgeCheck, title: "home.trust2.title", text: "home.trust2.text" },
  { icon: Truck, title: "home.trust3.title", text: "home.trust3.text" },
];

const guideItems: { icon: typeof BookOpen; title: TranslationKey; text: TranslationKey; cta: TranslationKey }[] = [
  { icon: BookOpen, title: "home.guide1.title", text: "home.guide1.text", cta: "home.guide1.cta" },
  { icon: CarFront, title: "home.guide2.title", text: "home.guide2.text", cta: "home.guide2.cta" },
  { icon: CreditCard, title: "home.guide3.title", text: "home.guide3.text", cta: "home.guide3.cta" },
  { icon: Truck, title: "home.guide4.title", text: "home.guide4.text", cta: "home.guide4.cta" },
];

const testimonialKeys: { nameKey: TranslationKey; textKey: TranslationKey }[] = [
  { nameKey: "home.testimonial1.name", textKey: "home.testimonial1.text" },
  { nameKey: "home.testimonial2.name", textKey: "home.testimonial2.text" },
  { nameKey: "home.testimonial3.name", textKey: "home.testimonial3.text" },
  { nameKey: "home.testimonial4.name", textKey: "home.testimonial4.text" },
];

const brandLogos: Record<string, string> = {
  "Alfa Romeo": "/brands/alfa-romeo.png",
  Audi: "/brands/audi.png",
  BMW: "/brands/bmw.png",
  Bentley: "/brands/bentley.png",
  Chevrolet: "/brands/chevrolet.png",
  Ford: "/brands/ford.png",
  Jaguar: "/brands/jaguar.png",
  "Land Rover": "/brands/land-rover.png",
  Lotus: "/brands/lotus.png",
  Maserati: "/brands/maserati.png",
  Mazda: "/brands/mazda.png",
  "Mercedes-AMG": "/brands/mercedes-amg.png",
  Tesla: "/brands/tesla.png",
  Toyota: "/brands/toyota.png",
  Volkswagen: "/brands/volkswagen.png",
};

function BrandsGrid() {
  const { t } = useLocale();
  const shown = brands.slice(0, 16);
  return (
    <section className="border-t py-14">
      <div className="container-page">
        <div className="flex items-baseline justify-between">
          <h2 className="text-2xl font-bold">{t("home.brandsTitle")}</h2>
          <Link to="/shop" className="text-sm font-semibold text-primary hover:underline">
            {t("home.brandsViewAll")}
          </Link>
        </div>
        <div className="mt-6 grid grid-cols-4 gap-4 sm:grid-cols-6 md:grid-cols-8">
          {shown.map((brand) => {
            const logo = brandLogos[brand];
            return (
              <Link
                key={brand}
                to="/shop"
                search={{ brand }}
                className="group flex flex-col items-center gap-2 rounded-lg py-2 text-center transition-colors hover:bg-muted"
              >
                <div className="flex size-12 items-center justify-center rounded-full border bg-white p-2 text-sm font-bold text-foreground transition-colors group-hover:border-primary group-hover:text-primary">
                  {logo ? (
                    <img src={logo} alt={brand} className="size-full object-contain" />
                  ) : (
                    brand.slice(0, 2).toUpperCase()
                  )}
                </div>
                <span className="text-xs font-medium text-muted-foreground">{brand}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function NewsletterHook() {
  const { t } = useLocale();
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setState("loading");
    try {
      await subscribeNewsletterFn({ data: { email } });
      setState("done");
      setEmail("");
    } catch {
      setState("idle");
    }
  }

  return (
    <section className="bg-navy py-10 text-white">
      <div className="container-page flex flex-col items-center justify-between gap-6 sm:flex-row">
        <div>
          <p className="text-xl font-bold">{t("home.newsletterHook")}</p>
          <p className="mt-1 text-sm text-white/60">{t("home.newsletterHookText")}</p>
        </div>
        {state === "done" ? (
          <p className="flex items-center gap-2 text-sm font-semibold text-accent">
            <CheckCircle2 className="size-4" /> {t("footer.newsletterText")}
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex w-full gap-2 sm:w-auto">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("footer.emailPlaceholder")}
              aria-label={t("footer.emailAria")}
              className="h-11 w-full min-w-0 rounded-md border border-white/15 bg-white/10 px-3 text-sm text-white placeholder:text-white/40 outline-none focus:ring-2 focus:ring-accent sm:w-64"
            />
            <button
              type="submit"
              disabled={state === "loading"}
              className="shrink-0 rounded-md bg-accent px-5 text-sm font-semibold text-accent-foreground hover:bg-accent/90 disabled:opacity-60"
            >
              OK
            </button>
          </form>
        )}
      </div>
    </section>
  );
}

function Home() {
  const { t } = useLocale();
  const { listings } = useAllListings();
  const carouselCars = listings.filter((l) => l.status === "available").slice(0, 12);
  const loopedCars = carouselCars.length >= 4 ? [...carouselCars, ...carouselCars] : carouselCars;
  const vehiclesSold = listings.filter((l) => l.status === "sold").length;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main id="main-content">
        {/* Hero — text on the left, looping muted video on the right */}
        <section className="border-b bg-navy text-white">
          <div className="container-page grid items-center gap-10 py-16 lg:grid-cols-2 lg:py-24">
            <div>
              <h1 className="animate-fade-in-up text-4xl font-bold leading-[1.08] md:text-5xl">
                {t("home.heroTitle")}
              </h1>
              <p className="animate-fade-in-up mt-5 max-w-lg text-lg text-white/70" style={{ animationDelay: "0.1s" }}>
                {t("home.heroSubtitle")}
              </p>
              <div
                className="animate-fade-in-up mt-8 flex flex-wrap items-center gap-3"
                style={{ animationDelay: "0.2s" }}
              >
                <Link
                  to="/shop"
                  className="inline-flex rounded-md bg-accent px-7 py-3 text-sm font-semibold uppercase tracking-wide text-accent-foreground hover:opacity-90"
                >
                  {t("home.ctaShop")}
                </Link>
                <Link
                  to="/contact"
                  className="inline-flex rounded-md border border-white/40 px-7 py-3 text-sm font-semibold uppercase tracking-wide text-white hover:bg-white/10"
                >
                  {t("home.ctaContact")}
                </Link>
              </div>
            </div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl lg:aspect-square">
              <video
                autoPlay
                loop
                muted
                playsInline
                className="h-full w-full object-cover"
                poster="https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1200&q=60"
              >
                <source src={heroVideoUrl} type="video/mp4" />
              </video>
            </div>
          </div>
        </section>

        {/* Trust section */}
        <section className="border-b bg-card py-14">
          <div className="container-page grid gap-10 sm:grid-cols-3">
            {trustItems.map(({ icon: Icon, title, text }) => (
              <div key={title} className="flex flex-col items-center text-center sm:items-start sm:text-left">
                <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Icon className="size-6" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">{t(title)}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{t(text)}</p>
              </div>
            ))}
          </div>
        </section>

        <BrandsGrid />

        {/* Car carousel — no frame, no label, just the vehicles */}
        {carouselCars.length > 0 && (
          <section className="overflow-hidden border-t py-16">
            <p className="eyebrow text-center text-primary">{t("home.collectionsIntro")}</p>
            <div className="relative mt-8 overflow-hidden">
              <div className="animate-marquee flex w-max gap-10 px-6">
                {loopedCars.map((car, i) => (
                  <Link
                    key={`${car.id}-${i}`}
                    to="/listings/$listingId"
                    params={{ listingId: car.id }}
                    className="group block h-40 w-64 shrink-0 overflow-hidden rounded-xl"
                  >
                    <img
                      src={car.images[0]}
                      alt={car.title}
                      width={400}
                      height={240}
                      className="h-full w-full object-cover drop-shadow-2xl transition-transform duration-500 group-hover:scale-105"
                    />
                  </Link>
                ))}
              </div>
            </div>
            <div className="mt-10 flex justify-center">
              <Link
                to="/shop"
                className="inline-flex rounded-md bg-primary px-8 py-3 text-sm font-semibold uppercase tracking-wide text-primary-foreground hover:opacity-90"
              >
                {t("home.collectionsCta")}
              </Link>
            </div>
          </section>
        )}

        {/* Services & guides */}
        <section className="border-t bg-card py-16">
          <div className="container-page">
            <h2 className="text-2xl font-bold">{t("home.guidesTitle")}</h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              {guideItems.map(({ icon: Icon, title, text, cta }) => (
                <div key={title} className="rounded-xl border bg-background p-6">
                  <Icon className="size-6 text-primary" />
                  <h3 className="mt-3 font-semibold">{t(title)}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{t(text)}</p>
                  <Link to="/shop" className="mt-3 inline-block text-sm font-semibold text-primary hover:underline">
                    {t(cta)}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Coverage stats */}
        <section className="border-t py-16">
          <div className="container-page text-center">
            <span className="eyebrow text-primary">{t("home.statsTag")}</span>
            <h2 className="mt-1 text-3xl font-bold">{t("home.statsTitle")}</h2>
            <p className="mx-auto mt-2 max-w-xl text-muted-foreground">{t("home.statsText")}</p>
            <div className="mx-auto mt-8 grid max-w-2xl grid-cols-2 gap-6 sm:grid-cols-4">
              {[
                { label: "home.statsMarkets", value: "50" },
                { label: "home.statsCurrencies", value: "40" },
                { label: "home.statsLanguages", value: "11" },
                { label: "home.statsVehicles", value: `${vehiclesSold}+` },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-xl border bg-card py-5">
                  <p className="text-2xl font-bold text-primary">{value}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{t(label as TranslationKey)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="border-t bg-card py-16">
          <p className="eyebrow text-center text-primary">{t("home.testimonialsIntro")}</p>
          <h2 className="mt-2 text-center text-3xl font-bold">{t("home.testimonialsTitle")}</h2>
          <div className="container-page mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {testimonialKeys.map(({ nameKey, textKey }, i) => {
              const name = t(nameKey);
              const initials = name
                .split(" ")
                .map((p) => p[0])
                .join("")
                .slice(0, 2);
              return (
                <div key={nameKey} className="rounded-xl border bg-background p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-full bg-navy text-xs font-bold text-white">
                      {initials}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{name}</p>
                      <div className="flex gap-0.5 text-accent">
                        {Array.from({ length: 5 }).map((_, star) => (
                          <Star key={star} className="size-3 fill-accent" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">"{t(textKey)}"</p>
                  <span className="sr-only">{i + 1}</span>
                </div>
              );
            })}
          </div>
        </section>
      </main>
      <NewsletterHook />
      <SiteFooter />
    </div>
  );
}
