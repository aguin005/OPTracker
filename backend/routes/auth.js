const express = require("express");
const passport = require("passport");
const rateLimit = require("express-rate-limit");

const router = express.Router();

// Keeps the login flow from being hammered.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
});

router.get(
  "/google",
  authLimiter,
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  authLimiter,
  passport.authenticate("google", {
    failureRedirect: `${process.env.CLIENT_URL}/login-failed`,
  }),
  (req, res) => {
    // Successful login, send them back into the app.
    res.redirect(process.env.CLIENT_URL);
  }
);

router.get("/me", (req, res) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return res.json({
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      avatarUrl: req.user.avatarUrl,
      avatarChoice: req.user.avatarChoice,
    });
  }
  return res.status(200).json({ user: null });
});

router.post("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.session.destroy(() => {
      res.clearCookie("connect.sid");
      res.status(200).json({ ok: true });
    });
  });
});

module.exports = router;