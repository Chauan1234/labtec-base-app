"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import fetchGroupsAxios, { ApiGroup } from "@/lib/group-controller/group";
import { useAuth } from "@/contexts/AuthContext";

type Group = {
  idGroup: string;
  nameGroup: string;
  ownerGroup: string;
  role: 'ADMIN' | 'USER';
};

type GroupContextType = {
  selectedGroup: Group | null;
  setSelectedGroup: (g: Group | null) => void;
  groups: Group[];
  loading: boolean;
  refresh: () => Promise<void>;
};

const GroupContext = createContext<GroupContextType | undefined>(undefined);

const SELECTED_GROUP_KEY = "labtec:selectedGroupId";

export function GroupProvider({ children }: { children: React.ReactNode }) {
  const { token, isAuthenticated } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedGroup, setSelectedGroupState] = useState<Group | null>(null);

  // wrapper que persiste a seleção no localStorage
  const setSelectedGroup = React.useCallback((g: Group | null) => {
    setSelectedGroupState(g);
    if (typeof window !== "undefined") {
      if (g) {
        localStorage.setItem(SELECTED_GROUP_KEY, g.idGroup);
      } else {
        localStorage.removeItem(SELECTED_GROUP_KEY);
      }
    }
  }, []);

  const mapApi = (g: ApiGroup): Group => ({ idGroup: g.idGroup, nameGroup: g.nameGroup, ownerGroup: g.ownerGroup, role: g.role });

  const refresh = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const api = await fetchGroupsAxios(token);
      const mapped = api.map(mapApi);
      setGroups(mapped);

      // Restaurar seleção persistida, ou manter a anterior/usar primeiro disponível
      const savedId = typeof window !== "undefined" ? localStorage.getItem(SELECTED_GROUP_KEY) : null;
      setSelectedGroupState(prev => {
        // se já tinha seleção, tenta apontar para o item atualizado (mesmo id)
        if (prev) {
          const updated = mapped.find(g => g.idGroup === prev.idGroup);
          if (updated) {
            // também atualiza o localStorage com o id (caso prev seja objeto desatualizado)
            if (typeof window !== "undefined") localStorage.setItem(SELECTED_GROUP_KEY, updated.idGroup);
            return updated;
          }
        }
        // tenta restaurar a seleção salva no localStorage
        if (savedId) {
          const fromSaved = mapped.find(g => g.idGroup === savedId);
          if (fromSaved) return fromSaved;
        }
        // fallback para o primeiro ou null
        return mapped.length > 0 ? mapped[0] : null;
      });
    } catch (e) {
      console.error("Failed to fetch groups", e);
    } finally {
      setLoading(false);
    }
  }, [token, isAuthenticated]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <GroupContext.Provider value={{ selectedGroup, setSelectedGroup, groups, loading, refresh }}>
      {children}
    </GroupContext.Provider>
  );
}

export function useGroup() {
  const ctx = useContext(GroupContext);
  if (!ctx) throw new Error("useGroup must be used within a GroupProvider");
  return ctx;
}

export type { Group };