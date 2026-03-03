import multer from "multer";
import fs from "fs";
import path from "path";

const ensureDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath = "";

    if (file.fieldname === "markerImage") {
      uploadPath = "uploads/markers";
    } else if (file.fieldname === "video") {
      uploadPath = "uploads/videos";
    } else if (file.fieldname === "patternFile") {
      uploadPath = "uploads/patterns";
    }

    ensureDir(uploadPath); // 🔥 automatically create folder

    cb(null, uploadPath);
  },

  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });

export default upload;