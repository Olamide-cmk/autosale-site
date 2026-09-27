import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { useLocale } from "@/i18n/locale-context";
import type { TranslationKey } from "@/i18n/translations";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Conditions d'utilisation — AutoSale" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Terms,
});

const sectionKeys: { title: TranslationKey; body: TranslationKey }[] = [
  { title: "terms.s1title", body: "terms.s1body" },
  { title: "terms.s2title", body: "terms.s2body" },
  { title: "terms.s3title", body: "terms.s3body" },
  { title: "terms.s4title", body: "terms.s4body" },
  { title: "terms.s5title", body: "terms.s5body" },
];

function Terms() {
  const { t } = useLocale();
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main id="main-content" className="container-page max-w-3xl py-14">
        <h1 className="text-4xl font-bold">{t("terms.title")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("terms.lastUpdated")}</p>
        <div className="mt-8 space-y-8">
          {sectionKeys.map((s) => (
            <section key={s.title}>
              <h2 className="text-xl font-semibold">{t(s.title)}</h2>
              <p className="mt-2 text-muted-foreground">{t(s.body)}</p>
            </section>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
