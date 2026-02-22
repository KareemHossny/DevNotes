const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { setCsrfCookie } = require("../middleware/csrf");
const { ok, fail } = require("../utils/response");

const ACCESS_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "15m";
const REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || "7d";
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
const isProd = process.env.NODE_ENV === "production";
const cookieSameSite = isProd ? "none" : "strict";

const signAccessToken = (userId) =>
  jwt.sign({ id: userId, type: "access" }, process.env.JWT_SECRET, {
    expiresIn: ACCESS_EXPIRES_IN,
  });

const signRefreshToken = (userId) =>
  jwt.sign({ id: userId, type: "refresh" }, REFRESH_SECRET, {
    expiresIn: REFRESH_EXPIRES_IN,
  });

const setAuthCookies = (res, accessToken, refreshToken) => {
  res.cookie("auth_token", accessToken, {
    httpOnly: true,
    sameSite: cookieSameSite,
    secure: isProd,
    path: "/",
    maxAge: 15 * 60 * 1000,
  });
  res.cookie("refresh_token", refreshToken, {
    httpOnly: true,
    sameSite: cookieSameSite,
    secure: isProd,
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return fail(res, "All fields are required", 400);
    }
    if (password.length < 8) {
      return fail(res, "Password must be at least 8 characters", 400);
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return fail(res, "Email already in use", 409);
    }

    const hashed = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashed,
    });

    const accessToken = signAccessToken(user._id);
    const refreshToken = signRefreshToken(user._id);
    const refreshTokenHash = await bcrypt.hash(refreshToken, 12);
    user.refreshTokenHash = refreshTokenHash;
    user.refreshTokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await user.save();

    setAuthCookies(res, accessToken, refreshToken);
    const csrfToken = setCsrfCookie(res);

    return ok(
      res,
      {
        csrfToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
        },
      },
      undefined,
      201
    );
  } catch (err) {
    return next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return fail(res, "Email and password are required", 400);
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+password"
    );

    if (!user) {
      return fail(res, "Invalid credentials", 401);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return fail(res, "Invalid credentials", 401);
    }

    const accessToken = signAccessToken(user._id);
    const refreshToken = signRefreshToken(user._id);
    const refreshTokenHash = await bcrypt.hash(refreshToken, 12);
    user.refreshTokenHash = refreshTokenHash;
    user.refreshTokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await user.save();

    setAuthCookies(res, accessToken, refreshToken);
    const csrfToken = setCsrfCookie(res);

    return ok(res, {
      csrfToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    return next(err);
  }
};

const me = async (req, res) => {
  const user = req.user;
  return ok(res, {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    },
  });
};

const refresh = async (req, res) => {
  try {
    const token = req.cookies?.refresh_token;
    if (!token) return fail(res, "Not authorized", 401);

    let decoded;
    try {
      decoded = jwt.verify(token, REFRESH_SECRET);
    } catch (_) {
      return fail(res, "Not authorized", 401);
    }

    if (decoded?.type !== "refresh") {
      return fail(res, "Not authorized", 401);
    }

    const user = await User.findById(decoded.id).select("+refreshTokenHash");
    if (!user || !user.refreshTokenHash) {
      return fail(res, "Not authorized", 401);
    }

    const match = await bcrypt.compare(token, user.refreshTokenHash);
    if (!match) {
      return fail(res, "Not authorized", 401);
    }

    // Rotate refresh token on every use.
    const newAccessToken = signAccessToken(user._id);
    const newRefreshToken = signRefreshToken(user._id);
    user.refreshTokenHash = await bcrypt.hash(newRefreshToken, 12);
    user.refreshTokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await user.save();

    setAuthCookies(res, newAccessToken, newRefreshToken);
    const csrfToken = setCsrfCookie(res);

    return ok(res, {
      csrfToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    return fail(res, "Not authorized", 401);
  }
};

const logout = async (req, res, next) => {
  try {
    if (req.user) {
      req.user.refreshTokenHash = null;
      req.user.refreshTokenExpiresAt = null;
      await req.user.save();
    }
    res.clearCookie("auth_token", {
      httpOnly: true,
      sameSite: cookieSameSite,
      secure: isProd,
      path: "/",
    });
    res.clearCookie("refresh_token", {
      httpOnly: true,
      sameSite: cookieSameSite,
      secure: isProd,
      path: "/",
    });
    res.clearCookie("csrf_token", {
      sameSite: cookieSameSite,
      secure: isProd,
      path: "/",
    });
    return ok(res, { message: "Logged out" });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  register,
  login,
  me,
  refresh,
  logout,
};
