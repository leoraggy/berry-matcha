import multer from "multer";

const SUPPORTED_TYPES = ["image/gif", "image/jpeg", "image/png", "image/webp"];

const uploader = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    if (!SUPPORTED_TYPES.includes(file.mimetype)) {
      callback(new Error("Choose a PNG, JPG, WebP, or GIF image."));
      return;
    }

    callback(null, true);
  },
});

export function uploadSingleImage(fieldName = "image") {
  return (req, res, next) => {
    uploader.single(fieldName)(req, res, (error) => {
      if (error) {
        res.status(400).json({ message: error.message });
        return;
      }

      next();
    });
  };
}
