import express from "express";
import { createServer } from "node:http";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import { connectToSocket } from "./controllers/socketManger.js";
import userRoutes from "./routes/users.route.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const server = createServer(app);
const io = connectToSocket(server);

app.use(cors());
app.use(express.json({ limit: "40kb" }));
app.use(express.urlencoded({ limit: "40kb", extended: true }));

// Serve React build
app.use(express.static(path.join(__dirname, "../frontend/dist")));

// API Routes
app.use("/api/v1/users", userRoutes);

// SPA fallback for React router (must be LAST)
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/dist", "index.html"));
});

const PORT = process.env.PORT || 8000;

const startServer = async () => {
  try {
    if (!process.env.MONGO_DB) throw new Error("MongoDB URI missing");
    await mongoose.connect(process.env.MONGO_DB);
    console.log("✅ MongoDB connected");

    server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  } catch (err) {
    console.error("❌ Server error:", err.message);
    process.exit(1);
  }
};

startServer();
