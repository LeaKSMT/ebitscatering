const express = require("express");
const router = express.Router();

const packageController = require("../controllers/packageController");
const { verifyToken } = require("../middleware/authMiddleware");

router.get("/", packageController.getPackages);
router.put("/:id", verifyToken, packageController.updatePackage);

module.exports = router;