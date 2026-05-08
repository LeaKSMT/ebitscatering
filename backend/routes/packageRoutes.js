const express = require("express");
const router = express.Router();

const packageController = require("../controllers/packageController");
const { verifyToken } = require("../middleware/authMiddleware");

router.get("/", packageController.getPackages);
router.get("/public", packageController.getPublicPackages);

router.post("/", verifyToken, packageController.createPackage);
router.put("/:id", verifyToken, packageController.updatePackage);
router.patch("/:id/status", verifyToken, packageController.updatePackageStatus);
router.delete("/:id", verifyToken, packageController.archivePackage);

module.exports = router;