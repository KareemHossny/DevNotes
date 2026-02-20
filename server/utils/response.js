const ok = (res, data = null, meta = undefined, status = 200) => {
  return res.status(status).json({
    success: true,
    data,
    error: null,
    ...(meta ? { meta } : {}),
  });
};

const fail = (res, error, status = 400, meta = undefined) => {
  return res.status(status).json({
    success: false,
    data: null,
    error,
    ...(meta ? { meta } : {}),
  });
};

module.exports = { ok, fail };
