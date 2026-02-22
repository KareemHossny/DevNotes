import axios from "axios";

const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length < 2) return null;
  return parts.pop().split(";").shift() || null;
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const method = (config.method || "get").toLowerCase();
  if (["post", "put", "patch", "delete"].includes(method)) {
    const csrfToken = getCookie("csrf_token");
    if (csrfToken) {
      config.headers["x-csrf-token"] = csrfToken;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (!original || original._retry) return Promise.reject(error);

    if (error.response?.status === 401) {
      original._retry = true;
      try {
        await api.post("/api/auth/refresh");
        return api(original);
      } catch (_) {
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
