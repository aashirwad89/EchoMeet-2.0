import express from "express";
import { createServer } from "node:http";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import { connectToSocket } from "./controllers/socketManger.js";
import userRoutes from "./routes/users.route.js";

// Load environment variables
dotenv.config();

// Initialize Express app and HTTP server
const app = express();
const server = createServer(app);

// Connect socket.io
const io = connectToSocket(server);

// Middleware
app.use(cors());
app.use(express.json({ limit: "40kb" }));
app.use(express.urlencoded({ limit: "40kb", extended: true }));
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Routes
app.use("/api/v1/users", userRoutes);

// Port setup
const PORT = process.env.PORT || 8000;

// Database connection and server start
const startServer = async () => {
  try {
    const MONGO_URI = process.env.MONGO_DB;

    if (!MONGO_URI) {
      throw new Error("❌ MongoDB connection string not found in .env");
    }

    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB connected successfully");

    server.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Error starting server:", error.message);
    process.exit(1); // Exit if server fails to start
  }
};

// Start the server
startServer();
    