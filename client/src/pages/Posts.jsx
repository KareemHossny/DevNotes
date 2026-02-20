import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import PostCard from "../components/PostCard";
import StateNotice from "../components/StateNotice";
import { useAuth } from "../context/AuthContext";
import { ROUTES } from "../constants/routes";
import { getPostsPaged } from "../services/postService";
import getApiErrorMessage from "../utils/getApiErrorMessage";
import { buildCanonicalUrl } from "../utils/seo";

const Posts = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialSearch = useMemo(() => searchParams.get("search") || "", [searchParams]);
  const page = useMemo(() => Number(searchParams.get("page") || 1), [searchParams]);
  const limit = 9;
  const [posts, setPosts] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const loadPosts = async () => {
      setLoading(true);
      setError("");

      try {
        const params = { page, limit };
        if (initialSearch) params.search = initialSearch;

        // Pagination is server-side for scalability.
        const { items, meta: nextMeta } = await getPostsPaged(params);
        setPosts(Array.isArray(items) ? items : []);
        setMeta({
          page: nextMeta?.page || 1,
          totalPages: nextMeta?.totalPages || 1,
          hasNext: nextMeta?.hasNext || false,
          hasPrev: nextMeta?.hasPrev || false,
        });
      } catch (err) {
        const message = getApiErrorMessage(err, "Failed to load posts");
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, [initialSearch, page, refreshKey]);

  const updatePage = (nextPage) => {
    const params = {};
    if (initialSearch) params.search = initialSearch;
    params.page = String(nextPage);
    setSearchParams(params);
  };

  return (
    <main className="grid gap-6">
      {(() => {
        const canonicalUrl = buildCanonicalUrl(location.pathname);
        return (
          <Helmet>
            <title>DevNotes | Posts</title>
            <meta
              name="description"
              content="Browse developer posts, build logs, and technical notes on DevNotes."
            />
            <link rel="canonical" href={canonicalUrl} />
            <meta property="og:title" content="DevNotes | Posts" />
            <meta
              property="og:description"
              content="Browse developer posts, build logs, and technical notes on DevNotes."
            />
            <meta property="og:type" content="website" />
            <meta property="og:image" content="/Copilot_20260216_032458.png" />
            <meta property="og:url" content={canonicalUrl} />
          </Helmet>
        );
      })()}
      <section className="py-1">
        <h1 className="text-center text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
          Engineering Notes, Done Right
        </h1>
        {initialSearch && (
          <p className="mt-2 text-center text-sm text-slate-500 dark:text-slate-400">
            Results for "{initialSearch}"
          </p>
        )}
      </section>

      {loading && (
        <section
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
          aria-label="Loading posts"
        >
          {Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={idx}
              className="h-56 animate-pulse rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 dark:border-slate-700 dark:from-slate-800 dark:via-slate-900 dark:to-slate-800"
            />
          ))}
        </section>
      )}
      {!loading && error && (
        <StateNotice
          variant="error"
          title="Could not load posts"
          message={error}
          actionLabel="Try Again"
          onAction={() => setRefreshKey((prev) => prev + 1)}
        />
      )}
      {!loading && !error && posts.length === 0 && (
        <StateNotice
          variant="empty"
          title="No posts found"
          message={
            initialSearch
              ? `No results for "${initialSearch}". Try a different title or tag.`
              : "There are no posts yet. Create the first one."
          }
          actionLabel={initialSearch ? "Clear Search" : isAuthenticated ? "Create Post" : "Sign In"}
          onAction={
            initialSearch
              ? () => setSearchParams({})
              : () => {
                  navigate(isAuthenticated ? ROUTES.POST_NEW : ROUTES.LOGIN);
                }
          }
        />
      )}

      {!loading && !error && posts.length > 0 && (
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </section>
      )}

      {!loading && !error && meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => updatePage(meta.page - 1)}
            disabled={!meta.hasPrev}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 transition disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-100"
          >
            Previous
          </button>
          <span className="text-sm text-slate-500 dark:text-slate-400">
            Page {meta.page} of {meta.totalPages}
          </span>
          <button
            type="button"
            onClick={() => updatePage(meta.page + 1)}
            disabled={!meta.hasNext}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 transition disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-100"
          >
            Next
          </button>
        </div>
      )}
    </main>
  );
};

export default Posts;
