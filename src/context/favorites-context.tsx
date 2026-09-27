import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useLocalStorageState } from "@/hooks/use-local-storage";
import { incrementHeartFn } from "@/server-fns";

type FavoritesContextValue = {
  favorites: string[];
  isFavorited: (listingId: string) => boolean;
  toggleFavorite: (listingId: string) => void;
};

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useLocalStorageState<string[]>("autosale:favorites", []);
  // Tracks which listings this browser has ever contributed a "heart" to on
  // the server, so toggling favorite on/off repeatedly can't inflate the
  // global count used for the 3-hearts auto-vedette threshold.
  const [heartedOnce, setHeartedOnce] = useLocalStorageState<string[]>("autosale:hearted-once", []);

  const value = useMemo<FavoritesContextValue>(
    () => ({
      favorites,
      isFavorited: (listingId) => favorites.includes(listingId),
      toggleFavorite: (listingId) => {
        const nowFavorited = !favorites.includes(listingId);
        setFavorites((prev) =>
          prev.includes(listingId) ? prev.filter((id) => id !== listingId) : [...prev, listingId],
        );
        if (nowFavorited && !heartedOnce.includes(listingId)) {
          setHeartedOnce((prev) => [...prev, listingId]);
          incrementHeartFn({ data: { listingId } }).catch(() => {});
        }
      },
    }),
    [favorites, setFavorites, heartedOnce, setHeartedOnce],
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be used within FavoritesProvider");
  return ctx;
}
