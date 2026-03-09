import express, { Request, Response } from "express";
import cors from "cors";
import { AppDataSource } from "./db";
import userRoutes from "./routes/userRoutes";
import dotenv from "dotenv";
import productRoutes from "./routes/productRoutes";
import orderRoutes from "./routes/orderRoutes";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 5000;

// Middleware
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());
app.use("/uploads", express.static("src/uploads"));


// Connect DB
AppDataSource.initialize()
    .then(() => console.log("DB connected"))
    .catch(err => console.log("DB connection Error:", err));

// Routes
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);

app.get("/", (req: Request, res: Response) => {
    res.send("Hello from Back-end!");
});

// Listen
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

