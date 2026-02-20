import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { fetchMe, loginUser, logoutUser, refreshUser, registerUser } from "../services/authService";
import getApiErrorMessage from "../utils/getApiErrorMessage";

const AuthContext = createContext(null);

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
    const init = async () => {
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
  }, []);

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

