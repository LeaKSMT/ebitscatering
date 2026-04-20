const express = require("express");
const compression = require("compression");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const app = express();

console.log("🔥 COOKIE AUTH VERSION LOADED");

app.set("trust proxy", 1);

const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const { httpLogger } = require("./utils/logger");

// Comprehensive CORS configuration
app.use((req, res, next) => {
    const allowedOrigins = [
        "https://ebitscatering.vercel.app",
        "https://ebitscatering-production.up.railway.app",
        "http://localhost:5173",
        "http://localhost:3000"
    ];

    const requestOrigin = req.headers.origin;

    // Set CORS headers for all requests
    if (allowedOrigins.includes(requestOrigin) || !requestOrigin) {
        res.setHeader("Access-Control-Allow-Origin", requestOrigin || "*");
        res.setHeader("Vary", "Origin");
        res.setHeader("Access-Control-Allow-Credentials", "true");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    }

    console.log(
        `[CORS] ${req.method} ${req.originalUrl} | origin: ${requestOrigin || "none"}`
    );

    if (req.method === "OPTIONS") {
        return res.sendStatus(204);
    }

    next();
});

app.use(compression());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(httpLogger);

app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Backend is running",
    });
});

app.get("/api", (req, res) => {
    res.status(200).json({
        success: true,
        message: "API is running",
    });
});

app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "API is healthy",
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
    });
});

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/bookings", require("./routes/bookingRoutes"));
app.use("/api/payments", require("./routes/paymentRoutes"));
app.use("/api/quotations", require("./routes/quotationRoutes"));

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});

process.on("unhandledRejection", (err) => {
    console.error("Unhandled Rejection:", err);
});

process.on("uncaughtException", (err) => {
    console.error("Uncaught Exception:", err);
});

process.on("SIGTERM", () => {
    console.log("SIGTERM received. Shutting down gracefully...");
    server.close(() => {
        console.log("Server closed.");
        process.exit(0);
    });
});

process.on("SIGINT", () => {
    console.log("SIGINT received. Shutting down gracefully...");
    server.close(() => {
        console.log("Server closed.");
        process.exit(0);
    });
});