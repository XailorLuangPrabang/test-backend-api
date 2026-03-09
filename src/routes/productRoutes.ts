import { Router } from "express";
import { AppDataSource } from "../db";
import { Product } from "../entities/product";
import { User } from "../entities/user";

const router = Router();

// Create product
router.post("/", async (req, res) => {
    const { name, description, price, stock, sellerId } = req.body;
    const seller = await AppDataSource.getRepository(User).findOneBy({ id: sellerId });
    if (!seller) return res.status(404).json({ message: "Seller not found" });

    const product = await AppDataSource.getRepository(Product).save({ name, description, price, stock, seller });
    res.status(201).json({ message: "Product created successful", data: product });
});

// Get all products
router.get("/", async (req, res) => {
    const products = await AppDataSource.getRepository(Product).find({ relations: ["seller"] });
    res.json(products);
});

// Get product by id
router.get("/:id", async (req, res) => {
    const { id } = req.params;
    const product = await AppDataSource.getRepository(Product).findOne({
        where: { id: parseInt(id) },
        relations: ["seller"]
    });
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
});

// Update product
router.put("/:id", async (req, res) => {
    const { id } = req.params;
    const data = req.body;
    await AppDataSource.getRepository(Product).update(id, data);
    res.json({ message: `Product ${id} updated`, data });
});

// Delete product
router.delete("/:id", async (req, res) => {
    const { id } = req.params;
    await AppDataSource.getRepository(Product).delete(id);
    res.json({ message: `Product ${id} deleted` });
});

export default router;
