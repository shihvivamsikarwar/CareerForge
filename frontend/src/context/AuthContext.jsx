import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { authApi, tokenStorage } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true while hydrating from token

  // On mount, try to restore session from saved token
  useEffect(() => {
    if (!tokenStorage.exists()) {
      setLoading(false);
      return;
    }
    authApi
      .getMe()
      .then(setUser)
      .catch(() => tokenStorage.clear()) // invalid / expired token
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (credentials) => {
    const data = await authApi.login(credentials);
    tokenStorage.set(data.token);
    setUser(data.user);
    return data;
  }, []);

  const register = useCallback(async (credentials) => {
    const data = await authApi.register(credentials);
    tokenStorage.set(data.token);
    setUser(data.user);
    return data;
  }, []);

  const logout = useCallback(() => {
    tokenStorage.clear();
    setUser(null);
  }, []);

  // Called by AuthSuccess page after Google OAuth redirect
  const loginWithToken = useCallback((token) => {
    tokenStorage.set(token);
    // Fetch user profile; caller redirects after awaiting this
    return authApi.getMe().then(setUser);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, loginWithToken }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
