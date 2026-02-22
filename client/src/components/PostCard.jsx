import { Link } from "react-router-dom";
import { FiArrowUpRight, FiCalendar, FiClock, FiHeart, FiUser } from "react-icons/fi";
import { ROUTES } from "../constants/routes";

const PostCard = ({ post }) => {
  const likesCount = Array.isArray(post.likes)
    ? post.likes.length
    : Number(post.likesCount) || 0;
  const tags = Array.isArray(post.tags) ? post.tags : [];
  const excerpt = (post.content || "").slice(0, 170);
  const readingTime = Math.max(
    1,
    Math.ceil((post.content || "").trim().split(/\s+/).filter(Boolean).length / 220)
  );

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl dark:border-slate-700 dark:bg-slate-900 dark:hover:border-indigo-400/50">
      <div className="pointer-events-none absolute -right-20 -top-16 h-40 w-40 rounded-full bg-indigo-100/70 blur-2xl transition-opacity duration-300 group-hover:opacity-100 dark:bg-indigo-500/20" />
      <div className="mb-4 h-1.5 w-16 rounded-full bg-gradient-to-r from-indigo-500 to-sky-400" />

      <header className="relative">
        <h2 className="text-xl font-extrabold leading-tight tracking-tight text-slate-900 dark:text-white">
          <Link
            to={ROUTES.postDetails(post._id)}
            className="inline-flex items-start gap-1 transition-colors hover:text-indigo-700 dark:hover:text-indigo-300"
          >
            {post.title}
            <FiArrowUpRight className="mt-1 shrink-0 text-base opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
          </Link>
        </h2>
      </header>

      <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
        {excerpt}...
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs font-medium text-slate-500 dark:text-slate-400">
        <span className="inline-flex items-center gap-1.5">
          <FiUser className="text-sm" />
          {post.author?.name || "Unknown author"}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <FiCalendar className="text-sm" />
          {new Date(post.createdAt).toLocaleDateString()}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <FiHeart className="text-sm" />
          {likesCount} likes
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] dark:border-slate-700 dark:bg-slate-800">
          <FiClock className="text-xs" />
          {readingTime} min read
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {tags.slice(0, 4).map((tag) => (
          <span
            key={`${post._id}-${tag}`}
            className="rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-200"
          >
            #{tag}
          </span>
        ))}
      </div>

      <div className="mt-5 border-t border-slate-200 pt-4 dark:border-slate-700">
        <Link
          to={ROUTES.postDetails(post._id)}
          className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-700 transition hover:text-indigo-600 dark:text-indigo-300 dark:hover:text-indigo-200"
        >
          Read article
          <FiArrowUpRight />
        </Link>
      </div>
    </article>
  );
};

export default PostCard;
