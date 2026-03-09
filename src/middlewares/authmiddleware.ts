import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface AuthRequest extends Request {
    user?: { userId: number; role?: string };
}

/**
 * authMiddleware ສາມາດຮັບ requiredRole ເພື່ອກວດສິດທິ admin/user
 * ຖ້າ requiredRole ບໍ່ຖືກກວດ, route ຈະເຂົ້າໄດ້ທົ່ວໄປ
 */
export const authMiddleware = (requiredRole?: string) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        const token = req.headers.authorization?.split(" ")[1]; // Bearer TOKEN
        if (!token) return res.status(401).json({ message: "No token provided" });

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || "SECRET_KEY") as { userId: number; role: string };

            // ດຶງ userId ແລະ role ຈາກ token
            req.user = { userId: decoded.userId, role: decoded.role };

            // ກວດສິດທິ
            if (requiredRole && decoded.role !== requiredRole) {
                return res.status(403).json({ message: "Forbidden" });
            }

            next();
        } catch (err) {
            res.status(401).json({ message: "Invalid token" });
        }
    };
};
