const express = require("express");
const router = express.Router();

router.post("/login", (req, res) => {
    console.log("TEST LOGIN ROUTE HIT");

    return res.status(200).json({
        message: "TEST LOGIN ROUTE WORKING",
        token: "test-token",
        user: {
            id: 1,
            name: "Owner",
            email: "owner@ebitscatering.com",
            role: "admin",
        },
    });
});

module.exports = router;