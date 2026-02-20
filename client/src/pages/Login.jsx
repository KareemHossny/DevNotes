import { useEffect, useMemo, useState } from "react";
import { FiArrowRight, FiCheckCircle, FiLogIn } from "react-icons/fi";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useAuth } from "../context/AuthContext";
import { ROUTES } from "../constants/routes";
import { buildCanonicalUrl } from "../utils/seo";

const Login = () => {
  const { login, loading, error, isAuthenticated, clearAuthError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [localError, setLocalError] = useState("");

  const redirectTo = useMemo(
    () => location.state?.from || ROUTES.HOME,
    [location.state]
  );

  useEffect(() => {
    if (isAuthenticated) navigate(redirectTo, { replace: true });
  }, [isAuthenticated, navigate, redirectTo]);

  useEffect(() => {
    clearAuthError();
    return () => clearAuthError();
  }, [clearAuthError]);

  const onChange = (e) => {
    if (localError) setLocalError("");
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    const email = form.email.trim().toLowerCase();
    if (!email || !form.password) {
      setLocalError("Email and password are required.");
      return;
    }

    try {
      await login({ email, password: form.password });
      navigate(redirectTo, { replace: true });
    } catch (_) {
      return;
    }
  };

  return (
    <main className="mx-auto grid w-full max-w-6xl gap-4 lg:grid-cols-[1.06fr_1fr]">
      {(() => {
        const canonicalUrl = buildCanonicalUrl(location.pathname);
        return (
          <Helmet>
            <title>DevNotes | Login</title>
            <meta name="description" content="Sign in to DevNotes to publish developer notes and build logs." />
            <link rel="canonical" href={canonicalUrl} />
            <meta property="og:title" content="DevNotes | Login" />
            <meta property="og:description" content="Sign in to DevNotes to publish developer notes and build logs." />
            <meta property="og:type" content="website" />
            <meta property="og:image" content="/Copilot_20260216_032458.png" />
            <meta property="og:url" content={canonicalUrl} />
          </Helmet>
        );
      })()}
      <aside className="rounded-3xl border border-slate-200 bg-gradient-to-b from-white to-indigo-50/40 p-6 shadow-sm dark:border-slate-700 dark:from-slate-900 dark:to-slate-800 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-700 dark:text-indigo-300">
          DevNotes Access
        </p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
          Welcome back to your writing space.
        </h1>
        <p className="mt-4 text-slate-600 dark:text-slate-300">
          Publish insights, document engineering decisions, and keep your developer journal
          in one place.
        </p>
        <ul className="mt-5 grid gap-3 text-sm text-slate-600 dark:text-slate-300">
          <li className="inline-flex items-center gap-2">
            <FiCheckCircle className="text-indigo-600 dark:text-indigo-300" />
            Fast markdown-friendly editor
          </li>
          <li className="inline-flex items-center gap-2">
            <FiCheckCircle className="text-indigo-600 dark:text-indigo-300" />
            Post analytics and likes
          </li>
          <li className="inline-flex items-center gap-2">
            <FiCheckCircle className="text-indigo-600 dark:text-indigo-300" />
            Search by tags and topics
          </li>
        </ul>
      </aside>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-8">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Sign In</h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Use your account credentials to continue.
        </p>

        <form onSubmit={onSubmit} className="mt-6 grid gap-3">
          <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={onChange}
            autoComplete="email"
            className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-slate-900 outline-none transition-colors focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />

          <label htmlFor="password" className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="Enter your password"
            value={form.password}
            onChange={onChange}
            autoComplete="current-password"
            className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-slate-900 outline-none transition-colors focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />

          <button
            type="submit"
            disabled={loading}
            className="mt-2 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <FiLogIn className="text-base" />
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        {(localError || error) && (
          <div
            className="mt-3 rounded-xl border border-rose-200 bg-rose-50/80 px-4 py-3 text-sm text-rose-700 dark:border-rose-700/60 dark:bg-rose-500/10 dark:text-rose-300"
            role="alert"
          >
            <p>{localError || error}</p>
          </div>
        )}

        <p className="mt-5 text-sm text-slate-600 dark:text-slate-300">
          No account yet?{" "}
          <Link
            to={ROUTES.REGISTER}
            className="inline-flex items-center gap-1 font-semibold text-indigo-700 hover:text-indigo-600 dark:text-indigo-300 dark:hover:text-indigo-200"
          >
            Create one
            <FiArrowRight className="text-sm" />
          </Link>
        </p>
      </section>
    </main>
  );
};

export default Login;

