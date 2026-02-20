const Spinner = ({ className = "", label = "Loading" }) => {
  return (
    <span
      className={`inline-flex items-center ${className}`}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <span
        className="flex items-center gap-1 text-base font-semibold text-current"
        aria-hidden="true"
      >
        <span className="inline-flex items-center gap-0.5">
          <span className="animate-pulse text-current">{"<"}</span>
          <span className="animate-pulse text-current">{" />"}</span>
        </span>
        <span className="h-4 w-1 animate-pulse rounded-full bg-current" />
      </span>
    </span>
  );
};

export default Spinner;
