"use client";

import { useAuth } from "@/contexts/AuthContext";

export default function Home() {
  const { isAuthenticated, token, email, username, logout } = useAuth();
  console.log({ isAuthenticated, token, email, username });
  return (
    <>
      <span>Carregando...</span>
      <button onClick={logout}>Logout</button>
    </>
  );
}
// Exemplo: inspecionar redirect_uri usado pelo adapter
