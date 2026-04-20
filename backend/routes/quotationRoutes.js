const express = require("express");
const router = express.Router();

const quotationController = require("../controllers/quotationController");
const { verifyToken } = require("../middleware/authMiddleware");

router.post("/", quotationController.createQuotation);

router.get("/", verifyToken, quotationController.getQuotations);
router.get("/:id", verifyToken, quotationController.getQuotationById);
router.put("/:id", verifyToken, quotationController.updateQuotation);
router.put("/:id/status", verifyToken, quotationController.updateQuotationStatus);
router.delete("/:id", verifyToken, quotationController.deleteQuotation);

module.exports = router;