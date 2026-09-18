"use client";

import type { ReactNode } from "react";
import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { Session } from "@/common/types";

export interface SavedScore {
  game: string;
  score: number;
  name: string;
  at: number;
}

export interface SessionContextValue {
  user: Session | null;
  login: (name?: string) => void;
  logout: () => void;
  scores: SavedScore[];
  saveScore: (entry: Omit<SavedScore, "at">) => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Session | null>(null);
  const [scores, setScores] = useState<SavedScore[]>([]);

  const login = useCallback((name?: string) => {
    setUser({ name: name ? name.toUpperCase().slice(0, 10) : "INVITADO" });
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const saveScore = useCallback((entry: Omit<SavedScore, "at">) => {
    setScores((prev) => [...prev, { ...entry, at: Date.now() }]);
  }, []);

  const value = useMemo(
    () => ({ user, login, logout, scores, saveScore }),
    [user, login, logout, scores, saveScore]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error("useSession debe usarse dentro de un SessionProvider");
  }
  return ctx;
}
