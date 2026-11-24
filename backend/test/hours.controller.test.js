import { beforeEach, describe, expect, it, vi } from "vitest";
import { getHours, updateHours } from "../src/controller/hours.controller.js";

const mocks = vi.hoisted(() => ({
  find: vi.fn(),
  findByIdAndUpdate: vi.fn(),
}));

vi.mock("../src/model/hours.model.js", () => ({
  default: mocks,
}));

const response = () => ({
  status: vi.fn().mockReturnThis(),
  json: vi.fn().mockReturnThis(),
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe("hours controller", () => {
  it("returns store hours successfully", async () => {
    const hours = [{ name: "Southcenter" }];
    mocks.find.mockResolvedValue(hours);
    const res = response();

    await getHours(null, res);

    expect(res.json).toHaveBeenCalledWith(hours);
  });

  it("passes null update data to the model and reports its validation error", async () => {
    const error = new Error("Hours data is required.");
    mocks.findByIdAndUpdate.mockRejectedValue(error);
    const res = response();

    await updateHours({ params: { id: "hours-1" }, body: null }, res);

    expect(mocks.findByIdAndUpdate).toHaveBeenCalledWith("hours-1", null);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: error.message });
  });
});
