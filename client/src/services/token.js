const TOKEN_KEY = "devnotes_token";
const USER_KEY = "devnotes_user";

export const getToken = () => localStorage.getItem(TOKEN_KEY);

export const setToken = (token) => {
  if (token) localStorage.setItem(TOKEN_KEY, token);
};

export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

export const getStoredUser = () => {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch (_) {
    localStorage.removeItem(USER_KEY);
    return null;
  }
};

export const setStoredUser = (user) => {
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const clearStoredUser = () => localStorage.removeItem(USER_KEY);
