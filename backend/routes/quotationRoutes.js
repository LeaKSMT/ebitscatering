const express = require("express");
const router = express.Router();
const quotationController = require("../controllers/quotationController");
const { verifyToken } = require("../middleware/authMiddleware");

router.get("/", verifyToken, quotationController.getQuotations);
router.get("/:id", verifyToken, quotationController.getQuotationById);
router.post("/", verifyToken, quotationController.createQuotation);
router.put("/:id", verifyToken, quotationController.updateQuotation);
router.delete("/:id", verifyToken, quotationController.deleteQuotation);

module.exports = router;