const cache = (seconds, options = {}) => (req, res, next) => {
  if (req.method !== "GET") return next();

  const directives = [
    "public",
    `max-age=${seconds}`,
    `stale-while-revalidate=${options.swr || Math.min(seconds * 5, 300)}`,
  ];

  if (options.sMaxage) {
    directives.push(`s-maxage=${options.sMaxage}`);
  }

  // For CDN/proxy caches that respect Surrogate-Control.
  if (options.surrogateMaxAge) {
    res.setHeader("Surrogate-Control", `max-age=${options.surrogateMaxAge}`);
  }

  res.setHeader("Cache-Control", directives.join(", "));
  return next();
};

module.exports = { cache };
