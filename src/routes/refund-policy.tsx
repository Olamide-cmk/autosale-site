import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { useLocale } from "@/i18n/locale-context";
import type { TranslationKey } from "@/i18n/translations";

export const Route = createFileRoute("/refund-policy")({
  head: () => ({
    meta: [
      { title: "Politique de remboursement — AutoSale" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: RefundPolicy,
});

const sectionKeys: { title: TranslationKey; body: TranslationKey }[] = [
  { title: "refundPolicy.s1title", body: "refundPolicy.s1body" },
  { title: "refundPolicy.s2title", body: "refundPolicy.s2body" },
  { title: "refundPolicy.s3title", body: "refundPolicy.s3body" },
];

function RefundPolicy() {
  const { t } = useLocale();
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main id="main-content" className="container-page max-w-3xl py-14">
        <h1 className="text-4xl font-bold">{t("refundPolicy.title")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("refundPolicy.lastUpdated")}</p>
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
