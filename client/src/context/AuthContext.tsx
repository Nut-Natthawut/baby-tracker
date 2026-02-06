import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { API_BASE_URL } from "@/lib/api";

type AuthUser = {
  id: string;
  email: string;
  name?: string | null;
};

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshMe: (overrideToken?: string) => Promise<AuthUser | null>;
  setToken: (token: string | null) => void;
  authFetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const TOKEN_KEY = "baby-tracker-auth-token";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  }, [token]);

  const authFetch = useCallback(
    async (input: RequestInfo | URL, init?: RequestInit) => {
      const headers = new Headers(init?.headers || {});
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return fetch(input, { ...init, headers });
    },
    [token]
  );

  const refreshMe = useCallback(
    async (overrideToken?: string) => {
      const activeToken = overrideToken || token;
      if (!activeToken) {
        setUser(null);
        setLoading(false);
        return null;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${activeToken}` },
        });
        if (response.status === 401) {
          setUser(null);
          setToken(null);
          return null;
        }
        if (!response.ok) {
          setUser(null);
          return null;
        }
        const result = await response.json();
        const me = result?.data as AuthUser;
        setUser(me);
        return me;
      } catch (error) {
        console.error("Auth refresh failed:", error);
        setUser(null);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [token, setToken]
  );

  useEffect(() => {
    const saved = localStorage.getItem(TOKEN_KEY);
    if (saved) {
      setToken(saved);
      // Call refreshMe directly with the saved token to avoid stale closure issues
      (async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${saved}` },
          });
          if (response.status === 401) {
            setUser(null);
            setToken(null);
          } else if (response.ok) {
            const result = await response.json();
            setUser(result?.data as AuthUser);
          } else {
            setUser(null);
          }
        } catch (error) {
          console.error("Auth refresh failed:", error);
          setUser(null);
        } finally {
          setLoading(false);
        }
      })();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) return false;
      const result = await response.json();
      const tokenValue = result?.data?.token as string | undefined;
      const userValue = result?.data?.user as AuthUser | undefined;
      if (!tokenValue || !userValue) return false;
      setToken(tokenValue);
      setUser(userValue);
      return true;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  }, [setToken]);

  const signup = useCallback(
    async (email: string, password: string, name?: string) => {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/signup`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, name }),
        });
        if (!response.ok) return false;
        const result = await response.json();
        const tokenValue = result?.data?.token as string | undefined;
        const userValue = result?.data?.user as AuthUser | undefined;
        if (!tokenValue || !userValue) return false;
        setToken(tokenValue);
        setUser(userValue);
        return true;
      } catch (error) {
        console.error("Signup error:", error);
        return false;
      }
    },
    [setToken]
  );

  const logout = useCallback(async () => {
    try {
      if (token) {
        await fetch(`${API_BASE_URL}/auth/logout`, { method: "POST" });
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      setToken(null);
    }
  }, [token, setToken]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      loading,
      login,
      signup,
      logout,
      refreshMe,
      setToken,
      authFetch,
    }),
    [user, token, loading, login, signup, logout, refreshMe, setToken, authFetch]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used within AuthProvider");
  return ctx;
};
