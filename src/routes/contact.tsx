import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { CheckCircle2, Send, Mail, Phone, MapPin } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLocale } from "@/i18n/locale-context";
import { submitContactFn } from "@/server-fns";
import { siteContact } from "@/config/contact";
import type { TranslationKey } from "@/i18n/translations";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — AutoSale" },
      { name: "description", content: "Contactez l'équipe AutoSale pour toute question sur nos véhicules." },
    ],
  }),
  component: Contact,
});

const topicKeys: { value: string; key: TranslationKey }[] = [
  { value: "vehicle", key: "contactPage.topicVehicle" },
  { value: "order", key: "contactPage.topicOrder" },
  { value: "payment", key: "contactPage.topicPayment" },
  { value: "delivery", key: "contactPage.topicDelivery" },
  { value: "other", key: "contactPage.topicOther" },
];

const schema = z.object({
  name: z.string().min(1, "Merci d'indiquer votre nom."),
  email: z.string().email("Adresse email invalide."),
  subject: z.string().min(1, "Merci d'indiquer un sujet."),
  message: z.string().min(10, "Votre message doit contenir au moins 10 caractères."),
});

function Contact() {
  const { t } = useLocale();
  const [form, setForm] = useState({ name: "", email: "", topic: "vehicle", subject: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: "" }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = schema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        fieldErrors[String(issue.path[0])] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setError("");
    setSending(true);
    try {
      const topicLabel = topicKeys.find((tk) => tk.value === form.topic)?.key;
      await submitContactFn({
        data: {
          listingId: "general-inquiry",
          name: form.name,
          email: form.email,
          phone: "",
          message: `[${topicLabel ? t(topicLabel) : form.topic}] ${form.subject}\n\n${form.message}`,
        },
      });
      setSent(true);
    } catch {
      setError(t("contactPage.error"));
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main id="main-content">
        <section className="border-b bg-navy py-14 text-white">
          <div className="container-page">
            <span className="eyebrow text-white/50">{t("contactPage.eyebrow")}</span>
            <h1 className="mt-1 text-4xl font-bold">{t("contactPage.title")}</h1>
            <p className="mt-2 max-w-xl text-white/70">{t("contactPage.subtitle")}</p>
          </div>
        </section>

        <div className="container-page grid gap-10 py-14 lg:grid-cols-[1fr_360px]">
          {/* Form */}
          <div>
            {sent ? (
              <div className="flex flex-col items-center rounded-xl border bg-card p-10 text-center">
                <CheckCircle2 className="size-9 text-primary" />
                <p className="mt-3 text-lg font-semibold">{t("contactPage.sentTitle")}</p>
                <p className="mt-1 text-sm text-muted-foreground">{t("contactPage.sentBody")}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5 rounded-xl border bg-card p-6 sm:p-8">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="eyebrow block">{t("contactPage.name")}</label>
                    <Input className="mt-1" value={form.name} onChange={(e) => update("name", e.target.value)} />
                    {errors["name"] && <p className="mt-1 text-xs font-medium text-destructive">{errors["name"]}</p>}
                  </div>
                  <div>
                    <label className="eyebrow block">{t("contactPage.email")}</label>
                    <Input
                      className="mt-1"
                      type="email"
                      value={form.email}
                      onChange={(e) => update("email", e.target.value)}
                    />
                    {errors["email"] && <p className="mt-1 text-xs font-medium text-destructive">{errors["email"]}</p>}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="eyebrow block">{t("contactPage.topic")}</label>
                    <Select value={form.topic} onValueChange={(v) => update("topic", v)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {topicKeys.map((tk) => (
                          <SelectItem key={tk.value} value={tk.value}>
                            {t(tk.key)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="eyebrow block">{t("contactPage.subject")}</label>
                    <Input
                      className="mt-1"
                      value={form.subject}
                      onChange={(e) => update("subject", e.target.value)}
                      placeholder={t("contactPage.subjectPlaceholder")}
                    />
                    {errors["subject"] && (
                      <p className="mt-1 text-xs font-medium text-destructive">{errors["subject"]}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="eyebrow block">{t("contactPage.message")}</label>
                  <textarea
                    value={form.message}
                    onChange={(e) => update("message", e.target.value)}
                    placeholder={t("contactPage.messagePlaceholder")}
                    className="mt-1 min-h-36 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                  />
                  {errors["message"] && (
                    <p className="mt-1 text-xs font-medium text-destructive">{errors["message"]}</p>
                  )}
                </div>

                {error && <p className="text-sm font-medium text-destructive">{error}</p>}

                <button
                  type="submit"
                  disabled={sending}
                  className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold uppercase tracking-wide text-primary-foreground hover:opacity-90 disabled:opacity-60 sm:w-auto"
                >
                  <Send className="size-4" /> {sending ? t("contactPage.sending") : t("contactPage.send")}
                </button>
              </form>
            )}
          </div>

          {/* Contact info */}
          <aside className="h-fit space-y-4">
            <div className="rounded-xl border bg-card p-6">
              <span className="eyebrow">{t("contactPage.infoTitle")}</span>
              <p className="mt-1 text-sm text-muted-foreground">{t("contactPage.infoSubtitle")}</p>
              <ul className="mt-4 space-y-4 text-sm">
                <li className="flex items-start gap-3">
                  <Mail className="mt-0.5 size-4 shrink-0 text-primary" />
                  <div>
                    <p className="font-semibold">{t("contactPage.byEmail")}</p>
                    <a href={`mailto:${siteContact.email}`} className="text-muted-foreground hover:text-primary">
                      {siteContact.email}
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Phone className="mt-0.5 size-4 shrink-0 text-primary" />
                  <div>
                    <p className="font-semibold">{t("contactPage.byPhone")}</p>
                    <span className="text-muted-foreground">{siteContact.phone}</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
                  <div>
                    <p className="font-semibold">{t("contactPage.location")}</p>
                    <span className="text-muted-foreground">{siteContact.location}</span>
                  </div>
                </li>
              </ul>
            </div>
            <div className="rounded-xl border bg-card p-6">
              <p className="text-sm font-semibold">{t("contactPage.hoursTitle")}</p>
              <p className="mt-1 text-sm text-muted-foreground">{t("contactPage.hoursText")}</p>
            </div>
          </aside>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
