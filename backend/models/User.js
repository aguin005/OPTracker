const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    googleId: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true },
    name: { type: String, required: true },
    avatarUrl: { type: String },
    // null/unset means "use the real Google photo". Any other value is the
    // id of a crew avatar the user picked instead, see the CREW list in
    // OnePieceTracker.jsx for valid ids.
    avatarChoice: { type: String, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);