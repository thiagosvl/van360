import { ResponsavelPassageiro } from "@/types/responsavel";
import React, { createContext, useContext, useEffect, useState } from "react";

const STORAGE_TOKEN_KEY = "@van360:responsavel_token";
const STORAGE_PASSAGEIROS_KEY = "@van360:responsavel_passageiros";
const STORAGE_PASSAGEIRO_ID_KEY = "@van360:responsavel_passageiro_id";

interface ResponsavelAuthContextData {
  token: string | null;
  passageiros: ResponsavelPassageiro[];
  passageiroSelecionado: ResponsavelPassageiro | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setSession: (token: string, passageiros: ResponsavelPassageiro[]) => void;
  selectPassageiro: (passageiro: ResponsavelPassageiro) => void;
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

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem(STORAGE_TOKEN_KEY);
      const storedPassageirosRaw = localStorage.getItem(STORAGE_PASSAGEIROS_KEY);
      const storedPassageiroId = localStorage.getItem(STORAGE_PASSAGEIRO_ID_KEY);

      if (storedToken && storedPassageirosRaw) {
        const parsedPassageiros: ResponsavelPassageiro[] = JSON.parse(storedPassageirosRaw);
        setToken(storedToken);
        setPassageiros(parsedPassageiros);

        if (storedPassageiroId) {
          const selected = parsedPassageiros.find(p => p.id === storedPassageiroId);
          setPassageiroSelecionado(selected || parsedPassageiros[0] || null);
        } else if (parsedPassageiros.length > 0) {
          setPassageiroSelecionado(parsedPassageiros[0]);
        }
      }
    } catch {
      localStorage.removeItem(STORAGE_TOKEN_KEY);
      localStorage.removeItem(STORAGE_PASSAGEIROS_KEY);
      localStorage.removeItem(STORAGE_PASSAGEIRO_ID_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setSession = (newToken: string, newPassageiros: ResponsavelPassageiro[]) => {
    setToken(newToken);
    setPassageiros(newPassageiros);

    localStorage.setItem(STORAGE_TOKEN_KEY, newToken);
    localStorage.setItem(STORAGE_PASSAGEIROS_KEY, JSON.stringify(newPassageiros));

    if (newPassageiros.length === 1) {
      setPassageiroSelecionado(newPassageiros[0]);
      localStorage.setItem(STORAGE_PASSAGEIRO_ID_KEY, newPassageiros[0].id);
    } else {
      setPassageiroSelecionado(null);
      localStorage.removeItem(STORAGE_PASSAGEIRO_ID_KEY);
    }
  };

  const selectPassageiro = (passageiro: ResponsavelPassageiro) => {
    setPassageiroSelecionado(passageiro);
    localStorage.setItem(STORAGE_PASSAGEIRO_ID_KEY, passageiro.id);
  };

  const logout = () => {
    setToken(null);
    setPassageiros([]);
    setPassageiroSelecionado(null);

    localStorage.removeItem(STORAGE_TOKEN_KEY);
    localStorage.removeItem(STORAGE_PASSAGEIROS_KEY);
    localStorage.removeItem(STORAGE_PASSAGEIRO_ID_KEY);
  };

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
