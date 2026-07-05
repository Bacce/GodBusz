import { useState, useEffect } from "react";

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem("favorite_stops");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "favorite_stops") {
        setFavorites(e.newValue ? JSON.parse(e.newValue) : []);
      }
    };

    const handleLocalChange = () => {
      const saved = localStorage.getItem("favorite_stops");
      setFavorites(saved ? JSON.parse(saved) : []);
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("favorites-updated", handleLocalChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("favorites-updated", handleLocalChange);
    };
  }, []);

  const toggleFavorite = (mids: string | string[]) => {
    const targetMids = Array.isArray(mids) ? mids : [mids];
    
    const isRemoving = targetMids.every((mid) => favorites.includes(mid));
    let newFavorites = [...favorites];
    
    if (isRemoving) {
      newFavorites = favorites.filter((id) => !targetMids.includes(id));
    } else {
      targetMids.forEach((mid) => {
        if (!newFavorites.includes(mid)) newFavorites.push(mid);
      });
    }
    
    localStorage.setItem("favorite_stops", JSON.stringify(newFavorites));
    setFavorites(newFavorites);
    window.dispatchEvent(new Event("favorites-updated"));
  };

  const isFavorite = (mid: string) => favorites.includes(mid);

  return { favorites, toggleFavorite, isFavorite };
}
