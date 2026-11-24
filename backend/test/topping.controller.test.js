import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createTopping,
  getAllToppings,
} from "../src/controller/topping.controller.js";

const mocks = vi.hoisted(() => ({
  find: vi.fn(),
  sort: vi.fn(),
  constructor: vi.fn(),
}));

vi.mock("../src/model/topping.model.js", () => ({
  default: class Topping {
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

describe("topping controller", () => {
  it("returns available toppings successfully", async () => {
    const toppings = [{ name: "Boba", isAvailable: true }];
    mocks.find.mockReturnValue({ sort: mocks.sort });
    mocks.sort.mockResolvedValue(toppings);
    const res = response();

    await getAllToppings(null, res, vi.fn());

    expect(mocks.find).toHaveBeenCalledWith({ isAvailable: true });
    expect(mocks.sort).toHaveBeenCalledWith({ name: 1 });
    expect(res.json).toHaveBeenCalledWith(toppings);
  });

  it("passes a null create body to the model and reports its error", async () => {
    const error = new Error("Topping data is required.");
    mocks.constructor.mockImplementation(() => ({
      save: vi.fn().mockRejectedValue(error),
    }));
    const next = vi.fn();

    await createTopping({ body: null }, response(), next);

    expect(mocks.constructor).toHaveBeenCalledWith(null);
    expect(next).toHaveBeenCalledWith(error);
  });
});
