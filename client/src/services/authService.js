import api from "./api";

const unwrap = (payload) => (payload && "data" in payload ? payload.data : payload);

export const registerUser = async (payload) => {
  const { data } = await api.post("/api/auth/register", payload);
  return unwrap(data);
};

export const loginUser = async (payload) => {
  const { data } = await api.post("/api/auth/login", payload);
  return unwrap(data);
};

export const fetchMe = async () => {
  const { data } = await api.get("/api/auth/me");
  return unwrap(data);
};

export const logoutUser = async () => {
  const { data } = await api.post("/api/auth/logout");
  return unwrap(data);
};

export const refreshUser = async () => {
  const { data } = await api.post("/api/auth/refresh");
  return unwrap(data);
};
