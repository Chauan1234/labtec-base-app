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
        const expiration = kc.tokenParsed?.exp;
        if (expiration) {
          const timeLeft = expiration * 1000 - Date.now();
		  
          if (timeLeft < 60000) {
            await kc.updateToken();
          }

          setUsername(kc.tokenParsed?.preferred_username);
          setEmail(kc.tokenParsed?.email);
          setToken(kc.token);
          setFirstName(kc.tokenParsed?.given_name);
          setLastName(kc.tokenParsed?.family_name);
        }
      } else {
        kc.login();
      }
    };

    initKeycloak();
  }, []); // Essa dependência vazia evita loop de renderização

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
