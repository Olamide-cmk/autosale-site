import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Cookie } from "lucide-react";
import { useLocale } from "@/i18n/locale-context";

export function CookieConsent() {
  const { t } = useLocale();
  const [choice, setChoice] = useState<"accepted" | "declined" | null | undefined>(undefined);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem("autosale:cookie-consent");
      setChoice(stored === "accepted" || stored === "declined" ? stored : null);
    } catch {
      setChoice(null);
    }
  }, []);

  function choose(value: "accepted" | "declined") {
    setChoice(value);
    try {
      window.localStorage.setItem("autosale:cookie-consent", value);
    } catch {
      // ignore
    }
  }

  if (choice === undefined || choice !== null) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t bg-navy px-4 py-4 text-white shadow-2xl">
      <div className="container-page flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
        <p className="flex items-center gap-2 text-sm text-white/85">
          <Cookie className="size-4 shrink-0 text-accent" />
          {t("cookies.message")}{" "}
          <Link to="/privacy" className="underline hover:text-accent">
            {t("cookies.learnMore")}
          </Link>
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => choose("declined")}
            className="rounded-md border border-white/30 px-4 py-2 text-sm font-semibold hover:bg-white/10"
          >
            {t("cookies.decline")}
          </button>
          <button
            type="button"
            onClick={() => choose("accepted")}
            className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground hover:opacity-90"
          >
            {t("cookies.accept")}
          </button>
        </div>
      </div>
    </div>
  );
}
