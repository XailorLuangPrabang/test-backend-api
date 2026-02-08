import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const authMiddleware = (req: any, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(" ")[1]; // Bearer TOKEN
    if (!token) return res.status(401).json({ message: "No token provided" });

    try {
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET || "SECRET_KEY");
        req.user = decoded; // userId จะอยู่ใน req.user.userId
        next();
    } catch (err) {
        res.status(401).json({ message: "Invalid token" });
    }
};
