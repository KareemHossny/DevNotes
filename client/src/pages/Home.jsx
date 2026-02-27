import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Hero from "../components/Hero";
import PostCard from "../components/PostCard";
import StateNotice from "../components/StateNotice";
import { getPostStats, getTopLikedPosts } from "../services/postService";
import getApiErrorMessage from "../utils/getApiErrorMessage";
import { useAuth } from "../context/AuthContext";
import { ROUTES } from "../constants/routes";
import { buildCanonicalUrl } from "../utils/seo";

const Home = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [posts, setPosts] = useState([]);
  const [stats, setStats] = useState({ totalPosts: 0, uniqueTags: 0, totalLikes: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const postsSectionRef = useRef(null);

  const topPosts = useMemo(() => {
    return [...posts]
      .sort((a, b) => {
        const aLikes = Array.isArray(a.likes) ? a.likes.length : 0;
        const bLikes = Array.isArray(b.likes) ? b.likes.length : 0;
        return bLikes - aLikes;
      })
      .slice(0, 9);
  }, [posts]);

  useEffect(() => {
    const loadPosts = async () => {
      setLoading(true);
      setError("");

      try {
        const [topLiked, statsData] = await Promise.all([
          getTopLikedPosts(9),
          getPostStats(),
        ]);
        setPosts(Array.isArray(topLiked) ? topLiked : []);
        setStats({
          totalPosts: statsData?.totalPosts || 0,
          uniqueTags: statsData?.uniqueTags || 0,
          totalLikes: statsData?.totalLikes || 0,
        });
      } catch (err) {
        const message = getApiErrorMessage(err, "Failed to load posts");
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, [refreshKey]);

  const handleExplorePosts = () => {
    postsSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <main className="grid gap-6">
      {(() => {
        const canonicalUrl = buildCanonicalUrl(location.pathname);
        return (
          <Helmet>
            <title>DevNotes | Home</title>
            <meta
              name="description"
              content="Discover top developer posts, architecture notes, and build logs on DevNotes."
            />
            <link rel="canonical" href={canonicalUrl} />
            <meta property="og:title" content="DevNotes | Home" />
            <meta
              property="og:description"
              content="Discover top developer posts, architecture notes, and build logs on DevNotes."
            />
            <meta property="og:type" content="website" />
            <meta property="og:image" content="/Copilot_20260216_032458.webp" />
            <meta property="og:url" content={canonicalUrl} />
          </Helmet>
        );
      })()}
      <Hero
        isAuthenticated={isAuthenticated}
        postCount={stats.totalPosts}
        topicCount={stats.uniqueTags}
        likeCount={stats.totalLikes}
        onExplorePosts={handleExplorePosts}
      />

      <section ref={postsSectionRef} className="py-1">
        <h1 className="text-center text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
Experience shared. Knowledge refined</h1>
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
          message="There are no posts yet. Create the first one."
          actionLabel={isAuthenticated ? "Create Post" : "Sign In"}
          onAction={() => {
            navigate(isAuthenticated ? ROUTES.POST_NEW : ROUTES.LOGIN);
          }}
        />
      )}

      {!loading && !error && topPosts.length > 0 && (
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {topPosts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </section>
      )}

      {!loading && !error && topPosts.length > 0 && (
        <div className="flex justify-center">
          <Link
            to={ROUTES.POSTS_ROOT}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white/80 px-5 py-3 text-sm font-semibold text-slate-700 transition duration-200 hover:-translate-y-0.5 hover:border-indigo-300 hover:text-indigo-700 dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-100 dark:hover:border-indigo-300 dark:hover:text-indigo-200"
          >
            View all posts
          </Link>
        </div>
      )}
    </main>
  );
};

export default Home;
