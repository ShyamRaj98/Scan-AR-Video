import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import markerRoutes from "./routes/markerRoutes.js";
dotenv.config();
connectDB();

const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173","https://seeyourmemory.netlify.app"],
    credentials: true,
  }),
);
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/markers", markerRoutes);

app.get("/", (req, res) => {
  res.send("AR Backend Running...");
});

app.use("/uploads", express.static("uploads"));

app.use((err, req, res, next) => {
  console.error("GLOBAL ERROR:", err);
  res.status(500).json({ message: err.message });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});