const express = require("express");
const cors = require("cors");
const compression = require("compression");
require("dotenv").config();

const app = express();

app.set("trust proxy", 1);

const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const { specs, swaggerUi } = require("./swagger");
const {
    generalLimiter,
    authLimiter,
    bookingLimiter,
    quotationLimiter,
} = require("./middleware/rateLimitMiddleware");
const { httpLogger } = require("./utils/logger");

app.use(compression());
app.use(httpLogger);
app.use(generalLimiter);

const allowedOrigins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://ebitscatering.vercel.app",
];

if (process.env.FRONTEND_URL) {
    allowedOrigins.push(process.env.FRONTEND_URL);
}

const corsOptions = {
    origin: (origin, callback) => {
        if (!origin) {
            return callback(null, true);
        }

        const isAllowedExact = allowedOrigins.includes(origin);
        const isVercelPreview = /^https:\/\/.*\.vercel\.app$/.test(origin);

        if (isAllowedExact || isVercelPreview) {
            return callback(null, true);
        }

        console.log(`CORS blocked for origin: ${origin}`);
        return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.send("Backend is running");
});

app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "API is healthy",
    });
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

app.use("/api/auth", authLimiter, require("./routes/authRoutes"));
app.use("/api/bookings", bookingLimiter, require("./routes/bookingRoutes"));
app.use("/api/payments", bookingLimiter, require("./routes/paymentRoutes"));
app.use("/api/quotations", quotationLimiter, require("./routes/quotationRoutes"));

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});