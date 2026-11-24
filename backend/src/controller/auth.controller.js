import passport from "passport";
import dotenv from "dotenv";

dotenv.config();
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

export const configureGoogleAuth = () => {
  const {
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_CALLBACK_URL,
    CLIENT_URL,
  } = process.env;
  const adminEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  if (
    !GOOGLE_CLIENT_ID ||
    !GOOGLE_CLIENT_SECRET ||
    !GOOGLE_CALLBACK_URL ||
    !CLIENT_URL
  ) {
    throw new Error(
      "GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK_URL, and CLIENT_URL must be configured.",
    );
  }
  let clientOrigin;
  let callbackURL;
  try {
    clientOrigin = new URL(CLIENT_URL);
    callbackURL = new URL(GOOGLE_CALLBACK_URL);
  } catch {
    throw new Error("CLIENT_URL and GOOGLE_CALLBACK_URL must be valid URLs.");
  }
  if (
    clientOrigin.origin !== CLIENT_URL ||
    !["http:", "https:"].includes(clientOrigin.protocol) ||
    (process.env.NODE_ENV === "production" &&
      (clientOrigin.protocol !== "https:" || callbackURL.protocol !== "https:"))
  ) {
    throw new Error(
      "CLIENT_URL must be an origin without a trailing slash, and production OAuth URLs must use HTTPS.",
    );
  }
  if (
    adminEmails.length === 0 ||
    adminEmails.some((email) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
  ) {
    throw new Error(
      "ADMIN_EMAILS must contain one or more valid email addresses.",
    );
  }

  passport.use(
    "google",
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: GOOGLE_CALLBACK_URL,
        state: true,
      },
      (_accessToken, _refreshToken, profile, done) => {
        const verifiedEmail = profile.emails?.find(
          (email) => email.verified === true,
        )?.value;
        const email = verifiedEmail?.trim().toLowerCase();

        if (!email || !adminEmails.includes(email)) {
          return done(null, false);
        }

        return done(null, { email });
      },
    ),
  );
};

export const googleCallback = (req, res, next) => {
  passport.authenticate("google", { session: false }, (error, user) => {
    if (error) {
      console.error("Google OAuth callback failed:", error.message);
      return res.redirect(`${process.env.CLIENT_URL}/admin?error=login_failed`);
    }

    if (!user) {
      return res.redirect(`${process.env.CLIENT_URL}/admin?error=unauthorized`);
    }

    req.session.regenerate((sessionError) => {
      if (sessionError) {
        return next(sessionError);
      }

      req.session.isAdmin = true;
      req.session.adminEmail = user.email;
      req.session.save((saveError) => {
        if (saveError) {
          return next(saveError);
        }

        return res.redirect(`${process.env.CLIENT_URL}/admin`);
      });
    });
  })(req, res, next);
};

export const getCurrentAdmin = (req, res) => {
  if (req.session?.isAdmin !== true) {
    return res.status(401).json({ authenticated: false });
  }

  return res.json({
    authenticated: true,
    email: req.session.adminEmail,
  });
};

export const logoutAdmin = (req, res, next) => {
  req.session.destroy((error) => {
    if (error) {
      return next(error);
    }

    res.clearCookie("berry-matcha.sid", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
    return res.status(204).end();
  });
};

export const routeGuard = (req, res, next) => {
  if (req.session?.isAdmin === true) {
    return next();
  }

  return res.status(401).json({
    success: false,
    message: "Unauthorized: You are not an admin.",
  });
};
