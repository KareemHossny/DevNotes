const { validationResult } = require("express-validator");
const { fail } = require("../utils/response");

const validate = (req, res, next) => {
  const result = validationResult(req);
  if (result.isEmpty()) return next();

  const errors = result.array().map((err) => ({
    field: err.path,
    message: err.msg,
  }));

  return fail(res, "Validation failed", 400, { errors });
};

module.exports = { validate };
