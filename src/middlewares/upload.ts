// // src/middlewares/upload.ts
// import multer from "multer";
// import path from "path";

// // กำหนด folder และชื่อไฟล์
// const storage = multer.diskStorage({
//   destination: "uploads/", // folder เก็บไฟล์
//   filename: (req, file, cb) => {
//     const uniqueSuffix = Date.now() + path.extname(file.originalname);
//     cb(null, uniqueSuffix);
//   },
// });

// export const upload = multer({ storage });
