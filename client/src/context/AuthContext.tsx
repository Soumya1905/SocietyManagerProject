import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import * as authService from "../services/authService";
import type { User } from "../types";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (input: authService.RegisterPayload) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }
    authService
      .getMe()
      .then(setUser)
      .catch(() => {
        localStorage.removeItem("token");
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const result = await authService.login({ email, password });
    localStorage.setItem("token", result.token);
    setUser(result.user);
    return result.user;
  };

  const register = async (input: authService.RegisterPayload) => {
    const result = await authService.register(input);
    localStorage.setItem("token", result.token);
    setUser(result.user);
    return result.user;
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    authService.logout().catch(() => {});
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
