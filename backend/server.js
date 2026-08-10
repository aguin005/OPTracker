require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const passport = require("./config/passport");
const helmet = require("helmet");
const cors = require("cors");
const mongoSanitize = require("express-mongo-sanitize");

const authRoutes = require("./routes/auth");
const progressRoutes = require("./routes/progress");
const userRoutes = require("./routes/user");

const app = express();
const isProd = process.env.NODE_ENV === "production";

// --- Security middleware ---
app.set("trust proxy", 1); // needed for secure cookies behind Render/Railway/Vercel proxies
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);
app.use(express.json());
app.use(mongoSanitize());

// --- Sessions, backed by MongoDB so they persist across server restarts ---
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
    cookie: {
      httpOnly: true,
      secure: isProd, // requires HTTPS, true once deployed
      sameSite: isProd ? "none" : "lax", // "none" needed once frontend and backend are on different domains
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

// --- Routes ---
app.use("/auth", authRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/user", userRoutes);

app.get("/health", (req, res) => res.json({ ok: true }));

// --- Error handler, keeps stack traces out of responses ---
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Something went wrong." });
});

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    const port = process.env.PORT || 5000;
    app.listen(port, () => console.log(`Server running on port ${port}`));
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB", err);
    process.exit(1);
  });