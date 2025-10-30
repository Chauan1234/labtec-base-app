"use client";

import { useRouter } from "next/navigation";
import React, { createContext, useContext, useEffect, useState } from "react";
import { KeycloakSingleton, KeycloakService } from "../lib/keycloack";

interface AuthContextType {
  isAuthenticated: boolean;
  username?: string;
  email?: string;
  token?: string;
  firstName?: string;
  lastName?: string;
  login: () => void;
  logout: () => void;
}

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState<string | undefined>();
  const [email, setEmail] = useState<string | undefined>();
  const [token, setToken] = useState<string | undefined>();
  const [firstName, setFirstName] = useState<string | undefined>();
  const [lastName, setLastName] = useState<string | undefined>();
  const router = useRouter();

  useEffect(() => {
    const keycloakService = new KeycloakService();

    const initKeycloak = async () => {
      const authenticated = await keycloakService.init();
      setIsAuthenticated(authenticated);

      const kc = KeycloakSingleton.getInstance();
      if (authenticated) {
        // Função para sincronizar o estado do contexto com o Keycloak
        const syncFromKC = () => {
          setUsername(kc.tokenParsed?.preferred_username);
          setEmail(kc.tokenParsed?.email);
          setToken(kc.token);
          setFirstName(kc.tokenParsed?.given_name);
          setLastName(kc.tokenParsed?.family_name);
        }
        syncFromKC();

        // Tenta atualizar o token imediatamente se estiver muito perto de expirar
        const expiration = kc.tokenParsed?.exp;
        if (expiration) {
          const timeLeft = expiration * 1000 - Date.now();
          if (timeLeft < 60000) { // Menos de 1 minuto
            try {
              await kc.updateToken(60); // Atualiza se o token expirar em menos de 60 segundos
              syncFromKC();
            } catch (error) {
              console.error("Falha ao atualizar token imediatamente:", error);
            }
          }
        }

        // Loop periódico para renovar o token antes de expirar
        let refreshIntervalId: number | undefined;
        const refreshLoop = async () => {
          try {
            // Pede que atualize se faltarem menos de 30s de validade
            const refreshed = await kc.updateToken(30);
            if (refreshed) {
              syncFromKC();
            } else {
              // Mesmo que não tenha renovado, ressincroniza caso token tenha mudado
              syncFromKC();
            }
          } catch (error) {
            console.error("Erro ao atualizar token periodicamente:", error);
          }
        }
        // Rodar a cada 20s como fallback
        refreshIntervalId = window.setInterval(refreshLoop, 20_000);

        // Fallback: ao receber evento de token expirado, tenta renovar
        kc.onTokenExpired = () => {
          refreshLoop();
        }
      } else {
        kc.login();
      }
    };

    initKeycloak();

    // Cleanup: quando o componente desmontar, limpar intervalos e handlers
    return () => {
      try {
        const kc = KeycloakSingleton.getInstance();
        kc.onTokenExpired = undefined;
      } catch (error) {
        console.error("Erro ao limpar handlers de token expirado:", error);
      }
    }
  }, []);

  const kc = KeycloakSingleton.getInstance();

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        username,
        email,
        token,
        firstName,
        lastName,
        login: () => kc.login(),
        logout: () =>
          kc.logout({
            redirectUri:
              typeof window !== "undefined" ? window.location.origin + baseUrl : undefined,
          }),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return context;
};
