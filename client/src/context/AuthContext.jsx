import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { fetchMe, loginUser, logoutUser, refreshUser, registerUser } from "../services/authService";
import { AUTH_EXPIRED_EVENT } from "../services/api";
import getApiErrorMessage from "../utils/getApiErrorMessage";

const AuthContext = createContext(null);
const CSRF_STORAGE_KEY = "devnotes_csrf_token";

const hasSessionHint = () => {
  if (typeof window === "undefined") return false;

  const hasStoredCsrf = Boolean(window.localStorage.getItem(CSRF_STORAGE_KEY));
  const hasCsrfCookie = document.cookie
    .split(";")
    .some((entry) => entry.trim().startsWith("csrf_token="));

  return hasStoredCsrf || hasCsrfCookie;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState(null);

  const clearAuthState = useCallback(() => {
    setUser(null);
    setError(null);
  }, []);

  const login = useCallback(async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const data = await loginUser(payload);
      setUser(data.user);
      return data;
    } catch (err) {
      const message = getApiErrorMessage(err, "Login failed");
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const data = await registerUser(payload);
      setUser(data.user);
      return data;
    } catch (err) {
      const message = getApiErrorMessage(err, "Registration failed");
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutUser();
    } catch (_) {
      // ignore network errors on logout
    } finally {
      clearAuthState();
    }
  }, [clearAuthState]);

  const clearAuthError = useCallback(() => setError(null), []);
  const isAuthenticated = Boolean(user);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const handleAuthExpired = () => {
      clearAuthState();
    };

    window.addEventListener(AUTH_EXPIRED_EVENT, handleAuthExpired);

    const init = async () => {
      if (!hasSessionHint()) {
        setUser(null);
        setInitializing(false);
        return;
      }

      try {
        const data = await fetchMe();
        setUser(data.user || null);
      } catch (_) {
        try {
          const refreshed = await refreshUser();
          setUser(refreshed.user || null);
        } catch (_) {
          setUser(null);
        }
      } finally {
        setInitializing(false);
      }
    };

    init();

    return () => {
      window.removeEventListener(AUTH_EXPIRED_EVENT, handleAuthExpired);
    };
  }, [clearAuthState]);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated,
      loading,
      initializing,
      error,
      login,
      register,
      logout,
      clearAuthError,
    }),
    [user, isAuthenticated, loading, initializing, error, login, register, logout, clearAuthError]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

