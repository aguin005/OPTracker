const express = require("express");
const ensureAuth = require("../middleware/ensureAuth");
const WatchProgress = require("../models/WatchProgress");
const OmnibusCollection = require("../models/OmnibusCollection");

const router = express.Router();

// Everything below requires a signed-in session.
router.use(ensureAuth);

router.get("/", async (req, res, next) => {
  try {
    const [watch, omnibus] = await Promise.all([
      WatchProgress.findOne({ userId: req.user._id }),
      OmnibusCollection.findOne({ userId: req.user._id }),
    ]);

    res.json({
      arcs: watch?.arcs ?? [],
      ownedOmnibus: omnibus?.ownedOmnibus ?? [],
    });
  } catch (err) {
    next(err);
  }
});

router.patch("/anime", async (req, res, next) => {
  try {
    const { arcId, watchedEpisodes } = req.body;

    if (typeof arcId !== "string" || typeof watchedEpisodes !== "number" || watchedEpisodes < 0) {
      return res.status(400).json({ error: "arcId and a non-negative watchedEpisodes number are required." });
    }

    const doc = await WatchProgress.findOneAndUpdate(
      { userId: req.user._id, "arcs.arcId": arcId },
      { $set: { "arcs.$.watchedEpisodes": watchedEpisodes } },
      { new: true }
    );

    if (!doc) {
      // Arc entry doesn't exist yet for this user, add it.
      await WatchProgress.findOneAndUpdate(
        { userId: req.user._id },
        { $push: { arcs: { arcId, watchedEpisodes } } },
        { upsert: true, new: true }
      );
    }

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

router.patch("/manga", async (req, res, next) => {
  try {
    const { omnibusNumber, owned } = req.body;

    if (typeof omnibusNumber !== "number" || typeof owned !== "boolean") {
      return res.status(400).json({ error: "omnibusNumber (number) and owned (boolean) are required." });
    }

    const update = owned
      ? { $addToSet: { ownedOmnibus: omnibusNumber } }
      : { $pull: { ownedOmnibus: omnibusNumber } };

    await OmnibusCollection.findOneAndUpdate({ userId: req.user._id }, update, {
      upsert: true,
      new: true,
    });

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;