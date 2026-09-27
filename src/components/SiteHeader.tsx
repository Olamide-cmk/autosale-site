import { Link } from "@tanstack/react-router";
import { Menu, X, Moon, Sun, Languages } from "lucide-react";
import { useState } from "react";
import { useTheme } from "@/hooks/use-theme";
import { useLocale } from "@/i18n/locale-context";

const nav = [
  { to: "/", key: "nav.home" },
  { to: "/about", key: "nav.about" },
  { to: "/shop", key: "nav.shop" },
  { to: "/vedette", key: "nav.featured" },
  { to: "/contact", key: "nav.contact" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { theme, toggle } = useTheme();
  const { locale, setLocale, t } = useLocale();

  return (
    <header className="sticky top-0 z-40 border-b bg-navy text-white">
      <div className="container-page flex h-16 items-center gap-8">
        <Link to="/" className="font-display flex items-baseline gap-1 text-2xl font-bold tracking-tight text-white">
          AUTO<span className="text-accent">SALE</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              activeProps={{ className: "text-accent" }}
              className="text-sm font-semibold uppercase tracking-wide text-white/70 transition-colors hover:text-white"
            >
              {t(item.key)}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setLocale(locale === "fr" ? "en" : "fr")}
            className="hidden items-center gap-1 rounded-md px-2 text-xs font-bold uppercase text-white/80 hover:bg-white/10 hover:text-white sm:inline-flex sm:h-9"
            aria-label="Changer de langue / Switch language"
          >
            <Languages className="size-4" /> {locale}
          </button>

          <button
            type="button"
            onClick={toggle}
            className="inline-flex size-9 items-center justify-center rounded-md text-white/80 hover:bg-white/10 hover:text-white"
            aria-label={theme === "dark" ? t("theme.toLight") : t("theme.toDark")}
          >
            {theme === "dark" ? <Sun className="size-4.5" /> : <Moon className="size-4.5" />}
          </button>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex size-9 items-center justify-center rounded-md text-white md:hidden"
            aria-label="Menu"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-white/10 bg-navy px-4 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="text-sm font-semibold uppercase tracking-wide text-white/80"
              >
                {t(item.key)}
              </Link>
            ))}
            <button
              type="button"
              onClick={() => setLocale(locale === "fr" ? "en" : "fr")}
              className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-white/80"
            >
              <Languages className="size-4" /> {locale === "fr" ? "English" : "Français"}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
