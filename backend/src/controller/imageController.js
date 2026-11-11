import { randomUUID } from "node:crypto";
import { Storage } from "@google-cloud/storage";

let storage;

export const uploadDrinkImage = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Select an image to upload." });
  }

  const extensions = {
    "image/gif": "gif",
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  };
  const extension = extensions[req.file.mimetype];
  const objectName = `drink-images/${randomUUID()}.${extension}`;
  const bucketName =
    process.env.GOOGLE_CLOUD_STORAGE_BUCKET || "berry-matcha-photos";

  try {
    if (!storage) {
      storage = new Storage();
    }

    await storage.bucket(bucketName).file(objectName).save(req.file.buffer, {
      metadata: {
        contentType: req.file.mimetype,
        cacheControl: "public, max-age=31536000",
      },
      resumable: false,
    });

    const imageLink = `https://storage.googleapis.com/${bucketName}/${objectName}`;
    res.status(201).json({ imageLink });
  } catch (error) {
    console.error("Unable to upload drink image:", error);
    res.status(500).json({ message: "Unable to upload image. Please try again." });
  }
};
