import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createDrink,
  getAllDrinks,
} from "../src/controller/drink.controller.js";

const mocks = vi.hoisted(() => ({
  drinkFind: vi.fn(),
  drinkConstructor: vi.fn(),
}));

vi.mock("../src/model/drink.model.js", () => ({
  default: class Drink {
    constructor(data) {
      return mocks.drinkConstructor(data);
    }

    static find(...args) {
      return mocks.drinkFind(...args);
    }

    static aggregate() {
      return [];
    }
  },
}));

vi.mock("../src/model/order.model.js", () => ({
  default: { collection: { name: "orders" } },
}));

const response = () => ({
  status: vi.fn().mockReturnThis(),
  json: vi.fn().mockReturnThis(),
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe("drink controller", () => {
  it("returns drinks successfully", async () => {
    const drinks = [{ name: "Berry Matcha" }];
    mocks.drinkFind.mockResolvedValue(drinks);
    const res = response();

    await getAllDrinks(null, res);

    expect(res.json).toHaveBeenCalledWith(drinks);
  });

  it("reports a null create body as a model validation error", async () => {
    const error = new Error("Drink data is required.");
    mocks.drinkConstructor.mockImplementation(() => ({
      save: vi.fn().mockRejectedValue(error),
    }));
    const res = response();

    await createDrink({ body: null }, res);

    expect(mocks.drinkConstructor).toHaveBeenCalledWith(null);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: error.message });
  });
});
