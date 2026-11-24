import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  handleStripeWebhook,
  getOrderDetails,
  postCheckout,
} from "../src/controller/checkout.controller.js";

const mocks = vi.hoisted(() => ({
  retrieve: vi.fn(),
  constructEvent: vi.fn(),
  findByIdAndUpdate: vi.fn(),
  hoursFindOne: vi.fn(),
}));

vi.mock("stripe", () => ({
  default: class Stripe {
    checkout = { sessions: { retrieve: mocks.retrieve } };
    webhooks = { constructEvent: mocks.constructEvent };
  },
}));

vi.mock("../src/model/drink.model.js", () => ({
  default: {},
}));

vi.mock("../src/model/order.model.js", () => ({
  default: { findByIdAndUpdate: mocks.findByIdAndUpdate },
}));

vi.mock("../src/model/topping.model.js", () => ({
  default: {},
}));

vi.mock("../src/model/hours.model.js", () => ({
  default: { findOne: mocks.hoursFindOne },
}));

const response = () => ({
  status: vi.fn().mockReturnThis(),
  json: vi.fn().mockReturnThis(),
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe("checkout controller", () => {
  it("returns the order ID for a paid checkout", async () => {
    mocks.retrieve.mockResolvedValue({
      payment_status: "paid",
      metadata: { orderId: "order-1" },
    });
    const order = {
      _id: { toString: () => "order-1" },
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      name: "Customer",
      email: "customer@example.com",
      phone: "555-0100",
      pickupDate: new Date("2026-01-02T00:00:00.000Z"),
      pickupTime: "10:00",
      location: "Ellensburg",
      drinks: [
        {
          drinkId: { toString: () => "drink-1" },
          name: "Matcha",
          price: 6,
          quantity: 1,
          sugar: "Full",
          ice: "Normal",
          toppings: [],
        },
      ],
      internalField: "not returned",
    };
    mocks.findByIdAndUpdate.mockResolvedValue(order);
    const res = response();

    await getOrderDetails(
      {
        query: { session_id: "cs_test_1" },
        session: {
          checkout: {
            stripeSessionId: "cs_test_1",
            orderId: "order-1",
          },
        },
      },
      res,
    );

    expect(mocks.retrieve).toHaveBeenCalledOnce();
    expect(mocks.findByIdAndUpdate).toHaveBeenCalledWith(
      "order-1",
      { status: "paid" },
      { new: true },
    );
    expect(res.json).toHaveBeenCalledWith({
      order: {
        _id: "order-1",
        createdAt: order.createdAt,
        name: "Customer",
        email: "customer@example.com",
        phone: "555-0100",
        pickupDate: order.pickupDate,
        pickupTime: "10:00",
        location: "Ellensburg",
        drinks: [
          {
            drinkId: "drink-1",
            name: "Matcha",
            price: 6,
            quantity: 1,
            sugar: "Full",
            ice: "Normal",
            toppings: [],
          },
        ],
      },
    });
  });

  it("rejects a checkout session not associated with this browser", async () => {
    const res = response();

    await getOrderDetails(
      { query: { session_id: "cs_test_1" }, session: {} },
      res,
    );

    expect(res.status).toHaveBeenCalledWith(403);
    expect(mocks.retrieve).not.toHaveBeenCalled();
    expect(mocks.findByIdAndUpdate).not.toHaveBeenCalled();
  });

  it("rejects null checkout details", async () => {
    const res = response();

    await postCheckout({ body: null, session: { cart: [] } }, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Provide valid customer and pickup details and a non-empty cart.",
    });
  });

  it.each([
    ["an invalid email", { email: "not-an-email" }],
    ["an invalid calendar date", { pickupDate: "2026-02-30" }],
    ["a date outside the pickup window", { pickupDate: "2099-01-01" }],
    ["an invalid time", { pickupTime: "25:90" }],
  ])("rejects checkout with %s", async (_description, overrides) => {
    const tomorrow = new Date();
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    const body = {
      name: "Customer",
      phone: "555-0100",
      email: "customer@example.com",
      pickupDate: tomorrow.toISOString().slice(0, 10),
      pickupTime: "10:00",
      location: "Ellensburg",
      ...overrides,
    };
    const res = response();

    await postCheckout({ body, session: { cart: [{ quantity: 1 }] } }, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(mocks.hoursFindOne).not.toHaveBeenCalled();
  });

  it("rejects pickup locations not present in the store hours", async () => {
    mocks.hoursFindOne.mockResolvedValue(null);
    const date = new Date();
    date.setUTCDate(date.getUTCDate() + 1);
    const pickupDate = date.toISOString().slice(0, 10);
    const res = response();

    await postCheckout(
      {
        body: {
          name: "Customer",
          phone: "555-0100",
          email: "customer@example.com",
          pickupDate,
          pickupTime: "10:00",
          location: "Unknown",
        },
        session: { cart: [{ quantity: 1 }] },
      },
      res,
    );

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "The selected pickup location, date, or time is unavailable.",
    });
  });

  it("rejects pickup times outside the location's hours", async () => {
    const date = new Date();
    date.setUTCDate(date.getUTCDate() + 1);
    const pickupDate = date.toISOString().slice(0, 10);
    const dayLabels = ["Sun", "Mon", "Tues", "Wed", "Thu", "Fri", "Sat"];
    mocks.hoursFindOne.mockResolvedValue({
      hours: [
        {
          dayOfTheWeek: dayLabels[date.getUTCDay()],
          hours: "9:00am - 5:00pm",
        },
      ],
    });
    const res = response();

    await postCheckout(
      {
        body: {
          name: "Customer",
          phone: "555-0100",
          email: "customer@example.com",
          pickupDate,
          pickupTime: "17:30",
          location: "Ellensburg",
        },
        session: { cart: [{ quantity: 1 }] },
      },
      res,
    );

    expect(res.status).toHaveBeenCalledWith(400);
    expect(mocks.hoursFindOne).toHaveBeenCalledWith({ name: "Ellensburg" });
  });

  it("marks the matching order paid for a verified Stripe event", async () => {
    vi.stubEnv("STRIPE_WEBHOOK_SECRET", "whsec_test");
    const event = {
      type: "checkout.session.completed",
      data: {
        object: {
          payment_status: "paid",
          metadata: { orderId: "order-1" },
        },
      },
    };
    mocks.constructEvent.mockReturnValue(event);
    mocks.findByIdAndUpdate.mockResolvedValue({ _id: "order-1" });
    const res = response();
    const rawBody = Buffer.from('{"id":"evt_test"}');

    await handleStripeWebhook(
      {
        body: rawBody,
        headers: { "stripe-signature": "test-signature" },
      },
      res,
    );

    expect(mocks.constructEvent).toHaveBeenCalledWith(
      rawBody,
      "test-signature",
      "whsec_test",
    );
    expect(mocks.findByIdAndUpdate).toHaveBeenCalledWith(
      "order-1",
      { status: "paid" },
      { new: false, runValidators: true },
    );
    expect(res.json).toHaveBeenCalledWith({ received: true });
  });

  it("rejects invalid webhook signatures without changing an order", async () => {
    vi.stubEnv("STRIPE_WEBHOOK_SECRET", "whsec_test");
    mocks.constructEvent.mockImplementation(() => {
      throw new Error("signature mismatch");
    });
    const res = response();

    await handleStripeWebhook(
      {
        body: Buffer.from("{}"),
        headers: { "stripe-signature": "invalid" },
      },
      res,
    );

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Invalid webhook signature.",
    });
    expect(mocks.findByIdAndUpdate).not.toHaveBeenCalled();
  });

  it("acknowledges unpaid completed sessions without marking orders paid", async () => {
    vi.stubEnv("STRIPE_WEBHOOK_SECRET", "whsec_test");
    mocks.constructEvent.mockReturnValue({
      type: "checkout.session.completed",
      data: {
        object: {
          payment_status: "unpaid",
          metadata: { orderId: "order-1" },
        },
      },
    });
    const res = response();

    await handleStripeWebhook(
      {
        body: Buffer.from("{}"),
        headers: { "stripe-signature": "test-signature" },
      },
      res,
    );

    expect(mocks.findByIdAndUpdate).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({ received: true });
  });
});
