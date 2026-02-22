const crypto = require("crypto");

const CSRF_COOKIE = "csrf_token";
const CSRF_HEADER = "x-csrf-token";
const isProd = process.env.NODE_ENV === "production";
const cookieSameSite = isProd ? "none" : "strict";

const generateCsrfToken = () => crypto.randomBytes(32).toString("hex");

const setCsrfCookie = (res, options = {}) => {
  const token = generateCsrfToken();
  res.cookie(CSRF_COOKIE, token, {
    httpOnly: false,
    sameSite: cookieSameSite,
    secure: isProd,
    path: "/",
    ...options,
  });
  return token;
};

const requireCsrf = (req, res, next) => {
  const cookieToken = req.cookies?.[CSRF_COOKIE];
  const headerToken = req.headers[CSRF_HEADER];

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return res.status(403).json({
      success: false,
      data: null,
      error: "Invalid CSRF token",
    });
  }

  return next();
};

module.exports = {
  CSRF_COOKIE,
  CSRF_HEADER,
  setCsrfCookie,
  requireCsrf,
};
