const express = require("express");
const ensureAuth = require("../middleware/ensureAuth");
const User = require("../models/User");

const router = express.Router();

router.use(ensureAuth);

// Pass { choice: "zoro" } to pick a crew avatar, or { choice: null } to
// go back to the real Google photo.
router.patch("/avatar", async (req, res, next) => {
  try {
    const { choice } = req.body;

    if (choice !== null && typeof choice !== "string") {
      return res.status(400).json({ error: "choice must be a string id or null." });
    }

    await User.updateOne({ _id: req.user._id }, { $set: { avatarChoice: choice } });

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;