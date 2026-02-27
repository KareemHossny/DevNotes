import { useEffect, useMemo, useState } from "react";
import { FiArrowLeft, FiCheckSquare, FiEdit3, FiSave } from "react-icons/fi";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import StateNotice from "../components/StateNotice";
import PageLoader from "../components/ui/PageLoader";
import { createPost, getPostById, updatePost } from "../services/postService";
import getApiErrorMessage from "../utils/getApiErrorMessage";
import { ROUTES } from "../constants/routes";
import { buildCanonicalUrl } from "../utils/seo";

const CreateEditPost = ({ mode }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const isEdit = mode === "edit";
  const [form, setForm] = useState({
    title: "",
    content: "",
    tags: "",
    isPublished: true,
  });
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [loadError, setLoadError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const pageTitle = useMemo(
    () => (isEdit ? "Edit Post" : "Create Post"),
    [isEdit]
  );

  useEffect(() => {
    if (!isEdit || !id) return;

    const loadPost = async () => {
      setLoading(true);
      setError("");
      setLoadError("");
      try {
        const post = await getPostById(id);
        setForm({
          title: post.title || "",
          content: post.content || "",
          tags: Array.isArray(post.tags) ? post.tags.join(", ") : "",
          isPublished: typeof post.isPublished === "boolean" ? post.isPublished : true,
        });
      } catch (err) {
        const message = getApiErrorMessage(err, "Failed to load post.");
        setLoadError(message);
      } finally {
        setLoading(false);
      }
    };

    loadPost();
  }, [id, isEdit, refreshKey]);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const title = form.title.trim();
    const content = form.content.trim();
    const tags = form.tags
      .split(",")
      .map((tag) => tag.trim().toLowerCase())
      .filter(Boolean);

    if (!title || !content) {
      setError("Title and content are required.");
      return;
    }

    const payload = {
      title,
      content,
      tags,
      isPublished: form.isPublished,
    };

    setSaving(true);
    try {
      const savedPost = isEdit ? await updatePost(id, payload) : await createPost(payload);
      navigate(ROUTES.postDetails(savedPost._id), { replace: true });
    } catch (err) {
      const message = getApiErrorMessage(err, "Failed to save post.");
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main>
        <PageLoader label="Loading editor" />
      </main>
    );
  }

  if (loadError) {
    return (
      <main>
        <StateNotice
          variant="error"
          title="Could not open post"
          message={loadError}
          actionLabel="Try Again"
          onAction={() => setRefreshKey((prev) => prev + 1)}
        />
      </main>
    );
  }

  const canonicalUrl = buildCanonicalUrl(location.pathname);

  return (
    <main>
      <Helmet>
        <title>{pageTitle} | DevNotes</title>
        <meta name="description" content="Create and publish developer notes, architecture insights, and build logs." />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={`${pageTitle} | DevNotes`} />
        <meta
          property="og:description"
          content="Create and publish developer notes, architecture insights, and build logs."
        />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/Copilot_20260216_032458.webp" />
        <meta property="og:url" content={canonicalUrl} />
      </Helmet>
      <section className="mx-auto w-full max-w-5xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h1 className="inline-flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            <FiEdit3 className="text-indigo-600 dark:text-indigo-300" />
            {pageTitle}
          </h1>
          <Link
            to={ROUTES.HOME}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-indigo-300 hover:text-indigo-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-indigo-400 dark:hover:text-indigo-200"
          >
            <FiArrowLeft />
            Back Home
          </Link>
        </div>

        <form onSubmit={onSubmit} className="grid gap-3">
          <label htmlFor="title" className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Title
          </label>
          <input
            id="title"
            name="title"
            type="text"
            placeholder="Post title"
            value={form.title}
            onChange={onChange}
            maxLength={200}
            className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-slate-900 outline-none transition-colors focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />

          <label htmlFor="content" className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Content
          </label>
          <textarea
            id="content"
            name="content"
            placeholder="Write your post content..."
            value={form.content}
            onChange={onChange}
            rows={14}
            className="min-h-[320px] rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-relaxed text-slate-900 outline-none transition-colors focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />

          <label htmlFor="tags" className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Tags
          </label>
          <input
            id="tags"
            name="tags"
            type="text"
            placeholder="react, nodejs, mongodb"
            value={form.tags}
            onChange={onChange}
            className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-slate-900 outline-none transition-colors focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />

          <label className="mt-2 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
            <FiCheckSquare className="text-indigo-600 dark:text-indigo-300" />
            <input
              name="isPublished"
              type="checkbox"
              checked={form.isPublished}
              onChange={onChange}
              className="h-4 w-4 accent-indigo-600"
            />
            Published
          </label>

          <button
            type="submit"
            disabled={saving}
            className="mt-1 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <FiSave className="text-base" />
            {saving ? "Saving..." : isEdit ? "Update Post" : "Publish Post"}
          </button>
        </form>

        {error && (
          <p className="mt-3 rounded-xl border border-rose-200 bg-rose-50/80 px-4 py-3 text-sm text-rose-700 dark:border-rose-700/60 dark:bg-rose-500/10 dark:text-rose-300">
            {error}
          </p>
        )}
      </section>
    </main>
  );
};

export default CreateEditPost;

