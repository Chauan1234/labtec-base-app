"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import fetchGroupsAxios, { ApiGroup } from "@/lib/group-controller/group";
import { useAuth } from "@/contexts/AuthContext";

type Group = {
  idGroup: string;
  name: string;
  owner: string;
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

  const mapApi = (g: ApiGroup): Group => ({ idGroup: g.idGroup, name: g.name, owner: g.owner });

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      console.log(token);
      const api = await fetchGroupsAxios(token);
      const mapped = api.map(mapApi);
      setGroups(mapped);
      if (!selectedGroup && mapped.length > 0) setSelectedGroup(mapped[0]);
    } catch (e) {
      console.error("Failed to fetch groups", e);
    } finally {
      setLoading(false);
    }
  }, [selectedGroup, token]);

  useEffect(()=>{
    if(isAuthenticated){
      refresh();
    }
  },[isAuthenticated]);

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
