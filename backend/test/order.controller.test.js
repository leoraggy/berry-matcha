import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createOrder,
  getAllOrders,
} from "../src/controller/order.controller.js";

const mocks = vi.hoisted(() => ({
  find: vi.fn(),
  constructor: vi.fn(),
}));

vi.mock("../src/model/order.model.js", () => ({
  default: class Order {
    constructor(data) {
      return mocks.constructor(data);
    }

    static find(...args) {
      return mocks.find(...args);
    }
  },
}));

const response = () => ({
  status: vi.fn().mockReturnThis(),
  json: vi.fn().mockReturnThis(),
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe("order controller", () => {
  it("returns orders successfully", async () => {
    const orders = [{ name: "Customer" }];
    mocks.find.mockResolvedValue(orders);
    const res = response();

    await getAllOrders(null, res);

    expect(res.json).toHaveBeenCalledWith(orders);
  });

  it("reports a null create body as a model validation error", async () => {
    const error = new Error("Order data is required.");
    mocks.constructor.mockImplementation(() => ({
      save: vi.fn().mockRejectedValue(error),
    }));
    const res = response();

    await createOrder({ body: null }, res);

    expect(mocks.constructor).toHaveBeenCalledWith(null);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: error.message });
  });
});
