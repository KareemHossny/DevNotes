const Post = require("../models/Post");
const { ok, fail } = require("../utils/response");

const getTopLiked = async (req, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 9, 30);

    const posts = await Post.aggregate([
      { $addFields: { likesCount: { $size: { $ifNull: ["$likes", []] } } } },
      { $sort: { likesCount: -1, createdAt: -1 } },
      { $limit: limit },
    ]);

    await Post.populate(posts, { path: "author", select: "name email" });

    return ok(res, posts);
  } catch (err) {
    return next(err);
  }
};

const searchPosts = async (req, res, next) => {
  try {
    const query = String(req.query.q || req.query.search || "").trim();
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);

    if (!query) {
      // Empty search returns an empty, paginated response (explicit behavior).
      return ok(res, [], {
        currentPage: page,
        totalPages: 0,
        totalResults: 0,
      });
    }

    // Attempt text search first for relevance scoring.
    const textFilter = { $text: { $search: query } };
    const textProjection = { score: { $meta: "textScore" } };

    const textTotal = await Post.countDocuments(textFilter);
    if (textTotal > 0) {
      const totalPages = Math.max(Math.ceil(textTotal / limit), 1);
      const skip = (page - 1) * limit;

      const posts = await Post.find(textFilter, textProjection)
        .populate("author", "name email")
        .sort({ score: { $meta: "textScore" }, createdAt: -1 })
        .skip(skip)
        .limit(limit);

      return ok(res, posts, {
        currentPage: page,
        totalPages,
        totalResults: textTotal,
      });
    }

    // Fallback: case-insensitive partial match (regex) on title + content.
    // This is acceptable for <100k docs and avoids empty results for partial words.
    const safe = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(safe, "i");
    const regexFilter = { $or: [{ title: regex }, { content: regex }] };

    const regexTotal = await Post.countDocuments(regexFilter);
    const totalPages = regexTotal ? Math.ceil(regexTotal / limit) : 0;
    const skip = (page - 1) * limit;

    const posts = await Post.find(regexFilter)
      .populate("author", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return ok(res, posts, {
      currentPage: page,
      totalPages,
      totalResults: regexTotal,
    });
  } catch (err) {
    return next(err);
  }
};

const getStats = async (req, res, next) => {
  try {
    const [result] = await Post.aggregate([
      {
        $project: {
          tags: 1,
          likesCount: { $size: { $ifNull: ["$likes", []] } },
        },
      },
      {
        $group: {
          _id: null,
          totalPosts: { $sum: 1 },
          totalLikes: { $sum: "$likesCount" },
          allTags: { $push: "$tags" },
        },
      },
      {
        $project: {
          _id: 0,
          totalPosts: 1,
          totalLikes: 1,
          uniqueTags: {
            $size: {
              $setUnion: [
                {
                  $reduce: {
                    input: "$allTags",
                    initialValue: [],
                    in: { $concatArrays: ["$$value", "$$this"] },
                  },
                },
                [],
              ],
            },
          },
        },
      },
    ]);

    return ok(res, result || { totalPosts: 0, totalLikes: 0, uniqueTags: 0 });
  } catch (err) {
    return next(err);
  }
};

const getPosts = async (req, res, next) => {
  try {
    const { search, tag } = req.query;
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 9, 1), 50);
    const filter = {};
    const trimmedSearch = String(search || "").trim().slice(0, 120);
    const projection = {};

    if (trimmedSearch) {
      // Use text index for scalable search and relevance scoring.
      filter.$text = { $search: trimmedSearch };
      projection.score = { $meta: "textScore" };
    }

    if (tag) {
      filter.tags = tag;
    }

    const total = await Post.countDocuments(filter);
    const totalPages = Math.max(Math.ceil(total / limit), 1);
    const skip = (page - 1) * limit;

    const sort = trimmedSearch
      ? { score: { $meta: "textScore" }, createdAt: -1 }
      : { createdAt: -1 };

    let posts = await Post.find(filter, projection)
      .populate("author", "name email")
      .sort(sort)
      .skip(skip)
      .limit(limit);

    // If text search yields no results, fallback to partial regex matching.
    if (trimmedSearch && total === 0) {
      const safe = trimmedSearch.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(safe, "i");
      const regexFilter = { $or: [{ title: regex }, { tags: regex }] };

      const regexTotal = await Post.countDocuments(regexFilter);
      const regexTotalPages = Math.max(Math.ceil(regexTotal / limit), 1);
      const regexSkip = (page - 1) * limit;

      posts = await Post.find(regexFilter)
        .populate("author", "name email")
        .sort({ createdAt: -1 })
        .skip(regexSkip)
        .limit(limit);

      return ok(res, posts, {
        page,
        limit,
        total: regexTotal,
        totalPages: regexTotalPages,
        hasNext: page < regexTotalPages,
        hasPrev: page > 1,
      });
    }

    return ok(res, posts, {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    });
  } catch (err) {
    return next(err);
  }
};

const getPostById = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id).populate(
      "author",
      "name email"
    );

    if (!post) {
      return fail(res, "Post not found", 404);
    }

    return ok(res, post);
  } catch (err) {
    return next(err);
  }
};

const createPost = async (req, res, next) => {
  try {
    const { title, content, tags, isPublished } = req.body;

    if (!title || !content) {
      return fail(res, "Title and content are required", 400);
    }

    const post = await Post.create({
      title,
      content,
      tags: Array.isArray(tags)
        ? tags.map((t) => t.trim()).filter(Boolean)
        : [],
      isPublished: typeof isPublished === "boolean" ? isPublished : true,
      author: req.user._id,
    });

    const created = await Post.findById(post._id).populate(
      "author",
      "name email"
    );

    return ok(res, created, undefined, 201);
  } catch (err) {
    return next(err);
  }
};

const updatePost = async (req, res, next) => {
  try {
    const { title, content, tags, isPublished } = req.body;

    const post = await Post.findById(req.params.id);

    if (!post) {
      return fail(res, "Post not found", 404);
    }

    const isAuthor = post.author.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isAuthor && !isAdmin) {
      return fail(res, "Forbidden", 403);
    }

    if (title !== undefined) post.title = title;
    if (content !== undefined) post.content = content;
    if (tags !== undefined) {
      post.tags = Array.isArray(tags)
        ? tags.map((t) => t.trim()).filter(Boolean)
        : [];
    }
    if (isPublished !== undefined) post.isPublished = isPublished;

    await post.save();

    const updated = await Post.findById(post._id).populate(
      "author",
      "name email"
    );

    return ok(res, updated);
  } catch (err) {
    return next(err);
  }
};

const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return fail(res, "Post not found", 404);
    }

    const isAuthor = post.author.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isAuthor && !isAdmin) {
      return fail(res, "Forbidden", 403);
    }

    await post.deleteOne();

    return ok(res, {
      id: post._id,
      message: "Post deleted",
    });
  } catch (err) {
    return next(err);
  }
};

const likePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return fail(res, "Post not found", 404);
    }

    const userId = req.user._id.toString();
    const hasLiked = post.likes.map((id) => id.toString()).includes(userId);

    if (hasLiked) {
      post.likes = post.likes.filter((id) => id.toString() !== userId);
    } else {
      post.likes.push(req.user._id);
    }

    await post.save();

    const updated = await Post.findById(post._id).populate(
      "author",
      "name email"
    );

    return ok(res, {
      id: post._id,
      likesCount: post.likes.length,
      liked: !hasLiked,
      post: updated,
    });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  getTopLiked,
  searchPosts,
  getStats,
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  likePost,
};
