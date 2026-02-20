import { useEffect, useMemo, useState } from "react";
import { FiArrowLeft, FiEdit3, FiHeart, FiTrash2, FiUser } from "react-icons/fi";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useAuth } from "../context/AuthContext";
import StateNotice from "../components/StateNotice";
import PageLoader from "../components/ui/PageLoader";
import { deletePost, getPostById, likePost } from "../services/postService";
import getApiErrorMessage from "../utils/getApiErrorMessage";
import { ROUTES } from "../constants/routes";
import { buildCanonicalUrl } from "../utils/seo";

const getReadingTime = (content = "") => {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
};

const renderContentBlocks = (content = "") => {
  const parseMarkdownImage = (text) => {
    const match = text.match(/^!\[(.*?)\]\((https?:\/\/[^\s)]+)\)$/);
    if (!match) return null;
    return { alt: match[1] || "Post image", src: match[2] };
  };

  const segments = content.split("```");

  return segments.map((segment, index) => {
    const isCode = index % 2 === 1;

    if (isCode) {
      const [firstLine, ...rest] = segment.split("\n");
      const language = firstLine.trim();
      const code = rest.join("\n").trim();

      return (
        <pre
          key={`code-${index}`}
          className="relative my-4 overflow-x-auto rounded-2xl border border-slate-200 bg-slate-900 p-4 pt-8 text-slate-100 dark:border-slate-700"
        >
          {language && (
            <span className="absolute right-3 top-2 font-mono text-[10px] uppercase tracking-wide text-slate-400">
              {language}
            </span>
          )}
          <code className="block break-words font-mono text-[13px] leading-relaxed">{code}</code>
        </pre>
      );
    }

    const paragraphs = segment
      .split("\n\n")
      .map((p) => p.trim())
      .filter(Boolean);

    return paragraphs.map((paragraph, pIndex) => {
      const image = parseMarkdownImage(paragraph);
      if (image) {
        return (
          <figure key={`img-${index}-${pIndex}`} className="my-5 overflow-hidden rounded-lg">
            <img src={image.src} alt={image.alt} className="w-full rounded-lg object-cover" />
          </figure>
        );
      }

      if (paragraph.startsWith("## ")) {
        return (
          <h2
            key={`h2-${index}-${pIndex}`}
            className="mb-3 mt-6 text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
          >
            {paragraph.replace(/^##\s+/, "")}
          </h2>
        );
      }

      if (paragraph.startsWith("# ")) {
        return (
          <h2
            key={`h1-${index}-${pIndex}`}
            className="mb-3 mt-6 text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
          >
            {paragraph.replace(/^#\s+/, "")}
          </h2>
        );
      }

      return (
        <p
          key={`p-${index}-${pIndex}`}
          className="mb-4 break-words whitespace-pre-wrap text-base leading-relaxed text-slate-700 dark:text-slate-200"
        >
          {paragraph}
        </p>
      );
    });
  });
};

const PostDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [isLiking, setIsLiking] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const loadPost = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getPostById(id);
        setPost(data);
      } catch (err) {
        const message = getApiErrorMessage(err, "Failed to load post.");
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    loadPost();
  }, [id, refreshKey]);

  const likedByCurrentUser = useMemo(() => {
    if (!user || !post?.likes) return false;
    return post.likes.some((likeId) => String(likeId) === String(user.id));
  }, [post?.likes, user]);

  const canEditOrDelete = useMemo(() => {
    if (!user || !post) return false;
    const authorId = typeof post.author === "object" ? post.author?._id : post.author;
    return String(authorId) === String(user.id) || user.role === "admin";
  }, [post, user]);

  const readingTime = useMemo(() => getReadingTime(post?.content || ""), [post?.content]);

  const handleLike = async () => {
    if (!isAuthenticated) {
      navigate(ROUTES.LOGIN, { state: { from: ROUTES.postDetails(id) } });
      return;
    }

    setActionError("");
    setIsLiking(true);
    try {
      const data = await likePost(id);
      setPost((prev) => {
        if (!prev) return prev;
        const currentLikes = Array.isArray(prev.likes) ? prev.likes : [];
        if (!user) return { ...prev, likes: currentLikes };

        const withoutUser = currentLikes.filter(
          (likeId) => String(likeId) !== String(user.id)
        );
        const nextLikes = data.liked ? [...withoutUser, user.id] : withoutUser;

        return {
          ...prev,
          likes: nextLikes,
        };
      });
    } catch (err) {
      const message = getApiErrorMessage(err, "Failed to update like.");
      setActionError(message);
    } finally {
      setIsLiking(false);
    }
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm("Delete this post permanently?");
    if (!confirmDelete) return;

    setActionError("");
    setIsDeleting(true);
    try {
      await deletePost(id);
      navigate(ROUTES.HOME, { replace: true });
    } catch (err) {
      const message = getApiErrorMessage(err, "Failed to delete post.");
      setActionError(message);
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <main>
        <PageLoader label="Loading post" />
      </main>
    );
  }

  if (error) {
    return (
      <main>
        <StateNotice
          variant="error"
          title="Could not load post"
          message={error}
          actionLabel="Try Again"
          onAction={() => setRefreshKey((prev) => prev + 1)}
        />
      </main>
    );
  }

  if (!post) {
    return (
      <main>
        <StateNotice
          variant="empty"
          title="Post not found"
          message="The post may have been deleted or is unavailable."
          actionLabel="Back Home"
          onAction={() => navigate(ROUTES.HOME)}
        />
      </main>
    );
  }

  return (
    <main className="overflow-x-hidden">
      {(() => {
        const canonicalUrl = buildCanonicalUrl(location.pathname);
        return (
          <Helmet>
            <title>{post.title} | DevNotes</title>
            <meta
              name="description"
              content={post.content ? post.content.slice(0, 155) : "Developer notes and build logs on DevNotes."}
            />
            <link rel="canonical" href={canonicalUrl} />
            <meta property="og:title" content={`${post.title} | DevNotes`} />
            <meta
              property="og:description"
              content={post.content ? post.content.slice(0, 155) : "Developer notes and build logs on DevNotes."}
            />
            <meta property="og:type" content="article" />
            <meta property="og:image" content="/Copilot_20260216_032458.png" />
            <meta property="og:url" content={canonicalUrl} />
          </Helmet>
        );
      })()}
      <article className="mx-auto w-full max-w-4xl overflow-hidden rounded-3xl border border-slate-200 bg-white px-4 py-6 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:px-6 sm:py-8 lg:px-8">
        <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              {post.title}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs font-medium text-slate-500 dark:text-slate-400">
              <span className="inline-flex items-center gap-1.5">
                <FiUser className="text-sm" />
                {post.author?.name || "Unknown author"}
              </span>
              <span>{new Date(post.createdAt).toLocaleDateString()}</span>
              <span>{readingTime} min read</span>
              <span>{Array.isArray(post.likes) ? post.likes.length : 0} likes</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              to={ROUTES.HOME}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-indigo-300 hover:text-indigo-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-indigo-400 dark:hover:text-indigo-200"
            >
              <FiArrowLeft />
              Back Home
            </Link>
            {canEditOrDelete && (
              <Link
                to={ROUTES.postEdit(post._id)}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-indigo-300 hover:text-indigo-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-indigo-400 dark:hover:text-indigo-200"
              >
                <FiEdit3 />
                Edit
              </Link>
            )}
          </div>
        </header>

        <div className="mb-6 flex flex-wrap gap-2">
          {post.tags?.map((tag) => (
            <span
              key={`${post._id}-${tag}`}
              className="rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-200"
            >
              #{tag}
            </span>
          ))}
        </div>

        <section className="mb-6 leading-relaxed">{renderContentBlocks(post.content)}</section>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleLike}
            disabled={isLiking}
            className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold text-white transition duration-200 disabled:cursor-not-allowed disabled:opacity-70 ${
              likedByCurrentUser
                ? "bg-indigo-500 hover:bg-indigo-400"
                : "bg-indigo-600 hover:bg-indigo-500"
            }`}
          >
            <FiHeart className={likedByCurrentUser ? "fill-current" : ""} />
            {isLiking ? "Updating..." : likedByCurrentUser ? "Unlike" : "Like"}
          </button>

          {canEditOrDelete && (
            <button
              type="button"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 text-sm font-semibold text-white transition duration-200 hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-70"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              <FiTrash2 />
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
          )}
        </div>

        <section className="mt-6 border-t border-dashed border-slate-200 pt-4 dark:border-slate-700">
          <p className="font-mono text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Written by
          </p>
          <p className="mt-1 text-base font-bold text-slate-900 dark:text-white">
            {post.author?.name || "Unknown author"}
          </p>
          {post.author?.email && (
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{post.author.email}</p>
          )}
        </section>

        {actionError && (
          <p className="mt-3 rounded-xl border border-rose-200 bg-rose-50/80 px-4 py-3 text-sm text-rose-700 dark:border-rose-700/60 dark:bg-rose-500/10 dark:text-rose-300">
            {actionError}
          </p>
        )}
      </article>
    </main>
  );
};

export default PostDetails;
