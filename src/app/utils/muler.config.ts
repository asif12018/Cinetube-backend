import { CloudinaryStorage } from "multer-storage-cloudinary";
import { cloudinaryUpload } from "./cloudinary.config";
import multer from "multer";

const storage = new CloudinaryStorage({
  cloudinary: cloudinaryUpload,
  params: async (req, file) => {
    // console.log("CloudinaryStorage params:", cloudinaryUpload.config());
    // console.log("Processing file:", file.originalname);
    const originalName = file.originalname;
    const fileNameWithOutExtension = originalName
      ?.split(".")
      .slice(0, -1)
      .join(".")
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9\-]/g, "");

    // Creating a unique name for the file
    const uniqueName =
      Math.random().toString(36).substring(2) +
      "-" +
      Date.now() +
      "-" +
      fileNameWithOutExtension;

    return {
      folder: "ph-healthcare/images", // Since we only allow images, we can hardcode the folder
      public_id: uniqueName,
      allowed_formats: ["jpg", "jpeg", "png", "webp"], // Restrict formats on Cloudinary's side
      resource_type: "image", // Explicitly define the resource type as image
    };
  },
});

// Create a file filter to reject PDFs and other non-image files immediately
const fileFilter = (
  req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  console.log("MULTER fileFilter:", {
    originalname: file.originalname,
    mimetype: file.mimetype,
    size: file.size,
  });

  const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "image/webp",
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    console.log("✅ File accepted");
    cb(null, true);
  } else {
    console.log("❌ File rejected - invalid mime");
    cb(
      new Error(
        "Invalid file type. Only JPG, JPEG, PNG, and WEBP image files are allowed.",
      ),
    );
  }
};

export const multerUpload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // Optional: Limit file size to 5MB to prevent abuse
  },
});
