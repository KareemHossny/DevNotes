const express = require("express");
const { body } = require("express-validator");
const rateLimit = require("express-rate-limit");
const { register, login, me, refresh, logout } = require("../controllers/authController");
const { protect } = require("../middleware/auth");
const { requireCsrf } = require("../middleware/csrf");
const { validate } = require("../middleware/validate");

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 20,
  message: { success: false, data: null, error: "Too many attempts, try again later." },
});

router.post(
  "/register",
  authLimiter,
  [
    body("name").trim().isLength({ min: 2, max: 80 }).withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters"),
  ],
  validate,
  register
);
router.post(
  "/login",
  authLimiter,
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").isLength({ min: 1 }).withMessage("Password is required"),
  ],
  validate,
  login
);
router.get("/me", protect, me);
router.post("/refresh", refresh);
router.post("/logout", protect, requireCsrf, logout);

module.exports = router;
