import { beforeEach, describe, expect, it, vi } from "vitest";
import { uploadDrinkImage } from "../src/controller/image.controller.js";

const mocks = vi.hoisted(() => ({
  save: vi.fn(),
}));

vi.mock("@google-cloud/storage", () => ({
  Storage: class Storage {
    bucket() {
      return {
        file() {
          return { save: mocks.save };
        },
      };
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

describe("image controller", () => {
  it("uploads a supplied image successfully", async () => {
    mocks.save.mockResolvedValue(undefined);
    const res = response();

    await uploadDrinkImage(
      { file: { mimetype: "image/png", buffer: Buffer.from("image") } },
      res,
    );

    expect(mocks.save).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      imageLink: expect.stringMatching(
        /^https:\/\/storage\.googleapis\.com\/berry-matcha-photos\/drink-images\/.+\.png$/,
      ),
    });
  });

  it("rejects a null file input", async () => {
    const res = response();

    await uploadDrinkImage({ file: null }, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Select an image to upload.",
    });
  });
});
