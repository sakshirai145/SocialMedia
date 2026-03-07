import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

import postsRoutes from "./routes/posts.routes.js";
import userRoutes from "./routes/user.routes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// routes
app.use("/api/posts", postsRoutes);
app.use("/api/users", userRoutes);
app.use(express.static("uploads"));

const start = async () => {
  try {

    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB Connected");

    app.listen(9080, () => {
      console.log("Server running on port 9080");
    });

  } catch (error) {
    console.error("MongoDB connection failed:", error);
  }
};

start();