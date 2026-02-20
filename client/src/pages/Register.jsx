import { useEffect, useMemo, useState } from "react";
import { FiArrowRight, FiCheckCircle, FiUserPlus } from "react-icons/fi";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useAuth } from "../context/AuthContext";
import { ROUTES } from "../constants/routes";
import { buildCanonicalUrl } from "../utils/seo";

const Register = () => {
  const { register, loading, error, isAuthenticated, clearAuthError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
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

    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();

    if (!name || !email || !form.password || !form.confirmPassword) {
      setLocalError("All fields are required.");
      return;
    }

    if (form.password.length < 8) {
      setLocalError("Password must be at least 8 characters.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setLocalError("Passwords do not match.");
      return;
    }

    try {
      await register({ name, email, password: form.password });
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
            <title>DevNotes | Register</title>
            <meta
              name="description"
              content="Create a DevNotes account to publish engineering notes and architecture insights."
            />
            <link rel="canonical" href={canonicalUrl} />
            <meta property="og:title" content="DevNotes | Register" />
            <meta
              property="og:description"
              content="Create a DevNotes account to publish engineering notes and architecture insights."
            />
            <meta property="og:type" content="website" />
            <meta property="og:image" content="/Copilot_20260216_032458.png" />
            <meta property="og:url" content={canonicalUrl} />
          </Helmet>
        );
      })()}
      <aside className="rounded-3xl border border-slate-200 bg-gradient-to-b from-white to-indigo-50/40 p-6 shadow-sm dark:border-slate-700 dark:from-slate-900 dark:to-slate-800 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-700 dark:text-indigo-300">
          Join DevNotes
        </p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
          Start publishing developer notes that matter.
        </h1>
        <p className="mt-4 text-slate-600 dark:text-slate-300">
          Build your portfolio narrative with practical posts, coding lessons, and architecture
          write-ups.
        </p>
        <ul className="mt-5 grid gap-3 text-sm text-slate-600 dark:text-slate-300">
          <li className="inline-flex items-center gap-2">
            <FiCheckCircle className="text-indigo-600 dark:text-indigo-300" />
            Create and edit posts quickly
          </li>
          <li className="inline-flex items-center gap-2">
            <FiCheckCircle className="text-indigo-600 dark:text-indigo-300" />
            Tag content for discoverability
          </li>
          <li className="inline-flex items-center gap-2">
            <FiCheckCircle className="text-indigo-600 dark:text-indigo-300" />
            Engage readers with likes-ready structure
          </li>
        </ul>
      </aside>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-8">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Create Account
        </h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Set up your writer profile in under a minute.
        </p>

        <form onSubmit={onSubmit} className="mt-6 grid gap-3">
          <label htmlFor="name" className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            placeholder="Your name"
            value={form.name}
            onChange={onChange}
            autoComplete="name"
            className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-slate-900 outline-none transition-colors focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />

          <label htmlFor="email" className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
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
            placeholder="At least 8 characters"
            value={form.password}
            onChange={onChange}
            autoComplete="new-password"
            className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-slate-900 outline-none transition-colors focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />

          <label htmlFor="confirmPassword" className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            placeholder="Repeat your password"
            value={form.confirmPassword}
            onChange={onChange}
            autoComplete="new-password"
            className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-slate-900 outline-none transition-colors focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />

          <button
            type="submit"
            disabled={loading}
            className="mt-2 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <FiUserPlus className="text-base" />
            {loading ? "Creating Account..." : "Create Account"}
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
          Already have an account?{" "}
          <Link
            to={ROUTES.LOGIN}
            className="inline-flex items-center gap-1 font-semibold text-indigo-700 hover:text-indigo-600 dark:text-indigo-300 dark:hover:text-indigo-200"
          >
            Sign in
            <FiArrowRight className="text-sm" />
          </Link>
        </p>
      </section>
    </main>
  );
};

export default Register;

