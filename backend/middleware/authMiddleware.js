const jwt = require("jsonwebtoken");

exports.verifyToken = (req, res, next) => {
    let token = null;

    if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
    }

    if (!token && req.headers.authorization?.startsWith("Bearer ")) {
        token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Access denied. No token provided.",
        });
    }

    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || "secretkey"
        );

        req.user = decoded;
        next();
    } catch (error) {
        console.error("JWT verify error:", error);
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token.",
        });
    }
};

exports.verifyAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({
            success: false,
            message: "Admin access only.",
        });
    }

    next();
};