require("dotenv").config();

const cors = require("cors");
const express = require("express");
const { connectDB } = require("./db/postgress");
const { sequelize } = require('./models');
const videoRoutes = require("./routes/videoRoutes");
const aiRoutes = require("./routes/aiRoutes");
const courseRoute = require("./routes/courseRoute");
const authRoutes = require("./routes/authRoutes");
const authenticate = require("./middleware/authMiddleware");
const vectorDBService = require("./db/vectorDB");

const app = express();
const PORT = process.env.PORT || 5000;

const ALLOWED_DOMAINS = process.env.ALLOWED_DOMAINS || "*";
// Middleware
app.use(cors({
  origin: ALLOWED_DOMAINS.split(","),
  credentials: true,
}));

app.use(express.json());

sequelize.sync({ alter: true })
  .then(() => console.log("✅ Models synced with database"))
  .catch((err) => console.error("❌ Model sync failed:", err));






// Routes
app.use("/api", videoRoutes);
app.use("/api", aiRoutes);
app.use("/api", courseRoute);
app.use("/api/auth", authRoutes);

// Health check for vector DB
app.get("/api/vector-db-status", (req, res) => {
  res.json({ enabled: vectorDBService.enabled });
});

// Protected route example
app.get("/api/protected", authenticate, (req, res) => {
  res.json({
    message: "You are authorized!",
    user: req.user,
  });
});

// Root route
app.get("/", (req, res) => {
  res.send("🚀 StudyHour Backend is running");
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Global Error:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

// Start server + DB
(async () => {
  try {
    await connectDB();
    console.log("✅ Connected to Postgres successfully");
  } catch (err) {
    console.warn("⚠️ DB connection failed. Starting in degraded mode.");
    console.warn(err.message);
  }

  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
})();

module.exports = app;
