const express = require("express");

const router = express.Router();

router.use("/auth", require("./authRoutes"));
router.use("/posts", require("./postRoutes"));

module.exports = router;
