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

export function GroupProvider({ children }: { children: React.ReactNode }) {
  const { token, isAuthenticated } = useAuth();
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const mapApi = (g: ApiGroup): Group => ({ idGroup: g.idGroup, nameGroup: g.nameGroup, ownerGroup: g.ownerGroup, role: g.role });

  const refresh = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const api = await fetchGroupsAxios(token);
      const mapped = api.map(mapApi);
      setGroups(mapped);

      // trocar selectedGroup pelo item atualizado (mesmo id) ou escolher o primeiro
      setSelectedGroup(prev => prev ?? (mapped.length > 0 ? mapped[0] : null));
      setSelectedGroup(prev => {
        if (!prev) return mapped.length > 0 ? mapped[0] : null;
        const updated = mapped.find(g => g.idGroup === prev.idGroup);
        return updated ?? prev; // se não encontrou, mantém o anterior
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