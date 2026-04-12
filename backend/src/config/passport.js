const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");

/**
 * Passport Google OAuth 2.0 Strategy
 * ────────────────────────────────────
 * Called by passport after Google redirects back with the user's profile.
 *
 * Flow:
 *  1. User clicks "Continue with Google"
 *  2. Browser → GET /api/auth/google → passport.authenticate('google') → Google consent screen
 *  3. Google → GET /api/auth/google/callback?code=...
 *  4. Passport exchanges code for profile and calls this verify function
 *  5. We find-or-create the user in MongoDB
 *  6. `done(null, user)` attaches the user to req.user
 *  7. Our callback route generates a JWT and redirects to the frontend
 */
// Temporarily disable Google OAuth for testing
if (process.env.GOOGLE_CLIENT_ID) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
        scope: ["profile", "email"],
      },

    async (accessToken, refreshToken, profile, done) => {
      try {
        const googleId = profile.id;
        const email = profile.emails?.[0]?.value;
        const name = profile.displayName || profile.name?.givenName || "User";
        const avatar = profile.photos?.[0]?.value || null;
        const emailVerified = profile.emails?.[0]?.verified ?? false;

        if (!email) {
          return done(
            new Error(
              "No email returned from Google. Please grant email permissions."
            ),
            null
          );
        }

        // ── 1. Try to find by googleId first (returning Google user) ──────
        let user = await User.findOne({ googleId });

        if (user) {
          // Update avatar in case it changed
          user.avatar = avatar;
          user.lastLogin = new Date();
          await user.save({ validateBeforeSave: false });
          return done(null, user);
        }

        // ── 2. Try to find by email (existing email/password account) ─────
        user = await User.findOne({ email });

        if (user) {
          // Link the Google account to the existing email account
          user.googleId = googleId;
          user.avatar = avatar || user.avatar;
          user.isEmailVerified = true; // Google confirms the email
          user.lastLogin = new Date();
          await user.save({ validateBeforeSave: false });
          return done(null, user);
        }

        // ── 3. Brand-new user — create account ────────────────────────────
        user = await User.create({
          googleId,
          name,
          email,
          avatar,
          isEmailVerified: emailVerified,
          lastLogin: new Date(),
          // No password — Google is the auth provider
        });

        console.log(`✅ New Google user created: ${user.email}`);
        return done(null, user);
      } catch (error) {
        // Duplicate key race condition — two concurrent first-logins
        if (error.code === 11000) {
          try {
            const existing = await User.findOne({
              $or: [
                { googleId: profile.id },
                { email: profile.emails?.[0]?.value },
              ],
            });
            if (existing) return done(null, existing);
          } catch (retryErr) {
            return done(retryErr, null);
          }
        }
        console.error("Google OAuth strategy error:", error);
        return done(error, null);
      }
    }
  )
);

/**
 * Serialize / deserialize are required by Passport even when we aren't
 * using sessions for the main auth flow. They prevent Passport from
 * throwing "Failed to serialize user into session" errors.
 */
passport.serializeUser((user, done) => done(null, user._id.toString()));

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

}

module.exports = passport;
