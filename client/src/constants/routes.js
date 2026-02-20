export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  PROFILE: "/profile",
  NOT_FOUND: "/404",
  POSTS_ROOT: "/posts",
  POST_NEW: "/posts/new",
  postDetails: (id = ":id") => `/posts/${id}`,
  postEdit: (id = ":id") => `/posts/${id}/edit`,
};

export const ROUTE_PATHS = {
  ROOT: "/",
  INDEX: "",
  POSTS_ROOT: "posts",
  POSTS_ID: "posts/:id",
  LOGIN: "login",
  REGISTER: "register",
  POSTS_NEW: "posts/new",
  POSTS_EDIT: "posts/:id/edit",
  PROFILE: "profile",
  NOT_FOUND: "404",
  WILDCARD: "*",
};
