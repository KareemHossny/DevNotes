import api from "./api";

const unwrap = (payload) => (payload && "data" in payload ? payload.data : payload);
const withFreshParams = (params = {}) => ({ ...params, _ts: Date.now() });

export const getPosts = async (params = {}, config = {}) => {
  const { data } = await api.get("/api/posts", {
    ...config,
    params: withFreshParams(params),
  });
  return unwrap(data);
};

// Use this when pagination metadata is needed.
export const getPostsPaged = async (params = {}, config = {}) => {
  const { data } = await api.get("/api/posts", {
    ...config,
    params: withFreshParams(params),
  });
  return {
    items: data?.data || [],
    meta: data?.meta || {},
  };
};

export const getTopLikedPosts = async (limit = 9) => {
  const { data } = await api.get("/api/posts/top-liked", {
    params: withFreshParams({ limit }),
  });
  return unwrap(data);
};

export const getPostStats = async () => {
  const { data } = await api.get("/api/posts/stats", {
    params: withFreshParams(),
  });
  return unwrap(data);
};

export const getPostById = async (postId) => {
  const { data } = await api.get(`/api/posts/${postId}`, {
    params: withFreshParams(),
  });
  return unwrap(data);
};

export const createPost = async (payload) => {
  const { data } = await api.post("/api/posts", payload);
  return unwrap(data);
};

export const updatePost = async (postId, payload) => {
  const { data } = await api.put(`/api/posts/${postId}`, payload);
  return unwrap(data);
};

export const likePost = async (postId) => {
  const { data } = await api.post(`/api/posts/${postId}/like`);
  return unwrap(data);
};

export const deletePost = async (postId) => {
  const { data } = await api.delete(`/api/posts/${postId}`);
  return unwrap(data);
};

