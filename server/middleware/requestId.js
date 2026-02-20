const { randomUUID } = require("crypto");

const requestId = () => (req, res, next) => {
  const incoming = req.headers["x-request-id"];
  const id = typeof incoming === "string" ? incoming : randomUUID();
  req.id = id;
  res.setHeader("x-request-id", id);
  return next();
};

module.exports = requestId;
