import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { ResponsavelPassageiro } from "@/types/responsavel";
import { STORAGE_KEYS } from "@/constants";
import { responsavelApi } from "@/services/api/responsavel.api";

const STORAGE_TOKEN_KEY = STORAGE_KEYS.RESPONSAVEL_TOKEN;
const STORAGE_PASSAGEIRO_ID_KEY = STORAGE_KEYS.RESPONSAVEL_PASSAGEIRO_ID;

interface ResponsavelAuthContextData {
  token: string | null;
  passageiros: ResponsavelPassageiro[];
  passageiroSelecionado: ResponsavelPassageiro | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setSession: (token: string, passageiros: ResponsavelPassageiro[]) => void;
  selectPassageiro: (passageiro: ResponsavelPassageiro) => void;
  refetchPassageiros: () => Promise<void>;
  logout: () => void;
}

const ResponsavelAuthContext = createContext<ResponsavelAuthContextData>(
  {} as ResponsavelAuthContextData
);

export const ResponsavelAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [passageiros, setPassageiros] = useState<ResponsavelPassageiro[]>([]);
  const [passageiroSelecionado, setPassageiroSelecionado] = useState<ResponsavelPassageiro | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const logout = useCallback(() => {
    setToken(null);
    setPassageiros([]);
    setPassageiroSelecionado(null);

    localStorage.removeItem(STORAGE_TOKEN_KEY);
    localStorage.removeItem(STORAGE_PASSAGEIRO_ID_KEY);
  }, []);

  const syncPassageiros = useCallback(async (authToken: string) => {
    try {
      const activePassageiros = await responsavelApi.getPassageiros(authToken);
      setToken(authToken);
      setPassageiros(activePassageiros);

      const storedPassageiroId = localStorage.getItem(STORAGE_PASSAGEIRO_ID_KEY);
      if (storedPassageiroId) {
        const selected = activePassageiros.find(p => p.id === storedPassageiroId);
        setPassageiroSelecionado(selected || activePassageiros[0] || null);
      } else if (activePassageiros.length === 1) {
        setPassageiroSelecionado(activePassageiros[0]);
        localStorage.setItem(STORAGE_PASSAGEIRO_ID_KEY, activePassageiros[0].id);
      } else {
        setPassageiroSelecionado(null);
      }
    } catch {
      logout();
    }
  }, [logout]);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem(STORAGE_TOKEN_KEY);
      if (storedToken) {
        await syncPassageiros(storedToken);
      }
      setIsLoading(false);
    };

    initAuth();
  }, [syncPassageiros]);

  const setSession = useCallback((newToken: string, newPassageiros: ResponsavelPassageiro[]) => {
    setToken(newToken);
    setPassageiros(newPassageiros);
    localStorage.setItem(STORAGE_TOKEN_KEY, newToken);

    if (newPassageiros.length === 1) {
      setPassageiroSelecionado(newPassageiros[0]);
      localStorage.setItem(STORAGE_PASSAGEIRO_ID_KEY, newPassageiros[0].id);
    } else {
      setPassageiroSelecionado(null);
      localStorage.removeItem(STORAGE_PASSAGEIRO_ID_KEY);
    }
  }, []);

  const selectPassageiro = useCallback((passageiro: ResponsavelPassageiro) => {
    setPassageiroSelecionado(passageiro);
    localStorage.setItem(STORAGE_PASSAGEIRO_ID_KEY, passageiro.id);
  }, []);

  const refetchPassageiros = useCallback(async () => {
    const storedToken = localStorage.getItem(STORAGE_TOKEN_KEY);
    if (storedToken) {
      await syncPassageiros(storedToken);
    }
  }, [syncPassageiros]);

  return (
    <ResponsavelAuthContext.Provider
      value={{
        token,
        passageiros,
        passageiroSelecionado,
        isAuthenticated: Boolean(token),
        isLoading,
        setSession,
        selectPassageiro,
        refetchPassageiros,
        logout
      }}
    >
      {children}
    </ResponsavelAuthContext.Provider>
  );
};

export function useResponsavelAuth() {
  const context = useContext(ResponsavelAuthContext);
  if (!context) {
    throw new Error("useResponsavelAuth deve ser usado dentro de um ResponsavelAuthProvider");
  }
  return context;
}
