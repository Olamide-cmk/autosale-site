import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { useLocale } from "@/i18n/locale-context";
import { aboutTrustImage, aboutCarImage } from "@/config/contact";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "À propos — AutoSale" },
      { name: "description", content: "L'histoire et la mission d'AutoSale." },
    ],
  }),
  component: About,
});

function About() {
  const { t } = useLocale();
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main id="main-content">
        <div className="container-page grid gap-10 py-14 lg:grid-cols-[1fr_420px]">
          {/* Copy */}
          <div>
            <span className="eyebrow text-primary">{t("about.eyebrow")}</span>
            <h1 className="mt-2 text-4xl font-bold">{t("about.title")}</h1>

            <div className="prose mt-6 space-y-5 text-muted-foreground">
              <p>{t("about.p1")}</p>
              <p>{t("about.p2")}</p>
              <p>{t("about.p3")}</p>

              <h2 className="text-2xl font-bold text-foreground">{t("about.commitmentTitle")}</h2>
              <ul className="list-disc space-y-2 pl-5">
                <li>{t("about.li1")}</li>
                <li>{t("about.li2")}</li>
                <li>{t("about.li3")}</li>
                <li>{t("about.li4")}</li>
              </ul>

              <h2 className="text-2xl font-bold text-foreground">{t("about.methodTitle")}</h2>
              <p>{t("about.methodText")}</p>

              <h2 className="text-2xl font-bold text-foreground">{t("about.howTitle")}</h2>
              <p>{t("about.howSubtitle")}</p>
              <Accordion type="single" collapsible className="not-prose">
                <AccordionItem value="how-1">
                  <AccordionTrigger className="text-left text-base font-semibold">
                    {t("about.howQ1")}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{t("about.howA1")}</AccordionContent>
                </AccordionItem>
                <AccordionItem value="how-2">
                  <AccordionTrigger className="text-left text-base font-semibold">
                    {t("about.howQ2")}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{t("about.howA2")}</AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>

          {/* Images — stacked, not side by side, for a more editorial, trustworthy feel */}
          <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <img
              src={aboutTrustImage}
              alt={t("about.trustImageAlt")}
              width={700}
              height={500}
              className="aspect-[4/3] w-full rounded-xl object-cover"
            />
            <img
              src={aboutCarImage}
              alt={t("about.carImageAlt")}
              width={700}
              height={500}
              className="aspect-[4/3] w-full rounded-xl object-cover"
            />
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
