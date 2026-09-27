import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { useLocale } from "@/i18n/locale-context";
import type { TranslationKey } from "@/i18n/translations";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Confidentialité — AutoSale" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Privacy,
});

const sectionKeys: { title: TranslationKey; body: TranslationKey }[] = [
  { title: "privacy.s1title", body: "privacy.s1body" },
  { title: "privacy.s2title", body: "privacy.s2body" },
  { title: "privacy.s3title", body: "privacy.s3body" },
  { title: "privacy.s4title", body: "privacy.s4body" },
  { title: "privacy.s5title", body: "privacy.s5body" },
  { title: "privacy.s6title", body: "privacy.s6body" },
];

function Privacy() {
  const { t } = useLocale();
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main id="main-content" className="container-page max-w-3xl py-14">
        <h1 className="text-4xl font-bold">{t("privacy.title")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("privacy.lastUpdated")}</p>
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
