import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../../config/cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary,

  params: async (req, file) => ({
    folder: "blogs",

    allowed_formats: ["jpg", "jpeg", "png", "webp"],

    resource_type: "image",
  }),
});

const upload = multer({ storage });

export default upload;