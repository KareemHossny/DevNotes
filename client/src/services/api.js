import axios from "axios";

const CSRF_STORAGE_KEY = "devnotes_csrf_token";
const setCsrfToken = (token) => {
  if (token) {
    localStorage.setItem(CSRF_STORAGE_KEY, token);
  }
};
const getCsrfToken = () => localStorage.getItem(CSRF_STORAGE_KEY);
const clearCsrfToken = () => localStorage.removeItem(CSRF_STORAGE_KEY);

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

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

    if (
      error.response?.status === 401 &&
      !String(original.url || "").includes("/api/auth/refresh")
    ) {
      original._retry = true;
      try {
        await api.post("/api/auth/refresh");
        return api(original);
      } catch (refreshError) {
        clearCsrfToken();
        return Promise.reject(refreshError);
      }
    }

    if (
      error.response?.status === 401 &&
      String(original.url || "").includes("/api/auth/refresh")
    ) {
      clearCsrfToken();
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export default api;
