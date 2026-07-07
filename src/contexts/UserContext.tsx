"use client";

import { createContext, useContext, useState, useCallback } from "react";
import type { AuthUser } from "@/types/auth";

interface UserContextValue {
  user: AuthUser | null;
  updateUser: (updates: Partial<AuthUser>) => void;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

export function UserProvider({
  user: initialUser,
  children,
}: {
  user: AuthUser | null;
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<AuthUser | null>(initialUser);

  const updateUser = useCallback((updates: Partial<AuthUser>) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : null));
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch("/api/profile");
      if (res.ok) {
        const data = await res.json();
        setUser((prev) => (prev ? { ...prev, ...data } : data));
      }
    } catch (error) {
      console.error("Error refreshing user:", error);
    }
  }, []);

  return (
    <UserContext.Provider value={{ user, updateUser, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within UserProvider");
  }
  return context;
}
