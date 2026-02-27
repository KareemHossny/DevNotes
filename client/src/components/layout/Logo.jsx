import { Link } from "react-router-dom";
import { ROUTES } from "../../constants/routes";

const Logo = ({
  showText = true,
  className = "",
  imageClassName = "",
  textClassName = "",
  to = ROUTES.HOME,
}) => {
  return (
    <Link
      to={to}
      className={`inline-flex items-center gap-1 rounded-xl px-1 py-1 text-slate-900 transition duration-200 hover:-translate-y-0.5 hover:text-indigo-700 dark:text-slate-100 dark:hover:text-indigo-300 ${className}`.trim()}
      aria-label="Go to homepage"
    >
      <picture>
        <source srcSet="/Copilot_20260216_032458.webp" type="image/webp" />
        <img
          src="/Copilot_20260216_032458.webp"
          alt="DevNotes logo"
          className={`h-12 w-12 object-contain rounded-xl shadow-sm ${imageClassName}`.trim()}
          loading="lazy"
        />
      </picture>
      {showText && (
        <span className={`text-lg font-extrabold tracking-tight ${textClassName}`.trim()}>
          DevNotes
        </span>
      )}
    </Link>
  );
};

export default Logo;
