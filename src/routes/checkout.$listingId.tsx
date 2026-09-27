import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { CheckCircle2, Lock, Check } from "lucide-react";
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
import { formatUsd, listings as seedListings, fromSubmittedListing } from "@/data/listings";
import { getSubmittedListingByIdFn, getPurchasedListingIdsFn, purchaseListingFn } from "@/server-fns";
import { useLocale } from "@/i18n/locale-context";
import { useLocalStorageState } from "@/hooks/use-local-storage";
import { countries } from "@/data/countries";

export const Route = createFileRoute("/checkout/$listingId")({
  loader: async ({ params }) => {
    const seedMatch = seedListings.find((l) => l.id === params.listingId);
    if (seedMatch) return { listing: seedMatch };

    const submitted = await getSubmittedListingByIdFn({ data: { id: params.listingId } });
    if (submitted) return { listing: fromSubmittedListing(submitted) };

    throw notFound();
  },
  head: () => ({
    meta: [
      { title: "Paiement — AutoSale" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Checkout,
});

const BUYER_FEE_RATE = 0;
const LOCAL_ZONE = new Set(["FR", "DE", "BJ", "TG", "CI", "SN", "NG", "GH", "CM"]);

type SavedContact = {
  countryIso2: string;
  dialCode: string;
  phone: string;
};

const contactSchema = z.object({
  firstName: z.string().min(1, "Le prénom est requis."),
  lastName: z.string().min(1, "Le nom est requis."),
  email: z.string().email("Adresse email invalide."),
  phone: z.string().min(4, "Numéro de téléphone invalide."),
  sameNumber: z.enum(["yes", "no"]),
  callNumber: z.string().optional(),
  countryIso2: z.string().min(1, "Merci de sélectionner un pays."),
});

const shippingSchema = z.object({
  address: z.string().min(1, "L'adresse est requise."),
  city: z.string().min(1, "La ville est requise."),
  postalCode: z.string().min(1, "Le code postal est requis."),
  region: z.string().optional(),
  addressComplement: z.string().optional(),
});

const cardSchema = z.object({
  cardNumber: z
    .string()
    .transform((v) => v.replace(/\s+/g, ""))
    .refine((v) => /^\d{13,19}$/.test(v), "Numéro de carte invalide."),
  cardExpiry: z.string().regex(/^\d{2}\/\d{2}$/, "Format attendu : MM/AA."),
  cardCvc: z.string().regex(/^\d{3,4}$/, "CVC invalide."),
});

const mobileMoneySchema = z.object({
  mobileNumber: z.string().min(4, "Numéro mobile money invalide."),
  mobileProvider: z.string().min(1, "Merci d'indiquer un opérateur."),
});

const paypalSchema = z.object({
  paypalEmail: z.string().email("Adresse email PayPal invalide."),
});

type ContactForm = z.infer<typeof contactSchema>;
type ShippingForm = z.infer<typeof shippingSchema>;

function Checkout() {
  const { listing } = Route.useLoaderData();
  const { t } = useLocale();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [done, setDone] = useState(false);
  const [alreadySold, setAlreadySold] = useState(false);

  const [savedContact, setSavedContact] = useLocalStorageState<SavedContact | null>(
    "autosale:saved-contact",
    null,
  );

  const [contact, setContact] = useState<ContactForm>({
    firstName: "",
    lastName: "",
    email: "",
    phone: savedContact?.phone ?? "",
    sameNumber: "yes",
    callNumber: "",
    countryIso2: savedContact?.countryIso2 ?? "",
  });
  const [shipping, setShipping] = useState<ShippingForm>({
    address: "",
    city: "",
    postalCode: "",
    region: "",
    addressComplement: "",
  });
  const [paymentMethod, setPaymentMethod] = useState<"card" | "mobile" | "paypal">("card");
  const [card, setCard] = useState({ cardNumber: "", cardExpiry: "", cardCvc: "" });
  const [mobile, setMobile] = useState({ mobileNumber: "", mobileProvider: "" });
  const [paypal, setPaypal] = useState({ paypalEmail: "" });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState("");
  const [cardLast4, setCardLast4] = useState("");

  useEffect(() => {
    let cancelled = false;
    getPurchasedListingIdsFn()
      .then((ids) => {
        if (!cancelled) setAlreadySold(listing.status === "sold" || ids.includes(listing.id));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [listing.id, listing.status]);

  const fee = Math.round(listing.price * BUYER_FEE_RATE);
  const total = listing.price + fee;
  const selectedCountry = countries.find((c) => c.iso2 === contact.countryIso2);
  const isLocalZone = contact.countryIso2 ? LOCAL_ZONE.has(contact.countryIso2) : true;

  function updateContact<K extends keyof ContactForm>(key: K, value: ContactForm[K]) {
    setContact((c) => ({ ...c, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: "" }));
  }
  function updateShipping<K extends keyof ShippingForm>(key: K, value: ShippingForm[K]) {
    setShipping((s) => ({ ...s, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: "" }));
  }

  function handleStep1(e: React.FormEvent) {
    e.preventDefault();
    const result = contactSchema.safeParse(contact);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) fieldErrors[String(issue.path[0])] = issue.message;
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    if (selectedCountry) {
      setSavedContact({
        countryIso2: selectedCountry.iso2,
        dialCode: selectedCountry.dialCode,
        phone: contact.sameNumber === "yes" ? contact.phone : contact.callNumber || contact.phone,
      });
    }
    setStep(2);
  }

  function handleStep2(e: React.FormEvent) {
    e.preventDefault();
    const result = shippingSchema.safeParse(shipping);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) fieldErrors[String(issue.path[0])] = issue.message;
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setStep(3);
  }

  async function handlePay(e: React.FormEvent) {
    e.preventDefault();
    const schema =
      paymentMethod === "card" ? cardSchema : paymentMethod === "mobile" ? mobileMoneySchema : paypalSchema;
    const data = paymentMethod === "card" ? card : paymentMethod === "mobile" ? mobile : paypal;
    const result = schema.safeParse(data);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) fieldErrors[String(issue.path[0])] = issue.message;
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setPayError("");
    setPaying(true);
    try {
      const res = await purchaseListingFn({
        data: {
          listingId: listing.id,
          amount: total,
          buyerName: `${contact.firstName} ${contact.lastName}`,
          buyerEmail: contact.email,
          cardNumber: paymentMethod === "card" ? card.cardNumber : "4242424242424242",
          cardExpiry: paymentMethod === "card" ? card.cardExpiry : "12/30",
          cardCvc: paymentMethod === "card" ? card.cardCvc : "123",
        },
      });
      setCardLast4(
        paymentMethod === "card"
          ? res.cardLast4
          : paymentMethod === "mobile"
            ? mobile.mobileNumber.slice(-4)
            : paypal.paypalEmail.slice(0, 4),
      );
      setDone(true);
    } catch (err) {
      if (err instanceof Error && err.message.includes("ALREADY_SOLD")) {
        setPayError(t("checkout.alreadySoldError"));
        setAlreadySold(true);
      } else {
        setPayError(t("checkout.genericError"));
      }
    } finally {
      setPaying(false);
    }
  }

  if (alreadySold && !done) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <main id="main-content" className="container-page flex flex-col items-center justify-center py-24 text-center">
          <h1 className="text-3xl font-bold">{t("checkout.unavailableTitle")}</h1>
          <p className="mt-2 max-w-md text-muted-foreground">{t("checkout.unavailableBody")}</p>
          <Link
            to="/"
            className="mt-6 rounded-md bg-primary px-6 py-2.5 text-sm font-semibold uppercase tracking-wide text-primary-foreground hover:opacity-90"
          >
            {t("checkout.seeOtherListings")}
          </Link>
        </main>
        <SiteFooter />
      </div>
    );
  }

  const stepLabels = [t("checkout.step1Title"), t("checkout.step2Title"), t("checkout.step3Title")];

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main id="main-content" className="container-page max-w-2xl py-12">
        <h1 className="text-3xl font-bold">{t("checkout.title")}</h1>
        <p className="mt-1 text-muted-foreground">{listing.title}</p>

        {!done && (
          <ol className="mt-6 flex flex-wrap items-center gap-2 text-sm">
            {stepLabels.map((label, i) => (
              <li key={label} className="flex items-center gap-2">
                <span
                  className={`flex size-7 items-center justify-center rounded-full text-xs font-bold ${
                    i + 1 < step
                      ? "bg-primary text-primary-foreground"
                      : i + 1 === step
                        ? "bg-accent text-accent-foreground"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {i + 1 < step ? <Check className="size-4" /> : i + 1}
                </span>
                <span className={i + 1 === step ? "font-semibold text-foreground" : "text-muted-foreground"}>
                  {label}
                </span>
                {i < stepLabels.length - 1 && <span className="mx-1 h-px w-6 bg-border sm:w-10" />}
              </li>
            ))}
          </ol>
        )}

        {done ? (
          <div className="mt-10 flex flex-col items-center rounded-xl border bg-card p-12 text-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle2 className="size-8 text-primary" />
            </div>
            <h2 className="mt-6 text-2xl font-bold">{t("checkout.successTitle")}</h2>
            <p className="mt-2 max-w-md text-muted-foreground">
              {t("checkout.successCardEnding")} {cardLast4} {t("checkout.successDebited")} {formatUsd(total)}.{" "}
              {t("checkout.successBodySuffix")} {listing.year} {listing.brand} {listing.model}.
            </p>
            <p className="mt-4 rounded-md bg-muted px-4 py-3 text-sm font-semibold text-foreground">
              {isLocalZone ? t("checkout.deliveryLocalTitle") : t("checkout.deliveryIntlTitle")}
            </p>
            <Link
              to="/"
              className="mt-6 rounded-md bg-primary px-6 py-2.5 text-sm font-semibold uppercase tracking-wide text-primary-foreground hover:opacity-90"
            >
              {t("checkout.backHome")}
            </Link>
          </div>
        ) : (
          <div className="mt-6 grid gap-6 sm:grid-cols-[1fr_1.3fr]">
            <div className="h-fit rounded-xl border bg-card p-5">
              <img
                src={listing.images[0]}
                alt={listing.title}
                width={600}
                height={400}
                className="aspect-[3/2] w-full rounded-lg object-cover"
              />
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">{t("checkout.askingPrice")}</dt>
                  <dd className="font-semibold">{formatUsd(listing.price)}</dd>
                </div>
                <div className="flex justify-between border-t pt-2 text-base">
                  <dt className="font-semibold">{t("checkout.totalToPay")}</dt>
                  <dd className="font-bold text-primary">{formatUsd(total)}</dd>
                </div>
              </dl>
            </div>

            {/* Step 1 — Contact */}
            {step === 1 && (
              <form onSubmit={handleStep1} className="rounded-xl border bg-card p-5">
                <h2 className="text-lg font-semibold">{t("checkout.step1Title")}</h2>
                <div className="mt-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="eyebrow block">{t("checkout.firstName")}</label>
                      <Input className="mt-1" value={contact.firstName} onChange={(e) => updateContact("firstName", e.target.value)} />
                      {errors["firstName"] && <p className="mt-1 text-xs font-medium text-destructive">{errors["firstName"]}</p>}
                    </div>
                    <div>
                      <label className="eyebrow block">{t("checkout.lastName")}</label>
                      <Input className="mt-1" value={contact.lastName} onChange={(e) => updateContact("lastName", e.target.value)} />
                      {errors["lastName"] && <p className="mt-1 text-xs font-medium text-destructive">{errors["lastName"]}</p>}
                    </div>
                  </div>
                  <div>
                    <label className="eyebrow block">{t("checkout.yourEmail")}</label>
                    <Input className="mt-1" type="email" value={contact.email} onChange={(e) => updateContact("email", e.target.value)} />
                    {errors["email"] && <p className="mt-1 text-xs font-medium text-destructive">{errors["email"]}</p>}
                  </div>
                  <div>
                    <label className="eyebrow block">{t("checkout.country")}</label>
                    <Select value={contact.countryIso2} onValueChange={(v) => updateContact("countryIso2", v)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder={t("checkout.selectCountry")} />
                      </SelectTrigger>
                      <SelectContent className="max-h-72">
                        {countries.map((c) => (
                          <SelectItem key={c.iso2} value={c.iso2}>
                            {c.name} ({c.dialCode})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors["countryIso2"] && <p className="mt-1 text-xs font-medium text-destructive">{errors["countryIso2"]}</p>}
                  </div>
                  <div>
                    <label className="eyebrow block">{t("checkout.phoneLabel")}</label>
                    <div className="mt-1 flex gap-2">
                      <span className="flex h-10 shrink-0 items-center rounded-md border bg-muted px-3 text-sm font-semibold">
                        {selectedCountry?.dialCode ?? "+…"}
                      </span>
                      <Input value={contact.phone} onChange={(e) => updateContact("phone", e.target.value)} />
                    </div>
                    {errors["phone"] && <p className="mt-1 text-xs font-medium text-destructive">{errors["phone"]}</p>}
                  </div>

                  <div>
                    <label className="eyebrow block">{t("checkout.sameNumberQuestion")}</label>
                    <div className="mt-2 flex gap-4 text-sm">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="sameNumber"
                          checked={contact.sameNumber === "yes"}
                          onChange={() => updateContact("sameNumber", "yes")}
                        />
                        {t("checkout.yes")}
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="sameNumber"
                          checked={contact.sameNumber === "no"}
                          onChange={() => updateContact("sameNumber", "no")}
                        />
                        {t("checkout.no")}
                      </label>
                    </div>
                  </div>
                  {contact.sameNumber === "no" && (
                    <div>
                      <label className="eyebrow block">{t("checkout.callNumber")}</label>
                      <div className="mt-1 flex gap-2">
                        <span className="flex h-10 shrink-0 items-center rounded-md border bg-muted px-3 text-sm font-semibold">
                          {selectedCountry?.dialCode ?? "+…"}
                        </span>
                        <Input value={contact.callNumber} onChange={(e) => updateContact("callNumber", e.target.value)} />
                      </div>
                    </div>
                  )}
                </div>
                <button
                  type="submit"
                  className="mt-5 w-full rounded-md bg-primary px-5 py-2.5 text-sm font-semibold uppercase tracking-wide text-primary-foreground hover:opacity-90"
                >
                  {t("checkout.next")}
                </button>
              </form>
            )}

            {/* Step 2 — Shipping */}
            {step === 2 && (
              <form onSubmit={handleStep2} className="rounded-xl border bg-card p-5">
                <h2 className="text-lg font-semibold">{t("checkout.step2Title")}</h2>
                <div className="mt-4 space-y-3">
                  <div>
                    <label className="eyebrow block">{t("checkout.address")}</label>
                    <Input className="mt-1" value={shipping.address} onChange={(e) => updateShipping("address", e.target.value)} />
                    {errors["address"] && <p className="mt-1 text-xs font-medium text-destructive">{errors["address"]}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="eyebrow block">{t("checkout.city")}</label>
                      <Input className="mt-1" value={shipping.city} onChange={(e) => updateShipping("city", e.target.value)} />
                      {errors["city"] && <p className="mt-1 text-xs font-medium text-destructive">{errors["city"]}</p>}
                    </div>
                    <div>
                      <label className="eyebrow block">{t("checkout.postalCode")}</label>
                      <Input className="mt-1" value={shipping.postalCode} onChange={(e) => updateShipping("postalCode", e.target.value)} />
                      {errors["postalCode"] && <p className="mt-1 text-xs font-medium text-destructive">{errors["postalCode"]}</p>}
                    </div>
                  </div>
                  <div>
                    <label className="eyebrow block">{t("checkout.region")}</label>
                    <Input className="mt-1" value={shipping.region} onChange={(e) => updateShipping("region", e.target.value)} />
                  </div>
                  <div>
                    <label className="eyebrow block">{t("checkout.addressComplement")}</label>
                    <Input className="mt-1" value={shipping.addressComplement} onChange={(e) => updateShipping("addressComplement", e.target.value)} />
                  </div>
                </div>
                <div className="mt-5 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="rounded-md border px-5 py-2.5 text-sm font-semibold"
                  >
                    {t("checkout.back")}
                  </button>
                  <button
                    type="submit"
                    className="flex-1 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold uppercase tracking-wide text-primary-foreground hover:opacity-90"
                  >
                    {t("checkout.next")}
                  </button>
                </div>
              </form>
            )}

            {/* Step 3 — Payment */}
            {step === 3 && (
              <form onSubmit={handlePay} className="rounded-xl border bg-card p-5">
                <h2 className="flex items-center gap-2 text-lg font-semibold">
                  <Lock className="size-4" /> {t("checkout.step3Title")}
                </h2>

                <div className="mt-4">
                  <label className="eyebrow block">{t("checkout.paymentMethod")}</label>
                  <div className="mt-2 grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("card")}
                      className={`rounded-md border px-4 py-2.5 text-sm font-semibold ${
                        paymentMethod === "card" ? "border-primary bg-primary/5 text-primary" : ""
                      }`}
                    >
                      {t("checkout.methodCard")}
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("mobile")}
                      className={`rounded-md border px-4 py-2.5 text-sm font-semibold ${
                        paymentMethod === "mobile" ? "border-primary bg-primary/5 text-primary" : ""
                      }`}
                    >
                      {t("checkout.methodMobileMoney")}
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("paypal")}
                      className={`rounded-md border px-4 py-2.5 text-sm font-semibold ${
                        paymentMethod === "paypal" ? "border-primary bg-primary/5 text-primary" : ""
                      }`}
                    >
                      {t("checkout.methodPaypal")}
                    </button>
                  </div>
                </div>

                {paymentMethod === "card" ? (
                  <div className="mt-4 space-y-3">
                    <div>
                      <label className="eyebrow block">{t("checkout.cardNumber")}</label>
                      <Input
                        className="mt-1"
                        inputMode="numeric"
                        value={card.cardNumber}
                        onChange={(e) => setCard((c) => ({ ...c, cardNumber: e.target.value }))}
                        placeholder="4242 4242 4242 4242"
                        maxLength={19}
                      />
                      {errors["cardNumber"] && <p className="mt-1 text-xs font-medium text-destructive">{errors["cardNumber"]}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="eyebrow block">{t("checkout.expiry")}</label>
                        <Input
                          className="mt-1"
                          value={card.cardExpiry}
                          onChange={(e) => setCard((c) => ({ ...c, cardExpiry: e.target.value }))}
                          placeholder="MM/AA"
                          maxLength={5}
                        />
                        {errors["cardExpiry"] && <p className="mt-1 text-xs font-medium text-destructive">{errors["cardExpiry"]}</p>}
                      </div>
                      <div>
                        <label className="eyebrow block">{t("checkout.cvc")}</label>
                        <Input
                          className="mt-1"
                          inputMode="numeric"
                          value={card.cardCvc}
                          onChange={(e) => setCard((c) => ({ ...c, cardCvc: e.target.value }))}
                          placeholder="123"
                          maxLength={4}
                        />
                        {errors["cardCvc"] && <p className="mt-1 text-xs font-medium text-destructive">{errors["cardCvc"]}</p>}
                      </div>
                    </div>
                  </div>
                ) : paymentMethod === "mobile" ? (
                  <div className="mt-4 space-y-3">
                    <div>
                      <label className="eyebrow block">{t("checkout.mobileProvider")}</label>
                      <Input
                        className="mt-1"
                        value={mobile.mobileProvider}
                        onChange={(e) => setMobile((m) => ({ ...m, mobileProvider: e.target.value }))}
                        placeholder="MTN, Orange Money, M-Pesa…"
                      />
                      {errors["mobileProvider"] && <p className="mt-1 text-xs font-medium text-destructive">{errors["mobileProvider"]}</p>}
                    </div>
                    <div>
                      <label className="eyebrow block">{t("checkout.mobileNumber")}</label>
                      <div className="mt-1 flex gap-2">
                        <span className="flex h-10 shrink-0 items-center rounded-md border bg-muted px-3 text-sm font-semibold">
                          {selectedCountry?.dialCode ?? "+…"}
                        </span>
                        <Input
                          value={mobile.mobileNumber}
                          onChange={(e) => setMobile((m) => ({ ...m, mobileNumber: e.target.value }))}
                        />
                      </div>
                      {errors["mobileNumber"] && <p className="mt-1 text-xs font-medium text-destructive">{errors["mobileNumber"]}</p>}
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 space-y-3">
                    <div>
                      <label className="eyebrow block">{t("checkout.paypalEmail")}</label>
                      <Input
                        className="mt-1"
                        type="email"
                        value={paypal.paypalEmail}
                        onChange={(e) => setPaypal({ paypalEmail: e.target.value })}
                        placeholder="vous@exemple.com"
                      />
                      {errors["paypalEmail"] && <p className="mt-1 text-xs font-medium text-destructive">{errors["paypalEmail"]}</p>}
                      <p className="mt-2 text-xs text-muted-foreground">{t("checkout.paypalHint")}</p>
                    </div>
                  </div>
                )}

                {payError && <p className="mt-3 text-sm font-medium text-destructive">{payError}</p>}
                <div className="mt-5 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="rounded-md border px-5 py-2.5 text-sm font-semibold"
                  >
                    {t("checkout.back")}
                  </button>
                  <button
                    type="submit"
                    disabled={paying}
                    className="flex-1 rounded-md bg-accent px-5 py-2.5 text-sm font-semibold uppercase tracking-wide text-accent-foreground hover:opacity-90 disabled:opacity-60"
                  >
                    {paying ? t("checkout.paying") : `${t("checkout.confirmOrder")} · ${formatUsd(total)}`}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
