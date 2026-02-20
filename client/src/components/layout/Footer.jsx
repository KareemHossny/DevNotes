const Footer = () => {
  return (
    <footer className="border-t border-slate-200/90 bg-white/70 backdrop-blur dark:border-slate-700/70 dark:bg-slate-900/70">
      <div className="app-shell flex min-h-[72px] flex-col justify-center gap-1 py-3 text-sm text-slate-500 dark:text-slate-400 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-semibold">DevNotes</p>
        <p>Built for developers who write and ship.</p>
      </div>
    </footer>
  );
};

export default Footer;
