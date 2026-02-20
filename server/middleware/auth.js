const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { fail } = require("../utils/response");

const protect = async (req, res, next) => {
  try {
    const token = req.cookies?.auth_token;

    if (!token) {
      return fail(res, "Not authorized", 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded?.type && decoded.type !== "access") {
      return fail(res, "Not authorized", 401);
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return fail(res, "Not authorized", 401);
    }

    req.user = user;
    return next();
  } catch (err) {
    return fail(res, "Not authorized", 401);
  }
};

module.exports = { protect };
