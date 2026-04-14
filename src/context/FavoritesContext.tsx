"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback } from "react";

const STORAGE_KEY = "emma-favorites";

interface FavoritesContextType {
  ids: string[];
  toggle: (productId: string) => void;
  has: (productId: string) => boolean;
  count: number;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

function loadIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export const FavoritesProvider = ({ children }: { children: ReactNode }) => {
  const [ids, setIds] = useState<string[]>(() => loadIds());

  const toggle = useCallback((productId: string) => {
    setIds((current) => {
      const exists = current.includes(productId);
      const next = exists ? current.filter((id) => id !== productId) : [...current, productId];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const has = useCallback((productId: string) => ids.includes(productId), [ids]);

  return (
    <FavoritesContext.Provider value={{ ids, toggle, has, count: ids.length }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be used within FavoritesProvider");
  return ctx;
};
