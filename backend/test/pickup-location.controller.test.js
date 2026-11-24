import { beforeEach, describe, expect, it, vi } from "vitest";
import { getPickupLocations } from "../src/controller/pickup-location.controller.js";

const mocks = vi.hoisted(() => ({
  find: vi.fn(),
  sort: vi.fn(),
}));

vi.mock("../src/model/pickup-location.model.js", () => ({
  default: { find: mocks.find },
}));

const response = () => ({ json: vi.fn() });

beforeEach(() => {
  vi.clearAllMocks();
});

describe("pickup location controller", () => {
  it("returns available pickup locations successfully", async () => {
    const locations = [{ name: "Ellensburg" }];
    mocks.find.mockReturnValue({ sort: mocks.sort });
    mocks.sort.mockResolvedValue(locations);
    const res = response();

    await getPickupLocations(null, res, vi.fn());

    expect(mocks.find).toHaveBeenCalledWith({ isAvailable: true });
    expect(mocks.sort).toHaveBeenCalledWith({ name: 1 });
    expect(res.json).toHaveBeenCalledWith(locations);
  });

  it("handles null request input while returning available locations", async () => {
    mocks.find.mockReturnValue({ sort: mocks.sort });
    mocks.sort.mockResolvedValue([]);
    const res = response();

    await getPickupLocations(null, res, vi.fn());

    expect(res.json).toHaveBeenCalledWith([]);
  });
});
