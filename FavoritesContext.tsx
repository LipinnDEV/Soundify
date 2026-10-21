import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { favoriteApi } from "../services/api";
import { getErrorMessage } from "../services/http";
import { useToast } from "./ToastContext";

interface FavoritesContextValue {
  /** false enquanto a lista de IDs favoritos ainda está sendo carregada. */
  ready: boolean;
  isFavorite: (trackId: number) => boolean;
  toggle: (trackId: number) => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

/** Guarda só os IDs das músicas favoritas, para pintar o coração em qualquer lista sem chamadas extras. */
export function FavoritesProvider({ children }: { children: ReactNode }) {
  const toast = useToast();
  const [ids, setIds] = useState<Set<number>>(new Set());
  const [ready, setReady] = useState(false);
  const idsRef = useRef(ids);
  idsRef.current = ids;

  useEffect(() => {
    let cancelled = false;
    favoriteApi
      .ids()
      .then((list) => {
        if (!cancelled) setIds(new Set(list));
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const apply = useCallback((trackId: number, favorite: boolean) => {
    setIds((previous) => {
      const next = new Set(previous);
      if (favorite) next.add(trackId);
      else next.delete(trackId);
      return next;
    });
  }, []);

  const toggle = useCallback(
    async (trackId: number) => {
      const makeFavorite = !idsRef.current.has(trackId);
      apply(trackId, makeFavorite); // atualização otimista: o coração muda na hora
      try {
        if (makeFavorite) await favoriteApi.add(trackId);
        else await favoriteApi.remove(trackId);
      } catch (error) {
        apply(trackId, !makeFavorite); // desfaz se a API falhar
        toast.show(getErrorMessage(error, "Não foi possível atualizar seus favoritos."), "error");
      }
    },
    [apply, toast],
  );

  const isFavorite = useCallback((trackId: number) => ids.has(trackId), [ids]);
  const value = useMemo(() => ({ ready, isFavorite, toggle }), [ready, isFavorite, toggle]);
  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites(): FavoritesContextValue {
  const context = useContext(FavoritesContext);
  if (!context) throw new Error("useFavorites deve ser usado dentro de FavoritesProvider");
  return context;
}
