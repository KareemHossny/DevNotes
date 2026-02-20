import Spinner from "./Spinner";

const PageLoader = ({ label = "Loading", className = "" }) => {
  return (
    <div className={`grid min-h-[60vh] place-items-center ${className}`}>
      <Spinner label={label} className="text-slate-500 dark:text-slate-400" />
    </div>
  );
};

export default PageLoader;
