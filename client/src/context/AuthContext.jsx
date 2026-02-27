import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import getApiErrorMessage from "../utils/getApiErrorMessage";
import { ROUTES } from "../constants/routes";

const AuthContext = createContext(null);
const CSRF_STORAGE_KEY = "devnotes_csrf_token";
const AUTH_EXPIRED_EVENT = "auth:expired";

let authServiceModulePromise = null;
const loadAuthService = async () => {
  if (!authServiceModulePromise) {
    authServiceModulePromise = import("../services/authService");
  }
  return authServiceModulePromise;
};

const isProtectedPath = (pathname = "") => {
  if (!pathname) return false;
  if (pathname === ROUTES.PROFILE || pathname === ROUTES.POST_NEW) return true;
  return /^\/posts\/[^/]+\/edit\/?$/.test(pathname);
};

const hasSessionHint = () => {
  if (typeof window === "undefined") return false;

  const hasStoredCsrf = Boolean(window.localStorage.getItem(CSRF_STORAGE_KEY));
  const hasCsrfCookie = document.cookie
    .split(";")
    .some((entry) => entry.trim().startsWith("csrf_token="));

  return hasStoredCsrf || hasCsrfCookie;
};

export const AuthProvider = ({ children }) => {
  const location = useLocation();
  const bootstrapAttemptedRef = useRef(false);
  const bootstrapInFlightRef = useRef(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(() => {
    if (typeof window === "undefined") return true;
    return hasSessionHint() || isProtectedPath(window.location.pathname);
  });
  const [error, setError] = useState(null);

  const clearAuthState = useCallback(() => {
    setUser(null);
    setError(null);
  }, []);

  const login = useCallback(async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const { loginUser } = await loadAuthService();
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
      const { registerUser } = await loadAuthService();
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
      const { logoutUser } = await loadAuthService();
      await logoutUser();
    } catch (_) {
      // ignore network errors on logout
    } finally {
      clearAuthState();
    }
  }, [clearAuthState]);

  const clearAuthError = useCallback(() => setError(null), []);
  const isAuthenticated = Boolean(user);
  const shouldBootstrapForRoute = isProtectedPath(location.pathname);

  const bootstrapAuth = useCallback(async () => {
    if (bootstrapAttemptedRef.current) return;
    if (bootstrapInFlightRef.current) {
      await bootstrapInFlightRef.current;
      return;
    }

    bootstrapAttemptedRef.current = true;
    setInitializing(true);

    const run = (async () => {
      try {
        const { fetchMe, refreshUser } = await loadAuthService();
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
        }
      } finally {
        setInitializing(false);
        bootstrapInFlightRef.current = null;
      }
    })();

    bootstrapInFlightRef.current = run;
    await run;
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const handleAuthExpired = () => {
      clearAuthState();
    };

    window.addEventListener(AUTH_EXPIRED_EVENT, handleAuthExpired);
    const shouldBootstrap = hasSessionHint() || shouldBootstrapForRoute;
    if (shouldBootstrap) {
      void bootstrapAuth();
    }

    return () => {
      window.removeEventListener(AUTH_EXPIRED_EVENT, handleAuthExpired);
    };
  }, [clearAuthState, shouldBootstrapForRoute, bootstrapAuth]);

  const effectiveInitializing =
    initializing || (!bootstrapAttemptedRef.current && shouldBootstrapForRoute);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated,
      loading,
      initializing: effectiveInitializing,
      error,
      login,
      register,
      logout,
      clearAuthError,
    }),
    [
      user,
      isAuthenticated,
      loading,
      effectiveInitializing,
      error,
      login,
      register,
      logout,
      clearAuthError,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

