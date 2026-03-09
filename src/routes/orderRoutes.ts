import { Router } from "express";
import { AppDataSource } from "../db";
import { Order } from "../entities/order";
import { User } from "../entities/user";
import { Product } from "../entities/product";

const router = Router();

// Create order
router.post("/create", async (req, res) => {
    const { userId, productId, quantity } = req.body;
    const user = await AppDataSource.getRepository(User).findOneBy({ id: userId });
    const product = await AppDataSource.getRepository(Product).findOneBy({ id: productId });

    if (!user) return res.status(404).json({ message: "User not found" });
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (quantity > product.stock) return res.status(400).json({ message: "Insufficient stock" });

    const totalPrice = product.price * quantity;
    const order = await AppDataSource.getRepository(Order).save({ user, product, quantity, totalPrice, status: "pending" });

    // decrease product stock
    product.stock -= quantity;
    await AppDataSource.getRepository(Product).save(product);

    res.status(201).json({ message: "Order created", data: order });
});

// Get all orders
router.get("/order/all", async (req, res) => {
    const orders = await AppDataSource.getRepository(Order).find({ relations: ["user", "product"] });
    res.json(orders);
});

// Get orders by user
router.get("/user/:userId", async (req, res) => {
    const { userId } = req.params;
    const orders = await AppDataSource.getRepository(Order).find({
        where: { user: { id: parseInt(userId) } },
        relations: ["product"]
    });
    res.json(orders);
});

export default router;
