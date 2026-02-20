import { Link, useLocation, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiLogOut, FiMail, FiShield, FiUser } from "react-icons/fi";
import { Helmet } from "react-helmet-async";
import { useAuth } from "../context/AuthContext";
import StateNotice from "../components/StateNotice";
import { ROUTES } from "../constants/routes";
import { buildCanonicalUrl } from "../utils/seo";

const Profile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const handleLogout = () => {
    logout();
    navigate(ROUTES.HOME, { replace: true });
  };

  if (!user) {
    return (
      <main>
        <StateNotice
          variant="empty"
          title="Profile unavailable"
          message="Your session is active but user data is missing."
          actionLabel="Go Home"
          onAction={() => navigate(ROUTES.HOME)}
        />
      </main>
    );
  }

  const canonicalUrl = buildCanonicalUrl(location.pathname);

  return (
    <main>
      <Helmet>
        <title>DevNotes | Profile</title>
        <meta name="description" content="Manage your DevNotes profile and account details." />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content="DevNotes | Profile" />
        <meta property="og:description" content="Manage your DevNotes profile and account details." />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/Copilot_20260216_032458.png" />
        <meta property="og:url" content={canonicalUrl} />
      </Helmet>
      <section className="mx-auto w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Profile</h1>
        <div className="mt-5 grid gap-3 text-sm">
          <p className="inline-flex items-center gap-2 text-slate-700 dark:text-slate-200">
            <FiUser className="text-indigo-600 dark:text-indigo-300" />
            {user.name}
          </p>
          <p className="inline-flex items-center gap-2 text-slate-700 dark:text-slate-200">
            <FiMail className="text-indigo-600 dark:text-indigo-300" />
            {user.email}
          </p>
          <p className="inline-flex items-center gap-2 capitalize text-slate-700 dark:text-slate-200">
            <FiShield className="text-indigo-600 dark:text-indigo-300" />
            {user.role}
          </p>
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          <Link
            to={ROUTES.HOME}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-700 transition hover:border-indigo-300 hover:text-indigo-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-indigo-400 dark:hover:text-indigo-200"
          >
            <FiArrowLeft />
            Back Home
          </Link>
          <button
            onClick={handleLogout}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 text-sm font-semibold text-white transition duration-200 hover:bg-rose-500"
          >
            <FiLogOut />
            Logout
          </button>
        </div>
      </section>
    </main>
  );
};

export default Profile;
