const express = require("express");
const { body, param, query } = require("express-validator");
const {
  getTopLiked,
  searchPosts,
  getStats,
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  likePost,
} = require("../controllers/postController");
const { protect } = require("../middleware/auth");
const { requireCsrf } = require("../middleware/csrf");
const { validate } = require("../middleware/validate");
const { cache } = require("../middleware/cache");

const router = express.Router();

router.get(
  "/search",
  [
    query("q").optional().isString().isLength({ max: 120 }).withMessage("Search is too long"),
    query("search").optional().isString().isLength({ max: 120 }).withMessage("Search is too long"),
    query("page").optional().isInt({ min: 1, max: 1000 }).withMessage("Invalid page"),
    query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Invalid limit"),
  ],
  validate,
  cache(30, { sMaxage: 60, surrogateMaxAge: 120 }),
  searchPosts
);
router.get(
  "/stats",
  cache(60, { sMaxage: 120, surrogateMaxAge: 300 }),
  getStats
);
router.get(
  "/top-liked",
  [query("limit").optional().isInt({ min: 1, max: 30 }).withMessage("Invalid limit")],
  validate,
  cache(60, { sMaxage: 120, surrogateMaxAge: 300 }),
  getTopLiked
);
router.get(
  "/",
  [
    query("search").optional().isString().isLength({ max: 120 }).withMessage("Search is too long"),
    query("tag").optional().isString().isLength({ max: 50 }).withMessage("Tag is too long"),
    query("page").optional().isInt({ min: 1, max: 1000 }).withMessage("Invalid page"),
    query("limit").optional().isInt({ min: 1, max: 50 }).withMessage("Invalid limit"),
  ],
  validate,
  cache(30, { sMaxage: 60, surrogateMaxAge: 120 }),
  getPosts
);
router.get(
  "/:id",
  [param("id").isMongoId().withMessage("Invalid post id")],
  validate,
  cache(120, { sMaxage: 300, surrogateMaxAge: 600 }),
  getPostById
);
router.post(
  "/",
  protect,
  requireCsrf,
  [
    body("title").trim().isLength({ min: 1, max: 200 }).withMessage("Title is required"),
    body("content").trim().isLength({ min: 1 }).withMessage("Content is required"),
    body("tags").optional().isArray().withMessage("Tags must be an array"),
    body("isPublished").optional().isBoolean().withMessage("isPublished must be boolean"),
  ],
  validate,
  createPost
);
router.put(
  "/:id",
  protect,
  requireCsrf,
  [
    param("id").isMongoId().withMessage("Invalid post id"),
    body("title").optional().isLength({ min: 1, max: 200 }).withMessage("Invalid title"),
    body("content").optional().isLength({ min: 1 }).withMessage("Invalid content"),
    body("tags").optional().isArray().withMessage("Tags must be an array"),
    body("isPublished").optional().isBoolean().withMessage("isPublished must be boolean"),
  ],
  validate,
  updatePost
);
router.delete(
  "/:id",
  protect,
  requireCsrf,
  [param("id").isMongoId().withMessage("Invalid post id")],
  validate,
  deletePost
);
router.post(
  "/:id/like",
  protect,
  requireCsrf,
  [param("id").isMongoId().withMessage("Invalid post id")],
  validate,
  likePost
);

module.exports = router;
