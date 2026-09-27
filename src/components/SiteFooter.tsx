import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Youtube, Twitter } from "lucide-react";
import { useLocale } from "@/i18n/locale-context";

export function SiteFooter() {
  const { t } = useLocale();

  function resetCookieConsent() {
    try {
      window.localStorage.removeItem("autosale:cookie-consent");
      window.location.reload();
    } catch {
      // ignore
    }
  }

  return (
    <footer className="mt-20 border-t bg-navy text-white">
      <div className="container-page grid gap-8 py-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <span className="font-display text-xl font-bold tracking-tight text-white">
            AUTO<span className="text-accent">SALE</span>
          </span>
          <p className="mt-2 max-w-xs text-sm text-white/60">{t("footer.tagline")}</p>
          <div className="mt-4 flex items-center gap-3">
            {[Instagram, Facebook, Twitter, Youtube].map((Icon, i) => (
              <a
                key={i}
                href="#"
                aria-label={t("footer.socialNetwork")}
                className="flex size-8 items-center justify-center rounded-full border border-white/15 text-white/70 transition-colors hover:border-accent hover:text-accent"
              >
                <Icon className="size-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h3 className="eyebrow text-white/50">{t("footer.company")}</h3>
          <ul className="mt-2 space-y-1.5 text-sm text-white/70">
            <li><Link to="/" className="hover:text-accent">{t("nav.home")}</Link></li>
            <li><Link to="/about" className="hover:text-accent">{t("footer.about")}</Link></li>
            <li><Link to="/shop" className="hover:text-accent">{t("nav.shop")}</Link></li>
            <li><Link to="/vedette" className="hover:text-accent">{t("nav.featured")}</Link></li>
            <li><Link to="/contact" className="hover:text-accent">{t("nav.contact")}</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="eyebrow text-white/50">{t("footer.legalHeading")}</h3>
          <ul className="mt-2 space-y-1.5 text-sm text-white/70">
            <li><Link to="/privacy" className="hover:text-accent">{t("footer.privacy")}</Link></li>
            <li><Link to="/refund-policy" className="hover:text-accent">{t("footer.refund")}</Link></li>
            <li><Link to="/return-policy" className="hover:text-accent">{t("footer.returns")}</Link></li>
            <li><Link to="/terms" className="hover:text-accent">{t("footer.terms")}</Link></li>
            <li>
              <button type="button" onClick={resetCookieConsent} className="text-left hover:text-accent">
                {t("footer.cookieSettings")}
              </button>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-3 text-center text-xs text-white/50">
        {t("footer.copyright")}
      </div>
    </footer>
  );
}
