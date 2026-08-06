const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // We never store the Google access or refresh token, since this
        // app doesn't need to call Google APIs later, it only needs to
        // know who the person is. We do refresh name/email/avatar on every
        // login though, so if any of those were missing or wrong on the
        // very first sign-in, or changed since, they get corrected here
        // instead of staying stale forever.
        const user = await User.findOneAndUpdate(
          { googleId: profile.id },
          {
            $set: {
              email: profile.emails?.[0]?.value,
              name: profile.displayName,
              avatarUrl: profile.photos?.[0]?.value,
            },
          },
          { upsert: true, new: true }
        );

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

// Only the Mongo _id goes into the session, keeps the session store small.
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;