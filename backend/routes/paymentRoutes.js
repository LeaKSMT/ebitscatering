const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");
const { verifyToken } = require("../middleware/authMiddleware");

router.get("/", verifyToken, paymentController.getPayments);
router.get("/:id", verifyToken, paymentController.getPaymentById);
router.post("/", verifyToken, paymentController.createPayment);
router.put("/:id", verifyToken, paymentController.updatePayment);
router.delete("/:id", verifyToken, paymentController.deletePayment);

module.exports = router;