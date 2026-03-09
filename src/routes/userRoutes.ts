import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../db";
import { User } from "../entities/user";

const router = Router();

// Register user
router.post("/register", async (req, res) => {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await AppDataSource.getRepository(User).save({ name, email, password: hashedPassword });
    res.status(201).json({ message: "User registered", data: user });
});

// Login user
router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    const user = await AppDataSource.getRepository(User).findOneBy({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Password incorrect" });

    const token = jwt.sign({ userId: user.id, role: user.role }, "SECRET_KEY", { expiresIn: "1h" });
    res.json({ message: "Login success", token });
});

// Get all users (admin)
router.get("/", async (req, res) => {
    const users = await AppDataSource.getRepository(User).find();
    res.json(users);
});

// Get user profile
router.get("/:id", async (req, res) => {
    const { id } = req.params;
    const user = await AppDataSource.getRepository(User).findOne({
        where: { id: parseInt(id) },
        relations: ["orders", "products"]
    });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
});

// Update user profile
router.put("/:id", async (req, res) => {
    const { id } = req.params;
    const data = req.body;
    await AppDataSource.getRepository(User).update(id, data);
    res.json({ message: `User ${id} updated`, data });
});

// Delete user
router.delete("/:id", async (req, res) => {
    const { id } = req.params;
    await AppDataSource.getRepository(User).delete(id);
    res.json({ message: `User ${id} deleted` });
});

export default router;
