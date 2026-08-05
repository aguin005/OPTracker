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

// Toggle a single episode within a single arc on or off.
router.patch("/anime", async (req, res, next) => {
  try {
    const { arcId, episodeNumber, watched } = req.body;

    if (typeof arcId !== "string" || typeof episodeNumber !== "number" || typeof watched !== "boolean") {
      return res.status(400).json({
        error: "arcId (string), episodeNumber (number), and watched (boolean) are required.",
      });
    }

    // Make sure a progress document exists for this user.
    await WatchProgress.updateOne(
      { userId: req.user._id },
      { $setOnInsert: { userId: req.user._id } },
      { upsert: true }
    );

    // Make sure this arc has an entry in the arcs array.
    await WatchProgress.updateOne(
      { userId: req.user._id, "arcs.arcId": { $ne: arcId } },
      { $push: { arcs: { arcId, watchedEpisodes: [] } } }
    );

    const update = watched
      ? { $addToSet: { "arcs.$[arc].watchedEpisodes": episodeNumber } }
      : { $pull: { "arcs.$[arc].watchedEpisodes": episodeNumber } };

    await WatchProgress.updateOne({ userId: req.user._id }, update, {
      arrayFilters: [{ "arc.arcId": arcId }],
    });

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// Set every watched episode for an arc at once, used for "mark whole arc" shortcuts.
router.patch("/anime/bulk", async (req, res, next) => {
  try {
    const { arcId, watchedEpisodes } = req.body;

    if (typeof arcId !== "string" || !Array.isArray(watchedEpisodes)) {
      return res.status(400).json({ error: "arcId (string) and watchedEpisodes (array of numbers) are required." });
    }

    const doc = await WatchProgress.findOneAndUpdate(
      { userId: req.user._id, "arcs.arcId": arcId },
      { $set: { "arcs.$.watchedEpisodes": watchedEpisodes } },
      { new: true }
    );

    if (!doc) {
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