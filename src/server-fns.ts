import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  getSubmittedListings,
  addContactMessage,
  addNewsletterSignup,
  recordPurchase,
  getPurchasedListingIds,
  getPurchaseForListing,
  incrementHeartCount,
  getAutoFeaturedListingIds,
} from "./backend/store";

// --- listings ----------------------------------------------------------

export const getSubmittedListingsFn = createServerFn({ method: "GET" }).handler(async () => {
  return await getSubmittedListings();
});

export const getSubmittedListingByIdFn = createServerFn({ method: "GET" })
  .validator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    const all = await getSubmittedListings();
    return all.find((l) => l.id === data.id) ?? null;
  });

// --- contact seller ----------------------------------------------------

export const submitContactFn = createServerFn({ method: "POST" })
  .validator(
    z.object({
      listingId: z.string(),
      name: z.string().min(1),
      email: z.string().email(),
      phone: z.string(),
      message: z.string().min(1).max(2000),
    }),
  )
  .handler(async ({ data }) => {
    const contactMessage = await addContactMessage(data);
    return { id: contactMessage.id };
  });

// --- newsletter ------------------------------------------------------------

export const subscribeNewsletterFn = createServerFn({ method: "POST" })
  .validator(z.object({ email: z.string().email() }))
  .handler(async ({ data }) => addNewsletterSignup(data.email));

// --- purchase (demo card payment) -------------------------------------------
//
// IMPORTANT: no real payment processor is involved here. The card number is
// validated for shape only and never stored — only the last 4 digits are
// kept, purely for the confirmation screen. This demonstrates the purchase
// flow end-to-end; wire in a real processor before accepting real payments.

const luhnCardNumber = z
  .string()
  .transform((v) => v.replace(/\s+/g, ""))
  .refine((v) => /^\d{13,19}$/.test(v), "Numéro de carte invalide.");

export const purchaseListingFn = createServerFn({ method: "POST" })
  .validator(
    z.object({
      listingId: z.string(),
      amount: z.number().positive(),
      buyerName: z.string().min(1),
      buyerEmail: z.string().email(),
      cardNumber: luhnCardNumber,
      cardExpiry: z.string().regex(/^\d{2}\/\d{2}$/, "Format attendu : MM/AA."),
      cardCvc: z.string().regex(/^\d{3,4}$/, "CVC invalide."),
    }),
  )
  .handler(async ({ data }) => {
    const existing = await getPurchaseForListing(data.listingId);
    if (existing) {
      throw new Error("ALREADY_SOLD");
    }
    const last4 = data.cardNumber.slice(-4);
    const purchase = await recordPurchase(data.listingId, data.buyerName, data.buyerEmail, data.amount, last4);
    return { id: purchase.id, cardLast4: last4 };
  });

export const getPurchasedListingIdsFn = createServerFn({ method: "GET" }).handler(async () => {
  return await getPurchasedListingIds();
});

// --- hearts / auto-vedette ---------------------------------------------------

export const incrementHeartFn = createServerFn({ method: "POST" })
  .validator(z.object({ listingId: z.string() }))
  .handler(async ({ data }) => {
    const count = await incrementHeartCount(data.listingId);
    return { count };
  });

export const getAutoFeaturedListingIdsFn = createServerFn({ method: "GET" }).handler(async () => {
  return await getAutoFeaturedListingIds();
});
