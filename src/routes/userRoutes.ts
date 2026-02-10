import jwt from 'jsonwebtoken';
import fs from 'fs';
import { Request, Response, Router } from "express";
import { AppDataSource } from "../db";
import { User } from "../entities/user";
import bcrypt from "bcryptjs";
import { authMiddleware } from "../middlewares/authmiddleware";
import { upload } from '../middlewares/upload';
import path from 'path';

const router = Router();

// GET all users
router.get("/", async (req, res) => {
    const users = await AppDataSource.getRepository(User).find();
    res.json(users);
});

// GET user by ID
router.get("/:id", async (req, res) => {
    const { id } = req.params;
    const user = await AppDataSource.getRepository(User).findOneBy({ id: parseInt(id) });
    res.json(user);
});

// POST create new user
router.post("/create", async (req, res) => {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await AppDataSource.getRepository(User).save({ name, email, password: hashedPassword });
    res.status(201).json({ message: "User successful created ", data: user });
});

// PUT update user
router.put("/:id", async (req, res) => {
    const { id } = req.params;
    const data = req.body;
    await AppDataSource.getRepository(User).update(id, data);
    res.json({ message: `User successful updated ${id}`, data });
});

// DELETE user
router.delete("/:id", async (req, res) => {
    const { id } = req.params;
    await AppDataSource.getRepository(User).delete(id);
    res.json({ message: `User ${id} deleted` });
});

// Register
router.post("/register", async (req, res) => {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await AppDataSource.getRepository(User).save({ name, email, password: hashedPassword });
    res.json({ message: "Registered", data: user });
});

// Login
router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    const user = await AppDataSource.getRepository(User).findOneBy({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Password incorrect" });

    const token = jwt.sign({ userId: user.id }, "SECRET_KEY", { expiresIn: "1h" });
    res.json({ message: "Login success", token });
});

// Profile (protected route)
router.get("/profile/me", authMiddleware, async (req, res) => {
    const user = await AppDataSource.getRepository(User).findOneBy({ id: req.body.userId });
    res.json(user);
});

//rouet profile upload
router.post("/profile/upload", authMiddleware, upload.single("avatar"), async (req: Request, res: Response) => {
    const userId = req.user?.userId;  // ✅ จะไม่ error สีแดง
    const filePath = req.file?.path;

    if (!filePath) return res.status(400).json({ message: "No file uploaded" });
    if (!userId) return res.status(401).json({ message: "User not authenticated" });

    await AppDataSource.getRepository(User).update(userId, { avatar: filePath });
    res.json({ message: "Profile image uploaded", avatar: filePath });
});

router.put("/profile/update", authMiddleware, async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: "User not authenticated" });

    const { name, email, password } = req.body;

    const updateData: Partial<User> = {};

    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        updateData.password = hashedPassword;
    }

    try {
        await AppDataSource.getRepository(User).update(userId, updateData);
        const updatedUser = await AppDataSource.getRepository(User).findOneBy({ id: userId });
        res.json({ message: "Profile updated successfully", data: updatedUser });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

router.delete("/profile/delete", authMiddleware, async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: "User not authenticated" });

    try {
        await AppDataSource.getRepository(User).delete(userId);
        res.json({ message: "Profile deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});
// 🔹 Change password
router.put("/profile/change-password", authMiddleware, async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const { oldPassword, newPassword } = req.body;

    if (!userId) return res.status(401).json({ message: "User not authenticated" });

    const user = await AppDataSource.getRepository(User).findOneBy({ id: userId });
    if (!user) return res.status(404).json({ message: "User not found" });

    // ✅ เปรียบเทียบรหัสเก่าจริง ๆ
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: "Old password incorrect" });


    // ✅ hash password ใหม่และ save
    user.password = await bcrypt.hash(newPassword, 10);
    await AppDataSource.getRepository(User).save(user);

    res.json({ message: "Password changed successfully" });
});


// 🔹 Delete avatar
router.delete("/profile/avatar/delete", authMiddleware, async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: "User not authenticated" });

    const user = await AppDataSource.getRepository(User).findOneBy({ id: userId });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.avatar) {
        const avatarPath = path.join(__dirname, "../", user.avatar); // path เต็ม
        if (fs.existsSync(avatarPath)) {
            fs.unlinkSync(avatarPath);
        }
    }

    user.avatar = null;
    await AppDataSource.getRepository(User).save(user);

    res.json({ message: "Avatar deleted successfully" });
});

// router.get("/:userId/followers", async (req, res) => {
//     const { userId } = req.params;

//     try {
//         const user = await AppDataSource.getRepository(User).findOne({
//             where: { id: parseInt(userId) },
//             relations: ["followers", "followers.follower"]
//         });

//         if (!user) return res.status(404).json({ message: "User not found" });

//         const followers = (user.followers || []).map(f => ({
//             id: f.follower?.id,
//             name: f.follower?.name,
//             email: f.follower?.email
//         })).filter(f => f.id != null);

//         res.json(followers);
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ message: "Server error" });
//     }
// });




// router.get("/:userId/following", async (req, res) => {
//     const { userId } = req.params;

//     try {
//         const user = await AppDataSource.getRepository(User).findOne({
//             where: { id: parseInt(userId) },
//             relations: ["following", "following.following"]
//         });

//         if (!user) return res.status(404).json({ message: "User not found" });

//         const following = user.following.map(f => ({
//             id: f.following.id,
//             name: f.following.name,
//             email: f.following.email
//         }));

//         res.json(following);
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ message: "Server error" });
//     }
// });


// router.post("/:userId/follow", async (req, res) => {
//     const { userId } = req.params; // user ที่จะถูก follow
//     const { followerId } = req.body; // user ที่ follow

//     try {
//         const userToFollow = await AppDataSource.getRepository(User).findOneBy({ id: parseInt(userId) });
//         const followerUser = await AppDataSource.getRepository(User).findOneBy({ id: parseInt(followerId) });

//         if (!userToFollow || !followerUser)
//             return res.status(404).json({ message: "User not found" });

//         // ตรวจสอบว่า follow ซ้ำหรือยัง
//         const existing = await AppDataSource.getRepository(Follow).findOne({
//             where: {
//                 follower: { id: followerUser.id },
//                 following: { id: userToFollow.id }
//             }
//         });

//         if (existing) return res.status(400).json({ message: "Already following" });

//         const follow = new Follow();
//         follow.follower = followerUser;
//         follow.following = userToFollow;

//         await AppDataSource.getRepository(Follow).save(follow);

//         res.json({ message: "Followed successfully" });
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ message: "Server error" });
//     }
// });

// router.delete("/:userId/unfollow", async (req, res) => {
//     const { userId } = req.params; // user ที่ถูก unfollow
//     const { followerId } = req.body; // user ที่ unfollow

//     try {
//         const followRepo = AppDataSource.getRepository(Follow);

//         const follows = await followRepo.findOne({
//             where: {
//                 follower: { id: parseInt(followerId) },
//                 following: { id: parseInt(userId) }
//             }
//         });

//         if (!follows) return res.status(404).json({ message: "Follow record not found" });

//         await followRepo.remove(follows);

//         res.json({ message: "Unfollowed successfully" });
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ message: "Server error" });
//     }
// });


export default router;