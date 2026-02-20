import { FiAlertCircle, FiInbox, FiLoader } from "react-icons/fi";

const StateNotice = ({
  variant = "info",
  title,
  message,
  actionLabel,
  onAction,
}) => {
  const variantStyles = {
    loading: {
      section:
        "border-sky-200 bg-sky-50/70 dark:border-sky-700/60 dark:bg-sky-500/10",
      icon: <FiLoader className="animate-spin text-sky-600 dark:text-sky-300" />,
    },
    error: {
      section:
        "border-rose-200 bg-rose-50/70 dark:border-rose-700/60 dark:bg-rose-500/10",
      icon: <FiAlertCircle className="text-rose-600 dark:text-rose-300" />,
    },
    empty: {
      section:
        "border-indigo-200 bg-indigo-50/70 dark:border-indigo-700/60 dark:bg-indigo-500/10",
      icon: <FiInbox className="text-indigo-600 dark:text-indigo-300" />,
    },
    info: {
      section:
        "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900",
      icon: <FiAlertCircle className="text-slate-600 dark:text-slate-300" />,
    },
  };

  const currentVariant = variantStyles[variant] || variantStyles.info;

  return (
    <section
      className={`rounded-2xl border p-5 shadow-sm sm:p-6 ${currentVariant.section}`}
      role="status"
    >
      <div className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white/70 text-lg dark:bg-slate-900/60">
        {currentVariant.icon}
      </div>
      {title && <h2 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h2>}
      {message && <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{message}</p>}
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-4 inline-flex h-10 items-center justify-center rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-indigo-500"
        >
          {actionLabel}
        </button>
      )}
    </section>
  );
};

export default StateNotice;
