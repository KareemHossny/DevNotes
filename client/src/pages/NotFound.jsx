import { Link, useLocation } from "react-router-dom";
import { FiArrowLeftCircle } from "react-icons/fi";
import { Helmet } from "react-helmet-async";
import { ROUTES } from "../constants/routes";
import { buildCanonicalUrl } from "../utils/seo";

const NotFound = () => {
  const location = useLocation();
  const canonicalUrl = buildCanonicalUrl(location.pathname);

  return (
    <main className="grid min-h-[60vh] place-items-center">
      <Helmet>
        <title>DevNotes | 404</title>
        <meta name="description" content="Page not found on DevNotes." />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content="DevNotes | 404" />
        <meta property="og:description" content="Page not found on DevNotes." />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/Copilot_20260216_032458.webp" />
        <meta property="og:url" content={canonicalUrl} />
      </Helmet>
      <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">404</h1>
        <p className="mt-3 text-slate-600 dark:text-slate-300">
          The page you requested does not exist.
        </p>
        <Link
          to={ROUTES.HOME}
          className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-indigo-500"
        >
          <FiArrowLeftCircle />
          Back Home
        </Link>
      </section>
    </main>
  );
};

export default NotFound;
