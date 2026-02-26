import axios from "axios";

const normalizeApiBaseUrl = (value) => {
  const fallback = "http://localhost:5001";
  const raw = (value || fallback).trim();
  const trimmed = raw.replace(/\/+$/, "");
  const withoutApiSuffix = trimmed.replace(/\/api$/i, "");

  if (
    typeof window !== "undefined" &&
    window.location.protocol === "https:" &&
    /^http:\/\//i.test(withoutApiSuffix) &&
    !/localhost|127\.0\.0\.1/i.test(withoutApiSuffix)
  ) {
    return withoutApiSuffix.replace(/^http:\/\//i, "https://");
  }

  return withoutApiSuffix;
};

const rawApiUrl = import.meta.env.VITE_API_URL || "http://localhost:5001";
const API_BASE_URL = normalizeApiBaseUrl(rawApiUrl);
export const AUTH_EXPIRED_EVENT = "auth:expired";

const CSRF_STORAGE_KEY = "devnotes_csrf_token";
const setCsrfToken = (token) => {
  if (token) {
    localStorage.setItem(CSRF_STORAGE_KEY, token);
  }
};
const getCsrfToken = () => localStorage.getItem(CSRF_STORAGE_KEY);
const clearCsrfToken = () => localStorage.removeItem(CSRF_STORAGE_KEY);

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

let refreshRequestPromise = null;
const isRefreshRequest = (url) => {
  const requestUrl = String(url || "");
  return /\/(?:api\/)?auth\/refresh(?:\?|$)/.test(requestUrl);
};

api.interceptors.request.use((config) => {
  const method = (config.method || "get").toLowerCase();
  if (["post", "put", "patch", "delete"].includes(method)) {
    const csrfToken = getCsrfToken();
    if (csrfToken) {
      config.headers["x-csrf-token"] = csrfToken;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    const csrfToken = response?.data?.data?.csrfToken;
    if (csrfToken) {
      setCsrfToken(csrfToken);
    }

    const requestUrl = response?.config?.url || "";
    if (requestUrl.includes("/api/auth/logout")) {
      clearCsrfToken();
    }

    return response;
  },
  async (error) => {
    const original = error.config;
    if (!original || original._retry) return Promise.reject(error);

    if (error.response?.status === 401 && !isRefreshRequest(original.url)) {
      original._retry = true;
      try {
        if (!refreshRequestPromise) {
          refreshRequestPromise = api.post("/api/auth/refresh");
        }
        await refreshRequestPromise;
        return api(original);
      } catch (refreshError) {
        clearCsrfToken();
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent(AUTH_EXPIRED_EVENT));
        }
        return Promise.reject(refreshError);
      } finally {
        refreshRequestPromise = null;
      }
    }

    if (error.response?.status === 401 && isRefreshRequest(original.url)) {
      clearCsrfToken();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent(AUTH_EXPIRED_EVENT));
      }
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export default api;
