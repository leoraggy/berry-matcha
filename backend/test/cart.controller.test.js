import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  addCartItem,
  getCart,
} from "../src/controller/cart.controller.js";

vi.mock("../src/model/drink.model.js", () => ({
  default: {},
}));

vi.mock("../src/model/topping.model.js", () => ({
  default: {},
}));

const response = () => ({
  status: vi.fn().mockReturnThis(),
  json: vi.fn().mockReturnThis(),
});

const session = () => ({
  cart: [],
  save: vi.fn((callback) => callback(null)),
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe("cart controller", () => {
  it("returns an empty cart successfully", async () => {
    const res = response();

    await getCart({ session: session() }, res, vi.fn());

    expect(res.json).toHaveBeenCalledWith({
      items: [],
      totalQuantity: 0,
      totalPrice: 0,
    });
  });

  it("rejects a null cart item body", async () => {
    const res = response();

    await addCartItem({ body: null, session: session() }, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Invalid cart item." });
  });
});
