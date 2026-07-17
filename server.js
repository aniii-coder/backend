import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import corsMiddleware from "./middleware/cors-middleware/index.js";
import connectDB from "./config/db.js";
import errorMiddleware from "./middleware/error-middleware/index.js";
import router from "./routes/index.js";

dotenv.config();

const app = express();

connectDB();

app.use(corsMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
});