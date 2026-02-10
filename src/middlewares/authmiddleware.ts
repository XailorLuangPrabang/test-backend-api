import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(" ")[1]; // Bearer TOKEN
    if (!token) return res.status(401).json({ message: "No token provided" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "SECRET_KEY") as { userId: number };
        req.user = { userId: decoded.userId };  // ✅ req.user ถูก type ถูกต้อง
        next();
    } catch {
        res.status(401).json({ message: "Invalid token" });
    }
};
