import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { authApi, userApi } from "../services/api";
import { onUnauthorized, tokenStorage } from "../services/http";
import type { UserProfile } from "../types/api";

interface AuthContextValue {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: UserProfile) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  // Se já existe um token salvo, ficamos "carregando" até confirmar na API quem é o usuário.
  const [loading, setLoading] = useState<boolean>(() => tokenStorage.get() !== null);

  // Sessão expirada ou token revogado: qualquer 401 fora do login derruba a sessão local.
  useEffect(() => {
    onUnauthorized(() => {
      tokenStorage.clear();
      setUser(null);
    });
    return () => onUnauthorized(null);
  }, []);

  useEffect(() => {
    if (!tokenStorage.get()) return;
    let cancelled = false;
    userApi
      .me()
      .then((profile) => {
        if (!cancelled) setUser(profile);
      })
      .catch(() => {
        /* 401 já é tratado pelo interceptor; em falhas de rede o token é mantido */
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const response = await authApi.login(email, password);
    tokenStorage.set(response.token);
    setUser(response.user);
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const response = await authApi.register(name, email, password);
    tokenStorage.set(response.token);
    setUser(response.user);
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout(); // revoga o token no servidor
    } catch {
      /* mesmo se falhar, o token local é descartado */
    }
    tokenStorage.clear();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, register, logout, setUser }),
    [user, loading, login, register, logout],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return context;
}
