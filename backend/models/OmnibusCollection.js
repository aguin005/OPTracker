const mongoose = require("mongoose");

const OmnibusCollectionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    ownedOmnibus: { type: [Number], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("OmnibusCollection", OmnibusCollectionSchema);