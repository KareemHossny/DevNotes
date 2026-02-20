import { useEffect, useMemo, useState } from "react";
import { FiEdit3, FiLogIn, FiLogOut, FiMenu, FiMoon, FiPlusCircle, FiSearch, FiSun, FiUser, FiX } from "react-icons/fi";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { ROUTES } from "../../constants/routes";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import usePostSuggestions from "../../hooks/usePostSuggestions";
import Logo from "./Logo";

const navLinkClass = ({ isActive }) =>
  [
    "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors duration-200",
    isActive
      ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300"
      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white",
  ].join(" ");

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const { suggestions, clearSuggestions } = usePostSuggestions(searchInput);

  const homeSearch = useMemo(() => {
    if (!location.search) return "";
    const params = new URLSearchParams(location.search);
    return params.get("search") || "";
  }, [location.search]);

  useEffect(() => {
    if (location.pathname === ROUTES.POSTS_ROOT) setSearchInput(homeSearch);
  }, [homeSearch, location.pathname]);

  useEffect(() => {
    setIsOpen(false);
    clearSuggestions();
  }, [location.pathname, clearSuggestions]);

  const submitSearch = (e) => {
    e.preventDefault();
    const query = searchInput.trim();
    if (!query) {
      navigate(ROUTES.HOME);
      return;
    }
    navigate(`${ROUTES.POSTS_ROOT}?search=${encodeURIComponent(query)}`);
    clearSuggestions();
  };

  const onLogout = () => {
    setIsOpen(false);
    clearSuggestions();
    logout();
    navigate(ROUTES.HOME, { replace: true });
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/85 shadow-nav backdrop-blur-xl transition-colors duration-300 dark:border-slate-700/70 dark:bg-slate-900/85">
      <div className="app-shell px-6 lg:px-12">
        <div className="flex min-h-16 items-center justify-between gap-3 py-2">
          <Logo imageClassName="h-10 w-10 sm:h-11 sm:w-11" textClassName="text-lg" />

          <div className="flex items-center gap-2">
            <nav className="hidden items-center gap-1 md:flex">
              {!isAuthenticated && (
                <>
                  <NavLink to={ROUTES.LOGIN} className={navLinkClass}>
                    <FiLogIn />
                    Login
                  </NavLink>
                  <NavLink to={ROUTES.REGISTER} className={navLinkClass}>
                    <FiEdit3 />
                    Register
                  </NavLink>
                </>
              )}

              {isAuthenticated && (
                <>
                  <span className="hidden rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 lg:inline">
                    {user?.name ? `Hi, ${user.name.split(" ")[0]}` : "Account"}
                  </span>
                  <NavLink to={ROUTES.POST_NEW} className={navLinkClass}>
                    <FiPlusCircle />
                    Create Post
                  </NavLink>
                  <NavLink to={ROUTES.PROFILE} className={navLinkClass}>
                    <FiUser />
                    Profile
                  </NavLink>
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-500/10"
                    onClick={onLogout}
                  >
                    <FiLogOut />
                    Logout
                  </button>
                </>
              )}
            </nav>

            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              {theme === "light" ? <FiMoon /> : <FiSun />}
              <span className="hidden sm:inline">{theme === "light" ? "Dark" : "Light"}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsOpen((prev) => !prev)}
              aria-label="Toggle menu"
              aria-expanded={isOpen}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 md:hidden"
            >
              {isOpen ? <FiX size={18} /> : <FiMenu size={18} />}
            </button>
          </div>
        </div>

        <div className="relative pb-3">
          <form onSubmit={submitSearch} className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative w-full">
              <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
              <input
                type="text"
                placeholder="Search posts by title or tag"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                aria-label="Search posts"
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm text-slate-900 outline-none transition-colors focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
            <button
              type="submit"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-3 text-sm font-semibold text-white transition duration-200 hover:bg-indigo-500 sm:w-auto"
            >
              <FiSearch />
              <span className="hidden sm:inline">Search</span>
            </button>
          </form>

          {suggestions.length > 0 && (
            <div className="absolute inset-x-0 top-[calc(100%+6px)] z-30 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
              {suggestions.map((post) => (
                <button
                  key={post._id}
                  type="button"
                  className="w-full px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                  onClick={() => {
                    navigate(ROUTES.postDetails(post._id));
                    clearSuggestions();
                  }}
                >
                  {post.title}
                </button>
              ))}
            </div>
          )}
        </div>

        <div
          className={`overflow-hidden transition-all duration-300 md:hidden ${
            isOpen ? "max-h-80 pb-3 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <nav className="grid gap-1 rounded-xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-700 dark:bg-slate-900">
            {!isAuthenticated && (
              <>
                <NavLink to={ROUTES.LOGIN} className={navLinkClass}>
                  <FiLogIn />
                  Login
                </NavLink>
                <NavLink to={ROUTES.REGISTER} className={navLinkClass}>
                  <FiEdit3 />
                  Register
                </NavLink>
              </>
            )}

            {isAuthenticated && (
              <>
                <NavLink to={ROUTES.POST_NEW} className={navLinkClass}>
                  <FiPlusCircle />
                  Create Post
                </NavLink>
                <NavLink to={ROUTES.PROFILE} className={navLinkClass}>
                  <FiUser />
                  Profile
                </NavLink>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-500/10"
                  onClick={onLogout}
                >
                  <FiLogOut />
                  Logout
                </button>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
