import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import passport from "passport";
import {
  configureGoogleAuth,
  getCurrentAdmin,
  logoutAdmin,
  routeGuard,
} from "../src/controller/auth.controller.js";

const validGoogleConfig = {
  GOOGLE_CLIENT_ID: "client-id",
  GOOGLE_CLIENT_SECRET: "client-secret",
  GOOGLE_CALLBACK_URL: "http://localhost:3000/api/auth/google/callback",
  CLIENT_URL: "http://localhost:5173",
  ADMIN_EMAILS: "Admin@example.com, second@example.com",
};

const setGoogleConfig = (overrides = {}) => {
  for (const [key, value] of Object.entries({
    ...validGoogleConfig,
    ...overrides,
  })) {
    vi.stubEnv(key, value);
  }
};

const verifyGoogleProfile = (profile) =>
  new Promise((resolve, reject) => {
    passport._strategy("google")._verify(
      "access-token",
      "refresh-token",
      profile,
      (error, user) => {
        if (error) {
          reject(error);
        } else {
          resolve(user);
        }
      },
    );
  });

beforeEach(() => {
  vi.unstubAllEnvs();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("admin authentication controller", () => {
  it("requires Google OAuth configuration", () => {
    vi.stubEnv("GOOGLE_CLIENT_ID", "");

    expect(() => configureGoogleAuth()).toThrow(
      "GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK_URL, and CLIENT_URL must be configured.",
    );
  });

  it("requires at least one valid admin email", () => {
    setGoogleConfig({ ADMIN_EMAILS: " , " });

    expect(() => configureGoogleAuth()).toThrow(
      "ADMIN_EMAILS must contain one or more valid email addresses.",
    );

    setGoogleConfig({ ADMIN_EMAILS: "not-an-email" });
    expect(() => configureGoogleAuth()).toThrow(
      "ADMIN_EMAILS must contain one or more valid email addresses.",
    );
  });

  it("requires production OAuth URLs to use HTTPS", () => {
    setGoogleConfig({ NODE_ENV: "production" });

    expect(() => configureGoogleAuth()).toThrow(
      "CLIENT_URL must be an origin without a trailing slash, and production OAuth URLs must use HTTPS.",
    );
  });

  it("accepts verified allowlisted emails case-insensitively", async () => {
    setGoogleConfig();
    configureGoogleAuth();

    await expect(
      verifyGoogleProfile({
        emails: [{ value: "ADMIN@example.com", verified: true }],
      }),
    ).resolves.toEqual({ email: "admin@example.com" });

    await expect(
      verifyGoogleProfile({
        emails: [{ value: "second@example.com", verified: true }],
      }),
    ).resolves.toEqual({ email: "second@example.com" });
  });

  it("rejects unverified and non-allowlisted Google emails", async () => {
    setGoogleConfig();
    configureGoogleAuth();

    await expect(
      verifyGoogleProfile({
        emails: [{ value: "admin@example.com", verified: false }],
      }),
    ).resolves.toBe(false);

    await expect(
      verifyGoogleProfile({
        emails: [{ value: "other@example.com", verified: true }],
      }),
    ).resolves.toBe(false);
  });

  it("allows an authenticated admin through the route guard", () => {
    const next = vi.fn();

    routeGuard({ session: { isAdmin: true } }, {}, next);

    expect(next).toHaveBeenCalledOnce();
  });

  it("rejects a request without an admin session", () => {
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    routeGuard({ session: {} }, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Unauthorized: You are not an admin.",
    });
  });

  it("returns the current admin for an authenticated session", () => {
    const res = { json: vi.fn() };

    getCurrentAdmin(
      { session: { isAdmin: true, adminEmail: "admin@example.com" } },
      res,
    );

    expect(res.json).toHaveBeenCalledWith({
      authenticated: true,
      email: "admin@example.com",
    });
  });

  it("returns 401 when no admin is logged in", () => {
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    getCurrentAdmin({ session: {} }, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ authenticated: false });
  });

  it("destroys the session and clears its cookie on logout", () => {
    const req = {
      session: {
        destroy: vi.fn((callback) => callback(null)),
      },
    };
    const res = {
      clearCookie: vi.fn(),
      status: vi.fn().mockReturnThis(),
      end: vi.fn(),
    };

    logoutAdmin(req, res, vi.fn());

    expect(req.session.destroy).toHaveBeenCalledOnce();
    expect(res.clearCookie).toHaveBeenCalledWith(
      "berry-matcha.sid",
      expect.objectContaining({ httpOnly: true, sameSite: "lax" }),
    );
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.end).toHaveBeenCalledOnce();
  });
});
