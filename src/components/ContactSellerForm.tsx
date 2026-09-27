import { useEffect, useState } from "react";
import { z } from "zod";
import { Phone, Send, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { maskPhone, type CarListing } from "@/data/listings";
import { submitContactFn } from "@/server-fns";
import { useLocale } from "@/i18n/locale-context";

const contactSchema = z.object({
  name: z.string().min(1, "Merci d'indiquer votre nom."),
  email: z.string().email("Adresse email invalide."),
  phone: z.string().optional(),
  message: z.string().min(10, "Votre message doit contenir au moins 10 caractères."),
});

export function ContactSellerForm({ listing }: { listing: CarListing }) {
  const { t } = useLocale();
  const [phoneRevealed, setPhoneRevealed] = useState(false);
  const defaultMessage = `${t("contact.defaultMessagePrefix")} ${listing.year} ${listing.brand} ${listing.model}. ${t("contact.defaultMessageSuffix")}`;
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: defaultMessage,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  // Keep the default message text in sync if the locale changes before the
  // user has typed their own message.
  useEffect(() => {
    setForm((f) => (f.message === "" || f.message === defaultMessage ? { ...f, message: defaultMessage } : f));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t]);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: "" }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = contactSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        fieldErrors[String(issue.path[0])] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setSending(true);
    try {
      await submitContactFn({
        data: {
          listingId: listing.id,
          name: form.name,
          email: form.email,
          phone: form.phone,
          message: form.message,
        },
      });
      setSent(true);
    } catch {
      toast.error(t("contact.errorGeneric"));
    } finally {
      setSending(false);
    }
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center rounded-xl border bg-card p-6 text-center">
        <CheckCircle2 className="size-8 text-primary" />
        <p className="mt-3 font-semibold">{t("contact.sentTitle")}</p>
        <p className="mt-1 text-sm text-muted-foreground">{t("contact.sentBodySuffix")}</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card p-6">
      <span className="eyebrow">{t("contact.title")}</span>
      <div className="mt-3 flex items-center gap-3">
        <div className="flex size-11 items-center justify-center rounded-full bg-navy text-xs font-bold text-white">
          AS
        </div>
        <div>
          <p className="font-semibold">{t("contact.companyName")}</p>
          <p className="text-xs text-muted-foreground">{t("contact.companySubtitle")}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setPhoneRevealed(true)}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-md border px-4 py-2.5 text-sm font-semibold hover:border-primary hover:text-primary"
      >
        <Phone className="size-4" />
        {phoneRevealed ? listing.sellerPhone : maskPhone(listing.sellerPhone)}
        {!phoneRevealed && <span className="text-xs text-muted-foreground">{t("contact.clickToReveal")}</span>}
      </button>

      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <div>
          <label className="eyebrow block">{t("contact.yourName")}</label>
          <Input className="mt-1" value={form.name} onChange={(e) => update("name", e.target.value)} />
          {errors["name"] && <p className="mt-1 text-xs font-medium text-destructive">{errors["name"]}</p>}
        </div>
        <div>
          <label className="eyebrow block">{t("contact.yourEmail")}</label>
          <Input
            className="mt-1"
            type="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
          />
          {errors["email"] && <p className="mt-1 text-xs font-medium text-destructive">{errors["email"]}</p>}
        </div>
        <div>
          <label className="eyebrow block">{t("contact.yourPhone")}</label>
          <Input className="mt-1" type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} />
        </div>
        <div>
          <label className="eyebrow block">{t("contact.message")}</label>
          <textarea
            value={form.message}
            onChange={(e) => update("message", e.target.value)}
            className="mt-1 min-h-24 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          {errors["message"] && <p className="mt-1 text-xs font-medium text-destructive">{errors["message"]}</p>}
        </div>
        <button
          type="submit"
          disabled={sending}
          className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold uppercase tracking-wide text-primary-foreground hover:opacity-90 disabled:opacity-60"
        >
          <Send className="size-4" /> {sending ? t("contact.sending") : t("contact.send")}
        </button>
      </form>
    </div>
  );
}
