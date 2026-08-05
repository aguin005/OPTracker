const mongoose = require("mongoose");

const ArcProgressSchema = new mongoose.Schema(
  {
    arcId: { type: String, required: true },
    // Specific episode numbers watched within this arc (arc-relative, 1-indexed),
    // not a running count, so episodes can be marked out of order.
    watchedEpisodes: { type: [Number], default: [] },
  },
  { _id: false }
);

const WatchProgressSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    arcs: { type: [ArcProgressSchema], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("WatchProgress", WatchProgressSchema);