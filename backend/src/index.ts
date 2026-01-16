import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db";
import apiRoutes from "./routes/api"; // 1. Import Routes

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// 2. Use Routes
app.use("/api", apiRoutes);

app.get("/", (req, res) => {
  res.send("BeeLine API is Running 🚀");
});

app.listen(PORT, () => {
  console.log(`⚡ Server running on port ${PORT}`);
  connectDB();
});
