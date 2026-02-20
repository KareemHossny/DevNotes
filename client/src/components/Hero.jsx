import { FiArrowRight, FiBookOpen } from "react-icons/fi";
import { Link } from "react-router-dom";
import { ROUTES } from "../constants/routes";

const DEV_TAGS = ["React", "Node.js", "MongoDB", "Express","JavaScript"];

const Hero = ({ isAuthenticated, postCount, topicCount, likeCount, onExplorePosts }) => {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-br from-white via-slate-50 to-indigo-50/60 px-5 py-8 shadow-sm transition-colors duration-300 dark:border-slate-700/70 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 sm:px-7 sm:py-10 lg:px-10 lg:py-12">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,rgba(99,102,241,0.16),transparent_40%),radial-gradient(circle_at_90%_90%,rgba(14,165,233,0.12),transparent_42%)] dark:bg-[radial-gradient(circle_at_10%_10%,rgba(129,140,248,0.18),transparent_40%),radial-gradient(circle_at_90%_90%,rgba(56,189,248,0.16),transparent_42%)]" />
      <div className="relative grid items-center gap-8 lg:grid-cols-2 lg:gap-10">
        <div className="space-y-6">
          <div className="space-y-4">
            <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-slate-900 dark:text-white sm:text-4xl lg:text-[2.6rem]">
Where Developers Turn<span className="mt-1 block text-indigo-600 dark:text-indigo-300">Experience Into Knowledge.
              </span>
            </h1>
            <p className="max-w-xl text-base text-slate-600 dark:text-slate-300 sm:text-lg">
DevNotes is a modern publishing space for developers to document architecture decisions, technical breakdowns, and real-world build logs — beautifully and clearly.            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to={isAuthenticated ? ROUTES.POST_NEW : ROUTES.LOGIN}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-indigo-500"
            >
              {isAuthenticated ? "Write a Post" : "Start Writing"}
              <FiArrowRight className="text-base" />
            </Link>
            <button
              type="button"
              onClick={onExplorePosts}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white/80 px-5 py-3 text-sm font-semibold text-slate-700 transition duration-200 hover:-translate-y-0.5 hover:border-indigo-300 hover:text-indigo-700 dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-100 dark:hover:border-indigo-300 dark:hover:text-indigo-200"
            >
              <FiBookOpen className="text-base" />
              Explore Posts
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {DEV_TAGS.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-200"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="grid max-w-xl grid-cols-3 gap-3 pt-1">
            <div className="rounded-xl border border-slate-200 bg-white/80 p-3 text-center dark:border-slate-700 dark:bg-slate-800/70">
              <p className="text-xl font-bold text-slate-900 dark:text-white">{postCount}</p>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Posts</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white/80 p-3 text-center dark:border-slate-700 dark:bg-slate-800/70">
              <p className="text-xl font-bold text-slate-900 dark:text-white">{topicCount}</p>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Topics</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white/80 p-3 text-center dark:border-slate-700 dark:bg-slate-800/70">
              <p className="text-xl font-bold text-slate-900 dark:text-white">{likeCount}</p>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Likes</p>
            </div>
          </div>
        </div>

        <div className="mx-auto w-full max-w-xl">
          <div className="group relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white/70 p-2 shadow-xl transition duration-300 dark:border-slate-700/60 dark:bg-slate-900/70">
            <picture>
              <source srcSet="/Copilot_20260216_021355.webp" type="image/webp" />
              <img
                src="/Copilot_20260216_021355.png"
                alt="DevNotes hero visual"
                className="h-full w-full rounded-2xl object-cover transition duration-500 group-hover:scale-[1.01]"
                loading="lazy"
              />
            </picture>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
