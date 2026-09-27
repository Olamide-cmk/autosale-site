import { useEffect, useState } from "react";
import { listings as seedListings, fromSubmittedListing, type CarListing } from "@/data/listings";
import { getSubmittedListingsFn, getPurchasedListingIdsFn, getAutoFeaturedListingIdsFn } from "@/server-fns";

/** Seed dataset + any listing published live via the "Sell my car" form,
 * merged into one list. Submitted listings load asynchronously from the
 * server and are appended once available. Listings ever purchased (demo
 * checkout) are shown as sold, including seed listings whose static status
 * can't otherwise be mutated. Listings that reached 3 favorite "hearts" are
 * shown as featured (vedette) even if not manually flagged as such. */
export function useAllListings(): { listings: CarListing[]; loading: boolean } {
  const [submitted, setSubmitted] = useState<CarListing[]>([]);
  const [purchasedIds, setPurchasedIds] = useState<string[]>([]);
  const [autoFeaturedIds, setAutoFeaturedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getSubmittedListingsFn(), getPurchasedListingIdsFn(), getAutoFeaturedListingIdsFn()])
      .then(([submittedRes, purchasedRes, autoFeaturedRes]) => {
        if (cancelled) return;
        setSubmitted(submittedRes.map(fromSubmittedListing));
        setPurchasedIds(purchasedRes);
        setAutoFeaturedIds(autoFeaturedRes);
      })
      .catch(() => {
        if (!cancelled) {
          setSubmitted([]);
          setPurchasedIds([]);
          setAutoFeaturedIds([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const merged = [...submitted, ...seedListings].map((listing) => {
    let next = listing;
    if (purchasedIds.includes(listing.id) && next.status !== "sold") {
      next = { ...next, status: "sold" as const };
    }
    if (autoFeaturedIds.includes(listing.id) && !next.featured) {
      next = { ...next, featured: true };
    }
    return next;
  });

  return { listings: merged, loading };
}
