const mongoose = require("mongoose");

const ArcProgressSchema = new mongoose.Schema(
  {
    arcId: { type: String, required: true },
    watchedEpisodes: { type: Number, required: true, min: 0, default: 0 },
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