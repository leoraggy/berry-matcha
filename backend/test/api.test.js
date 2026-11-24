import express from "express";
import session from "express-session";
import passport from "passport";
import request from "supertest";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import drinkRouter from "../src/routes/drink.routes.js";
import hoursRouter from "../src/routes/hours.routes.js";
import orderRouter from "../src/routes/order.routes.js";
import cartRouter from "../src/routes/cart.routes.js";
import toppingRouter from "../src/routes/topping.routes.js";
import authRouter from "../src/routes/auth.routes.js";

const mocks = vi.hoisted(() => ({
  drinkFind: vi.fn(),
  toppingFind: vi.fn(),
  toppingSort: vi.fn(),
  hoursFind: vi.fn(),
}));

vi.mock("../src/model/drink.model.js", () => ({
  default: { find: mocks.drinkFind },
}));

vi.mock("../src/model/order.model.js", () => ({
  default: { collection: { name: "orders" } },
}));

vi.mock("../src/model/topping.model.js", () => ({
  default: { find: mocks.toppingFind },
}));

vi.mock("../src/model/hours.model.js", () => ({
  default: { find: mocks.hoursFind },
}));

vi.mock("stripe", () => ({
  default: class Stripe {},
}));

const createRouterTestApp = () => {
  const app = express();
  app.use(express.json());
  app.use(
    session({
      secret: "vitest-session-secret-longer-than-thirty-two-characters",
      resave: false,
      saveUninitialized: false,
    }),
  );
  app.use(passport.initialize());
  app.use("/api/auth", authRouter);
  app.use("/api/drinks", drinkRouter);
  app.use("/api/hours", hoursRouter);
  app.use("/api/orders", orderRouter);
  app.use("/api/cart", cartRouter);
  app.use("/api/toppings", toppingRouter);
  return app;
};

let app;

beforeAll(() => {
  app = createRouterTestApp();
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe("API routers", () => {
  it("returns drinks from the catalog", async () => {
    const drinks = [
      { _id: "drink-1", name: "Berry Matcha", price: 6.5, category: "Matcha" },
    ];
    mocks.drinkFind.mockResolvedValue(drinks);

    const response = await request(app).get("/api/drinks");

    expect(response.status).toBe(200);
    expect(response.body).toEqual(drinks);
    expect(mocks.drinkFind).toHaveBeenCalledOnce();
  });

  it("returns available toppings in name order", async () => {
    const toppings = [{ _id: "topping-1", name: "Boba", isAvailable: true }];
    mocks.toppingFind.mockReturnValue({ sort: mocks.toppingSort });
    mocks.toppingSort.mockResolvedValue(toppings);

    const response = await request(app).get("/api/toppings");

    expect(response.status).toBe(200);
    expect(response.body).toEqual(toppings);
    expect(mocks.toppingFind).toHaveBeenCalledWith({ isAvailable: true });
    expect(mocks.toppingSort).toHaveBeenCalledWith({ name: 1 });
  });

  it("returns store hours", async () => {
    const hours = [
      { name: "Southcenter", hours: [{ dayOfTheWeek: "Monday" }] },
    ];
    mocks.hoursFind.mockResolvedValue(hours);

    const response = await request(app).get("/api/hours");

    expect(response.status).toBe(200);
    expect(response.body).toEqual(hours);
  });

  it("returns an empty cart for a new session", async () => {
    const response = await request(app).get("/api/cart");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      items: [],
      totalQuantity: 0,
      totalPrice: 0,
    });
  });

  it("rejects malformed cart items", async () => {
    const response = await request(app)
      .post("/api/cart/items")
      .send({ drinkId: "not-an-object-id" });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: "Invalid cart item." });
  });

  it("rejects unauthenticated access to admin APIs", async () => {
    const responses = await Promise.all([
      request(app).get("/api/auth/me"),
      request(app).get("/api/drinks/sales"),
      request(app).post("/api/drinks/image"),
      request(app).get("/api/orders"),
      request(app).get("/api/orders/507f1f77bcf86cd799439011"),
      request(app).post("/api/orders").send({ name: "Untrusted order" }),
      request(app).put("/api/hours/location-1").send({ hours: [] }),
      request(app).post("/api/toppings").send({ name: "Boba" }),
    ]);

    expect(responses.map(({ status }) => status)).toEqual([
      401, 401, 401, 401, 401, 401, 401, 401,
    ]);
  });
});
