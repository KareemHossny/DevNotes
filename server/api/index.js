const app = require("../server");
const { initializeApp } = app;

module.exports = async (req, res) => {
  try {
    await initializeApp();
    return app(req, res);
  } catch (err) {
    return res.status(500).json({
      success: false,
      data: null,
      error: "Server initialization failed",
    });
  }
};
