import jwt from 'jsonwebtoken';
import { Router } from "express";
import { AppDataSource } from "../db";
import { User } from "../entities/user";
import bcrypt from "bcryptjs";
import { authMiddleware } from "../middlewares/authmiddleware";

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

export default router;