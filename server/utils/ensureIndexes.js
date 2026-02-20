const mongoose = require("mongoose");

const ensureUserIndexes = async () => {
  try {
    const db = mongoose.connection.db;
    if (!db) return;

    const users = db.collection("users");
    const indexes = await users.indexes();
    const legacyIndex = indexes.find((idx) => idx.name === "username_1");

    if (legacyIndex) {
      await users.dropIndex("username_1");
      console.log("Dropped legacy index: users.username_1");
    }
  } catch (err) {
    const ignorable = err?.codeName === "NamespaceNotFound";
    if (!ignorable) {
      console.error("Index check failed:", err.message);
    }
  }
};

module.exports = { ensureUserIndexes };
