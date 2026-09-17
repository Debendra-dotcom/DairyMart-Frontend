import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Profile } from "../types/profile";
import { getProfile } from "../services/profileApi";
import {
  bindProfileToCurrentSession,
  clearCurrentAuthSession,
  debugAuthState,
  hasCurrentTabAuth,
  seedTabAuthFromRememberedSession,
  storeAuthSession,
} from "../services/authStorage";

const AUTH_BASE = "http://127.0.0.1:8000/api/auth";

type SignupPayload = {
  name: string;
  email: string;
  phone: string;
  password: string;
};

type LoginPayload = {
  email: string;
  password: string;
};

type AuthResponse = {
  access: string;
  refresh: string;
  profile: Profile;
};

interface AuthContextType {
  user: Profile | null;
  isLoggedIn: boolean;
  isAuthLoading: boolean;
  signup: (payload: SignupPayload) => Promise<Profile>;
  login: (payload: LoginPayload) => Promise<Profile>;
  refreshProfile: () => Promise<Profile | null>;
  setUserProfile: (profile: Profile) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

async function parseResponse<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (typeof data.error === "string") {
      throw new Error(data.error);
    }
    if (data.error && typeof data.error === "object") {
      const firstError = Object.values(data.error).flat().join(" ");
      throw new Error(firstError || "Request failed");
    }
    throw new Error("Request failed");
  }
  return data;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const refreshProfile = async () => {
    seedTabAuthFromRememberedSession();
    if (!hasCurrentTabAuth()) {
      setUser(null);
      debugAuthState("refresh-profile-skipped-no-token");
      return null;
    }

    try {
      const profile = await getProfile();
      bindProfileToCurrentSession(profile);
      setUser(profile);
      debugAuthState("refresh-profile-success", { userId: profile.id, email: profile.email });
      return profile;
    } catch (error) {
      clearCurrentAuthSession();
      setUser(null);
      debugAuthState("refresh-profile-failed", { error: error instanceof Error ? error.message : String(error) });
      return null;
    }
  };

  useEffect(() => {
    refreshProfile().finally(() => setIsAuthLoading(false));
  }, []);

  const signup = async (payload: SignupPayload) => {
    const response = await fetch(`${AUTH_BASE}/signup/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await parseResponse<AuthResponse>(response);
    storeAuthSession(data.access, data.refresh, data.profile);
    setUser(data.profile);
    debugAuthState("signup-success", { userId: data.profile.id, email: data.profile.email });
    return data.profile;
  };

  const login = async (payload: LoginPayload) => {
    const response = await fetch(`${AUTH_BASE}/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await parseResponse<AuthResponse>(response);
    storeAuthSession(data.access, data.refresh, data.profile);
    setUser(data.profile);
    debugAuthState("login-success", { userId: data.profile.id, email: data.profile.email });
    return data.profile;
  };

  const setUserProfile = (profile: Profile) => {
    setUser(profile);
    debugAuthState("set-user-profile", { userId: profile.id, email: profile.email });
  };

  const logout = () => {
    clearCurrentAuthSession();
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      isLoggedIn: Boolean(user && hasCurrentTabAuth()),
      isAuthLoading,
      signup,
      login,
      refreshProfile,
      setUserProfile,
      logout,
    }),
    [user, isAuthLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
