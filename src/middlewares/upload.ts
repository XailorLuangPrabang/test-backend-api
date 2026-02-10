import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
    destination: "uploads/",  // folder ต้องมี
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + path.extname(file.originalname);
        cb(null, uniqueSuffix);
    },
});

export const upload = multer({ storage });
