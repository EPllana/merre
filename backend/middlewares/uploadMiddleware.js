import multer from "multer";
import path from "path";
import fs from "fs";

// Krijo folderin nese nuk ekziston
const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

ensureDir("uploads/docs");
ensureDir("uploads/selfies");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === "idDocument") {
      cb(null, "uploads/docs");
    } else if (file.fieldname === "selfie") {
      cb(null, "uploads/selfies");
    } else {
      cb(new Error("Invalid field name"), null);
    }
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}_${Date.now()}${ext}`);
  }
});

export const upload = multer({ storage });
